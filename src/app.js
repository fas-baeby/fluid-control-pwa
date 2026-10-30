import { formatBytes, readFirmwareFile } from "./firmware-file.js";
import { connectDevice, isCoreAvailable, isWebSerialSupported } from "./firmware-service.js";

const el = (id) => document.getElementById(id);

const input = el("firmware-input");
const fileName = el("firmware-name");
const errorBox = el("firmware-error");
const details = el("firmware-details");
const address = el("device-address");
const baudRate = el("device-baudrate");
const connectButton = el("connect-button");
const disconnectButton = el("disconnect-button");
const connectionStatus = el("connection-status");
const deviceMessage = el("device-message");
const deviceDetails = el("device-details");
const flashButton = el("flash-button");
const resetButton = el("reset-button");
const supportBanner = el("support-banner");
const transferPanel = el("transfer-panel");
const transferProgress = el("transfer-progress");
const transferResult = el("transfer-result");
const transferSteps = el("transfer-steps");

const STEP_LABELS = {
    jumpToBootloader: "Redemarrage en bootloader",
    requestBootloaderUpdate: "Demande de mise a jour bootloader",
    confirmBootloaderChallenge: "Confirmation du defi bootloader",
    requestPatcherUpdate: "Demande de mise a jour patcher",
    confirmPatcherChallenge: "Confirmation du defi patcher",
    requestApplicationUpdate: "Demande de mise a jour application",
};

/** @type {Awaited<ReturnType<typeof readFirmwareFile>> | null} */
let firmware = null;
/** @type {Awaited<ReturnType<typeof connectDevice>> | null} */
let session = null;
let serialReady = false;
let busy = false;

function show(node, visible) {
    node.classList.toggle("is-hidden", !visible);
}

function showError(message) {
    errorBox.textContent = message;
    show(errorBox, Boolean(message));
}

function setDeviceMessage(message, modifier) {
    deviceMessage.className = `notification mt-4 ${modifier}`;
    deviceMessage.textContent = message;
    show(deviceMessage, Boolean(message));
}

function renderConnection() {
    const connected = Boolean(session);

    connectionStatus.textContent = connected ? "Connecte" : "Deconnecte";
    connectionStatus.className = `tag ml-2 ${connected ? "is-success" : "is-light"}`;
    connectButton.disabled = busy || connected || !serialReady;
    connectButton.classList.toggle("is-loading", busy && !connected);
    disconnectButton.disabled = busy || !connected;
    address.disabled = busy || connected;
    baudRate.disabled = busy || connected;
}

function renderIdentification(identification) {
    if (!identification) {
        show(deviceDetails, false);
        return;
    }

    const text = (value) => String(value ?? "").trim() || "-";

    el("device-part").textContent = `${text(identification.partNumber)} ${text(identification.suffix)}`.trim();
    el("device-description").textContent = text(identification.description);
    el("device-serial").textContent = text(identification.serialNumber);
    el("device-software").textContent = text(identification.swVersion);
    el("device-hardware").textContent = text(identification.hwVersion);
    el("device-fullscale").textContent = text(identification.deviceFullScale);

    show(deviceDetails, true);
}

function render() {
    renderConnection();

    if (!firmware) {
        fileName.textContent = "Aucun fichier selectionne";
        show(details, false);
        flashButton.disabled = true;
        resetButton.disabled = true;
        return;
    }

    fileName.textContent = firmware.name;
    el("detail-name").textContent = firmware.name;
    el("detail-size").textContent = `${formatBytes(firmware.size)} (${firmware.size} octets)`;
    el("detail-modified").textContent = firmware.lastModified.toLocaleString("fr-FR");
    el("detail-digest").textContent = firmware.digest ?? "indisponible (contexte non securise)";

    show(details, true);
    resetButton.disabled = busy;
    flashButton.disabled = busy || !session;
}

async function onFileSelected(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    showError("");
    try {
        firmware = await readFirmwareFile(file);
    } catch (error) {
        firmware = null;
        input.value = "";
        showError(error.message);
    }
    render();
}

function reset() {
    firmware = null;
    input.value = "";
    showError("");
    show(transferPanel, false);
    render();
}

function setBusy(value) {
    busy = value;
    input.disabled = value;
    flashButton.classList.toggle("is-loading", value && Boolean(session));
    render();
}

async function connect() {
    if (session || busy) return;

    const deviceAddress = address.value.trim().toLowerCase();
    if (!/^[0-9a-f]{2}$/.test(deviceAddress)) {
        setDeviceMessage("Adresse invalide : deux caracteres hexadecimaux attendus.", "is-danger is-light");
        return;
    }

    setDeviceMessage("Selection du port serie...", "is-info is-light");
    setBusy(true);

    try {
        session = await connectDevice(deviceAddress, {
            preferredBaudRate: Number(baudRate.value),
            onAttempt: (rate, index, total) =>
                setDeviceMessage(`Detection de la vitesse : essai ${index}/${total} a ${rate} bauds...`, "is-info is-light"),
        });
    } catch (error) {
        setDeviceMessage(error.message, "is-danger is-light");
        return;
    } finally {
        setBusy(false);
    }

    baudRate.value = String(session.baudRate);
    renderIdentification(session.identification);

    if (session.identification) {
        setDeviceMessage(`Appareil identifie a ${session.baudRate} bauds.`, "is-success is-light");
    } else {
        // Un MFC deja en bootloader ne repond a IDER sur aucune vitesse : la connexion reste
        // exploitable pour relancer un transfert apres un echec.
        setDeviceMessage(
            "Connecte, mais aucune reponse sur les vitesses testees. Verifiez l'adresse et le cablage, " +
                "ou poursuivez si l'appareil est deja en bootloader.",
            "is-warning is-light",
        );
    }
}

async function disconnect() {
    if (!session) return;

    const current = session;
    session = null;
    renderIdentification(null);
    render();

    try {
        await current.disconnect();
    } catch (error) {
        setDeviceMessage(`Fermeture du port incomplete : ${error.message}`, "is-warning is-light");
    }
}

function appendStep(step) {
    const item = document.createElement("li");
    item.textContent = `${step.ok ? "OK" : "ECHEC"} - ${STEP_LABELS[step.name] ?? step.name}${step.error ? ` : ${step.error}` : ""}`;
    item.className = step.ok ? "has-text-success" : "has-text-danger";
    transferSteps.append(item);
}

function setResult(message, modifier) {
    transferResult.className = `notification ${modifier}`;
    transferResult.textContent = message;
}

async function startTransfer() {
    if (!firmware || !session || busy) return;

    const confirmed = confirm(
        `Transferer "${firmware.name}" (${formatBytes(firmware.size)}) vers le MFC ${address.value.trim().toLowerCase()} ?\n\n` +
            "L'appareil sera redemarre en bootloader. Ne le debranchez pas pendant l'operation.",
    );
    if (!confirmed) return;

    showError("");
    transferSteps.replaceChildren();
    // Barre indeterminee tant que le premier bloc YMODEM n'est pas parti.
    transferProgress.removeAttribute("value");
    setResult("Deverrouillage du bootloader...", "is-info is-light");
    show(transferResult, true);
    show(transferPanel, true);
    setBusy(true);

    try {
        const result = await session.flash(firmware, {
            onStep: appendStep,
            onProgress: ({ percent, sentBytes, totalBytes }) => {
                transferProgress.value = percent;
                setResult(
                    `Transfert YMODEM : ${percent}% (${formatBytes(sentBytes)} / ${formatBytes(totalBytes)})`,
                    "is-info is-light",
                );
            },
        });

        if (!result.success) {
            transferProgress.value = 0;
            setResult(
                `Sequence interrompue a l'etape "${STEP_LABELS[result.failedStep] ?? result.failedStep}" : ${result.error}`,
                "is-danger is-light",
            );
            return;
        }

        transferProgress.value = 100;
        setResult(
            result.transfer.validated
                ? `Firmware transfere et valide par le bootloader (${result.transfer.blocks} blocs, ${formatBytes(result.transfer.bytesSent)}).`
                : `Firmware transfere (${result.transfer.blocks} blocs) mais le bootloader n'a pas confirme la validation.`,
            result.transfer.validated ? "is-success is-light" : "is-warning is-light",
        );
    } catch (error) {
        transferProgress.value = 0;
        setResult(error.message, "is-danger is-light");
    } finally {
        setBusy(false);
        // Le MFC redemarre sur le nouveau firmware : la session courante ne vaut plus rien.
        await disconnect();
        setDeviceMessage("Reconnectez l'appareil pour verifier la version installee.", "is-info is-light");
    }
}

async function checkPrerequisites() {
    const issues = [];

    if (!isWebSerialSupported()) {
        issues.push(
            "La Web Serial API est indisponible dans ce navigateur. Utilisez Chrome ou Edge sur ordinateur, en HTTPS.",
        );
    }
    if (!(await isCoreAvailable())) {
        issues.push(
            "La librairie @fas/webserial-core n'est pas installee : le transfert est desactive. Voir docs/ARCHITECTURE.md.",
        );
    }

    serialReady = issues.length === 0;
    supportBanner.textContent = issues.join(" ");
    show(supportBanner, issues.length > 0);
    render();
}

function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    navigator.serviceWorker.register("./sw.js").catch(() => undefined);
}

input.addEventListener("change", onFileSelected);
connectButton.addEventListener("click", connect);
disconnectButton.addEventListener("click", disconnect);
resetButton.addEventListener("click", reset);
flashButton.addEventListener("click", startTransfer);

render();
checkPrerequisites();
registerServiceWorker();
