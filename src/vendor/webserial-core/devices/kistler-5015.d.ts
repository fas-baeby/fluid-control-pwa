import { D as DeviceSpec } from '../descriptor-4xm6FaU-.js';
import { E as EnumValue } from '../primitives-CP8ivAQc.js';
import { B as BitStructOutput, a as BitField } from '../bits-cVmwxCUN.js';
import { C as Codec } from '../codec-C_X5zMVV.js';
import { I as InstrumentOf, L as Link } from '../instrument-BtbrzcJ6.js';

declare const KISTLER_TIME_CONSTANTS: {
    readonly 0: "DC (Long)";
    readonly 1: "Short";
    readonly 2: "Medium";
    readonly 9: "Autre (lecture seule)";
};
declare const KISTLER_LOW_PASS_FILTERS: {
    readonly 0: "LP off (200 kHz)";
    readonly 1: "10 Hz";
    readonly 2: "30 Hz";
    readonly 3: "100 Hz";
    readonly 4: "300 Hz";
    readonly 5: "1 kHz";
    readonly 6: "3 kHz";
    readonly 7: "10 kHz";
    readonly 8: "30 kHz";
    readonly 9: "Autre (lecture seule)";
};
/** Kistler expects a 4-significant-digit mantissa with a signed exponent, e.g. 1.000E+0. */
declare function encodeKistlerScientific(value: number, label: string, min: number, max: number): string;
declare const kistlerErrorFlags: Codec<BitStructOutput<{
    readonly syntaxError: BitField;
    readonly bufferOverflow: BitField;
    readonly chargeAmplifierOverloaded: BitField;
    readonly zeroPointError: BitField;
    readonly commandReceived: BitField;
}>>;
declare const kistler5015: DeviceSpec<readonly [{
    readonly key: "instantaneousValue";
    readonly label: "Valeur instantanée";
    readonly read: "V=";
    readonly codec: Codec<number>;
    readonly description: "Valeur mesurée courante de l'amplificateur de charge.";
}, {
    readonly key: "sensitivity";
    readonly label: "Sensibilité";
    readonly read: "TS";
    readonly write: "TS";
    readonly codec: Codec<number>;
    readonly encode: (value: number) => string;
    readonly reply: "none";
    readonly unit: "pC/M.U.";
    readonly description: "Sensibilité de l'amplificateur de charge. 1.000E-2 à 9.999E+3 pC/M.U.";
}, {
    readonly key: "scaleVoltage";
    readonly label: "Échelle de la sortie tension";
    readonly read: "SC";
    readonly write: "SC";
    readonly codec: Codec<number>;
    readonly encode: (value: number) => string;
    readonly reply: "none";
    readonly unit: "M.U./V";
    readonly description: "Échelle de la sortie tension. 1.000E-5 à 9.999E+8 M.U./V.";
}, {
    readonly key: "timeConstant";
    readonly label: "Constante de temps (passe-haut)";
    readonly read: "TC";
    readonly write: "TC";
    readonly codec: Codec<EnumValue<number>>;
    readonly encode: (code: number) => string;
    readonly reply: "none";
    readonly description: "0=DC (Long), 1=Short, 2=Medium.";
}, {
    readonly key: "lowPassFilter";
    readonly label: "Fréquence de coupure passe-bas";
    readonly read: "LP";
    readonly write: "LP";
    readonly codec: Codec<EnumValue<number>>;
    readonly encode: (code: number) => string;
    readonly reply: "none";
    readonly description: "0=off (200 kHz), 1=10 Hz ... 8=30 kHz.";
}, {
    readonly key: "errorCode";
    readonly label: "Code d'erreur";
    readonly read: "CE";
    readonly codec: Codec<BitStructOutput<{
        readonly syntaxError: BitField;
        readonly bufferOverflow: BitField;
        readonly chargeAmplifierOverloaded: BitField;
        readonly zeroPointError: BitField;
        readonly commandReceived: BitField;
    }>>;
    readonly description: "Mot d'état : erreur de syntaxe, débordement, surcharge, erreur de zéro.";
}, {
    readonly key: "firmwareVersion";
    readonly label: "Version firmware";
    readonly read: "CV";
    readonly codec: Codec<string>;
}, {
    readonly key: "measureControl";
    readonly label: "Contrôle de mesure";
    readonly write: "RO";
    readonly codec: Codec<string>;
    readonly encode: (active: boolean) => "1" | "0";
    readonly reply: "none";
    readonly description: "0=inactif (Reset), 1=actif (Operate).";
}, {
    readonly key: "localControl";
    readonly label: "Verrouillage des commandes locales";
    readonly write: "CL";
    readonly codec: Codec<string>;
    readonly encode: (locked: boolean) => "1" | "0";
    readonly reply: "none";
    readonly description: "0=déverrouillé, 1=verrouillé (Esc et Enter restent actifs).";
}, {
    readonly key: "measuringCycleControl";
    readonly label: "Contrôle du cycle de mesure";
    readonly write: "CX";
    readonly codec: Codec<string>;
    readonly encode: (remote: boolean) => "1" | "0";
    readonly reply: "none";
    readonly description: "0=local (boutons Meas/F), 1=distant via l'entrée Remote Control.";
}, {
    readonly key: "replyTerminator";
    readonly label: "Terminateur de réponse";
    readonly write: "CT";
    readonly codec: Codec<string>;
    readonly encode: (mode: number) => string;
    readonly reply: "none";
    readonly description: "0=<cr><lf>, 1=<cr>, 2=<lf>. Modifier ce réglage impose de reconfigurer le framing.";
}, {
    readonly key: "commandCodeReply";
    readonly label: "Écho du code de commande";
    readonly write: "CH";
    readonly codec: Codec<string>;
    readonly encode: (include: boolean) => "1" | "0";
    readonly reply: "none";
    readonly description: "0=supprimé, 1=la réponse est préfixée du code de commande.";
}], []>;
type Kistler5015Instrument = InstrumentOf<typeof kistler5015.params>;
declare function createKistler5015(link?: Link): Kistler5015Instrument;

export { KISTLER_LOW_PASS_FILTERS, KISTLER_TIME_CONSTANTS, type Kistler5015Instrument, createKistler5015, encodeKistlerScientific, kistler5015, kistlerErrorFlags };
