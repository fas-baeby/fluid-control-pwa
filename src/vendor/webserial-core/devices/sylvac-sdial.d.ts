import { D as DeviceSpec } from '../descriptor-4xm6FaU-.js';
import { E as EnumValue } from '../primitives-CP8ivAQc.js';
import { C as Codec } from '../codec-C_X5zMVV.js';
import { I as InstrumentOf, L as Link } from '../instrument-BtbrzcJ6.js';

declare const SYLVAC_MODES: {
    readonly NOR: "Normal (mesure)";
    readonly REF: "Référence";
    readonly MIN: "Minimum";
    readonly MAX: "Maximum";
    readonly DEL: "Delta";
    readonly TOL1: "Tolérance";
};
declare const SYLVAC_ERRORS: Record<number, string>;
type SylvacTolerance = "under" | "pass" | "over" | null;
interface SylvacReading {
    value: number;
    toleranceSymbol: string | null;
    toleranceStatus: SylvacTolerance;
}
declare const sylvacReading: Codec<SylvacReading>;
declare const sylvacPreset: Codec<number>;
declare function encodeSylvacPreset(value: number): string;
interface SylvacSettings {
    unit?: "MM" | "IN";
    resolution?: "RES2" | "RES3";
    reference?: "REF1" | "REF2";
    battery?: "OK" | "Replace";
    flags: string[];
    raw: string;
}
declare const sylvacSettings: Codec<SylvacSettings>;
interface SylvacIdentification {
    manufacturer: string | null;
    instrument: string | null;
    option1: string | null;
    option2: string | null;
    raw: string;
}
declare const sylvacIdentification: Codec<SylvacIdentification>;
declare const sylvacSDial: DeviceSpec<readonly [{
    readonly key: "displayedValue";
    readonly label: "Valeur affichée";
    readonly read: "PRI";
    readonly codec: Codec<SylvacReading>;
    readonly description: "Valeur courante avec son éventuel verdict de tolérance.";
}, {
    readonly key: "mode";
    readonly label: "Mode de fonctionnement";
    readonly read: "MOD?";
    readonly codec: Codec<EnumValue<string>>;
    readonly description: "Mode de mesure actuel : NOR, REF, MIN, MAX, DEL, TOL1.";
}, {
    readonly key: "preset";
    readonly label: "Valeur de preset";
    readonly read: "PRE?";
    readonly write: "PRE ";
    readonly codec: Codec<number>;
    readonly encode: typeof encodeSylvacPreset;
    readonly reply: "none";
    readonly description: "Valeur de preset de la référence active.";
}, {
    readonly key: "settings";
    readonly label: "Paramètres principaux";
    readonly read: "SET?";
    readonly codec: Codec<SylvacSettings>;
    readonly description: "Unité, résolution, référence, état batterie.";
}, {
    readonly key: "identification";
    readonly label: "Identification";
    readonly read: "ID?";
    readonly codec: Codec<SylvacIdentification>;
    readonly description: "Fabricant, instrument, versions d'options.";
}], readonly [{
    readonly key: "setUnitMM";
    readonly label: "Unité millimètres";
    readonly command: "MM";
    readonly category: "configuration";
    readonly reply: "none";
}, {
    readonly key: "setUnitInch";
    readonly label: "Unité pouces";
    readonly command: "IN";
    readonly category: "configuration";
    readonly reply: "none";
}, {
    readonly key: "setResolution001";
    readonly label: "Résolution 0.001 mm";
    readonly command: "RES2";
    readonly category: "configuration";
    readonly reply: "none";
}, {
    readonly key: "setResolution01";
    readonly label: "Résolution 0.01 mm";
    readonly command: "RES3";
    readonly category: "configuration";
    readonly reply: "none";
}, {
    readonly key: "setReference1";
    readonly label: "Référence 1";
    readonly command: "REF1";
    readonly category: "configuration";
    readonly reply: "none";
}, {
    readonly key: "setReference2";
    readonly label: "Référence 2";
    readonly command: "REF2";
    readonly category: "configuration";
    readonly reply: "none";
}, {
    readonly key: "recallPreset";
    readonly label: "Rappeler le preset";
    readonly command: "PRE";
    readonly category: "configuration";
    readonly reply: "none";
}, {
    readonly key: "resetToNormal";
    readonly label: "Revenir en mode normal";
    readonly command: "NOR";
    readonly category: "contrôle";
    readonly reply: "none";
}, {
    readonly key: "reset";
    readonly label: "Réinitialiser";
    readonly command: "RST";
    readonly category: "contrôle";
    readonly reply: "none";
}, {
    readonly key: "powerOn";
    readonly label: "Allumer";
    readonly command: "ON";
    readonly category: "contrôle";
    readonly reply: "none";
}, {
    readonly key: "powerOff";
    readonly label: "Éteindre";
    readonly command: "OFF";
    readonly category: "contrôle";
    readonly reply: "none";
}, {
    readonly key: "enableHold";
    readonly label: "Geler la valeur";
    readonly command: "STO1";
    readonly category: "contrôle";
    readonly reply: "none";
}, {
    readonly key: "disableHold";
    readonly label: "Dégeler la valeur";
    readonly command: "STO0";
    readonly category: "contrôle";
    readonly reply: "none";
}, {
    readonly key: "enableContinuousOutput";
    readonly label: "Transfert continu activé";
    readonly command: "OUT1";
    readonly category: "mesure";
    readonly reply: "none";
}, {
    readonly key: "disableContinuousOutput";
    readonly label: "Transfert continu désactivé";
    readonly command: "OUT0";
    readonly category: "mesure";
    readonly reply: "none";
}]>;
type SylvacSDialInstrument = InstrumentOf<typeof sylvacSDial.params, NonNullable<typeof sylvacSDial.actions>>;
declare function createSylvacSDial(link?: Link): SylvacSDialInstrument;

export { SYLVAC_ERRORS, SYLVAC_MODES, type SylvacIdentification, type SylvacReading, type SylvacSDialInstrument, type SylvacSettings, type SylvacTolerance, createSylvacSDial, encodeSylvacPreset, sylvacIdentification, sylvacPreset, sylvacReading, sylvacSDial, sylvacSettings };
