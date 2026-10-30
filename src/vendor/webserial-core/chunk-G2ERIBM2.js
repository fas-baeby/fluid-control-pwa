import { lineFraming } from './chunk-X46GM2F5.js';
import { defineDevice, param } from './chunk-EM4MNF4I.js';
import { defineCodec, ProtocolError } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/devices/scale.ts
var SCALE_PATTERN = /^(?:(?<status>[A-Z]{2})[\s,]+)?(?:(?<mode>[A-Z]{1,3})[\s,]+)?(?<value>[+-]?\d+(?:\.\d+)?)(?:[\s,]+(?<unit>[A-Za-z%/]+))?$/i;
var scaleReading = defineCodec("scaleReading", (raw) => {
  const cleaned = raw.trim();
  if (!cleaned) throw new ProtocolError("Reponse vide de la balance.");
  const match = cleaned.match(SCALE_PATTERN);
  if (!match?.groups) {
    throw new ProtocolError(`Reponse de balance non supportee : "${cleaned}".`);
  }
  const value = Number.parseFloat(match.groups["value"]);
  if (!Number.isFinite(value)) {
    throw new ProtocolError(`Valeur numerique invalide dans "${cleaned}".`);
  }
  return {
    value,
    unit: match.groups["unit"] ?? null,
    status: match.groups["status"]?.toUpperCase() ?? null,
    mode: match.groups["mode"]?.toUpperCase() ?? null
  };
});
function scaleDevice(command = "SI") {
  return defineDevice({
    id: "generic-scale",
    label: "Balance serie",
    framing: lineFraming({ terminator: "\r\n" }),
    portOptions: { baudRate: 9600 },
    defaultTimeout: 1e3,
    params: [
      param({
        key: "weight",
        label: "Poids",
        read: command,
        codec: scaleReading,
        description: "Mesure courante renvoyee par la balance."
      })
    ]
  });
}
var scale = scaleDevice();

export { scale, scaleDevice, scaleReading };
//# sourceMappingURL=chunk-G2ERIBM2.js.map
//# sourceMappingURL=chunk-G2ERIBM2.js.map