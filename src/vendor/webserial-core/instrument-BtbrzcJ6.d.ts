import { C as Codec } from './codec-C_X5zMVV.js';
import { T as Transport, F as Framing, P as PortOptions, a as DecodeContext, b as ParamSpec, A as ActionSpec, D as DeviceSpec, c as ParamDescription, d as ActionDescription } from './descriptor-4xm6FaU-.js';

type FrameDirection = "tx" | "rx";
interface FrameMeta {
    /** Rendered as a highlighted suffix badge by the console logger. */
    checksum?: string;
    label?: string;
}
interface Logger {
    frame(direction: FrameDirection, frame: string, meta?: FrameMeta): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string, cause?: unknown): void;
}
declare const noopLogger: Logger;
interface ConsoleLoggerOptions {
    prefix?: string;
    styled?: boolean;
}
declare function createConsoleLogger(options?: ConsoleLoggerOptions): Logger;

/**
 * Raw byte access for protocols that bypass text framing (YMODEM transfers, ACK/NAK handshakes).
 * Because the transport is byte-level, no stream swap is needed to enter or leave this mode.
 */
declare class BinaryChannel {
    #private;
    private readonly transport;
    constructor(transport: Transport, pushback?: Uint8Array);
    get buffered(): number;
    write(bytes: Uint8Array): Promise<void>;
    unread(bytes: Uint8Array): void;
    clear(): Uint8Array;
    readChunk(timeoutMs: number): Promise<Uint8Array>;
    /** Resolves with null when the deadline elapses before a byte arrives. */
    readByte(timeoutMs: number): Promise<number | null>;
    waitForByte(target: number, timeoutMs: number, cancelByte?: number): Promise<"found" | "cancelled" | "timeout">;
    /** Swallow whatever the device is still sending, for a fixed settling window. */
    drain(ms: number): Promise<Uint8Array>;
}

interface LinkOptions {
    framing: Framing;
    transport?: Transport;
    portOptions?: PortOptions;
    defaultTimeout?: number;
    encoding?: string;
    logger?: Logger;
}
interface RequestOptions {
    timeout?: number;
    context?: DecodeContext;
}
/**
 * Owns the transport, the framing, the receive buffer and the command queue.
 * Every instrument talks to its device through a Link, whatever the protocol.
 */
declare class Link {
    #private;
    readonly transport: Transport;
    readonly framing: Framing;
    portOptions: PortOptions;
    defaultTimeout: number;
    logger: Logger;
    constructor(options: LinkOptions);
    get isOpen(): boolean;
    get buffered(): string;
    open(overrides?: Partial<PortOptions>): Promise<void>;
    close(): Promise<void>;
    reopen(overrides?: Partial<PortOptions>): Promise<void>;
    send(payload: string | Uint8Array, meta?: {
        checksum?: string;
    }): Promise<void>;
    receive(options?: RequestOptions): Promise<string>;
    /** Serialized send + receive: the only safe way to use a shared serial line. */
    request(payload: string | Uint8Array, options?: RequestOptions): Promise<string>;
    enqueue<T>(operation: () => Promise<T>): Promise<T>;
    /** Absorb unsolicited output left on the line before issuing a new command. */
    flush(ms?: number): Promise<string>;
    /** Switch to raw bytes; buffered text is discarded because it cannot be re-encoded faithfully. */
    binary(): BinaryChannel;
    endBinary(): void;
}

type ValueOf<S> = S extends {
    codec: Codec<infer T>;
} ? T : never;
/** An explicit `encode` decides what the write accessor accepts, which is rarely the decoded shape. */
type WriteValueOf<S> = S extends {
    encode: (value: infer V) => string;
} ? V : ValueOf<S>;
type ReadableParam<P extends readonly ParamSpec[]> = Extract<P[number], {
    read: string;
}>;
type WritableParam<P extends readonly ParamSpec[]> = Extract<P[number], {
    write: string;
}>;
type ReadApi<P extends readonly ParamSpec[]> = {
    [S in ReadableParam<P> as `read${Capitalize<S["key"]>}`]: (options?: RequestOptions) => Promise<ValueOf<S>>;
};
type WriteApi<P extends readonly ParamSpec[]> = {
    [S in WritableParam<P> as `write${Capitalize<S["key"]>}`]: (value: WriteValueOf<S>, options?: RequestOptions) => Promise<void>;
};
type ActionApi<A extends readonly ActionSpec[]> = {
    [S in A[number] as S["key"]]: (options?: RequestOptions) => Promise<string | null>;
};
type InstrumentOf<P extends readonly ParamSpec[], A extends readonly ActionSpec[] = []> = Instrument<P, A> & ReadApi<P> & WriteApi<P> & ActionApi<A>;
declare class Instrument<P extends readonly ParamSpec[] = readonly ParamSpec[], A extends readonly ActionSpec[] = readonly ActionSpec[]> {
    #private;
    readonly spec: DeviceSpec<P, A>;
    readonly link: Link;
    constructor(spec: DeviceSpec<P, A>, link?: Link);
    get id(): string;
    get params(): P;
    get isConnected(): boolean;
    connect(overrides?: Partial<PortOptions>): Promise<void>;
    disconnect(): Promise<void>;
    reconnect(overrides?: Partial<PortOptions>): Promise<void>;
    /** Runtime metadata, so a generic UI can enumerate what the device exposes. */
    describe(): ParamDescription[];
    describeActions(): ActionDescription[];
    getParam(key: string): ParamSpec | undefined;
    getAction(key: string): ActionSpec | undefined;
    raw(command: string, payload?: string, options?: RequestOptions): Promise<string>;
    readParam<K extends P[number]["key"]>(key: K, options?: RequestOptions): Promise<ValueOf<Extract<P[number], {
        key: K;
    }>>>;
    writeParam<K extends P[number]["key"]>(key: K, value: ValueOf<Extract<P[number], {
        key: K;
    }>>, options?: RequestOptions): Promise<void>;
    /** Fire a behaviour command. Returns null when the device stays silent, which is legal in basic mode. */
    runAction(key: string, options?: RequestOptions): Promise<string | null>;
}
/**
 * Builds the instrument and derives one accessor per parameter from the descriptor table,
 * so the table stays the only place a parameter is declared.
 */
declare function createInstrument<const P extends readonly ParamSpec[], const A extends readonly ActionSpec[] = []>(spec: DeviceSpec<P, A>, link?: Link): InstrumentOf<P, A>;

export { type ActionApi as A, BinaryChannel as B, type ConsoleLoggerOptions as C, type FrameDirection as F, type InstrumentOf as I, Link as L, type RequestOptions as R, type WritableParam as W, type FrameMeta as a, Instrument as b, type LinkOptions as c, type Logger as d, type ReadApi as e, type ReadableParam as f, type WriteApi as g, createConsoleLogger as h, createInstrument as i, noopLogger as n };
