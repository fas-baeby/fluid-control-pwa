import { acknowledgedFraming } from './chunk-MQUFHSGT.js';
import { asText, asInt } from './chunk-Z5NZJSCE.js';
import { createInstrument } from './chunk-ZRL2DAVD.js';
import { defineDevice, action, param } from './chunk-EM4MNF4I.js';
import { defineCodec, ProtocolError, ConfigurationError } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/devices/tsi4000.ts
function padded(value, digits) {
  return String(value).padStart(digits, "0");
}
function requireInt(value, min, max, label) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new ConfigurationError(`${label} : entier attendu entre ${min} et ${max}, recu ${value}.`);
  }
  return value;
}
function fixedPoint(value, integerDigits, fractionDigits) {
  if (!Number.isFinite(value)) {
    throw new ConfigurationError(`Valeur numerique non finie : ${value}.`);
  }
  const [integerPart, decimalPart] = value.toFixed(fractionDigits).split(".");
  return `${integerPart.padStart(integerDigits, "0")}.${decimalPart}`;
}
var tsiFlowUnits = defineCodec("RU", (raw) => {
  const code = raw.trim().toUpperCase();
  if (code === "S") return "standard";
  if (code === "V") return "volumetric";
  return code;
});
var TRIGGER_CLEARED = /^X{2}0(?:\.0+)?$/i;
var TRIGGER_PATTERN = /^(?<source>[FP])(?<polarity>[+-])(?<value>\d+(?:\.\d+)?)$/i;
function tsiTriggerCodec(prefix) {
  return defineCodec(prefix, (input) => {
    const raw = input.trim();
    if (!raw) return { cleared: true, raw };
    const body = raw.toUpperCase().startsWith(prefix) ? raw.slice(prefix.length) : raw;
    if (TRIGGER_CLEARED.test(body)) return { cleared: true, raw };
    const match = body.match(TRIGGER_PATTERN);
    if (!match?.groups) return { cleared: false, raw };
    return {
      cleared: false,
      source: match.groups["source"]?.toUpperCase(),
      polarity: match.groups["polarity"],
      value: Number.parseFloat(match.groups["value"]),
      raw
    };
  });
}
function encodeTsiTrigger(trigger) {
  if (typeof trigger === "string") {
    const normalized = trigger.trim().toUpperCase();
    if (!/^[FP][+-]\d+(?:\.\d+)?$/.test(normalized)) {
      throw new ConfigurationError(
        `Declencheur TSI invalide "${trigger}" : attendu par exemple F+002.00 ou P-110.00.`
      );
    }
    return normalized;
  }
  if (trigger.source !== "F" && trigger.source !== "P") {
    throw new ConfigurationError("La source du declencheur TSI doit etre F ou P.");
  }
  if (trigger.polarity !== "+" && trigger.polarity !== "-") {
    throw new ConfigurationError("La polarite du declencheur TSI doit etre + ou -.");
  }
  if (!Number.isFinite(trigger.value) || trigger.value < 0) {
    throw new ConfigurationError("La valeur du declencheur TSI doit etre positive ou nulle.");
  }
  const fractionDigits = trigger.fractionDigits ?? 2;
  const integerDigits = fractionDigits === 3 ? 2 : 3;
  return `${trigger.source}${trigger.polarity}${fixedPoint(trigger.value, integerDigits, fractionDigits)}`;
}
var DISPLAY_SINGLE = /^[FTP]$/;
var DISPLAY_SEQUENCE = /^(?<pattern>[FTPX]{3})(?<cycles>\d+)$/;
var tsiDisplayMode = defineCodec("RDM", (input) => {
  const raw = input.trim().toUpperCase();
  if (!raw) throw new ProtocolError("RDM : reponse de mode d'affichage vide.");
  if (DISPLAY_SINGLE.test(raw)) {
    return { raw, mode: "single", parameter: raw };
  }
  const match = raw.match(DISPLAY_SEQUENCE);
  if (!match?.groups) return { raw, mode: "unknown" };
  const pattern = match.groups["pattern"];
  return {
    raw,
    mode: "sequence",
    pattern,
    cycles: Number.parseInt(match.groups["cycles"], 10),
    parameters: [...pattern].filter((entry) => entry !== "X")
  };
});
function encodeTsiDisplayMode(spec) {
  let suffix;
  if (typeof spec === "string") {
    suffix = spec.trim().toUpperCase();
  } else if ("parameter" in spec) {
    suffix = String(spec.parameter).trim().toUpperCase();
  } else {
    const pattern = String(spec.pattern).trim().toUpperCase();
    const cycles = Number.parseInt(String(spec.cycles), 10);
    if (!pattern || !Number.isInteger(cycles) || cycles <= 0) {
      throw new ConfigurationError("Sequence d'affichage TSI invalide : motif et nombre de cycles requis.");
    }
    suffix = `${pattern}${cycles}`;
  }
  if (!/^[FTP]$|^[FTPX]{3}\d+$/.test(suffix)) {
    throw new ConfigurationError(
      `Mode d'affichage TSI invalide "${suffix}" : attendu F, T, P ou un motif tel que FTP2.`
    );
  }
  return suffix;
}
var tsiDisplayUnits = defineCodec("RDU", (raw) => {
  const code = raw.trim();
  if (code === "0") return "L/min";
  if (code === "1") return "cm3/min";
  throw new ProtocolError(`RDU : unite d'affichage inconnue "${raw}".`);
});
function encodeTsiDisplayUnits(units) {
  const normalized = units.trim().toLowerCase();
  if (["0", "l/min", "lpm", "l"].includes(normalized)) return "0";
  if (["1", "cm3/min", "cm^3/min", "ccm", "sccm"].includes(normalized)) return "1";
  throw new ConfigurationError("Les unites d'affichage TSI doivent etre L/min ou cm3/min.");
}
var tsi4000 = defineDevice({
  id: "tsi-4000",
  label: "TSI 4000/4100",
  framing: acknowledgedFraming({ terminator: "\r\n", outboundTerminator: "\r" }),
  portOptions: { baudRate: 38400, dataBits: 8, stopBits: 1, parity: "none" },
  defaultTimeout: 1e3,
  params: [
    param({
      key: "serialNumber",
      label: "Num\xE9ro de s\xE9rie",
      read: "SN",
      codec: asText,
      description: "Num\xE9ro de s\xE9rie de l'instrument."
    }),
    param({
      key: "modelNumber",
      label: "R\xE9f\xE9rence mod\xE8le",
      read: "MN",
      codec: asText,
      description: "R\xE9f\xE9rence mod\xE8le, dont se d\xE9duit la s\xE9rie (4000 ou 4100)."
    }),
    param({
      key: "firmwareRevision",
      label: "Version firmware",
      read: "REV",
      codec: asText
    }),
    param({
      key: "calibrationDate",
      label: "Date d'\xE9talonnage",
      read: "DATE",
      codec: asText
    }),
    param({
      key: "gasCalibration",
      label: "Calibration gaz",
      read: "RG",
      write: "SG",
      codec: asInt("RG"),
      encode: (code) => String(requireInt(code, 0, 6, "Code de gaz TSI")),
      description: "Calibration gaz active dans l'instrument."
    }),
    param({
      key: "pressureCompensation",
      label: "Compensation de pression",
      write: "SP",
      codec: asText,
      encode: (kPa) => {
        if (!Number.isFinite(kPa) || kPa < 0 || kPa > 200) {
          throw new ConfigurationError(
            `Compensation de pression TSI : attendu entre 0 et 200 kPa, recu ${kPa}.`
          );
        }
        return fixedPoint(kPa, 3, 2);
      },
      unit: "kPa",
      description: "\xC9criture seule : aucune commande de relecture document\xE9e."
    }),
    param({
      key: "flowUnits",
      label: "Unit\xE9s de d\xE9bit",
      read: "RU",
      write: "SU",
      codec: tsiFlowUnits,
      encode: (units) => {
        const normalized = String(units).trim().toLowerCase();
        if (["s", "std", "standard", "slpm", "std l/min"].includes(normalized)) return "S";
        if (["v", "vol", "volumetric", "vol l/min", "volumetric l/min"].includes(normalized)) {
          return "V";
        }
        throw new ConfigurationError("Les unites de debit TSI doivent etre standard ou volumetric.");
      },
      description: "Unit\xE9s de d\xE9bit standard ou volum\xE9triques."
    }),
    param({
      key: "sampleRate",
      label: "P\xE9riode d'\xE9chantillonnage",
      read: "RSR",
      write: "SSR",
      codec: asInt("RSR"),
      encode: (ms) => padded(requireInt(ms, 1, 1e3, "Periode d'echantillonnage TSI"), 4),
      unit: "ms",
      description: "P\xE9riode d'\xE9chantillonnage interne, s\xE9rie et analogique."
    }),
    param({
      key: "analogFullScale",
      label: "Pleine \xE9chelle analogique",
      read: "RAS",
      write: "SAS",
      codec: asInt("RAS"),
      encode: (slpm) => padded(requireInt(slpm, 1, 300, "Pleine echelle analogique TSI"), 3),
      unit: "Std L/min"
    }),
    param({
      key: "analogZeroOffset",
      label: "Offset z\xE9ro analogique",
      read: "RAZ",
      write: "SAZ",
      codec: asInt("RAZ"),
      encode: (mV) => {
        const value = requireInt(mV, -100, 100, "Offset zero analogique TSI");
        return value < 0 ? `-${padded(Math.abs(value), 3)}` : padded(value, 3);
      },
      unit: "mV"
    }),
    param({
      key: "beginTrigger",
      label: "D\xE9clencheur de d\xE9but",
      read: "RBT",
      write: "SBT",
      codec: tsiTriggerCodec("BT"),
      encode: encodeTsiTrigger,
      description: "Seuil de d\xE9clenchement de d\xE9but, effa\xE7able via CBT."
    }),
    param({
      key: "endTrigger",
      label: "D\xE9clencheur de fin",
      read: "RET",
      write: "SET",
      codec: tsiTriggerCodec("ET"),
      encode: encodeTsiTrigger,
      description: "Seuil de d\xE9clenchement de fin, effa\xE7able via CET."
    }),
    param({
      key: "displayUpdateRate",
      label: "P\xE9riode de rafra\xEEchissement LCD",
      read: "RUR",
      write: "SUR",
      codec: asInt("RUR"),
      encode: (ms) => padded(requireInt(ms, 50, 5e3, "Periode de rafraichissement TSI"), 4),
      unit: "ms"
    }),
    param({
      key: "displayMode",
      label: "Mode d'affichage",
      read: "RDM",
      write: "SDM",
      codec: tsiDisplayMode,
      encode: encodeTsiDisplayMode,
      description: "Mode d'affichage LCD simple ou s\xE9quence. S\xE9rie 4100 uniquement."
    }),
    param({
      key: "displayUnits",
      label: "Unit\xE9s affich\xE9es",
      read: "RDU",
      write: "SDU",
      codec: tsiDisplayUnits,
      encode: encodeTsiDisplayUnits,
      description: "Unit\xE9s de d\xE9bit affich\xE9es sur LCD. S\xE9rie 4100 uniquement."
    })
  ],
  actions: [
    action({ key: "ping", label: "Ping", command: "?", category: "diagnostic" }),
    action({ key: "save", label: "Enregistrer les r\xE9glages", command: "SAVE", category: "configuration" }),
    action({
      key: "restoreDefaults",
      label: "R\xE9initialisation usine",
      command: "DEFAULT",
      category: "configuration"
    }),
    action({
      key: "clearBeginTrigger",
      label: "Effacer d\xE9clencheur de d\xE9but",
      command: "CBT",
      category: "trigger"
    }),
    action({
      key: "clearEndTrigger",
      label: "Effacer d\xE9clencheur de fin",
      command: "CET",
      category: "trigger"
    })
  ]
});
function createTsi4000(link) {
  return createInstrument(tsi4000, link);
}
function buildTsiMeasurementCommand(request = {}) {
  const includeFlow = request.includeFlow ?? true;
  const includeTemperature = request.includeTemperature ?? false;
  const includePressure = request.includePressure ?? false;
  const sampleCount = request.sampleCount ?? 1;
  if (!includeFlow && !includeTemperature && !includePressure) {
    throw new ConfigurationError("Une mesure TSI doit inclure au moins un champ.");
  }
  if (!Number.isInteger(sampleCount) || sampleCount < 1 || sampleCount > 9999) {
    throw new ConfigurationError(
      `Nombre d'echantillons TSI invalide : attendu entre 1 et 9999, recu ${sampleCount}.`
    );
  }
  return `DA${includeFlow ? "F" : "x"}${includeTemperature ? "T" : "x"}${includePressure ? "P" : "x"}${padded(sampleCount, 4)}`;
}
function parseTsiMeasurement(raw, request = {}) {
  const includeFlow = request.includeFlow ?? true;
  const includeTemperature = request.includeTemperature ?? false;
  const includePressure = request.includePressure ?? false;
  const cleaned = raw.trim();
  if (!cleaned) throw new ProtocolError("Reponse de mesure TSI vide.");
  const values = cleaned.split(",").map((part) => part.trim()).filter(Boolean);
  const expected = [includeFlow, includeTemperature, includePressure].filter(Boolean).length;
  if (values.length !== expected) {
    throw new ProtocolError(`Mesure TSI : ${expected} valeurs attendues, recu "${cleaned}".`);
  }
  const measurement = { sampleCount: request.sampleCount ?? 1, raw: cleaned };
  let index = 0;
  const next = (field) => {
    const value = Number.parseFloat(values[index]);
    if (!Number.isFinite(value)) {
      throw new ProtocolError(`Mesure TSI : ${field} non numerique dans "${cleaned}".`);
    }
    index += 1;
    return value;
  };
  if (includeFlow) measurement.flow = next("debit");
  if (includeTemperature) measurement.temperature = next("temperature");
  if (includePressure) measurement.pressure = next("pression");
  return measurement;
}
async function readTsiMeasurement(instrument, request = {}, options = {}) {
  const command = buildTsiMeasurementCommand(request);
  const raw = await instrument.raw(command, "", {
    ...options,
    context: { expectsValue: true, ...options.context }
  });
  return parseTsiMeasurement(raw, request);
}
function tsiSeriesOf(modelNumber) {
  const cleaned = String(modelNumber ?? "").trim();
  if (/^41\d{2}/.test(cleaned)) return "4100";
  if (/^40\d{2}/.test(cleaned)) return "4000";
  return null;
}
async function readTsiIdentity(instrument) {
  const [serialNumber, modelNumber, firmwareRevision, calibrationDate] = await Promise.allSettled([
    instrument.readSerialNumber(),
    instrument.readModelNumber(),
    instrument.readFirmwareRevision(),
    instrument.readCalibrationDate()
  ]);
  const model = modelNumber.status === "fulfilled" ? modelNumber.value : null;
  const series = tsiSeriesOf(model);
  return {
    serialNumber,
    modelNumber,
    firmwareRevision,
    calibrationDate,
    series,
    supportsDisplayCommands: series === "4100"
  };
}

export { buildTsiMeasurementCommand, createTsi4000, encodeTsiDisplayMode, encodeTsiDisplayUnits, encodeTsiTrigger, parseTsiMeasurement, readTsiIdentity, readTsiMeasurement, tsi4000, tsiDisplayMode, tsiDisplayUnits, tsiFlowUnits, tsiSeriesOf, tsiTriggerCodec };
//# sourceMappingURL=chunk-KGEZEL4S.js.map
//# sourceMappingURL=chunk-KGEZEL4S.js.map