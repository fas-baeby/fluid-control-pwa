import { toMessage, ProtocolError } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/core/result.ts
function ok(value = {}) {
  return { success: true, ...value };
}
function err(error, extra = {}) {
  return { success: false, error, ...extra };
}
function isOk(result) {
  return result.success;
}
function isErr(result) {
  return !result.success;
}
async function toResult(operation, context) {
  try {
    return ok(await operation());
  } catch (error) {
    return err(context ? context(error) : toMessage(error));
  }
}

// src/codec/crc.ts
function modbus(at, length) {
  let crc = 65535;
  for (let i = 0; i < length; i += 1) {
    crc ^= at(i);
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 1) !== 0 ? crc >> 1 ^ 40961 : crc >> 1;
    }
  }
  return crc & 65535;
}
function crc16Modbus(data) {
  return modbus((i) => data.charCodeAt(i), data.length).toString(16).padStart(4, "0");
}
function crc16ModbusBytes(bytes) {
  return modbus((i) => bytes[i], bytes.length);
}
function isCrcValid(frame, compute = crc16Modbus) {
  if (frame.length < 4) return false;
  const received = frame.slice(-4);
  return received.toLowerCase() === compute(frame.slice(0, -4)).toLowerCase();
}

// src/codec/hex.ts
var HexCursor = class {
  constructor(source, label = "trame") {
    this.source = source;
    this.label = label;
  }
  #pos = 0;
  get offset() {
    return this.#pos;
  }
  get remaining() {
    return Math.max(this.source.length - this.#pos, 0);
  }
  get exhausted() {
    return this.remaining === 0;
  }
  seek(position) {
    this.#pos = position;
  }
  skip(chars) {
    this.#pos += chars;
  }
  peek(chars) {
    return this.source.slice(this.#pos, this.#pos + chars);
  }
  take(chars) {
    if (this.#pos + chars > this.source.length) {
      throw new ProtocolError(
        `${this.label} tronquee : ${chars} caracteres demandes a l'offset ${this.#pos}, ${this.remaining} disponibles.`
      );
    }
    const slice = this.source.slice(this.#pos, this.#pos + chars);
    this.#pos += chars;
    return slice;
  }
  rest() {
    return this.take(this.remaining);
  }
  ascii(chars, options = {}) {
    const raw = this.take(chars);
    return options.trim === false ? raw : raw.trim();
  }
  uint8() {
    return this.#integer(2);
  }
  uint16() {
    return this.#integer(4);
  }
  uint32() {
    return this.#integer(8);
  }
  int16() {
    const value = this.#integer(4);
    return value > 32767 ? value - 65536 : value;
  }
  int32() {
    const value = this.#integer(8);
    return value > 2147483647 ? value - 4294967296 : value;
  }
  float32(littleEndian = false) {
    return hexToFloat32(this.take(8), littleEndian);
  }
  #integer(chars) {
    const raw = this.take(chars);
    const value = Number.parseInt(raw, 16);
    if (!Number.isInteger(value)) {
      throw new ProtocolError(`${this.label} : hexadecimal invalide "${raw}" a l'offset ${this.#pos - chars}.`);
    }
    return value;
  }
};
function hexToFloat32(hex, littleEndian = false) {
  if (hex.length !== 8) {
    throw new ProtocolError(`float32 attend 8 caracteres hexadecimaux, recu ${hex.length}.`);
  }
  const view = new DataView(new ArrayBuffer(4));
  for (let i = 0; i < 4; i += 1) {
    const byte = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    if (!Number.isInteger(byte)) {
      throw new ProtocolError(`float32 : hexadecimal invalide "${hex}".`);
    }
    view.setUint8(i, byte);
  }
  return view.getFloat32(0, littleEndian);
}
function float32ToHex(value, littleEndian = false) {
  const view = new DataView(new ArrayBuffer(4));
  view.setFloat32(0, value, littleEndian);
  let hex = "";
  for (let i = 0; i < 4; i += 1) {
    hex += view.getUint8(i).toString(16).padStart(2, "0");
  }
  return hex;
}
function intToHex(value, chars) {
  const normalized = value < 0 ? value + 16 ** chars : value;
  return normalized.toString(16).padStart(chars, "0").slice(-chars);
}

// src/codec/struct.ts
var VARIABLE_SIZE = -1;
function field(name, size, read) {
  return { name, size, read };
}
var uint8 = field("uint8", 2, (cursor) => cursor.uint8());
var uint16 = field("uint16", 4, (cursor) => cursor.uint16());
var uint32 = field("uint32", 8, (cursor) => cursor.uint32());
var int16 = field("int16", 4, (cursor) => cursor.int16());
var int32 = field("int32", 8, (cursor) => cursor.int32());
var float32 = field("float32", 8, (cursor) => cursor.float32());
var rest = field("rest", VARIABLE_SIZE, (cursor) => cursor.rest());
function ascii(chars, options = {}) {
  return field("ascii", chars, (cursor) => cursor.ascii(chars, options));
}
function skip(chars) {
  return {
    name: "skip",
    size: chars,
    skip: true,
    read: (cursor) => {
      cursor.skip(chars);
      return null;
    }
  };
}
function array(item, count) {
  const size = item.size === VARIABLE_SIZE ? VARIABLE_SIZE : item.size * count;
  return field(`${item.name}[${count}]`, size, (cursor) => {
    const values = [];
    for (let i = 0; i < count; i += 1) values.push(item.read(cursor));
    return values;
  });
}
function pid() {
  return field("pid", 24, (cursor) => [cursor.float32(), cursor.float32(), cursor.float32()]);
}
function mapField(source, transform) {
  return field(`${source.name}->mapped`, source.size, (cursor) => transform(source.read(cursor)));
}
function struct(shape, options = {}) {
  const name = options.name ?? "struct";
  const entries = Object.entries(shape);
  const size = entries.some(([, f]) => f.size === VARIABLE_SIZE) ? VARIABLE_SIZE : entries.reduce((total, [, f]) => total + f.size, 0);
  function decode(hex) {
    const cursor = new HexCursor(hex, name);
    const output = {};
    for (const [key, spec] of entries) {
      const value = spec.read(cursor);
      if (!spec.skip) output[key] = value;
    }
    return output;
  }
  return {
    name,
    size,
    fields: entries.map(([key]) => key),
    decode,
    decodeResult(hex) {
      try {
        const decoded = decode(hex);
        return ok({
          ...decoded,
          rawData: hex,
          dataLength: hex.length,
          isComplete: size === VARIABLE_SIZE || hex.length >= size
        });
      } catch (error) {
        return err(`Failed to parse ${name} data: ${toMessage(error)}`, { rawData: hex });
      }
    }
  };
}

export { HexCursor, VARIABLE_SIZE, array, ascii, crc16Modbus, crc16ModbusBytes, err, float32, float32ToHex, hexToFloat32, int16, int32, intToHex, isCrcValid, isErr, isOk, mapField, ok, pid, rest, skip, struct, toResult, uint16, uint32, uint8 };
//# sourceMappingURL=chunk-7V5XXNHL.js.map
//# sourceMappingURL=chunk-7V5XXNHL.js.map