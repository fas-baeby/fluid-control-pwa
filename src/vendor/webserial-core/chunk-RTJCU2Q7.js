import { asKeyedEnum } from './chunk-Z5NZJSCE.js';
import { createInstrument } from './chunk-ZRL2DAVD.js';
import { lineFraming } from './chunk-X46GM2F5.js';
import { defineDevice, action, param } from './chunk-EM4MNF4I.js';
import { defineCodec, ProtocolError, DeviceError, ConfigurationError } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/devices/sylvac-sdial.ts
var SYLVAC_MODES = {
  NOR: "Normal (mesure)",
  REF: "R\xE9f\xE9rence",
  MIN: "Minimum",
  MAX: "Maximum",
  DEL: "Delta",
  TOL1: "Tol\xE9rance"
};
var SYLVAC_ERRORS = {
  0: "Erreur capteur (vitesse ou distance d'\xE9chelle)",
  1: "Commande incorrecte",
  2: "Erreur de parit\xE9 (instruments duplex uniquement)",
  3: "\xC9tendue de mesure d\xE9pass\xE9e"
};
function rejectSylvacError(raw) {
  const cleaned = raw.trim();
  if (!cleaned.toUpperCase().startsWith("ERR")) return cleaned;
  const code = Number.parseInt(cleaned.slice(3), 10);
  throw new DeviceError(
    `Sylvac ERR${code} : ${SYLVAC_ERRORS[code] ?? "code d'erreur inconnu"}.`,
    `ERR${code}`
  );
}
var SYLVAC_VALUE = /^([+\- ]?)(\d+)\.(\d+)([<=>]?)$/;
var TOLERANCE = { "<": "under", "=": "pass", ">": "over" };
var sylvacReading = defineCodec("PRI", (input) => {
  const cleaned = rejectSylvacError(input);
  if (!cleaned) throw new ProtocolError("Reponse vide du Sylvac S_Dial.");
  const match = cleaned.match(SYLVAC_VALUE);
  if (!match) throw new ProtocolError(`Reponse Sylvac inattendue : "${cleaned}".`);
  const magnitude = Number.parseFloat(`${match[2]}.${match[3]}`);
  if (!Number.isFinite(magnitude)) {
    throw new ProtocolError(`Valeur numerique invalide dans "${cleaned}".`);
  }
  const symbol = match[4] || null;
  return {
    value: match[1] === "-" ? -magnitude : magnitude,
    toleranceSymbol: symbol,
    toleranceStatus: symbol ? TOLERANCE[symbol] ?? null : null
  };
});
var sylvacPreset = defineCodec("PRE?", (input) => {
  const cleaned = rejectSylvacError(input);
  const match = cleaned.match(SYLVAC_VALUE);
  if (!match) throw new ProtocolError(`Preset Sylvac illisible : "${cleaned}".`);
  const magnitude = Number.parseFloat(`${match[2]}.${match[3]}`);
  return match[1] === "-" ? -magnitude : magnitude;
});
function encodeSylvacPreset(value) {
  if (!Number.isFinite(value)) {
    throw new ConfigurationError("Le preset Sylvac doit etre un nombre fini.");
  }
  return `${value >= 0 ? "+" : "-"}${Math.abs(value).toFixed(3)}`;
}
var sylvacSettings = defineCodec("SET?", (input) => {
  const cleaned = rejectSylvacError(input);
  const settings = { flags: [], raw: cleaned };
  for (const token of cleaned.toUpperCase().split(/\s+/).filter(Boolean)) {
    if (token === "MM" || token === "IN") settings.unit = token;
    else if (token === "RES2" || token === "RES3") settings.resolution = token;
    else if (token === "REF1" || token === "REF2") settings.reference = token;
    else if (token === "B1") settings.battery = "OK";
    else if (token === "B0") settings.battery = "Replace";
    else settings.flags.push(token);
  }
  return settings;
});
var sylvacIdentification = defineCodec("ID?", (input) => {
  const cleaned = rejectSylvacError(input);
  const parts = cleaned.split(".");
  const head = parts[0] ?? "";
  return {
    manufacturer: head.slice(0, 2) || null,
    instrument: head.slice(2) || null,
    option1: parts[1] ?? null,
    option2: parts[2] ?? null,
    raw: cleaned
  };
});
var sylvacSDial = defineDevice({
  id: "sylvac-sdial",
  label: "Sylvac S_Dial",
  framing: lineFraming({ terminator: "\r" }),
  portOptions: { baudRate: 4800, dataBits: 7, stopBits: 2, parity: "even" },
  defaultTimeout: 1e3,
  params: [
    param({
      key: "displayedValue",
      label: "Valeur affich\xE9e",
      read: "PRI",
      codec: sylvacReading,
      description: "Valeur courante avec son \xE9ventuel verdict de tol\xE9rance."
    }),
    param({
      key: "mode",
      label: "Mode de fonctionnement",
      read: "MOD?",
      codec: asKeyedEnum(SYLVAC_MODES, { name: "MOD?", normalize: (raw) => raw.toUpperCase() }),
      description: "Mode de mesure actuel : NOR, REF, MIN, MAX, DEL, TOL1."
    }),
    param({
      key: "preset",
      label: "Valeur de preset",
      read: "PRE?",
      write: "PRE ",
      codec: sylvacPreset,
      encode: encodeSylvacPreset,
      reply: "none",
      description: "Valeur de preset de la r\xE9f\xE9rence active."
    }),
    param({
      key: "settings",
      label: "Param\xE8tres principaux",
      read: "SET?",
      codec: sylvacSettings,
      description: "Unit\xE9, r\xE9solution, r\xE9f\xE9rence, \xE9tat batterie."
    }),
    param({
      key: "identification",
      label: "Identification",
      read: "ID?",
      codec: sylvacIdentification,
      description: "Fabricant, instrument, versions d'options."
    })
  ],
  actions: [
    action({ key: "setUnitMM", label: "Unit\xE9 millim\xE8tres", command: "MM", category: "configuration", reply: "none" }),
    action({ key: "setUnitInch", label: "Unit\xE9 pouces", command: "IN", category: "configuration", reply: "none" }),
    action({ key: "setResolution001", label: "R\xE9solution 0.001 mm", command: "RES2", category: "configuration", reply: "none" }),
    action({ key: "setResolution01", label: "R\xE9solution 0.01 mm", command: "RES3", category: "configuration", reply: "none" }),
    action({ key: "setReference1", label: "R\xE9f\xE9rence 1", command: "REF1", category: "configuration", reply: "none" }),
    action({ key: "setReference2", label: "R\xE9f\xE9rence 2", command: "REF2", category: "configuration", reply: "none" }),
    action({ key: "recallPreset", label: "Rappeler le preset", command: "PRE", category: "configuration", reply: "none" }),
    action({ key: "resetToNormal", label: "Revenir en mode normal", command: "NOR", category: "contr\xF4le", reply: "none" }),
    action({ key: "reset", label: "R\xE9initialiser", command: "RST", category: "contr\xF4le", reply: "none" }),
    action({ key: "powerOn", label: "Allumer", command: "ON", category: "contr\xF4le", reply: "none" }),
    action({ key: "powerOff", label: "\xC9teindre", command: "OFF", category: "contr\xF4le", reply: "none" }),
    action({ key: "enableHold", label: "Geler la valeur", command: "STO1", category: "contr\xF4le", reply: "none" }),
    action({ key: "disableHold", label: "D\xE9geler la valeur", command: "STO0", category: "contr\xF4le", reply: "none" }),
    action({ key: "enableContinuousOutput", label: "Transfert continu activ\xE9", command: "OUT1", category: "mesure", reply: "none" }),
    action({ key: "disableContinuousOutput", label: "Transfert continu d\xE9sactiv\xE9", command: "OUT0", category: "mesure", reply: "none" })
  ]
});
function createSylvacSDial(link) {
  return createInstrument(sylvacSDial, link);
}

export { SYLVAC_ERRORS, SYLVAC_MODES, createSylvacSDial, encodeSylvacPreset, sylvacIdentification, sylvacPreset, sylvacReading, sylvacSDial, sylvacSettings };
//# sourceMappingURL=chunk-RTJCU2Q7.js.map
//# sourceMappingURL=chunk-RTJCU2Q7.js.map