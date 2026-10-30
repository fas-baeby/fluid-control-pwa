import { D as DeviceSpec } from '../descriptor-4xm6FaU-.js';
import { C as Codec } from '../codec-C_X5zMVV.js';
import { I as InstrumentOf, L as Link, R as RequestOptions } from '../instrument-BtbrzcJ6.js';

type TsiFlowUnits = "standard" | "volumetric";
interface TsiTrigger {
    cleared: boolean;
    source?: "F" | "P";
    polarity?: "+" | "-";
    value?: number;
    raw: string;
}
interface TsiTriggerInput {
    source: "F" | "P";
    polarity: "+" | "-";
    value: number;
    /** 4100 series uses 3 decimals, 4000 series 2. */
    fractionDigits?: 2 | 3;
}
interface TsiDisplayMode {
    raw: string;
    mode: "single" | "sequence" | "unknown";
    parameter?: string;
    pattern?: string;
    cycles?: number;
    parameters?: string[];
}
type TsiDisplayModeInput = string | {
    parameter: string;
} | {
    pattern: string;
    cycles: number;
};
declare const tsiFlowUnits: Codec<TsiFlowUnits | string>;
declare function tsiTriggerCodec(prefix: "BT" | "ET"): Codec<TsiTrigger>;
declare function encodeTsiTrigger(trigger: TsiTriggerInput | string): string;
declare const tsiDisplayMode: Codec<TsiDisplayMode>;
declare function encodeTsiDisplayMode(spec: TsiDisplayModeInput): string;
declare const tsiDisplayUnits: Codec<"L/min" | "cm3/min">;
declare function encodeTsiDisplayUnits(units: string): string;
declare const tsi4000: DeviceSpec<readonly [{
    readonly key: "serialNumber";
    readonly label: "Numéro de série";
    readonly read: "SN";
    readonly codec: Codec<string>;
    readonly description: "Numéro de série de l'instrument.";
}, {
    readonly key: "modelNumber";
    readonly label: "Référence modèle";
    readonly read: "MN";
    readonly codec: Codec<string>;
    readonly description: "Référence modèle, dont se déduit la série (4000 ou 4100).";
}, {
    readonly key: "firmwareRevision";
    readonly label: "Version firmware";
    readonly read: "REV";
    readonly codec: Codec<string>;
}, {
    readonly key: "calibrationDate";
    readonly label: "Date d'étalonnage";
    readonly read: "DATE";
    readonly codec: Codec<string>;
}, {
    readonly key: "gasCalibration";
    readonly label: "Calibration gaz";
    readonly read: "RG";
    readonly write: "SG";
    readonly codec: Codec<number>;
    readonly encode: (code: number) => string;
    readonly description: "Calibration gaz active dans l'instrument.";
}, {
    readonly key: "pressureCompensation";
    readonly label: "Compensation de pression";
    readonly write: "SP";
    readonly codec: Codec<string>;
    readonly encode: (kPa: number) => string;
    readonly unit: "kPa";
    readonly description: "Écriture seule : aucune commande de relecture documentée.";
}, {
    readonly key: "flowUnits";
    readonly label: "Unités de débit";
    readonly read: "RU";
    readonly write: "SU";
    readonly codec: Codec<string>;
    readonly encode: (units: TsiFlowUnits | string) => "S" | "V";
    readonly description: "Unités de débit standard ou volumétriques.";
}, {
    readonly key: "sampleRate";
    readonly label: "Période d'échantillonnage";
    readonly read: "RSR";
    readonly write: "SSR";
    readonly codec: Codec<number>;
    readonly encode: (ms: number) => string;
    readonly unit: "ms";
    readonly description: "Période d'échantillonnage interne, série et analogique.";
}, {
    readonly key: "analogFullScale";
    readonly label: "Pleine échelle analogique";
    readonly read: "RAS";
    readonly write: "SAS";
    readonly codec: Codec<number>;
    readonly encode: (slpm: number) => string;
    readonly unit: "Std L/min";
}, {
    readonly key: "analogZeroOffset";
    readonly label: "Offset zéro analogique";
    readonly read: "RAZ";
    readonly write: "SAZ";
    readonly codec: Codec<number>;
    readonly encode: (mV: number) => string;
    readonly unit: "mV";
}, {
    readonly key: "beginTrigger";
    readonly label: "Déclencheur de début";
    readonly read: "RBT";
    readonly write: "SBT";
    readonly codec: Codec<TsiTrigger>;
    readonly encode: typeof encodeTsiTrigger;
    readonly description: "Seuil de déclenchement de début, effaçable via CBT.";
}, {
    readonly key: "endTrigger";
    readonly label: "Déclencheur de fin";
    readonly read: "RET";
    readonly write: "SET";
    readonly codec: Codec<TsiTrigger>;
    readonly encode: typeof encodeTsiTrigger;
    readonly description: "Seuil de déclenchement de fin, effaçable via CET.";
}, {
    readonly key: "displayUpdateRate";
    readonly label: "Période de rafraîchissement LCD";
    readonly read: "RUR";
    readonly write: "SUR";
    readonly codec: Codec<number>;
    readonly encode: (ms: number) => string;
    readonly unit: "ms";
}, {
    readonly key: "displayMode";
    readonly label: "Mode d'affichage";
    readonly read: "RDM";
    readonly write: "SDM";
    readonly codec: Codec<TsiDisplayMode>;
    readonly encode: typeof encodeTsiDisplayMode;
    readonly description: "Mode d'affichage LCD simple ou séquence. Série 4100 uniquement.";
}, {
    readonly key: "displayUnits";
    readonly label: "Unités affichées";
    readonly read: "RDU";
    readonly write: "SDU";
    readonly codec: Codec<"L/min" | "cm3/min">;
    readonly encode: typeof encodeTsiDisplayUnits;
    readonly description: "Unités de débit affichées sur LCD. Série 4100 uniquement.";
}], readonly [{
    readonly key: "ping";
    readonly label: "Ping";
    readonly command: "?";
    readonly category: "diagnostic";
}, {
    readonly key: "save";
    readonly label: "Enregistrer les réglages";
    readonly command: "SAVE";
    readonly category: "configuration";
}, {
    readonly key: "restoreDefaults";
    readonly label: "Réinitialisation usine";
    readonly command: "DEFAULT";
    readonly category: "configuration";
}, {
    readonly key: "clearBeginTrigger";
    readonly label: "Effacer déclencheur de début";
    readonly command: "CBT";
    readonly category: "trigger";
}, {
    readonly key: "clearEndTrigger";
    readonly label: "Effacer déclencheur de fin";
    readonly command: "CET";
    readonly category: "trigger";
}]>;
type Tsi4000Instrument = InstrumentOf<typeof tsi4000.params, NonNullable<typeof tsi4000.actions>>;
declare function createTsi4000(link?: Link): Tsi4000Instrument;
interface TsiMeasurementRequest {
    includeFlow?: boolean;
    includeTemperature?: boolean;
    includePressure?: boolean;
    sampleCount?: number;
}
interface TsiMeasurement {
    flow?: number;
    temperature?: number;
    pressure?: number;
    sampleCount: number;
    raw: string;
}
/** Composite query `D{mode}{F|x}{T|x}{P|x}{nnnn}`; too structured to be a plain parameter read. */
declare function buildTsiMeasurementCommand(request?: TsiMeasurementRequest): string;
declare function parseTsiMeasurement(raw: string, request?: TsiMeasurementRequest): TsiMeasurement;
declare function readTsiMeasurement(instrument: Tsi4000Instrument, request?: TsiMeasurementRequest, options?: RequestOptions): Promise<TsiMeasurement>;
type TsiSeries = "4000" | "4100" | null;
declare function tsiSeriesOf(modelNumber: string | null | undefined): TsiSeries;
declare function readTsiIdentity(instrument: Tsi4000Instrument): Promise<{
    serialNumber: PromiseSettledResult<string>;
    modelNumber: PromiseSettledResult<string>;
    firmwareRevision: PromiseSettledResult<string>;
    calibrationDate: PromiseSettledResult<string>;
    series: TsiSeries;
    supportsDisplayCommands: boolean;
}>;

export { type Tsi4000Instrument, type TsiDisplayMode, type TsiDisplayModeInput, type TsiFlowUnits, type TsiMeasurement, type TsiMeasurementRequest, type TsiSeries, type TsiTrigger, type TsiTriggerInput, buildTsiMeasurementCommand, createTsi4000, encodeTsiDisplayMode, encodeTsiDisplayUnits, encodeTsiTrigger, parseTsiMeasurement, readTsiIdentity, readTsiMeasurement, tsi4000, tsiDisplayMode, tsiDisplayUnits, tsiFlowUnits, tsiSeriesOf, tsiTriggerCodec };
