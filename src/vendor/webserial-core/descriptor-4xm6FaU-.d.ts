import { C as Codec } from './codec-C_X5zMVV.js';

interface DecodeContext {
    /** Total message length in characters, for fixed-size protocols. */
    expectedLength?: number;
    /** Command code the reply is expected to echo. */
    expectedCommand?: string;
    /** Shorter inactivity window once a complete message looks available. */
    fastInactivityDelay?: number;
    /** Whether a value follows the acknowledgement; only reads expect one. */
    expectsValue?: boolean;
}
interface Extraction {
    message: string;
    /** Characters to drop from the head of the buffer, including any delimiter. */
    consumed: number;
}
/**
 * Turns a byte stream into discrete messages. Swapping the framing is what lets the same
 * Link drive line-terminated ASCII, prefixed protocols and CRC-checked binary frames.
 */
interface Framing {
    readonly name: string;
    encode(payload: string | Uint8Array): Uint8Array;
    /** Returns null when the buffer does not hold a complete message yet. */
    extract(buffer: string, context?: DecodeContext): Extraction | null;
}

interface PortOptions {
    baudRate: number;
    dataBits?: 7 | 8;
    stopBits?: 1 | 2;
    parity?: "none" | "even" | "odd";
    flowControl?: "none" | "hardware";
    bufferSize?: number;
}
declare const DEFAULT_PORT_OPTIONS: Required<Omit<PortOptions, "baudRate">> & PortOptions;
declare function withPortDefaults(options: PortOptions): Required<PortOptions>;
/**
 * Byte-level serial access. Text decoding and message framing live in the layers above,
 * which is what lets the same transport serve ASCII protocols and binary transfers.
 */
interface Transport {
    readonly isOpen: boolean;
    open(options: PortOptions): Promise<void>;
    close(): Promise<void>;
    reopen(overrides?: Partial<PortOptions>): Promise<void>;
    write(bytes: Uint8Array): Promise<void>;
    /** Resolves with an empty chunk when the deadline elapses; never throws on timeout. */
    read(timeoutMs: number): Promise<Uint8Array>;
}

/** How much of an answer a command produces: always, sometimes, or never. */
type ReplyExpectation = "required" | "optional" | "none";
interface ParamSpec {
    readonly key: string;
    readonly label: string;
    readonly codec: Codec<any>;
    /** Command issued to read the value; omit for write-only parameters. */
    readonly read?: string;
    /** Command issued to write the value; omit for read-only parameters. */
    readonly write?: string;
    readonly unit?: string;
    readonly description?: string;
    readonly timeout?: number;
    readonly encode?: (value: any) => string;
    /** Applies to the write command only; reads always expect an answer. */
    readonly reply?: ReplyExpectation;
    /** Total reply length, for protocols whose frames carry no terminator. */
    readonly responseLength?: number;
}
declare function param<const S extends ParamSpec>(spec: S): S;
/** Command that triggers a behaviour instead of carrying a value (autocalibration, reset...). */
interface ActionSpec {
    readonly key: string;
    readonly label: string;
    readonly command: string;
    readonly payload?: string;
    readonly description?: string;
    readonly category?: string;
    readonly timeout?: number;
    readonly reply?: ReplyExpectation;
}
declare function action<const S extends ActionSpec>(spec: S): S;
interface DeviceSpec<P extends readonly ParamSpec[] = readonly ParamSpec[], A extends readonly ActionSpec[] = readonly ActionSpec[]> {
    readonly id: string;
    readonly label: string;
    readonly framing: Framing;
    readonly portOptions: PortOptions;
    readonly params: P;
    readonly actions?: A;
    readonly defaultTimeout?: number;
    readonly encoding?: string;
    /** Defaults to `command + payload`; override for prefixed or addressed protocols. */
    readonly buildRequest?: (command: string, payload: string) => string;
}
declare function defineDevice<const P extends readonly ParamSpec[], const A extends readonly ActionSpec[] = []>(spec: DeviceSpec<P, A>): DeviceSpec<P, A>;
interface ParamDescription {
    key: string;
    label: string;
    readable: boolean;
    writable: boolean;
    readCommand?: string;
    writeCommand?: string;
    unit?: string;
    description?: string;
}
declare function describeParams(params: readonly ParamSpec[]): ParamDescription[];
interface ActionDescription {
    key: string;
    label: string;
    command: string;
    category?: string;
    description?: string;
}
declare function describeActions(actions?: readonly ActionSpec[]): ActionDescription[];

export { type ActionSpec as A, type DeviceSpec as D, type Extraction as E, type Framing as F, type PortOptions as P, type ReplyExpectation as R, type Transport as T, type DecodeContext as a, type ParamSpec as b, type ParamDescription as c, type ActionDescription as d, DEFAULT_PORT_OPTIONS as e, action as f, defineDevice as g, describeActions as h, describeParams as i, param as p, withPortDefaults as w };
