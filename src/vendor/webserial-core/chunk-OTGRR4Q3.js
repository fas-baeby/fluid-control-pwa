import { asBitStruct, bit } from './chunk-MZ3FVZAH.js';
import { asEnum, asText } from './chunk-Z5NZJSCE.js';
import { createInstrument } from './chunk-ZRL2DAVD.js';
import { lineFraming } from './chunk-X46GM2F5.js';
import { defineDevice, param } from './chunk-EM4MNF4I.js';
import { defineCodec, ProtocolError, ConfigurationError } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/devices/kistler-5015.ts
var KISTLER_TIME_CONSTANTS = {
  0: "DC (Long)",
  1: "Short",
  2: "Medium",
  9: "Autre (lecture seule)"
};
var KISTLER_LOW_PASS_FILTERS = {
  0: "LP off (200 kHz)",
  1: "10 Hz",
  2: "30 Hz",
  3: "100 Hz",
  4: "300 Hz",
  5: "1 kHz",
  6: "3 kHz",
  7: "10 kHz",
  8: "30 kHz",
  9: "Autre (lecture seule)"
};
function boundedFloat(name, min, max) {
  return defineCodec(name, (raw) => {
    const value = Number.parseFloat(raw.trim());
    if (!Number.isFinite(value) || value < min || value > max) {
      throw new ProtocolError(`${name} : valeur hors plage "${raw}".`);
    }
    return value;
  });
}
function encodeKistlerScientific(value, label, min, max) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new ConfigurationError(
      `${label} : attendu entre ${min.toExponential(3)} et ${max.toExponential(3)}, recu ${value}.`
    );
  }
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / 10 ** exponent;
  return `${mantissa.toFixed(3)}E${exponent >= 0 ? "+" : "-"}${Math.abs(exponent)}`;
}
function requireCode(value, allowed, label) {
  if (!allowed.includes(value)) {
    throw new ConfigurationError(`${label} : attendu ${allowed.join(", ")}, recu ${value}.`);
  }
  return String(value);
}
var kistlerErrorFlags = asBitStruct(
  {
    syntaxError: bit(0),
    bufferOverflow: bit(1),
    chargeAmplifierOverloaded: bit(3),
    zeroPointError: bit(4),
    commandReceived: bit(5)
  },
  { name: "CE" }
);
var kistler5015 = defineDevice({
  id: "kistler-5015",
  label: "Kistler 5015",
  framing: lineFraming({ terminator: "\r\n", stripEchoedCommand: true }),
  portOptions: { baudRate: 9600, dataBits: 8, stopBits: 1, parity: "none" },
  defaultTimeout: 1e3,
  params: [
    param({
      key: "instantaneousValue",
      label: "Valeur instantan\xE9e",
      read: "V=",
      codec: defineCodec("V=", (raw) => {
        const value = Number.parseFloat(raw.trim());
        if (!Number.isFinite(value)) {
          throw new ProtocolError(`V= : valeur instantanee invalide "${raw}".`);
        }
        return value;
      }),
      description: "Valeur mesur\xE9e courante de l'amplificateur de charge."
    }),
    param({
      key: "sensitivity",
      label: "Sensibilit\xE9",
      read: "TS",
      write: "TS",
      codec: boundedFloat("TS", 0.01, 9999),
      encode: (value) => encodeKistlerScientific(value, "Sensibilite Kistler", 0.01, 9999),
      reply: "none",
      unit: "pC/M.U.",
      description: "Sensibilit\xE9 de l'amplificateur de charge. 1.000E-2 \xE0 9.999E+3 pC/M.U."
    }),
    param({
      key: "scaleVoltage",
      label: "\xC9chelle de la sortie tension",
      read: "SC",
      write: "SC",
      codec: boundedFloat("SC", 1e-5, 9999e5),
      encode: (value) => encodeKistlerScientific(value, "Echelle de sortie Kistler", 1e-5, 9999e5),
      reply: "none",
      unit: "M.U./V",
      description: "\xC9chelle de la sortie tension. 1.000E-5 \xE0 9.999E+8 M.U./V."
    }),
    param({
      key: "timeConstant",
      label: "Constante de temps (passe-haut)",
      read: "TC",
      write: "TC",
      codec: asEnum(KISTLER_TIME_CONSTANTS, { name: "TC" }),
      encode: (code) => requireCode(code, [0, 1, 2], "Constante de temps Kistler"),
      reply: "none",
      description: "0=DC (Long), 1=Short, 2=Medium."
    }),
    param({
      key: "lowPassFilter",
      label: "Fr\xE9quence de coupure passe-bas",
      read: "LP",
      write: "LP",
      codec: asEnum(KISTLER_LOW_PASS_FILTERS, { name: "LP" }),
      encode: (code) => requireCode(code, [0, 1, 2, 3, 4, 5, 6, 7, 8], "Filtre passe-bas Kistler"),
      reply: "none",
      description: "0=off (200 kHz), 1=10 Hz ... 8=30 kHz."
    }),
    param({
      key: "errorCode",
      label: "Code d'erreur",
      read: "CE",
      codec: kistlerErrorFlags,
      description: "Mot d'\xE9tat : erreur de syntaxe, d\xE9bordement, surcharge, erreur de z\xE9ro."
    }),
    param({
      key: "firmwareVersion",
      label: "Version firmware",
      read: "CV",
      codec: asText
    }),
    param({
      key: "measureControl",
      label: "Contr\xF4le de mesure",
      write: "RO",
      codec: asText,
      encode: (active) => active ? "1" : "0",
      reply: "none",
      description: "0=inactif (Reset), 1=actif (Operate)."
    }),
    param({
      key: "localControl",
      label: "Verrouillage des commandes locales",
      write: "CL",
      codec: asText,
      encode: (locked) => locked ? "1" : "0",
      reply: "none",
      description: "0=d\xE9verrouill\xE9, 1=verrouill\xE9 (Esc et Enter restent actifs)."
    }),
    param({
      key: "measuringCycleControl",
      label: "Contr\xF4le du cycle de mesure",
      write: "CX",
      codec: asText,
      encode: (remote) => remote ? "1" : "0",
      reply: "none",
      description: "0=local (boutons Meas/F), 1=distant via l'entr\xE9e Remote Control."
    }),
    param({
      key: "replyTerminator",
      label: "Terminateur de r\xE9ponse",
      write: "CT",
      codec: asText,
      encode: (mode) => requireCode(mode, [0, 1, 2], "Terminateur de reponse Kistler"),
      reply: "none",
      description: "0=<cr><lf>, 1=<cr>, 2=<lf>. Modifier ce r\xE9glage impose de reconfigurer le framing."
    }),
    param({
      key: "commandCodeReply",
      label: "\xC9cho du code de commande",
      write: "CH",
      codec: asText,
      encode: (include) => include ? "1" : "0",
      reply: "none",
      description: "0=supprim\xE9, 1=la r\xE9ponse est pr\xE9fix\xE9e du code de commande."
    })
  ]
});
function createKistler5015(link) {
  return createInstrument(kistler5015, link);
}

export { KISTLER_LOW_PASS_FILTERS, KISTLER_TIME_CONSTANTS, createKistler5015, encodeKistlerScientific, kistler5015, kistlerErrorFlags };
//# sourceMappingURL=chunk-OTGRR4Q3.js.map
//# sourceMappingURL=chunk-OTGRR4Q3.js.map