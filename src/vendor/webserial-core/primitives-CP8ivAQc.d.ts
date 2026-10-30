import { C as Codec } from './codec-C_X5zMVV.js';

interface EnumValue<C extends number | string = number> {
    code: C;
    label: string;
}
interface BitFlags {
    raw: number;
    active: string[];
    flags: Record<string, boolean>;
}
declare const asText: Codec<string>;
declare function asFloat(name?: string): Codec<number>;
declare function asInt(name?: string, radix?: number): Codec<number>;
declare function asBool(truthy?: string | RegExp, name?: string): Codec<boolean>;
declare function asEnum<const M extends Record<number, string>>(map: M, options?: {
    name?: string;
    radix?: number;
}): Codec<EnumValue<number>>;
declare function asKeyedEnum<const M extends Record<string, string>>(map: M, options?: {
    name?: string;
    normalize?: (raw: string) => string;
}): Codec<EnumValue<string>>;
/** Positional digit string, e.g. FM "10" -> filament1 on, filament2 off. */
declare function asDigitFlags<const K extends readonly string[]>(keys: K, options?: {
    name?: string;
    truthy?: string;
}): Codec<Record<K[number], boolean>>;
declare function asBitFlags<const M extends Record<number, string>>(labels: M, options?: {
    name?: string;
    radix?: number;
}): Codec<BitFlags>;
interface FieldSpec {
    readonly key: string;
    readonly codec: Codec<unknown>;
}
type FieldsOutput<F extends readonly FieldSpec[]> = {
    [S in F[number] as S["key"]]: S["codec"] extends Codec<infer T> ? T : never;
};
/** Split a single reply into several typed values, e.g. "1.2E-9 3 980" -> leakRate/status/pressure. */
declare function asFields<const F extends readonly FieldSpec[]>(fields: F, options?: {
    separator?: string | RegExp;
    name?: string;
}): Codec<FieldsOutput<F>>;

export { type BitFlags as B, type EnumValue as E, type FieldsOutput as F, type FieldSpec as a, asBitFlags as b, asBool as c, asDigitFlags as d, asEnum as e, asFields as f, asFloat as g, asInt as h, asKeyedEnum as i, asText as j };
