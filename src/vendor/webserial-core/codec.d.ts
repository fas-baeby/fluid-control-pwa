import { C as Codec } from './codec-C_X5zMVV.js';
export { D as Decoded, d as defineCodec, m as mapCodec } from './codec-C_X5zMVV.js';
export { B as BitFlags, E as EnumValue, a as FieldSpec, F as FieldsOutput, b as asBitFlags, c as asBool, d as asDigitFlags, e as asEnum, f as asFields, g as asFloat, h as asInt, i as asKeyedEnum, j as asText } from './primitives-CP8ivAQc.js';
export { A as AnyBitField, a as BitField, b as BitShape, B as BitStructOutput, R as RangeField, c as asBitStruct, d as bit, e as bits, f as decodeBits } from './bits-cVmwxCUN.js';
export { F as Field, H as HexCursor, b as SkipField, S as StructCodec, c as StructMeta, a as StructOutput, d as StructShape, V as VARIABLE_SIZE, e as array, f as ascii, h as float32, i as float32ToHex, j as hexToFloat32, k as int16, l as int32, m as intToHex, p as mapField, r as pid, s as rest, t as skip, u as struct, w as uint16, x as uint32, y as uint8 } from './struct-GZ2q60gQ.js';

/**
 * Agilent 3G "Compressed Format": mantissa followed by a signed exponent,
 * e.g. "423-09" = 423e-9 = 4.23e-7. Some firmwares answer in plain decimal instead.
 */
declare function asCompressed(name?: string): Codec<number>;
declare function compressedToString(value: number, digits?: number): string;

/** Frame checksum, as 4 lowercase hex characters. */
declare function crc16Modbus(data: string): string;
/** Block checksum over raw bytes, as a 16-bit number. */
declare function crc16ModbusBytes(bytes: Uint8Array): number;
declare function isCrcValid(frame: string, compute?: (data: string) => string): boolean;

export { Codec, asCompressed, compressedToString, crc16Modbus, crc16ModbusBytes, isCrcValid };
