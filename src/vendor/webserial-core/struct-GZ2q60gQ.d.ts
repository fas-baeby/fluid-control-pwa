/**
 * Sequential reader over an ASCII-hex payload. Replaces the per-parser getFloat32/getInt16
 * helpers and the manual `pos += 8` arithmetic that silently shifted whole frames.
 */
declare class HexCursor {
    #private;
    private readonly source;
    private readonly label;
    constructor(source: string, label?: string);
    get offset(): number;
    get remaining(): number;
    get exhausted(): boolean;
    seek(position: number): void;
    skip(chars: number): void;
    peek(chars: number): string;
    take(chars: number): string;
    rest(): string;
    ascii(chars: number, options?: {
        trim?: boolean;
    }): string;
    uint8(): number;
    uint16(): number;
    uint32(): number;
    int16(): number;
    int32(): number;
    float32(littleEndian?: boolean): number;
}
declare function hexToFloat32(hex: string, littleEndian?: boolean): number;
declare function float32ToHex(value: number, littleEndian?: boolean): string;
declare function intToHex(value: number, chars: number): string;

type Ok<T extends object = object> = {
    success: true;
} & T;
type Err<E extends object = object> = {
    success: false;
    error: string;
} & E;
type Result<T extends object = object, E extends object = object> = Ok<T> | Err<E>;
declare function ok<T extends object>(value: T): Ok<T>;
declare function ok(): Ok;
declare function err<E extends object>(error: string, extra: E): Err<E>;
declare function err(error: string): Err;
declare function isOk<T extends object, E extends object>(result: Result<T, E>): result is Ok<T>;
declare function isErr<T extends object, E extends object>(result: Result<T, E>): result is Err<E>;
/** Bridge throwing code to the Result shape consumed by the UI layers. */
declare function toResult<T extends object>(operation: () => Promise<T>, context?: (error: unknown) => string): Promise<Result<T>>;

declare const VARIABLE_SIZE = -1;
interface Field<T> {
    readonly name: string;
    /** Length in hex characters, or VARIABLE_SIZE. */
    readonly size: number;
    read(cursor: HexCursor): T;
}
/** Padding field: consumed from the frame but absent from the decoded object. */
interface SkipField extends Field<null> {
    readonly skip: true;
}
declare const uint8: Field<number>;
declare const uint16: Field<number>;
declare const uint32: Field<number>;
declare const int16: Field<number>;
declare const int32: Field<number>;
declare const float32: Field<number>;
declare const rest: Field<string>;
declare function ascii(chars: number, options?: {
    trim?: boolean;
}): Field<string>;
declare function skip(chars: number): SkipField;
declare function array<T>(item: Field<T>, count: number): Field<T[]>;
/** Three consecutive float32: the PID triplet layout used across CHIPREG configuration frames. */
declare function pid(): Field<[number, number, number]>;
declare function mapField<A, B>(source: Field<A>, transform: (value: A) => B): Field<B>;
type StructShape = Record<string, Field<unknown>>;
type StructOutput<S extends StructShape> = {
    [K in keyof S as S[K] extends {
        skip: true;
    } ? never : K]: S[K] extends Field<infer T> ? T : never;
};
interface StructMeta {
    rawData: string;
    dataLength: number;
    isComplete: boolean;
}
interface StructCodec<T> {
    readonly name: string;
    /** Total length in hex characters, or VARIABLE_SIZE when a field is unbounded. */
    readonly size: number;
    readonly fields: readonly string[];
    decode(hex: string): T;
    /** Legacy-compatible wrapper: { success, ...fields, rawData, dataLength, isComplete }. */
    decodeResult(hex: string): Result<T & StructMeta, {
        rawData: string;
    }>;
}
declare function struct<const S extends StructShape>(shape: S, options?: {
    name?: string;
}): StructCodec<StructOutput<S>>;

export { type Err as E, type Field as F, HexCursor as H, type Ok as O, type Result as R, type StructCodec as S, VARIABLE_SIZE as V, type StructOutput as a, type SkipField as b, type StructMeta as c, type StructShape as d, array as e, ascii as f, err as g, float32 as h, float32ToHex as i, hexToFloat32 as j, int16 as k, int32 as l, intToHex as m, isErr as n, isOk as o, mapField as p, ok as q, pid as r, rest as s, skip as t, struct as u, toResult as v, uint16 as w, uint32 as x, uint8 as y };
