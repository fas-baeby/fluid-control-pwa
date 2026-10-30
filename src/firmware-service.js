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
 * Sequence complete de mise a jour : deverrouillage du bootloader puis transfert YMODEM.
 * Non branchee tant que la librairie n'est pas installee (etape 2 de la feuille de route).
 *
 * @param {{ bytes: Uint8Array, name: string }} firmware
 * @param {{ address?: string, onStep?: (step: unknown) => void, onProgress?: (progress: unknown) => void }} [options]
 */
export async function updateFirmware(firmware, options = {}) {
    const { createChipreg, runFirmwareUpdateSequence, sendChipregFirmware } = await loadCore();

    const mfc = createChipreg({ address: options.address ?? "ff" });
    await mfc.connect();

    try {
        const sequence = await runFirmwareUpdateSequence(mfc, { onStep: options.onStep });
        if (!sequence.success) return sequence;

        // Le MFC redemarre en bootloader : la liaison doit etre rouverte avant le transfert.
        await mfc.reconnect();

        const transfer = await sendChipregFirmware(mfc, firmware.bytes, {
            fileName: firmware.name,
            onProgress: options.onProgress,
        });

        return { success: true, steps: sequence.steps, transfer };
    } finally {
        await mfc.disconnect().catch(() => undefined);
    }
}
