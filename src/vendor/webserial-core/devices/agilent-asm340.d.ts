import { D as DeviceSpec } from '../descriptor-4xm6FaU-.js';
import { E as EnumValue } from '../primitives-CP8ivAQc.js';
import { C as Codec } from '../codec-C_X5zMVV.js';
import { I as InstrumentOf, L as Link } from '../instrument-BtbrzcJ6.js';

declare const ASM340_CYCLE_STATUS: {
    readonly ST: "Démarrage";
    readonly CZ: "Zéro électronique";
    readonly CM: "Autre calibration";
    readonly HV: "Cycle vide poussé";
    readonly SN: "Cycle sniffing";
};
declare const ASM340_TEST_MODES: {
    readonly 1: "Atmosphère";
    readonly 2: "GL (gross leak)";
    readonly 3: "Normal";
    readonly 4: "Haute sensibilité";
};
declare const ASM340_UNITS: {
    readonly 0: "ppm";
    readonly 1: "mbar·l/s";
    readonly 2: "Pa·m³/h";
    readonly 3: "Torr·l/s";
    readonly 4: "gr/yr";
    readonly 5: "oz/yr";
    readonly 6: "lb/yr";
    readonly 7: "custom";
};
declare const ASM340_GASES: {
    readonly 2: "H₂";
    readonly 3: "He-3";
    readonly 4: "He-4";
};
declare const ASM340_PRESSURE_LEVELS: {
    readonly 0: "Atmosphère / grossier";
    readonly 1: "Gross leak";
    readonly 2: "Normal";
    readonly 3: "Haute sensibilité";
};
interface Asm340StatusBits {
    filament: 1 | 2;
    filamentOn: boolean;
    inCycle: boolean;
    pressureLevel: number;
    pressureLevelLabel: string;
    sniffingMode: boolean;
    autocalibrationOk: boolean;
    panelUnlocked: boolean;
    noDefault: boolean;
    inletVent: boolean;
    cycleAvailable: boolean;
    pumpSynchro: boolean;
    snifferClear: boolean;
}
declare function asm340StatusBits(word: number): Asm340StatusBits;
declare const asm340DetectorStatus: Codec<{
    raw: number;
    bits: Asm340StatusBits;
}>;
interface Asm340InternalLeak {
    leakValue: number;
    temperatureCoefficient?: number;
    agingCoefficient?: number;
    year?: number;
    calibrationTemperature?: number;
    raw?: string;
}
/** FE packs the fields without separators: CF value, then 1+1+4+2 digits. */
declare const asm340InternalLeak: Codec<Asm340InternalLeak>;
/** ER packs a count followed by that many 4-digit codes. */
declare const asm340Errors: Codec<string[]>;
declare const asm340PumpSpeed: Codec<{
    speed: number;
    valid: boolean;
}>;
declare const asm340StatusString: Codec<{
    statusBits: Asm340StatusBits;
    leakRate: number;
    statusCode: number;
    pressure: number;
}>;
declare const asm340: DeviceSpec<readonly [{
    readonly key: "leakRate";
    readonly label: "Taux de fuite (corrigé)";
    readonly read: "?LE";
    readonly codec: Codec<number>;
    readonly unit: "unité active";
    readonly description: "Signal hélium calibré corrigé, format compressé (CF).";
}, {
    readonly key: "leakRateRaw";
    readonly label: "Taux de fuite (non corrigé)";
    readonly read: "?LE2";
    readonly codec: Codec<number>;
    readonly description: "Signal hélium calibré non corrigé, format compressé (CF).";
}, {
    readonly key: "inletPressure";
    readonly label: "Pression d'entrée";
    readonly read: "?PE";
    readonly codec: Codec<number>;
    readonly unit: "mbar";
    readonly description: "Pression mesurée à l'entrée du détecteur (CF).";
}, {
    readonly key: "cycleStatus";
    readonly label: "État du cycle";
    readonly read: "?CY";
    readonly codec: Codec<EnumValue<string>>;
    readonly description: "ST=démarrage, CZ=zéro élec., CM=calibration, HV=vide poussé, SN=sniffing.";
}, {
    readonly key: "testMode";
    readonly label: "Mode de test";
    readonly read: "?CYT";
    readonly write: "=CYT";
    readonly codec: Codec<EnumValue<number>>;
    readonly encode: (code: number) => string;
    readonly description: "1=atmosphère, 2=GL, 3=normal, 4=haute sensibilité.";
}, {
    readonly key: "detectorStatus";
    readonly label: "Statut détecteur";
    readonly read: "?ST";
    readonly codec: Codec<{
        raw: number;
        bits: Asm340StatusBits;
    }>;
    readonly description: "Mot de 16 bits (entier 5 chiffres) décrivant l'état complet du détecteur.";
}, {
    readonly key: "statusString";
    readonly label: "Chaîne HLD (TR)";
    readonly read: "?TR";
    readonly codec: Codec<{
        statusBits: Asm340StatusBits;
        leakRate: number;
        statusCode: number;
        pressure: number;
    }>;
    readonly description: "Renvoie: signal hélium (CF), code statut, pression d'entrée (CF).";
}, {
    readonly key: "ready";
    readonly label: "Prêt à tester";
    readonly read: "?RDY";
    readonly codec: Codec<boolean>;
    readonly description: "E=détecteur prêt à tester, D=non prêt.";
}, {
    readonly key: "unit";
    readonly label: "Unité active";
    readonly read: "?UN";
    readonly write: "=UN";
    readonly codec: Codec<EnumValue<number>>;
    readonly encode: (code: number) => string;
    readonly description: "0=ppm, 1=mbar·l/s, 2=Pa·m³/h, 3=Torr·l/s, 4=gr/yr, 5=oz/yr, 6=lb/yr, 7=custom.";
}, {
    readonly key: "threshold";
    readonly label: "Seuil de rejet courant";
    readonly read: "?S1";
    readonly codec: Codec<number>;
    readonly description: "Seuil du test en cours (CF).";
}, {
    readonly key: "vacuumThreshold";
    readonly label: "Seuil vide poussé";
    readonly read: "?S1H";
    readonly codec: Codec<number>;
    readonly description: "Seuil de rejet pour le test en vide poussé (CF).";
}, {
    readonly key: "sniffingThreshold";
    readonly label: "Seuil sniffing";
    readonly read: "?S1S";
    readonly codec: Codec<number>;
    readonly description: "Seuil de rejet pour le test sniffing (CF).";
}, {
    readonly key: "filamentAvailability";
    readonly label: "Disponibilité filaments";
    readonly read: "?FM";
    readonly codec: Codec<Record<"filament1" | "filament2", boolean>>;
    readonly description: "État des filaments 1 et 2 (1=ok, 0=grillé).";
}, {
    readonly key: "activeFilament";
    readonly label: "Filament actif";
    readonly read: "?SW";
    readonly codec: Codec<number>;
    readonly description: "Numéro du filament actuellement utilisé.";
}, {
    readonly key: "pumpSpeed";
    readonly label: "Vitesse pompe haut vide";
    readonly read: "?V1";
    readonly codec: Codec<{
        speed: number;
        valid: boolean;
    }>;
    readonly unit: "RPM";
    readonly description: "Vitesse de rotation de la pompe haut vide et validité de la mesure.";
}, {
    readonly key: "temperature";
    readonly label: "Température";
    readonly read: "?TE";
    readonly codec: Codec<number>;
    readonly description: "Température du détecteur.";
}, {
    readonly key: "gas";
    readonly label: "Gaz traceur";
    readonly read: "?GZ";
    readonly codec: Codec<EnumValue<number>>;
    readonly description: "Masse du gaz utilisé: 2=H2, 3=He-3, 4=He-4.";
}, {
    readonly key: "cellStatus";
    readonly label: "État cellule";
    readonly read: "?SC";
    readonly codec: Codec<Record<"emissionOn" | "cellSafetyTriggered" | "triodeSafetyTriggered", boolean>>;
    readonly description: "Émission, sécurité cellule (PI1), sécurité triode.";
}, {
    readonly key: "internalLeak";
    readonly label: "Fuite interne calibrée";
    readonly read: "?FE";
    readonly codec: Codec<Asm340InternalLeak>;
    readonly description: "Valeur (CF), coeff. T°, coeff. vieillissement, année, T° étalonnage.";
}, {
    readonly key: "recentTestResult";
    readonly label: "Résultat dernier test";
    readonly read: "?RE";
    readonly codec: Codec<boolean>;
    readonly description: "E=bonne pièce, D=mauvaise pièce.";
}, {
    readonly key: "autocalibrationStatus";
    readonly label: "État autocalibration";
    readonly read: "?AC";
    readonly codec: Codec<string>;
    readonly description: "Statut de validation de l'autocalibration.";
}, {
    readonly key: "zeroStatus";
    readonly label: "État zéro";
    readonly read: "?AZ";
    readonly write: "=AZ";
    readonly codec: Codec<boolean>;
    readonly encode: (enabled: boolean) => "E" | "D";
    readonly description: "E=zéro actif, D=zéro inactif.";
}, {
    readonly key: "softwareVersion";
    readonly label: "Version logicielle";
    readonly read: "?MD";
    readonly codec: Codec<string>;
    readonly description: "Numéro de version du firmware du détecteur.";
}, {
    readonly key: "errors";
    readonly label: "Défauts mémorisés";
    readonly read: "?ER";
    readonly codec: Codec<string[]>;
    readonly description: "Nombre de défauts courants puis codes de chaque défaut.";
}, {
    readonly key: "warnings";
    readonly label: "Avertissements mémorisés";
    readonly read: "?WA";
    readonly codec: Codec<string>;
    readonly description: "Liste des avertissements mémorisés.";
}], readonly [{
    readonly key: "startCycle";
    readonly label: "Démarrer cycle";
    readonly command: "=CY";
    readonly payload: "1";
    readonly category: "contrôle";
    readonly reply: "optional";
}, {
    readonly key: "stopCycle";
    readonly label: "Arrêter cycle";
    readonly command: "=CY";
    readonly payload: "0";
    readonly category: "contrôle";
    readonly reply: "optional";
}, {
    readonly key: "startAutocalibration";
    readonly label: "Démarrer autocalibration";
    readonly command: "!AC";
    readonly category: "calibration";
    readonly reply: "optional";
}, {
    readonly key: "abortAutocalibration";
    readonly label: "Annuler autocalibration";
    readonly command: "!AS";
    readonly category: "calibration";
    readonly reply: "optional";
}, {
    readonly key: "exchangeFilament";
    readonly label: "Changer de filament";
    readonly command: "!SW";
    readonly category: "contrôle";
    readonly reply: "optional";
}, {
    readonly key: "resetErrors";
    readonly label: "Réinitialiser défauts";
    readonly command: "!RE";
    readonly category: "service";
    readonly reply: "optional";
}, {
    readonly key: "resetWarnings";
    readonly label: "Réinitialiser avertissements";
    readonly command: "!WA";
    readonly category: "service";
    readonly reply: "optional";
}, {
    readonly key: "resetToDefaults";
    readonly label: "Réinitialisation usine";
    readonly command: "!DE";
    readonly category: "configuration";
    readonly reply: "optional";
}]>;
type Asm340Instrument = InstrumentOf<typeof asm340.params, NonNullable<typeof asm340.actions>>;
declare function createAsm340(link?: Link): Asm340Instrument;
declare function readAsm340DeviceInfo(instrument: Asm340Instrument): Promise<{
    softwareVersion: PromiseSettledResult<string>;
    unit: PromiseSettledResult<EnumValue<number>>;
    gas: PromiseSettledResult<EnumValue<number>>;
    internalLeak: PromiseSettledResult<Asm340InternalLeak>;
    filamentAvailability: PromiseSettledResult<Record<"filament1" | "filament2", boolean>>;
}>;

export { ASM340_CYCLE_STATUS, ASM340_GASES, ASM340_PRESSURE_LEVELS, ASM340_TEST_MODES, ASM340_UNITS, type Asm340Instrument, type Asm340InternalLeak, type Asm340StatusBits, asm340, asm340DetectorStatus, asm340Errors, asm340InternalLeak, asm340PumpSpeed, asm340StatusBits, asm340StatusString, createAsm340, readAsm340DeviceInfo };
