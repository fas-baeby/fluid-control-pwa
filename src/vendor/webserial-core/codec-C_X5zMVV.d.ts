interface Codec<T> {
    readonly name: string;
    decode(raw: string): T;
    encode?(value: T): string;
}
type Decoded<C> = C extends Codec<infer T> ? T : never;
declare function defineCodec<T>(name: string, decode: (raw: string) => T, encode?: (value: T) => string): Codec<T>;
declare function mapCodec<A, B>(source: Codec<A>, transform: (value: A) => B, name?: string): Codec<B>;

export { type Codec as C, type Decoded as D, defineCodec as d, mapCodec as m };
