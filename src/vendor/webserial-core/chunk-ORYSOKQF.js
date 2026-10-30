import { defineCodec, ProtocolError } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/codec/compressed.ts
var CF_PATTERN = /^(-?\d+)([+-]\d+)$/;
function asCompressed(name = "cf") {
  return defineCodec(name, (raw) => {
    const token = raw.trim().split(/\s+/)[0] ?? "";
    const match = token.match(CF_PATTERN);
    if (match) {
      const mantissa = Number.parseInt(match[1], 10);
      const exponent = Number.parseInt(match[2], 10);
      const value = mantissa * 10 ** exponent;
      if (Number.isFinite(value)) return value;
    }
    const plain = Number.parseFloat(token);
    if (Number.isFinite(plain)) return plain;
    throw new ProtocolError(`${name} : format compresse invalide "${raw}".`);
  });
}
function compressedToString(value, digits = 3) {
  if (!Number.isFinite(value)) {
    throw new ProtocolError(`Valeur non finie, non representable en format compresse : ${value}.`);
  }
  if (value === 0) return `0+00`;
  const exponent = Math.floor(Math.log10(Math.abs(value))) - (digits - 1);
  const mantissa = Math.round(value / 10 ** exponent);
  const sign = exponent < 0 ? "-" : "+";
  return `${mantissa}${sign}${Math.abs(exponent).toString().padStart(2, "0")}`;
}

export { asCompressed, compressedToString };
//# sourceMappingURL=chunk-ORYSOKQF.js.map
//# sourceMappingURL=chunk-ORYSOKQF.js.map