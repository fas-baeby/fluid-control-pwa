import './chunk-KP45J53Z.js';
export { acknowledgedFraming } from './chunk-MQUFHSGT.js';
export { ACK, NAK, prefixedFraming } from './chunk-USUAA7GO.js';
export { asCompressed, compressedToString } from './chunk-ORYSOKQF.js';
export { assertNoErrorFrame, crcFraming, splitCrcFrame } from './chunk-6XMHCNHO.js';
export { HexCursor, VARIABLE_SIZE, array, ascii, crc16Modbus, crc16ModbusBytes, err, float32, float32ToHex, hexToFloat32, int16, int32, intToHex, isCrcValid, isErr, isOk, mapField, ok, pid, rest, skip, struct, toResult, uint16, uint32, uint8 } from './chunk-7V5XXNHL.js';
export { asBitStruct, bit, bits, decodeBits } from './chunk-MZ3FVZAH.js';
export { asBitFlags, asBool, asDigitFlags, asEnum, asFields, asFloat, asInt, asKeyedEnum, asText } from './chunk-Z5NZJSCE.js';
import { EMPTY_CHUNK } from './chunk-ZRL2DAVD.js';
export { AsyncQueue, BinaryChannel, DEFAULT_PORT_OPTIONS, Deferred, EMPTY_CHUNK, Instrument, Link, WebSerialTransport, bytesToHex, concatBytes, createConsoleLogger, createInstrument, delay, hexToBytes, noopLogger, remainingTime, withPortDefaults } from './chunk-ZRL2DAVD.js';
export { lineFraming } from './chunk-X46GM2F5.js';
export { action, defineDevice, describeActions, describeParams, param } from './chunk-EM4MNF4I.js';
import { TransportError } from './chunk-R5M3P5DD.js';
export { ChecksumError, ConfigurationError, DeviceError, ProtocolError, TimeoutError, TransportError, WebSerialError, assertSerialSupported, defineCodec, describePortFailure, isSerialSupported, mapCodec, toMessage } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/transport/mock.ts
var MockTransport = class {
  written = [];
  /** Kept separately: binary protocols cannot be inspected through the decoded text. */
  writtenBytes = [];
  exchanges;
  #open = false;
  #options;
  #queue = [];
  #waiters = [];
  #encoder = new TextEncoder();
  #decoder = new TextDecoder();
  #onWrite;
  constructor(options = {}) {
    this.exchanges = options.exchanges ?? [];
    this.#onWrite = options.onWrite;
  }
  get isOpen() {
    return this.#open;
  }
  get portOptions() {
    return this.#options;
  }
  get lastWritten() {
    return this.written.at(-1);
  }
  async open(options) {
    this.#options = options;
    this.#open = true;
  }
  async close() {
    this.#open = false;
    for (const waiter of this.#waiters.splice(0)) {
      clearTimeout(waiter.timer);
      waiter.resolve(EMPTY_CHUNK);
    }
    this.#queue.length = 0;
  }
  async reopen(overrides = {}) {
    const options = { ...this.#options, ...overrides };
    await this.close();
    await this.open(options);
  }
  async write(bytes) {
    if (!this.#open) throw new TransportError("Port serie non ouvert.");
    const request = this.#decoder.decode(bytes);
    this.written.push(request);
    this.writtenBytes.push(bytes.slice());
    const exchange = this.exchanges.find(
      (candidate) => typeof candidate.expect === "string" ? request === candidate.expect || request.trim() === candidate.expect : candidate.expect.test(request)
    );
    if (exchange) {
      const reply = typeof exchange.reply === "function" ? exchange.reply(request) : exchange.reply;
      if (reply !== void 0) this.pushRx(reply);
      return;
    }
    this.#onWrite?.(request, this);
  }
  async read(timeoutMs) {
    const queued = this.#queue.shift();
    if (queued) return queued;
    if (!(timeoutMs > 0)) return EMPTY_CHUNK;
    return new Promise((resolve) => {
      const waiter = {
        resolve,
        timer: setTimeout(() => {
          const index = this.#waiters.indexOf(waiter);
          if (index >= 0) this.#waiters.splice(index, 1);
          resolve(EMPTY_CHUNK);
        }, timeoutMs)
      };
      this.#waiters.push(waiter);
    });
  }
  /** Inject bytes as if the device had sent them. */
  pushRx(data) {
    const chunk = typeof data === "string" ? this.#encoder.encode(data) : data;
    const waiter = this.#waiters.shift();
    if (waiter) {
      clearTimeout(waiter.timer);
      waiter.resolve(chunk);
      return;
    }
    this.#queue.push(chunk);
  }
};

// src/device/sampler.ts
var Sampler = class {
  #window;
  #samples = [];
  constructor(window = 1) {
    this.#window = Math.max(1, Math.trunc(window) || 1);
  }
  get window() {
    return this.#window;
  }
  set window(size) {
    this.#window = Math.max(1, Math.trunc(size) || 1);
    if (this.#samples.length > this.#window) {
      this.#samples = this.#samples.slice(-this.#window);
    }
  }
  get count() {
    return this.#samples.length;
  }
  get average() {
    if (this.#samples.length === 0) return null;
    const total = this.#samples.reduce((sum, value) => sum + value, 0);
    return total / this.#samples.length;
  }
  push(value) {
    if (!Number.isFinite(value)) return this.average;
    this.#samples.push(value);
    if (this.#samples.length > this.#window) this.#samples.shift();
    return this.average;
  }
  reset() {
    this.#samples = [];
  }
};
function numericOf(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value && typeof value === "object" && "value" in value) {
    const inner = value.value;
    if (typeof inner === "number" && Number.isFinite(inner)) return inner;
  }
  return null;
}
function poll(read, options = {}) {
  const { intervalMs = 1e3, onValue, onError } = options;
  if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
    throw new RangeError("poll(interval) attend un nombre de millisecondes positif.");
  }
  let running = true;
  let timer;
  const tick = async () => {
    if (!running) return;
    try {
      const value = await read();
      if (running) onValue?.(value);
    } catch (error) {
      if (running) onError?.(error);
    } finally {
      if (running) timer = setTimeout(() => void tick(), intervalMs);
    }
  };
  void tick();
  return () => {
    running = false;
    if (timer !== void 0) clearTimeout(timer);
  };
}

export { MockTransport, Sampler, numericOf, poll };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map