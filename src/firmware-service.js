/**
 * Point d'integration unique avec @fas/webserial-core.
 *
 * Tout le reste de l'application ignore la librairie : si sa distribution n'est pas encore
 * presente dans `src/vendor/webserial-core/`, l'UI reste utilisable et signale simplement que
 * le transfert est indisponible. Voir `docs/ARCHITECTURE.md` pour la procedure d'installation.
 */

const CORE_ENTRY = "./vendor/webserial-core/devices.js";

let corePromise = null;

/** @returns {Promise<typeof import("./vendor/webserial-core/devices.js")>} */
export function loadCore() {
    corePromise ??= import(/* @vite-ignore */ CORE_ENTRY).catch((error) => {
        corePromise = null;
        throw error;
    });
    return corePromise;
}

export async function isCoreAvailable() {
    try {
        await loadCore();
        return true;
    } catch {
        return false;
    }
}

export function isWebSerialSupported() {
    return "serial" in navigator;
}

/**
 * Transfert YMODEM precede du deverrouillage du bootloader.
 *
 * Le `reconnect()` intercale n'est pas optionnel : apres `requestApplicationUpdate` le MCU a
 * redemarre, et le port doit etre ferme/rouvert pour se resynchroniser avant le premier bloc.
 * L'implementation de reference (fas-digital-manufacturing, `enterBinaryMode()`) fait de meme.
 * Les tests unitaires de la librairie n'exposent pas cette contrainte : ils utilisent un
 * transport simule, ou la resynchronisation n'a aucun sens.
 */
async function flash(mfc, firmware, options) {
    const { runFirmwareUpdateSequence, sendChipregFirmware } = await loadCore();

    const sequence = await runFirmwareUpdateSequence(mfc, { onStep: options.onStep });
    if (!sequence.success) return sequence;

    await mfc.reconnect();

    const transfer = await sendChipregFirmware(mfc, firmware.bytes, {
        fileName: firmware.name,
        onProgress: options.onProgress,
    });

    return { success: true, steps: sequence.steps, transfer };
}

/** Vitesses balayees a la connexion, de la plus probable a la moins probable. */
export const BAUD_RATES = [115200, 57600, 38400, 19200, 9600];

function createSession(mfc, baudRate, identification) {
    return {
        baudRate,
        identification,
        identify: (options) => mfc.readIdentification(options),
        /**
         * @param {{ bytes: Uint8Array, name: string }} firmware
         * @param {{ onStep?: (step: unknown) => void, onProgress?: (progress: unknown) => void }} [options]
         */
        flash: (firmware, options = {}) => flash(mfc, firmware, options),
        disconnect: () => mfc.disconnect(),
    };
}

/**
 * Ouvre le port serie puis identifie l'appareil en balayant les vitesses, pour que
 * l'operateur n'ait pas a connaitre celle configuree dans le MFC.
 *
 * `navigator.serial.requestPort()` n'est declenche qu'a la premiere ouverture — donc l'appel
 * doit suivre un geste utilisateur — les essais suivants reutilisent le port via `reopen()`.
 *
 * Quand aucune vitesse ne repond, la session reste ouverte sur la vitesse preferee :
 * un MFC deja en bootloader ne repond a IDER sur aucune vitesse mais accepte un transfert.
 * `identification` vaut alors `null`.
 *
 * @param {string} [address] deux caracteres hexadecimaux, `ff` pour la diffusion
 * @param {{ preferredBaudRate?: number, rates?: number[], timeout?: number,
 *          onAttempt?: (rate: number, index: number, total: number) => void }} [options]
 */
export async function connectDevice(address = "ff", options = {}) {
    const { preferredBaudRate = 115200, rates = BAUD_RATES, timeout = 1000, onAttempt } = options;
    const ordered = [preferredBaudRate, ...rates.filter((rate) => rate !== preferredBaudRate)];

    const { createChipreg } = await loadCore();
    const mfc = createChipreg({ address });

    await mfc.connect({ baudRate: ordered[0] });

    try {
        for (const [index, rate] of ordered.entries()) {
            if (index > 0) await mfc.reconnect({ baudRate: rate });
            onAttempt?.(rate, index + 1, ordered.length);

            try {
                return createSession(mfc, rate, await mfc.readIdentification({ timeout }));
            } catch {
                // Mauvaise vitesse : la trame est incoherente ou n'arrive jamais. On continue.
            }
        }

        if (ordered.at(-1) !== preferredBaudRate) {
            await mfc.reconnect({ baudRate: preferredBaudRate });
        }
        return createSession(mfc, preferredBaudRate, null);
    } catch (error) {
        await mfc.disconnect().catch(() => undefined);
        throw error;
    }
}
