import { defineCodec, ProtocolError } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/codec/primitives.ts
var asText = defineCodec(
  "text",
  (raw) => raw.trim(),
  (value) => value
);
function asFloat(name = "float") {
  return defineCodec(
    name,
    (raw) => {
      const value = Number.parseFloat(raw.trim());
      if (!Number.isFinite(value)) {
        throw new ProtocolError(`${name} : valeur non numerique "${raw}".`);
      }
      return value;
    },
    (value) => String(value)
  );
}
function asInt(name = "int", radix = 10) {
  return defineCodec(
    name,
    (raw) => {
      const value = Number.parseInt(raw.trim(), radix);
      if (!Number.isInteger(value)) {
        throw new ProtocolError(`${name} : entier invalide "${raw}".`);
      }
      return value;
    },
    (value) => value.toString(radix)
  );
}
function asBool(truthy = "1", name = "bool") {
  const matches = typeof truthy === "string" ? (raw) => raw === truthy : (raw) => truthy.test(raw);
  return defineCodec(
    name,
    (raw) => matches(raw.trim()),
    (value) => value ? "1" : "0"
  );
}
function asEnum(map, options = {}) {
  const { name = "enum", radix = 10 } = options;
  return defineCodec(name, (raw) => {
    const code = Number.parseInt(raw.trim(), radix);
    if (!Number.isInteger(code)) {
      throw new ProtocolError(`${name} : code invalide "${raw}".`);
    }
    return { code, label: map[code] ?? `Inconnu (${code})` };
  });
}
function asKeyedEnum(map, options = {}) {
  const { name = "enum", normalize } = options;
  return defineCodec(name, (raw) => {
    const trimmed = raw.trim();
    const code = normalize ? normalize(trimmed) : trimmed;
    return { code, label: map[code] ?? `Inconnu (${code})` };
  });
}
function asDigitFlags(keys, options = {}) {
  const { name = "digitFlags", truthy = "1" } = options;
  return defineCodec(name, (raw) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length < keys.length) {
      throw new ProtocolError(
        `${name} : ${keys.length} chiffres attendus, ${digits.length} recus dans "${raw}".`
      );
    }
    const output = {};
    keys.forEach((key, index) => {
      output[key] = digits.charAt(index) === truthy;
    });
    return output;
  });
}
function asBitFlags(labels, options = {}) {
  const { name = "bitflags", radix = 10 } = options;
  const entries = Object.entries(labels).map(([bit, label]) => [Number(bit), label]);
  return defineCodec(name, (raw) => {
    const value = Number.parseInt(raw.trim(), radix);
    if (!Number.isInteger(value)) {
      throw new ProtocolError(`${name} : mot d'etat invalide "${raw}".`);
    }
    const flags = {};
    const active = [];
    for (const [bit, label] of entries) {
      const set = (value & 1 << bit) !== 0;
      flags[label] = set;
      if (set) active.push(label);
    }
    return { raw: value, active, flags };
  });
}
function asFields(fields, options = {}) {
  const { separator = /\s+/, name = "fields" } = options;
  return defineCodec(name, (raw) => {
    const parts = raw.trim().split(separator);
    if (parts.length < fields.length) {
      throw new ProtocolError(
        `${name} : ${fields.length} champs attendus, ${parts.length} recus dans "${raw}".`
      );
    }
    const output = {};
    fields.forEach((field, index) => {
      output[field.key] = field.codec.decode(parts[index]);
    });
    return output;
  });
}

export { asBitFlags, asBool, asDigitFlags, asEnum, asFields, asFloat, asInt, asKeyedEnum, asText };
//# sourceMappingURL=chunk-Z5NZJSCE.js.map
//# sourceMappingURL=chunk-Z5NZJSCE.js.map