import { formatBytes, readFirmwareFile } from "./firmware-file.js";
import { isCoreAvailable, isWebSerialSupported } from "./firmware-service.js";

const el = (id) => document.getElementById(id);

const input = el("firmware-input");
const fileName = el("firmware-name");
const errorBox = el("firmware-error");
const details = el("firmware-details");
const flashButton = el("flash-button");
const resetButton = el("reset-button");
const supportBanner = el("support-banner");

/** @type {Awaited<ReturnType<typeof readFirmwareFile>> | null} */
let firmware = null;
let transferEnabled = false;

function show(node, visible) {
    node.classList.toggle("is-hidden", !visible);
}

function showError(message) {
    errorBox.textContent = message;
    show(errorBox, Boolean(message));
}

function render() {
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
    resetButton.disabled = false;
    flashButton.disabled = !transferEnabled;
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
    render();
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

    transferEnabled = issues.length === 0;
    supportBanner.textContent = issues.join(" ");
    show(supportBanner, issues.length > 0);
    render();
}

function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    navigator.serviceWorker.register("./sw.js").catch(() => undefined);
}

input.addEventListener("change", onFileSelected);
resetButton.addEventListener("click", reset);
flashButton.addEventListener("click", () => {
    showError("Transfert non encore implemente : etape 2 de la feuille de route.");
});

render();
checkPrerequisites();
registerServiceWorker();
