import { defineCodec, ProtocolError } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/codec/bits.ts
function bit(offset) {
  return { kind: "bit", offset };
}
function bits(offset, length, labels) {
  return { kind: "bits", offset, length, labels };
}
function decodeBits(shape, word) {
  const output = { raw: word };
  for (const [key, field] of Object.entries(shape)) {
    if (field.kind === "bit") {
      output[key] = (word & 1 << field.offset) !== 0;
      continue;
    }
    const mask = (1 << field.length) - 1;
    const code = word >> field.offset & mask;
    output[key] = field.labels ? { code, label: field.labels[code] ?? `Inconnu (${code})` } : code;
  }
  return output;
}
function asBitStruct(shape, options = {}) {
  const { name = "bits", radix = 10 } = options;
  return defineCodec(name, (raw) => {
    const word = Number.parseInt(raw.trim(), radix);
    if (!Number.isInteger(word)) {
      throw new ProtocolError(`${name} : mot d'etat invalide "${raw}".`);
    }
    return decodeBits(shape, word);
  });
}

export { asBitStruct, bit, bits, decodeBits };
//# sourceMappingURL=chunk-MZ3FVZAH.js.map
//# sourceMappingURL=chunk-MZ3FVZAH.js.map