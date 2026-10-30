export { E as Err, F as Field, H as HexCursor, O as Ok, R as Result, b as SkipField, S as StructCodec, c as StructMeta, a as StructOutput, d as StructShape, V as VARIABLE_SIZE, e as array, f as ascii, g as err, h as float32, i as float32ToHex, j as hexToFloat32, k as int16, l as int32, m as intToHex, n as isErr, o as isOk, p as mapField, q as ok, r as pid, s as rest, t as skip, u as struct, v as toResult, w as uint16, x as uint32, y as uint8 } from './struct-GZ2q60gQ.js';
export { A as ActionApi, B as BinaryChannel, C as ConsoleLoggerOptions, F as FrameDirection, a as FrameMeta, b as Instrument, I as InstrumentOf, L as Link, c as LinkOptions, d as Logger, e as ReadApi, f as ReadableParam, R as RequestOptions, W as WritableParam, g as WriteApi, h as createConsoleLogger, i as createInstrument, n as noopLogger } from './instrument-BtbrzcJ6.js';
export { C as Codec, D as Decoded, d as defineCodec, m as mapCodec } from './codec-C_X5zMVV.js';
export { B as BitFlags, E as EnumValue, a as FieldSpec, F as FieldsOutput, b as asBitFlags, c as asBool, d as asDigitFlags, e as asEnum, f as asFields, g as asFloat, h as asInt, i as asKeyedEnum, j as asText } from './primitives-CP8ivAQc.js';
export { A as AnyBitField, a as BitField, b as BitShape, B as BitStructOutput, R as RangeField, c as asBitStruct, d as bit, e as bits, f as decodeBits } from './bits-cVmwxCUN.js';
export { asCompressed, compressedToString, crc16Modbus, crc16ModbusBytes, isCrcValid } from './codec.js';
import { F as Framing, T as Transport, P as PortOptions } from './descriptor-4xm6FaU-.js';
export { d as ActionDescription, A as ActionSpec, e as DEFAULT_PORT_OPTIONS, a as DecodeContext, D as DeviceSpec, E as Extraction, c as ParamDescription, b as ParamSpec, R as ReplyExpectation, f as action, g as defineDevice, h as describeActions, i as describeParams, p as param, w as withPortDefaults } from './descriptor-4xm6FaU-.js';

declare class WebSerialError extends Error {
    constructor(message: string, options?: {
        cause?: unknown;
    });
}
/** Port-level failure: open, close, read, write. */
declare class TransportError extends WebSerialError {
}
declare class TimeoutError extends TransportError {
}
/** The bytes came through but do not match the expected protocol shape. */
declare class ProtocolError extends WebSerialError {
}
declare class ChecksumError extends ProtocolError {
}
/** The device answered correctly with an application-level error. */
declare class DeviceError extends WebSerialError {
    readonly code: number | string | undefined;
    constructor(message: string, code?: number | string, options?: {
        cause?: unknown;
    });
}
declare class ConfigurationError extends WebSerialError {
}
declare function toMessage(error: unknown): string;
/** Turn an opaque DOMException from the Web Serial API into an actionable message. */
declare function describePortFailure(error: unknown): string;
declare function isSerialSupported(): boolean;
declare function assertSerialSupported(): void;

declare const EMPTY_CHUNK: Uint8Array;
declare function concatBytes(...chunks: Uint8Array[]): Uint8Array;
declare function bytesToHex(bytes: Uint8Array): string;
declare function hexToBytes(hex: string): Uint8Array;

declare function delay(ms: number): Promise<void>;
declare class Deferred<T> {
    readonly promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
    constructor();
}
/** Serializes operations so a single command owns the serial line at a time. */
declare class AsyncQueue {
    #private;
    get idle(): boolean;
    run<T>(operation: () => Promise<T>): Promise<T>;
}
declare function remainingTime(deadline: number): number;

interface LineFramingOptions {
    /** Delimiter expected on inbound messages. */
    terminator?: string;
    /** Delimiter appended to outbound messages; defaults to the inbound one. */
    outboundTerminator?: string;
    appendTerminator?: boolean;
    includeTerminator?: boolean;
    trim?: boolean;
    /** Drop the command code some devices echo ahead of the value (Kistler CH1). */
    stripEchoedCommand?: boolean;
}
declare function lineFraming(options?: LineFramingOptions): Framing;

declare const ACK = "\u0006";
declare const NAK = "\u0015";
interface PrefixedFramingOptions {
    terminator?: string;
    outboundTerminator?: string;
    /** Byte or token appended by the device to acknowledge a command. */
    ack?: string;
    nak?: string;
    /** Textual forms some firmwares use instead of the control bytes. */
    ackToken?: RegExp;
    nakToken?: RegExp;
}
/**
 * Line protocol carrying a trailing AK/NK discharge, used by the Agilent 3G detectors.
 * The prefix (`?` request, `!` immediate, `=` parameter) is produced by the device
 * descriptor, so framing only has to delimit the reply and resolve the acknowledgement.
 */
declare function prefixedFraming(options?: PrefixedFramingOptions): Framing;

interface AcknowledgedFramingOptions {
    terminator?: string;
    /** TSI terminates commands with CR but answers with CRLF. */
    outboundTerminator?: string;
    ack?: RegExp;
    error?: RegExp;
}
/**
 * Line protocol where the instrument first acknowledges with `OK`, then sends the value
 * on a second line. Whether that value line exists depends on the command, so the caller
 * states it through `DecodeContext.expectsValue`.
 */
declare function acknowledgedFraming(options?: AcknowledgedFramingOptions): Framing;

interface CrcFramingOptions {
    separator?: string;
    /** Address + separator + command, before any data. */
    headerLength?: number;
    checksumLength?: number;
    compute?: (data: string) => string;
    /** Payload already ending with this marker is sent as-is, checksum skipped. */
    skipMarker?: string;
    errorCommand?: string;
    maxErrorFrameLength?: number;
}
/**
 * Self-delimiting frames: `aa->CMD<data><crc>` with no terminator at all.
 * Completeness is therefore decided by the checksum, optionally short-circuited by a
 * known response length. This is stricter than waiting for a silence on the line, which
 * cannot tell a complete frame from a truncated one.
 */
declare function crcFraming(options?: CrcFramingOptions): Framing;
interface CrcFrame {
    address: string;
    command: string;
    data: string;
    checksum: string;
    raw: string;
}
declare function splitCrcFrame(frame: string, options?: CrcFramingOptions): CrcFrame;
interface ErrorFrameOptions {
    errorCommand?: string;
    messages?: Record<number, string>;
}
/** Turns an ERRN frame into a DeviceError; returns the frame untouched otherwise. */
declare function assertNoErrorFrame(frame: string, options?: ErrorFrameOptions): string;

interface WebSerialTransportOptions {
    port?: SerialPort;
    filters?: SerialPortFilter[];
}
declare class WebSerialTransport implements Transport {
    #private;
    constructor(options?: WebSerialTransportOptions);
    get isOpen(): boolean;
    get port(): SerialPort | undefined;
    /** Must be called from a user gesture (click, tap). */
    select(): Promise<void>;
    open(options: PortOptions): Promise<void>;
    close(): Promise<void>;
    reopen(overrides?: Partial<PortOptions>): Promise<void>;
    write(bytes: Uint8Array): Promise<void>;
    read(timeoutMs: number): Promise<Uint8Array>;
}

interface MockExchange {
    expect: string | RegExp;
    reply: string | Uint8Array | ((request: string) => string | Uint8Array | undefined);
}
interface MockTransportOptions {
    exchanges?: MockExchange[];
    /** Fallback reply used when no exchange matches. */
    onWrite?: (request: string, transport: MockTransport) => void;
}
/** In-memory transport for tests and fixture replay; no browser or hardware required. */
declare class MockTransport implements Transport {
    #private;
    readonly written: string[];
    /** Kept separately: binary protocols cannot be inspected through the decoded text. */
    readonly writtenBytes: Uint8Array[];
    readonly exchanges: MockExchange[];
    constructor(options?: MockTransportOptions);
    get isOpen(): boolean;
    get portOptions(): PortOptions | undefined;
    get lastWritten(): string | undefined;
    open(options: PortOptions): Promise<void>;
    close(): Promise<void>;
    reopen(overrides?: Partial<PortOptions>): Promise<void>;
    write(bytes: Uint8Array): Promise<void>;
    read(timeoutMs: number): Promise<Uint8Array>;
    /** Inject bytes as if the device had sent them. */
    pushRx(data: string | Uint8Array): void;
}

/** Rolling average over the last N samples. Opt-in, instead of being imposed on every instrument. */
declare class Sampler {
    #private;
    constructor(window?: number);
    get window(): number;
    set window(size: number);
    get count(): number;
    get average(): number | null;
    push(value: number): number | null;
    reset(): void;
}
declare function numericOf(value: unknown): number | null;
interface PollOptions<T> {
    intervalMs?: number;
    onValue?: (value: T) => void;
    onError?: (error: unknown) => void;
}
/** Reschedules after each completion, so a slow device cannot queue overlapping reads. */
declare function poll<T>(read: () => Promise<T>, options?: PollOptions<T>): () => void;

export { ACK, type AcknowledgedFramingOptions, AsyncQueue, ChecksumError, ConfigurationError, type CrcFrame, type CrcFramingOptions, Deferred, DeviceError, EMPTY_CHUNK, type ErrorFrameOptions, Framing, type LineFramingOptions, type MockExchange, MockTransport, type MockTransportOptions, NAK, type PollOptions, PortOptions, type PrefixedFramingOptions, ProtocolError, Sampler, TimeoutError, Transport, TransportError, WebSerialError, WebSerialTransport, type WebSerialTransportOptions, acknowledgedFraming, assertNoErrorFrame, assertSerialSupported, bytesToHex, concatBytes, crcFraming, delay, describePortFailure, hexToBytes, isSerialSupported, lineFraming, numericOf, poll, prefixedFraming, remainingTime, splitCrcFrame, toMessage };
