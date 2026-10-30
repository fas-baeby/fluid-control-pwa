import { asBitStruct, bit, bits } from './chunk-MZ3FVZAH.js';
import { asFloat, asEnum, asFields, asInt, asBool, asText } from './chunk-Z5NZJSCE.js';
import { createInstrument } from './chunk-ZRL2DAVD.js';
import { lineFraming } from './chunk-X46GM2F5.js';
import { defineDevice, action, param } from './chunk-EM4MNF4I.js';
import { mapCodec, defineCodec } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/devices/agilent-asm142.ts
var ASM142_CYCLE_STATUS = {
  0: "D\xE9pollution",
  1: "Cycle sniffing",
  2: "Vide pouss\xE9",
  3: "Calibration (d\xE9tecteur)",
  4: "Calibration (utilisateur)",
  5: "Z\xE9ro \xE9lectronique",
  6: "D\xE9marrage"
};
var ASM142_UNITS = {
  1: "mbar\xB7l/s",
  2: "Pa\xB7m\xB3/s",
  3: "Torr\xB7l/s"
};
var ASM142_PRESSURE_LEVELS = {
  0: "Atmosph\xE8re / grossier",
  1: "GL",
  2: "FL",
  3: "Haute sensibilit\xE9"
};
var ASM142_GASES = {
  2: "H\u2082",
  3: "He-3",
  4: "He-4"
};
var asm142DetectorStatus = mapCodec(
  asBitStruct(
    {
      filamentIsSecond: bit(0),
      filamentOn: bit(1),
      inCycle: bit(2),
      pressure: bits(3, 2, ASM142_PRESSURE_LEVELS),
      sniffingMode: bit(5),
      autocalibrationOk: bit(6),
      panelOpen: bit(7),
      noDefault: bit(8),
      inletVent: bit(9),
      cycleAvailable: bit(10),
      turboSyncro: bit(11),
      snifferClear: bit(14)
    },
    { name: "ST" }
  ),
  (decoded) => ({
    raw: decoded.raw,
    filament: decoded.filamentIsSecond ? 2 : 1,
    filamentOn: decoded.filamentOn,
    inCycle: decoded.inCycle,
    pressureLevel: decoded.pressure.code,
    pressureLevelLabel: decoded.pressure.label,
    sniffingMode: decoded.sniffingMode,
    autocalibrationOk: decoded.autocalibrationOk,
    panelOpen: decoded.panelOpen,
    noDefault: decoded.noDefault,
    inletVent: decoded.inletVent,
    cycleAvailable: decoded.cycleAvailable,
    turboSyncro: decoded.turboSyncro,
    snifferClear: decoded.snifferClear
  }),
  "ST"
);
var asm142Errors = defineCodec("ER", (raw) => {
  const codes = raw.trim().split(/\s+/).map((part) => Number.parseInt(part, 10)).filter((value) => Number.isFinite(value));
  return codes.length === 0 || codes[0] === 0 ? [] : codes;
});
var asm142 = defineDevice({
  id: "agilent-asm142",
  label: "Agilent ASM 142",
  framing: lineFraming({ terminator: "\r" }),
  portOptions: { baudRate: 9600, dataBits: 8, stopBits: 1, parity: "none" },
  defaultTimeout: 1e3,
  params: [
    param({
      key: "leakRate",
      label: "Taux de fuite",
      read: "LE",
      codec: asFloat("LE"),
      unit: "unit\xE9 active",
      description: "Signal h\xE9lium calibr\xE9 modifi\xE9 (mesure principale)."
    }),
    param({
      key: "leakRateAlt",
      label: "Taux de fuite (autre unit\xE9)",
      read: "LE2",
      codec: asFloat("LE2"),
      description: "Signal h\xE9lium calibr\xE9 dans une unit\xE9 diff\xE9rente de l'unit\xE9 active."
    }),
    param({
      key: "inletPressure",
      label: "Pression d'entr\xE9e",
      read: "PE",
      codec: asFloat("PE"),
      unit: "mbar",
      description: "Pression mesur\xE9e \xE0 l'entr\xE9e du d\xE9tecteur."
    }),
    param({
      key: "cycleStatus",
      label: "\xC9tat du cycle",
      read: "CY",
      codec: asEnum(ASM142_CYCLE_STATUS, { name: "CY" }),
      description: "0=d\xE9pollution, 1=sniffing, 2=vide pouss\xE9, 3=cal. d\xE9tecteur, 4=cal. user, 5=z\xE9ro \xE9lec., 6=d\xE9marrage."
    }),
    param({
      key: "detectorStatus",
      label: "Statut d\xE9tecteur",
      read: "ST",
      codec: asm142DetectorStatus,
      description: "Mot de 16 bits d\xE9crivant l'\xE9tat complet du d\xE9tecteur (filament, cycle, pompe, etc.)."
    }),
    param({
      key: "autoString",
      label: "Lecture automatique (TR)",
      read: "TR",
      codec: asFields(
        [
          { key: "leakRate", codec: asFloat("TR.leakRate") },
          { key: "statusCode", codec: asInt("TR.statusCode") },
          { key: "pressure", codec: asFloat("TR.pressure") }
        ],
        { name: "TR" }
      ),
      description: "Renvoie en une commande: signal h\xE9lium, code statut, pression d'entr\xE9e."
    }),
    param({
      key: "unit",
      label: "Unit\xE9 active",
      read: "UN",
      codec: asEnum(ASM142_UNITS, { name: "UN" }),
      description: "1=mbar\xB7l/s, 2=Pa\xB7m\xB3/s, 3=Torr\xB7l/s."
    }),
    param({
      key: "threshold",
      label: "Seuil de test courant",
      read: "S1",
      codec: asFloat("S1"),
      description: "Seuil du test en cours (vide ou sniffing selon le mode actif)."
    }),
    param({
      key: "vacuumThreshold",
      label: "Seuil vide pouss\xE9",
      read: "S1H",
      codec: asFloat("S1H"),
      description: "Seuil de rejet pour le test en vide pouss\xE9."
    }),
    param({
      key: "sniffingThreshold",
      label: "Seuil sniffing",
      read: "S1S",
      codec: asFloat("S1S"),
      description: "Seuil de rejet pour le test sniffing."
    }),
    param({
      key: "filamentStatus",
      label: "\xC9tat filaments",
      read: "FM",
      codec: asFields(
        [
          { key: "filament1", codec: asBool("1", "FM.filament1") },
          { key: "filament2", codec: asBool("1", "FM.filament2") }
        ],
        { name: "FM" }
      ),
      description: "\xC9tat des filaments 1 et 2 (1=ok, 0=grill\xE9)."
    }),
    param({
      key: "turboSpeed",
      label: "Vitesse turbopompe",
      read: "V1",
      codec: asFields(
        [
          { key: "speed", codec: asInt("V1.speed") },
          { key: "accurate", codec: asBool("1", "V1.accurate") }
        ],
        { name: "V1" }
      ),
      unit: "RPM",
      description: "Vitesse de rotation de la turbopompe et indicateur de mesure pr\xE9cise."
    }),
    param({
      key: "temperature",
      label: "Temp\xE9rature",
      read: "TE",
      codec: asFields(
        [
          { key: "temperature", codec: asInt("TE.temperature") },
          { key: "isProbe", codec: asBool("1", "TE.isProbe") }
        ],
        { name: "TE" }
      ),
      description: "Temp\xE9rature du d\xE9tecteur et indicateur (sonde ou valeur pr\xE9-r\xE9gl\xE9e)."
    }),
    param({
      key: "autocalibrationStatus",
      label: "\xC9tat autocalibration",
      read: "AC",
      codec: asBool("1", "AC"),
      description: "1=autocalibration en cours, 0=inactif."
    }),
    param({
      key: "autozeroStatus",
      label: "\xC9tat autoz\xE9ro",
      read: "AZ",
      codec: asBool("1", "AZ"),
      description: "1=autoz\xE9ro actif, 0=inactif."
    }),
    param({
      key: "softwareVersion",
      label: "Version logicielle",
      read: "MD",
      codec: asText,
      description: "Num\xE9ro de version du firmware du d\xE9tecteur."
    }),
    param({
      key: "internalLeak",
      label: "Fuite interne calibr\xE9e",
      read: "FE",
      codec: asFields(
        [
          { key: "leakValue", codec: asFloat("FE.leakValue") },
          { key: "temperatureCoefficient", codec: asInt("FE.temperatureCoefficient") },
          { key: "agingCoefficient", codec: asInt("FE.agingCoefficient") },
          { key: "year", codec: asInt("FE.year") },
          { key: "calibrationTemperature", codec: asInt("FE.calibrationTemperature") }
        ],
        { name: "FE" }
      ),
      description: "Valeur de la fuite interne: valeur, coeff. T\xB0, coeff. vieillissement, ann\xE9e, T\xB0 \xE9talonnage."
    }),
    param({
      key: "gas",
      label: "Gaz traceur",
      read: "GZ",
      codec: asEnum(ASM142_GASES, { name: "GZ" }),
      description: "Masse du gaz utilis\xE9: 2=H2, 3=He-3, 4=He-4."
    }),
    param({
      key: "cellStatus",
      label: "\xC9tat cellule",
      read: "SC",
      codec: asFields(
        [
          { key: "emissionOn", codec: asBool("1", "SC.emissionOn") },
          { key: "cellSecure", codec: asBool("1", "SC.cellSecure") },
          { key: "triodeSecure", codec: asBool("1", "SC.triodeSecure") }
        ],
        { name: "SC" }
      ),
      description: "\xC9mission, s\xE9curit\xE9 cellule, s\xE9curit\xE9 triode."
    }),
    param({
      key: "recentTestResult",
      label: "R\xE9sultat dernier test",
      read: "RE",
      codec: asBool("1", "RE"),
      description: "1=bon, 0=mauvais."
    }),
    param({
      key: "errors",
      label: "Erreurs sauvegard\xE9es",
      read: "ER",
      codec: asm142Errors,
      description: "Nombre d'erreurs puis codes d'erreur."
    })
  ],
  actions: [
    action({
      key: "startAutocalibration",
      label: "D\xE9marrer autocalibration",
      command: "AC",
      category: "calibration",
      reply: "optional"
    }),
    action({
      key: "abortAutocalibration",
      label: "Annuler autocalibration",
      command: "AS",
      category: "calibration",
      reply: "optional"
    }),
    action({
      key: "resetWarnings",
      label: "R\xE9initialiser avertissements",
      command: "WA",
      category: "contr\xF4le",
      reply: "optional"
    }),
    action({
      key: "exchangeFilament",
      label: "Changer de filament",
      command: "SW",
      category: "contr\xF4le",
      reply: "optional"
    }),
    action({
      key: "selectBasicMode",
      label: "Mode basic RS-232",
      command: "VS",
      category: "configuration",
      reply: "optional"
    }),
    action({
      key: "selectAdvancedMode",
      label: "Mode avanc\xE9 RS-232",
      command: "SU",
      category: "configuration",
      reply: "optional"
    }),
    action({
      key: "resetToDefaults",
      label: "R\xE9initialisation usine",
      command: "DE",
      category: "configuration",
      reply: "optional"
    })
  ]
});
function createAsm142(link) {
  return createInstrument(asm142, link);
}
async function readAsm142DeviceInfo(instrument) {
  const [softwareVersion, unit, gas, internalLeak, filamentStatus] = await Promise.allSettled([
    instrument.readSoftwareVersion(),
    instrument.readUnit(),
    instrument.readGas(),
    instrument.readInternalLeak(),
    instrument.readFilamentStatus()
  ]);
  return {
    softwareVersion,
    unit,
    gas,
    internalLeak,
    filamentStatus
  };
}

export { ASM142_CYCLE_STATUS, ASM142_GASES, ASM142_PRESSURE_LEVELS, ASM142_UNITS, asm142, asm142DetectorStatus, asm142Errors, createAsm142, readAsm142DeviceInfo };
//# sourceMappingURL=chunk-DKEWM7II.js.map
//# sourceMappingURL=chunk-DKEWM7II.js.map