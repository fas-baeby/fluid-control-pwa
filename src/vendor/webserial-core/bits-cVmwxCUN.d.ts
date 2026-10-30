import { C as Codec } from './codec-C_X5zMVV.js';
import { E as EnumValue } from './primitives-CP8ivAQc.js';

interface BitField {
    readonly kind: "bit";
    readonly offset: number;
}
interface RangeField<M extends Record<number, string> | undefined> {
    readonly kind: "bits";
    readonly offset: number;
    readonly length: number;
    readonly labels: M;
}
type AnyBitField = BitField | RangeField<Record<number, string> | undefined>;
declare function bit(offset: number): BitField;
declare function bits(offset: number, length: number): RangeField<undefined>;
declare function bits<const M extends Record<number, string>>(offset: number, length: number, labels: M): RangeField<M>;
type BitShape = Record<string, AnyBitField>;
type BitValue<F> = F extends BitField ? boolean : F extends RangeField<infer M> ? M extends Record<number, string> ? EnumValue<number> : number : never;
type BitStructOutput<S extends BitShape> = {
    raw: number;
} & {
    [K in keyof S]: BitValue<S[K]>;
};
/**
 * Centralises the shift/mask arithmetic of status words. Doing it inline per device is
 * where off-by-one bit errors hide, and multi-bit fields cannot be expressed with flags alone.
 */
declare function decodeBits<const S extends BitShape>(shape: S, word: number): BitStructOutput<S>;
declare function asBitStruct<const S extends BitShape>(shape: S, options?: {
    name?: string;
    radix?: number;
}): Codec<BitStructOutput<S>>;

export { type AnyBitField as A, type BitStructOutput as B, type RangeField as R, type BitField as a, type BitShape as b, asBitStruct as c, bit as d, bits as e, decodeBits as f };
