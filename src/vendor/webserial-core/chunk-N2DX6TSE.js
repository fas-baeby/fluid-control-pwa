import { prefixedFraming } from './chunk-USUAA7GO.js';
import { asCompressed } from './chunk-ORYSOKQF.js';
import { bit, bits, asBitStruct, decodeBits } from './chunk-MZ3FVZAH.js';
import { asFields, asInt, asKeyedEnum, asEnum, asBool, asDigitFlags, asText } from './chunk-Z5NZJSCE.js';
import { createInstrument } from './chunk-ZRL2DAVD.js';
import { defineDevice, action, param } from './chunk-EM4MNF4I.js';
import { mapCodec, defineCodec, ProtocolError, ConfigurationError } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/devices/agilent-asm340.ts
var ASM340_CYCLE_STATUS = {
  ST: "D\xE9marrage",
  CZ: "Z\xE9ro \xE9lectronique",
  CM: "Autre calibration",
  HV: "Cycle vide pouss\xE9",
  SN: "Cycle sniffing"
};
var ASM340_TEST_MODES = {
  1: "Atmosph\xE8re",
  2: "GL (gross leak)",
  3: "Normal",
  4: "Haute sensibilit\xE9"
};
var ASM340_UNITS = {
  0: "ppm",
  1: "mbar\xB7l/s",
  2: "Pa\xB7m\xB3/h",
  3: "Torr\xB7l/s",
  4: "gr/yr",
  5: "oz/yr",
  6: "lb/yr",
  7: "custom"
};
var ASM340_GASES = {
  2: "H\u2082",
  3: "He-3",
  4: "He-4"
};
var ASM340_PRESSURE_LEVELS = {
  0: "Atmosph\xE8re / grossier",
  1: "Gross leak",
  2: "Normal",
  3: "Haute sensibilit\xE9"
};
var ASM340_STATUS_SHAPE = {
  filamentIsSecond: bit(0),
  filamentOn: bit(1),
  inCycle: bit(2),
  pressure: bits(3, 2, ASM340_PRESSURE_LEVELS),
  sniffingMode: bit(5),
  autocalibrationOk: bit(6),
  panelUnlocked: bit(7),
  noDefault: bit(8),
  inletVent: bit(9),
  cycleAvailable: bit(10),
  pumpSynchro: bit(11),
  snifferClear: bit(14)
};
function asm340StatusBits(word) {
  const decoded = decodeBits(ASM340_STATUS_SHAPE, word);
  return {
    filament: decoded.filamentIsSecond ? 2 : 1,
    filamentOn: decoded.filamentOn,
    inCycle: decoded.inCycle,
    pressureLevel: decoded.pressure.code,
    pressureLevelLabel: decoded.pressure.label,
    sniffingMode: decoded.sniffingMode,
    autocalibrationOk: decoded.autocalibrationOk,
    panelUnlocked: decoded.panelUnlocked,
    noDefault: decoded.noDefault,
    inletVent: decoded.inletVent,
    cycleAvailable: decoded.cycleAvailable,
    pumpSynchro: decoded.pumpSynchro,
    snifferClear: decoded.snifferClear
  };
}
var asm340DetectorStatus = mapCodec(
  asBitStruct(ASM340_STATUS_SHAPE, { name: "ST" }),
  (decoded) => ({ raw: decoded.raw, bits: asm340StatusBits(decoded.raw) }),
  "ST"
);
var FE_PATTERN = /^(-?\d+[+-]\d{2})(\d)(\d)(\d{4})(\d{2})$/;
var cfValue = asCompressed("FE");
var asm340InternalLeak = defineCodec("FE", (raw) => {
  const text = raw.trim();
  const match = text.match(FE_PATTERN);
  if (!match) {
    return { leakValue: cfValue.decode(text), raw: text };
  }
  return {
    leakValue: cfValue.decode(match[1]),
    temperatureCoefficient: Number.parseInt(match[2], 10),
    agingCoefficient: Number.parseInt(match[3], 10),
    year: Number.parseInt(match[4], 10),
    calibrationTemperature: Number.parseInt(match[5], 10)
  };
});
var asm340Errors = defineCodec("ER", (raw) => {
  const text = raw.replace(/\s+/g, "");
  if (!text || text === "0") return [];
  const count = Number.parseInt(text.charAt(0), 10) || 0;
  const codes = [];
  for (let i = 0; i < count; i += 1) {
    const code = text.slice(1 + i * 4, 5 + i * 4);
    if (code.length === 4) codes.push(code);
  }
  return codes;
});
var V1_PATTERN = /^(\d+)([EDed])?$/;
var asm340PumpSpeed = defineCodec(
  "V1",
  (raw) => {
    const match = raw.trim().match(V1_PATTERN);
    if (!match) {
      throw new ProtocolError(`V1 : reponse de vitesse pompe invalide "${raw}".`);
    }
    return {
      speed: Number.parseInt(match[1], 10),
      valid: (match[2] ?? "").toUpperCase() === "E"
    };
  }
);
var asm340StatusString = mapCodec(
  asFields(
    [
      { key: "leakRate", codec: asCompressed("TR.leakRate") },
      { key: "statusCode", codec: asInt("TR.statusCode") },
      { key: "pressure", codec: asCompressed("TR.pressure") }
    ],
    { name: "TR" }
  ),
  (fields) => ({ ...fields, statusBits: asm340StatusBits(fields.statusCode) }),
  "TR"
);
function requireRange(value, min, max, label) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new ConfigurationError(`${label} : attendu un entier entre ${min} et ${max}, recu ${value}.`);
  }
  return String(value);
}
var asm340 = defineDevice({
  id: "agilent-asm340",
  label: "Agilent ASM 340 (3G)",
  framing: prefixedFraming({ terminator: "\r" }),
  portOptions: { baudRate: 9600, dataBits: 8, stopBits: 1, parity: "none" },
  defaultTimeout: 1e3,
  params: [
    param({
      key: "leakRate",
      label: "Taux de fuite (corrig\xE9)",
      read: "?LE",
      codec: asCompressed("LE"),
      unit: "unit\xE9 active",
      description: "Signal h\xE9lium calibr\xE9 corrig\xE9, format compress\xE9 (CF)."
    }),
    param({
      key: "leakRateRaw",
      label: "Taux de fuite (non corrig\xE9)",
      read: "?LE2",
      codec: asCompressed("LE2"),
      description: "Signal h\xE9lium calibr\xE9 non corrig\xE9, format compress\xE9 (CF)."
    }),
    param({
      key: "inletPressure",
      label: "Pression d'entr\xE9e",
      read: "?PE",
      codec: asCompressed("PE"),
      unit: "mbar",
      description: "Pression mesur\xE9e \xE0 l'entr\xE9e du d\xE9tecteur (CF)."
    }),
    param({
      key: "cycleStatus",
      label: "\xC9tat du cycle",
      read: "?CY",
      codec: asKeyedEnum(ASM340_CYCLE_STATUS, {
        name: "CY",
        normalize: (raw) => raw.toUpperCase()
      }),
      description: "ST=d\xE9marrage, CZ=z\xE9ro \xE9lec., CM=calibration, HV=vide pouss\xE9, SN=sniffing."
    }),
    param({
      key: "testMode",
      label: "Mode de test",
      read: "?CYT",
      write: "=CYT",
      codec: asEnum(ASM340_TEST_MODES, { name: "CYT" }),
      encode: (code) => requireRange(code, 1, 4, "Mode de test ASM340"),
      description: "1=atmosph\xE8re, 2=GL, 3=normal, 4=haute sensibilit\xE9."
    }),
    param({
      key: "detectorStatus",
      label: "Statut d\xE9tecteur",
      read: "?ST",
      codec: asm340DetectorStatus,
      description: "Mot de 16 bits (entier 5 chiffres) d\xE9crivant l'\xE9tat complet du d\xE9tecteur."
    }),
    param({
      key: "statusString",
      label: "Cha\xEEne HLD (TR)",
      read: "?TR",
      codec: asm340StatusString,
      description: "Renvoie: signal h\xE9lium (CF), code statut, pression d'entr\xE9e (CF)."
    }),
    param({
      key: "ready",
      label: "Pr\xEAt \xE0 tester",
      read: "?RDY",
      codec: asBool(/^E$/i, "RDY"),
      description: "E=d\xE9tecteur pr\xEAt \xE0 tester, D=non pr\xEAt."
    }),
    param({
      key: "unit",
      label: "Unit\xE9 active",
      read: "?UN",
      write: "=UN",
      codec: asEnum(ASM340_UNITS, { name: "UN" }),
      encode: (code) => requireRange(code, 0, 7, "Code d'unit\xE9 ASM340"),
      description: "0=ppm, 1=mbar\xB7l/s, 2=Pa\xB7m\xB3/h, 3=Torr\xB7l/s, 4=gr/yr, 5=oz/yr, 6=lb/yr, 7=custom."
    }),
    param({
      key: "threshold",
      label: "Seuil de rejet courant",
      read: "?S1",
      codec: asCompressed("S1"),
      description: "Seuil du test en cours (CF)."
    }),
    param({
      key: "vacuumThreshold",
      label: "Seuil vide pouss\xE9",
      read: "?S1H",
      codec: asCompressed("S1H"),
      description: "Seuil de rejet pour le test en vide pouss\xE9 (CF)."
    }),
    param({
      key: "sniffingThreshold",
      label: "Seuil sniffing",
      read: "?S1S",
      codec: asCompressed("S1S"),
      description: "Seuil de rejet pour le test sniffing (CF)."
    }),
    param({
      key: "filamentAvailability",
      label: "Disponibilit\xE9 filaments",
      read: "?FM",
      codec: asDigitFlags(["filament1", "filament2"], { name: "FM" }),
      description: "\xC9tat des filaments 1 et 2 (1=ok, 0=grill\xE9)."
    }),
    param({
      key: "activeFilament",
      label: "Filament actif",
      read: "?SW",
      codec: asInt("SW"),
      description: "Num\xE9ro du filament actuellement utilis\xE9."
    }),
    param({
      key: "pumpSpeed",
      label: "Vitesse pompe haut vide",
      read: "?V1",
      codec: asm340PumpSpeed,
      unit: "RPM",
      description: "Vitesse de rotation de la pompe haut vide et validit\xE9 de la mesure."
    }),
    param({
      key: "temperature",
      label: "Temp\xE9rature",
      read: "?TE",
      codec: asInt("TE"),
      description: "Temp\xE9rature du d\xE9tecteur."
    }),
    param({
      key: "gas",
      label: "Gaz traceur",
      read: "?GZ",
      codec: asEnum(ASM340_GASES, { name: "GZ" }),
      description: "Masse du gaz utilis\xE9: 2=H2, 3=He-3, 4=He-4."
    }),
    param({
      key: "cellStatus",
      label: "\xC9tat cellule",
      read: "?SC",
      codec: asDigitFlags(
        ["emissionOn", "cellSafetyTriggered", "triodeSafetyTriggered"],
        { name: "SC" }
      ),
      description: "\xC9mission, s\xE9curit\xE9 cellule (PI1), s\xE9curit\xE9 triode."
    }),
    param({
      key: "internalLeak",
      label: "Fuite interne calibr\xE9e",
      read: "?FE",
      codec: asm340InternalLeak,
      description: "Valeur (CF), coeff. T\xB0, coeff. vieillissement, ann\xE9e, T\xB0 \xE9talonnage."
    }),
    param({
      key: "recentTestResult",
      label: "R\xE9sultat dernier test",
      read: "?RE",
      codec: asBool(/^E$/i, "RE"),
      description: "E=bonne pi\xE8ce, D=mauvaise pi\xE8ce."
    }),
    param({
      key: "autocalibrationStatus",
      label: "\xC9tat autocalibration",
      read: "?AC",
      codec: asText,
      description: "Statut de validation de l'autocalibration."
    }),
    param({
      key: "zeroStatus",
      label: "\xC9tat z\xE9ro",
      read: "?AZ",
      write: "=AZ",
      codec: asBool(/^E$/i, "AZ"),
      encode: (enabled) => enabled ? "E" : "D",
      description: "E=z\xE9ro actif, D=z\xE9ro inactif."
    }),
    param({
      key: "softwareVersion",
      label: "Version logicielle",
      read: "?MD",
      codec: asText,
      description: "Num\xE9ro de version du firmware du d\xE9tecteur."
    }),
    param({
      key: "errors",
      label: "D\xE9fauts m\xE9moris\xE9s",
      read: "?ER",
      codec: asm340Errors,
      description: "Nombre de d\xE9fauts courants puis codes de chaque d\xE9faut."
    }),
    param({
      key: "warnings",
      label: "Avertissements m\xE9moris\xE9s",
      read: "?WA",
      codec: asText,
      description: "Liste des avertissements m\xE9moris\xE9s."
    })
  ],
  actions: [
    action({
      key: "startCycle",
      label: "D\xE9marrer cycle",
      command: "=CY",
      payload: "1",
      category: "contr\xF4le",
      reply: "optional"
    }),
    action({
      key: "stopCycle",
      label: "Arr\xEAter cycle",
      command: "=CY",
      payload: "0",
      category: "contr\xF4le",
      reply: "optional"
    }),
    action({
      key: "startAutocalibration",
      label: "D\xE9marrer autocalibration",
      command: "!AC",
      category: "calibration",
      reply: "optional"
    }),
    action({
      key: "abortAutocalibration",
      label: "Annuler autocalibration",
      command: "!AS",
      category: "calibration",
      reply: "optional"
    }),
    action({
      key: "exchangeFilament",
      label: "Changer de filament",
      command: "!SW",
      category: "contr\xF4le",
      reply: "optional"
    }),
    action({
      key: "resetErrors",
      label: "R\xE9initialiser d\xE9fauts",
      command: "!RE",
      category: "service",
      reply: "optional"
    }),
    action({
      key: "resetWarnings",
      label: "R\xE9initialiser avertissements",
      command: "!WA",
      category: "service",
      reply: "optional"
    }),
    action({
      key: "resetToDefaults",
      label: "R\xE9initialisation usine",
      command: "!DE",
      category: "configuration",
      reply: "optional"
    })
  ]
});
function createAsm340(link) {
  return createInstrument(asm340, link);
}
async function readAsm340DeviceInfo(instrument) {
  const [softwareVersion, unit, gas, internalLeak, filamentAvailability] = await Promise.allSettled([
    instrument.readSoftwareVersion(),
    instrument.readUnit(),
    instrument.readGas(),
    instrument.readInternalLeak(),
    instrument.readFilamentAvailability()
  ]);
  return { softwareVersion, unit, gas, internalLeak, filamentAvailability };
}

export { ASM340_CYCLE_STATUS, ASM340_GASES, ASM340_PRESSURE_LEVELS, ASM340_TEST_MODES, ASM340_UNITS, asm340, asm340DetectorStatus, asm340Errors, asm340InternalLeak, asm340PumpSpeed, asm340StatusBits, asm340StatusString, createAsm340, readAsm340DeviceInfo };
//# sourceMappingURL=chunk-N2DX6TSE.js.map
//# sourceMappingURL=chunk-N2DX6TSE.js.map