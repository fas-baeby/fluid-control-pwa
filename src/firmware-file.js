/**
 * Selection et validation d'une image de firmware, sans aucune dependance au port serie :
 * la meme fonction sert a l'UI, aux tests et a un futur import par glisser-deposer.
 */

export const MAX_FIRMWARE_BYTES = 1024 * 1024;
const ALLOWED_EXTENSIONS = [".bin"];

export class FirmwareFileError extends Error {
    constructor(message) {
        super(message);
        this.name = "FirmwareFileError";
    }
}

function assertAccepted(file) {
    const name = file.name.toLowerCase();

    if (!ALLOWED_EXTENSIONS.some((extension) => name.endsWith(extension))) {
        throw new FirmwareFileError(
            `Extension non supportee. Attendu : ${ALLOWED_EXTENSIONS.join(", ")}.`,
        );
    }
    if (file.size === 0) {
        throw new FirmwareFileError("Le fichier est vide.");
    }
    if (file.size > MAX_FIRMWARE_BYTES) {
        throw new FirmwareFileError(
            `Fichier trop volumineux : ${formatBytes(file.size)} pour un maximum de ${formatBytes(MAX_FIRMWARE_BYTES)}.`,
        );
    }
}

export function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Kio`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mio`;
}

async function sha256Hex(bytes) {
    // crypto.subtle n'existe qu'en contexte securise, comme la Web Serial API elle-meme.
    if (!globalThis.crypto?.subtle) return null;

    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * @param {File} file
 * @returns {Promise<{ name: string, size: number, lastModified: Date, bytes: Uint8Array, digest: string | null }>}
 */
export async function readFirmwareFile(file) {
    assertAccepted(file);

    const bytes = new Uint8Array(await file.arrayBuffer());

    return {
        name: file.name,
        size: bytes.byteLength,
        lastModified: new Date(file.lastModified),
        bytes,
        digest: await sha256Hex(bytes),
    };
}
