import { D as DeviceSpec } from '../descriptor-4xm6FaU-.js';
import { E as EnumValue, F as FieldsOutput } from '../primitives-CP8ivAQc.js';
import { C as Codec } from '../codec-C_X5zMVV.js';
import { I as InstrumentOf, L as Link } from '../instrument-BtbrzcJ6.js';

declare const ASM142_CYCLE_STATUS: {
    readonly 0: "Dépollution";
    readonly 1: "Cycle sniffing";
    readonly 2: "Vide poussé";
    readonly 3: "Calibration (détecteur)";
    readonly 4: "Calibration (utilisateur)";
    readonly 5: "Zéro électronique";
    readonly 6: "Démarrage";
};
declare const ASM142_UNITS: {
    readonly 1: "mbar·l/s";
    readonly 2: "Pa·m³/s";
    readonly 3: "Torr·l/s";
};
declare const ASM142_PRESSURE_LEVELS: {
    readonly 0: "Atmosphère / grossier";
    readonly 1: "GL";
    readonly 2: "FL";
    readonly 3: "Haute sensibilité";
};
declare const ASM142_GASES: {
    readonly 2: "H₂";
    readonly 3: "He-3";
    readonly 4: "He-4";
};
interface Asm142DetectorStatus {
    raw: number;
    filament: 1 | 2;
    filamentOn: boolean;
    inCycle: boolean;
    pressureLevel: number;
    pressureLevelLabel: string;
    sniffingMode: boolean;
    autocalibrationOk: boolean;
    panelOpen: boolean;
    noDefault: boolean;
    inletVent: boolean;
    cycleAvailable: boolean;
    turboSyncro: boolean;
    snifferClear: boolean;
}
/** ST mixes single bits with a 2-bit pressure field; the shift/mask work lives in decodeBits. */
declare const asm142DetectorStatus: Codec<Asm142DetectorStatus>;
/** ER answers with a count followed by the codes; a leading 0 means "no error". */
declare const asm142Errors: Codec<number[]>;
declare const asm142: DeviceSpec<readonly [{
    readonly key: "leakRate";
    readonly label: "Taux de fuite";
    readonly read: "LE";
    readonly codec: Codec<number>;
    readonly unit: "unité active";
    readonly description: "Signal hélium calibré modifié (mesure principale).";
}, {
    readonly key: "leakRateAlt";
    readonly label: "Taux de fuite (autre unité)";
    readonly read: "LE2";
    readonly codec: Codec<number>;
    readonly description: "Signal hélium calibré dans une unité différente de l'unité active.";
}, {
    readonly key: "inletPressure";
    readonly label: "Pression d'entrée";
    readonly read: "PE";
    readonly codec: Codec<number>;
    readonly unit: "mbar";
    readonly description: "Pression mesurée à l'entrée du détecteur.";
}, {
    readonly key: "cycleStatus";
    readonly label: "État du cycle";
    readonly read: "CY";
    readonly codec: Codec<EnumValue<number>>;
    readonly description: "0=dépollution, 1=sniffing, 2=vide poussé, 3=cal. détecteur, 4=cal. user, 5=zéro élec., 6=démarrage.";
}, {
    readonly key: "detectorStatus";
    readonly label: "Statut détecteur";
    readonly read: "ST";
    readonly codec: Codec<Asm142DetectorStatus>;
    readonly description: "Mot de 16 bits décrivant l'état complet du détecteur (filament, cycle, pompe, etc.).";
}, {
    readonly key: "autoString";
    readonly label: "Lecture automatique (TR)";
    readonly read: "TR";
    readonly codec: Codec<FieldsOutput<readonly [{
        readonly key: "leakRate";
        readonly codec: Codec<number>;
    }, {
        readonly key: "statusCode";
        readonly codec: Codec<number>;
    }, {
        readonly key: "pressure";
        readonly codec: Codec<number>;
    }]>>;
    readonly description: "Renvoie en une commande: signal hélium, code statut, pression d'entrée.";
}, {
    readonly key: "unit";
    readonly label: "Unité active";
    readonly read: "UN";
    readonly codec: Codec<EnumValue<number>>;
    readonly description: "1=mbar·l/s, 2=Pa·m³/s, 3=Torr·l/s.";
}, {
    readonly key: "threshold";
    readonly label: "Seuil de test courant";
    readonly read: "S1";
    readonly codec: Codec<number>;
    readonly description: "Seuil du test en cours (vide ou sniffing selon le mode actif).";
}, {
    readonly key: "vacuumThreshold";
    readonly label: "Seuil vide poussé";
    readonly read: "S1H";
    readonly codec: Codec<number>;
    readonly description: "Seuil de rejet pour le test en vide poussé.";
}, {
    readonly key: "sniffingThreshold";
    readonly label: "Seuil sniffing";
    readonly read: "S1S";
    readonly codec: Codec<number>;
    readonly description: "Seuil de rejet pour le test sniffing.";
}, {
    readonly key: "filamentStatus";
    readonly label: "État filaments";
    readonly read: "FM";
    readonly codec: Codec<FieldsOutput<readonly [{
        readonly key: "filament1";
        readonly codec: Codec<boolean>;
    }, {
        readonly key: "filament2";
        readonly codec: Codec<boolean>;
    }]>>;
    readonly description: "État des filaments 1 et 2 (1=ok, 0=grillé).";
}, {
    readonly key: "turboSpeed";
    readonly label: "Vitesse turbopompe";
    readonly read: "V1";
    readonly codec: Codec<FieldsOutput<readonly [{
        readonly key: "speed";
        readonly codec: Codec<number>;
    }, {
        readonly key: "accurate";
        readonly codec: Codec<boolean>;
    }]>>;
    readonly unit: "RPM";
    readonly description: "Vitesse de rotation de la turbopompe et indicateur de mesure précise.";
}, {
    readonly key: "temperature";
    readonly label: "Température";
    readonly read: "TE";
    readonly codec: Codec<FieldsOutput<readonly [{
        readonly key: "temperature";
        readonly codec: Codec<number>;
    }, {
        readonly key: "isProbe";
        readonly codec: Codec<boolean>;
    }]>>;
    readonly description: "Température du détecteur et indicateur (sonde ou valeur pré-réglée).";
}, {
    readonly key: "autocalibrationStatus";
    readonly label: "État autocalibration";
    readonly read: "AC";
    readonly codec: Codec<boolean>;
    readonly description: "1=autocalibration en cours, 0=inactif.";
}, {
    readonly key: "autozeroStatus";
    readonly label: "État autozéro";
    readonly read: "AZ";
    readonly codec: Codec<boolean>;
    readonly description: "1=autozéro actif, 0=inactif.";
}, {
    readonly key: "softwareVersion";
    readonly label: "Version logicielle";
    readonly read: "MD";
    readonly codec: Codec<string>;
    readonly description: "Numéro de version du firmware du détecteur.";
}, {
    readonly key: "internalLeak";
    readonly label: "Fuite interne calibrée";
    readonly read: "FE";
    readonly codec: Codec<FieldsOutput<readonly [{
        readonly key: "leakValue";
        readonly codec: Codec<number>;
    }, {
        readonly key: "temperatureCoefficient";
        readonly codec: Codec<number>;
    }, {
        readonly key: "agingCoefficient";
        readonly codec: Codec<number>;
    }, {
        readonly key: "year";
        readonly codec: Codec<number>;
    }, {
        readonly key: "calibrationTemperature";
        readonly codec: Codec<number>;
    }]>>;
    readonly description: "Valeur de la fuite interne: valeur, coeff. T°, coeff. vieillissement, année, T° étalonnage.";
}, {
    readonly key: "gas";
    readonly label: "Gaz traceur";
    readonly read: "GZ";
    readonly codec: Codec<EnumValue<number>>;
    readonly description: "Masse du gaz utilisé: 2=H2, 3=He-3, 4=He-4.";
}, {
    readonly key: "cellStatus";
    readonly label: "État cellule";
    readonly read: "SC";
    readonly codec: Codec<FieldsOutput<readonly [{
        readonly key: "emissionOn";
        readonly codec: Codec<boolean>;
    }, {
        readonly key: "cellSecure";
        readonly codec: Codec<boolean>;
    }, {
        readonly key: "triodeSecure";
        readonly codec: Codec<boolean>;
    }]>>;
    readonly description: "Émission, sécurité cellule, sécurité triode.";
}, {
    readonly key: "recentTestResult";
    readonly label: "Résultat dernier test";
    readonly read: "RE";
    readonly codec: Codec<boolean>;
    readonly description: "1=bon, 0=mauvais.";
}, {
    readonly key: "errors";
    readonly label: "Erreurs sauvegardées";
    readonly read: "ER";
    readonly codec: Codec<number[]>;
    readonly description: "Nombre d'erreurs puis codes d'erreur.";
}], readonly [{
    readonly key: "startAutocalibration";
    readonly label: "Démarrer autocalibration";
    readonly command: "AC";
    readonly category: "calibration";
    readonly reply: "optional";
}, {
    readonly key: "abortAutocalibration";
    readonly label: "Annuler autocalibration";
    readonly command: "AS";
    readonly category: "calibration";
    readonly reply: "optional";
}, {
    readonly key: "resetWarnings";
    readonly label: "Réinitialiser avertissements";
    readonly command: "WA";
    readonly category: "contrôle";
    readonly reply: "optional";
}, {
    readonly key: "exchangeFilament";
    readonly label: "Changer de filament";
    readonly command: "SW";
    readonly category: "contrôle";
    readonly reply: "optional";
}, {
    readonly key: "selectBasicMode";
    readonly label: "Mode basic RS-232";
    readonly command: "VS";
    readonly category: "configuration";
    readonly reply: "optional";
}, {
    readonly key: "selectAdvancedMode";
    readonly label: "Mode avancé RS-232";
    readonly command: "SU";
    readonly category: "configuration";
    readonly reply: "optional";
}, {
    readonly key: "resetToDefaults";
    readonly label: "Réinitialisation usine";
    readonly command: "DE";
    readonly category: "configuration";
    readonly reply: "optional";
}]>;
type Asm142Instrument = InstrumentOf<typeof asm142.params, NonNullable<typeof asm142.actions>>;
declare function createAsm142(link?: Link): Asm142Instrument;
interface Asm142DeviceInfo {
    softwareVersion: PromiseSettledResult<string>;
    unit: PromiseSettledResult<{
        code: number;
        label: string;
    }>;
    gas: PromiseSettledResult<{
        code: number;
        label: string;
    }>;
    internalLeak: PromiseSettledResult<unknown>;
    filamentStatus: PromiseSettledResult<unknown>;
}
/**
 * Identification sweep. Reads are reported individually because a detector in a transient
 * state answers some commands and not others, and a single failure must not void the sweep.
 */
declare function readAsm142DeviceInfo(instrument: Asm142Instrument): Promise<Asm142DeviceInfo>;

export { ASM142_CYCLE_STATUS, ASM142_GASES, ASM142_PRESSURE_LEVELS, ASM142_UNITS, type Asm142DetectorStatus, type Asm142DeviceInfo, type Asm142Instrument, asm142, asm142DetectorStatus, asm142Errors, createAsm142, readAsm142DeviceInfo };
