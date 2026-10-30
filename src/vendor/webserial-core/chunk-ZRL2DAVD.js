import { describeParams, describeActions } from './chunk-EM4MNF4I.js';
import { assertSerialSupported, TransportError, describePortFailure, TimeoutError, ConfigurationError } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/core/logger.ts
var noopLogger = {
  frame() {
  },
  info() {
  },
  warn() {
  },
  error() {
  }
};
var LABEL_STYLE = "font-weight: bold; color: #0066cc;";
var FRAME_STYLE = 'color: #333; font-family: "Courier New", monospace;';
var CHECKSUM_STYLE = 'background: linear-gradient(90deg, #28a745, #20c997); color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px; font-family: "Courier New", monospace; font-size: 11px;';
var HINT_STYLE = "color: #999; font-size: 10px; font-style: italic;";
function createConsoleLogger(options = {}) {
  const { prefix = "", styled = true } = options;
  const tag = prefix ? `${prefix} ` : "";
  return {
    frame(direction, frame, meta) {
      const label = `${tag}${meta?.label ?? (direction === "tx" ? "Sending" : "Received")}`;
      if (!styled || !meta?.checksum || !frame.endsWith(meta.checksum)) {
        console.log(`%c${label}:%c ${frame}`, LABEL_STYLE, FRAME_STYLE);
        return;
      }
      const body = frame.slice(0, frame.length - meta.checksum.length);
      console.log(
        `%c${label}:%c ${body}%c${meta.checksum}%c <- CRC`,
        LABEL_STYLE,
        FRAME_STYLE,
        CHECKSUM_STYLE,
        HINT_STYLE
      );
    },
    info(message) {
      console.log(`${tag}${message}`);
    },
    warn(message) {
      console.warn(`${tag}${message}`);
    },
    error(message, cause) {
      if (cause === void 0) console.error(`${tag}${message}`);
      else console.error(`${tag}${message}`, cause);
    }
  };
}

// src/core/bytes.ts
var EMPTY_CHUNK = new Uint8Array(0);
function concatBytes(...chunks) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  if (total === 0) return EMPTY_CHUNK;
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}
function bytesToHex(bytes) {
  let hex = "";
  for (const byte of bytes) hex += byte.toString(16).padStart(2, "0");
  return hex;
}
function hexToBytes(hex) {
  const clean = hex.replace(/\s+/g, "");
  if (clean.length % 2 !== 0) {
    throw new RangeError(`Chaine hexadecimale de longueur impaire : ${clean.length}`);
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// src/core/async.ts
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
var Deferred = class {
  promise;
  resolve;
  reject;
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
};
var AsyncQueue = class {
  #tail = Promise.resolve();
  get idle() {
    return this.#pendingCount === 0;
  }
  #pendingCount = 0;
  run(operation) {
    this.#pendingCount += 1;
    const result = this.#tail.then(operation, operation);
    this.#tail = result.catch(() => void 0);
    void result.catch(() => void 0).finally(() => {
      this.#pendingCount -= 1;
    });
    return result;
  }
};
function remainingTime(deadline) {
  return Math.max(deadline - Date.now(), 0);
}

// src/transport/transport.ts
var DEFAULT_PORT_OPTIONS = {
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
  flowControl: "none",
  bufferSize: 255
};
function withPortDefaults(options) {
  return { ...DEFAULT_PORT_OPTIONS, ...options };
}

// src/transport/web-serial.ts
var TIMEOUT = /* @__PURE__ */ Symbol("read-timeout");
var WebSerialTransport = class {
  #port;
  #reader;
  #writer;
  /** A read that outlived its deadline stays pending and is reused, so a timeout never drops bytes. */
  #pending;
  #options;
  #filters;
  constructor(options = {}) {
    this.#port = options.port;
    this.#filters = options.filters;
  }
  get isOpen() {
    return Boolean(this.#port && this.#reader && this.#writer);
  }
  get port() {
    return this.#port;
  }
  /** Must be called from a user gesture (click, tap). */
  async select() {
    assertSerialSupported();
    try {
      this.#port = await navigator.serial.requestPort(
        this.#filters ? { filters: this.#filters } : {}
      );
    } catch (error) {
      throw new TransportError(describePortFailure(error), { cause: error });
    }
  }
  async open(options) {
    assertSerialSupported();
    if (this.isOpen) return;
    if (!this.#port) await this.select();
    const port = this.#port;
    if (!port) throw new TransportError("Aucun port serie selectionne.");
    this.#options = options;
    try {
      await port.open(withPortDefaults(options));
    } catch (error) {
      throw new TransportError(describePortFailure(error), { cause: error });
    }
    if (!port.readable || !port.writable) {
      await this.close().catch(() => void 0);
      throw new TransportError("Le port est ouvert mais ses flux sont indisponibles.");
    }
    this.#reader = port.readable.getReader();
    this.#writer = port.writable.getWriter();
  }
  async close() {
    const failures = [];
    if (this.#reader) {
      try {
        await this.#reader.cancel();
      } catch (error) {
        failures.push(error);
      }
      try {
        this.#reader.releaseLock();
      } catch (error) {
        failures.push(error);
      }
      this.#reader = void 0;
    }
    this.#pending = void 0;
    if (this.#writer) {
      try {
        this.#writer.releaseLock();
      } catch (error) {
        failures.push(error);
      }
      this.#writer = void 0;
    }
    if (this.#port) {
      try {
        await this.#port.close();
      } catch (error) {
        failures.push(error);
      }
    }
    if (failures.length > 0) {
      throw new TransportError("Fermeture du port serie incomplete.", { cause: failures[0] });
    }
  }
  async reopen(overrides = {}) {
    const options = { ...DEFAULT_PORT_OPTIONS, ...this.#options, ...overrides };
    const port = this.#port;
    await this.close().catch(() => void 0);
    this.#port = port;
    await this.open(options);
  }
  async write(bytes) {
    const writer = this.#writer;
    if (!writer) throw new TransportError("Port serie non ouvert.");
    try {
      await writer.write(bytes);
    } catch (error) {
      throw new TransportError("Echec d'ecriture sur le port serie.", { cause: error });
    }
  }
  async read(timeoutMs) {
    const reader = this.#reader;
    if (!reader) throw new TransportError("Port serie non ouvert.");
    this.#pending ??= reader.read();
    const pending = this.#pending;
    if (!(timeoutMs > 0)) {
      return this.#settle(await pending);
    }
    let timer;
    const timeout = new Promise((resolve) => {
      timer = setTimeout(() => resolve(TIMEOUT), timeoutMs);
    });
    try {
      const outcome = await Promise.race([pending, timeout]);
      if (outcome === TIMEOUT) return EMPTY_CHUNK;
      return this.#settle(outcome);
    } catch (error) {
      this.#pending = void 0;
      throw new TransportError("Echec de lecture sur le port serie.", { cause: error });
    } finally {
      if (timer !== void 0) clearTimeout(timer);
    }
  }
  #settle(result) {
    this.#pending = void 0;
    if (result.done || !result.value) return EMPTY_CHUNK;
    return result.value;
  }
};

// src/transport/binary-channel.ts
var BinaryChannel = class {
  constructor(transport, pushback = EMPTY_CHUNK) {
    this.transport = transport;
    this.#buffer = pushback;
  }
  #buffer;
  get buffered() {
    return this.#buffer.length;
  }
  write(bytes) {
    return this.transport.write(bytes);
  }
  unread(bytes) {
    this.#buffer = concatBytes(bytes, this.#buffer);
  }
  clear() {
    const pending = this.#buffer;
    this.#buffer = EMPTY_CHUNK;
    return pending;
  }
  async readChunk(timeoutMs) {
    if (this.#buffer.length > 0) return this.clear();
    return this.transport.read(timeoutMs);
  }
  /** Resolves with null when the deadline elapses before a byte arrives. */
  async readByte(timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    for (; ; ) {
      if (this.#buffer.length > 0) {
        const byte = this.#buffer[0];
        this.#buffer = this.#buffer.subarray(1);
        return byte;
      }
      const remaining = remainingTime(deadline);
      if (remaining <= 0) return null;
      const chunk = await this.transport.read(remaining);
      if (chunk.length > 0) this.#buffer = concatBytes(this.#buffer, chunk);
    }
  }
  async waitForByte(target, timeoutMs, cancelByte) {
    const deadline = Date.now() + timeoutMs;
    for (; ; ) {
      const byte = await this.readByte(remainingTime(deadline));
      if (byte === null) return "timeout";
      if (byte === target) return "found";
      if (cancelByte !== void 0 && byte === cancelByte) return "cancelled";
    }
  }
  /** Swallow whatever the device is still sending, for a fixed settling window. */
  async drain(ms) {
    const deadline = Date.now() + ms;
    let drained = this.clear();
    for (; ; ) {
      const remaining = remainingTime(deadline);
      if (remaining <= 0) return drained;
      const chunk = await this.transport.read(remaining);
      if (chunk.length === 0) return drained;
      drained = concatBytes(drained, chunk);
    }
  }
};

// src/link.ts
var Link = class {
  transport;
  framing;
  portOptions;
  defaultTimeout;
  logger;
  #encoding;
  #queue = new AsyncQueue();
  #decoder;
  #buffer = "";
  #binary;
  constructor(options) {
    this.framing = options.framing;
    this.transport = options.transport ?? new WebSerialTransport();
    this.portOptions = options.portOptions ?? DEFAULT_PORT_OPTIONS;
    this.defaultTimeout = options.defaultTimeout ?? 1e3;
    this.logger = options.logger ?? noopLogger;
    this.#encoding = options.encoding ?? "utf-8";
    this.#decoder = new TextDecoder(this.#encoding);
  }
  get isOpen() {
    return this.transport.isOpen;
  }
  get buffered() {
    return this.#buffer;
  }
  async open(overrides = {}) {
    this.#reset();
    this.portOptions = { ...this.portOptions, ...overrides };
    await this.transport.open(this.portOptions);
  }
  async close() {
    this.#reset();
    await this.transport.close();
  }
  async reopen(overrides = {}) {
    this.#reset();
    this.portOptions = { ...this.portOptions, ...overrides };
    await this.transport.reopen(this.portOptions);
  }
  async send(payload, meta) {
    const bytes = this.framing.encode(payload);
    if (typeof payload === "string") this.logger.frame("tx", payload, meta);
    await this.transport.write(bytes);
  }
  async receive(options = {}) {
    const timeout = options.timeout ?? this.defaultTimeout;
    const deadline = Date.now() + timeout;
    for (; ; ) {
      const extraction = this.framing.extract(this.#buffer, options.context);
      if (extraction) {
        this.#buffer = this.#buffer.slice(extraction.consumed);
        this.logger.frame("rx", extraction.message);
        return extraction.message;
      }
      const remaining = remainingTime(deadline);
      if (remaining <= 0) {
        const partial = this.#buffer ? ` Tampon partiel : "${this.#buffer}"` : "";
        this.#buffer = "";
        throw new TimeoutError(`Aucune reponse complete apres ${timeout} ms.${partial}`);
      }
      const chunk = await this.transport.read(remaining);
      if (chunk.length > 0) this.#buffer += this.#decoder.decode(chunk, { stream: true });
    }
  }
  /** Serialized send + receive: the only safe way to use a shared serial line. */
  request(payload, options = {}) {
    return this.#queue.run(async () => {
      await this.send(payload);
      return this.receive(options);
    });
  }
  enqueue(operation) {
    return this.#queue.run(operation);
  }
  /** Absorb unsolicited output left on the line before issuing a new command. */
  async flush(ms = 100) {
    const deadline = Date.now() + ms;
    let drained = this.#buffer;
    this.#buffer = "";
    for (; ; ) {
      const remaining = remainingTime(deadline);
      if (remaining <= 0) return drained;
      const chunk = await this.transport.read(remaining);
      if (chunk.length === 0) return drained;
      drained += this.#decoder.decode(chunk, { stream: true });
    }
  }
  /** Switch to raw bytes; buffered text is discarded because it cannot be re-encoded faithfully. */
  binary() {
    if (this.#buffer.length > 0) {
      this.logger.warn(`Passage en mode binaire : ${this.#buffer.length} caracteres non lus abandonnes.`);
      this.#buffer = "";
    }
    this.#binary ??= new BinaryChannel(this.transport);
    return this.#binary;
  }
  endBinary() {
    this.#binary = void 0;
    this.#decoder = new TextDecoder(this.#encoding);
  }
  #reset() {
    this.#buffer = "";
    this.#binary = void 0;
    this.#decoder = new TextDecoder(this.#encoding);
  }
};

// src/device/instrument.ts
var Instrument = class {
  spec;
  link;
  constructor(spec, link) {
    this.spec = spec;
    this.link = link ?? new Link({
      framing: spec.framing,
      portOptions: spec.portOptions,
      ...spec.defaultTimeout !== void 0 ? { defaultTimeout: spec.defaultTimeout } : {},
      ...spec.encoding !== void 0 ? { encoding: spec.encoding } : {}
    });
  }
  get id() {
    return this.spec.id;
  }
  get params() {
    return this.spec.params;
  }
  get isConnected() {
    return this.link.isOpen;
  }
  connect(overrides) {
    return this.link.open(overrides);
  }
  disconnect() {
    return this.link.close();
  }
  reconnect(overrides) {
    return this.link.reopen(overrides);
  }
  /** Runtime metadata, so a generic UI can enumerate what the device exposes. */
  describe() {
    return describeParams(this.spec.params);
  }
  describeActions() {
    return describeActions(this.spec.actions);
  }
  getParam(key) {
    return this.spec.params.find((spec) => spec.key === key);
  }
  getAction(key) {
    return this.spec.actions?.find((spec) => spec.key === key);
  }
  async raw(command, payload = "", options = {}) {
    const request = this.#buildRequest(command, payload);
    return this.link.request(request, {
      ...options,
      context: { expectedCommand: command, ...options.context }
    });
  }
  async readParam(key, options = {}) {
    const spec = this.#requireParam(key);
    if (!spec.read) {
      throw new ConfigurationError(`Le parametre "${key}" n'est pas lisible sur ${this.spec.id}.`);
    }
    const raw = await this.raw(spec.read, "", {
      ...spec.timeout !== void 0 ? { timeout: spec.timeout } : {},
      ...options,
      context: {
        expectsValue: true,
        ...spec.responseLength !== void 0 ? { expectedLength: spec.responseLength } : {},
        ...options.context
      }
    });
    return spec.codec.decode(raw);
  }
  async writeParam(key, value, options = {}) {
    const spec = this.#requireParam(key);
    if (!spec.write) {
      throw new ConfigurationError(`Le parametre "${key}" n'est pas inscriptible sur ${this.spec.id}.`);
    }
    const payload = spec.encode ? spec.encode(value) : spec.codec.encode ? spec.codec.encode(value) : String(value);
    await this.#dispatch(this.#buildRequest(spec.write, payload), spec.reply ?? "required", {
      ...spec.timeout !== void 0 ? { timeout: spec.timeout } : {},
      ...options,
      context: { expectedCommand: spec.write, expectsValue: false, ...options.context }
    });
  }
  /** Fire a behaviour command. Returns null when the device stays silent, which is legal in basic mode. */
  async runAction(key, options = {}) {
    const spec = this.getAction(key);
    if (!spec) {
      throw new ConfigurationError(`Action inconnue "${key}" sur ${this.spec.id}.`);
    }
    return this.#dispatch(
      this.#buildRequest(spec.command, spec.payload ?? ""),
      spec.reply ?? "required",
      {
        ...spec.timeout !== void 0 ? { timeout: spec.timeout } : {},
        ...options,
        context: { expectedCommand: spec.command, expectsValue: false, ...options.context }
      }
    );
  }
  #buildRequest(command, payload) {
    return this.spec.buildRequest ? this.spec.buildRequest(command, payload) : `${command}${payload}`;
  }
  #dispatch(request, reply, options) {
    return this.link.enqueue(async () => {
      await this.link.send(request);
      if (reply === "none") return null;
      try {
        return await this.link.receive(options);
      } catch (error) {
        if (reply === "optional" && error instanceof TimeoutError) return null;
        throw error;
      }
    });
  }
  #requireParam(key) {
    const spec = this.getParam(key);
    if (!spec) {
      throw new ConfigurationError(`Parametre inconnu "${key}" sur ${this.spec.id}.`);
    }
    return spec;
  }
};
function capitalize(key) {
  return key.length === 0 ? key : `${key[0]?.toUpperCase() ?? ""}${key.slice(1)}`;
}
function createInstrument(spec, link) {
  const instrument = new Instrument(spec, link);
  const target = instrument;
  const attach = (name, implementation) => {
    if (name in target) {
      throw new ConfigurationError(
        `${spec.id} : l'accesseur genere "${name}" entre en collision avec un membre existant.`
      );
    }
    Object.defineProperty(target, name, {
      value: implementation,
      enumerable: false,
      configurable: true,
      writable: true
    });
  };
  for (const entry of spec.params) {
    const key = entry.key;
    if (entry.read) {
      attach(`read${capitalize(entry.key)}`, ((options) => instrument.readParam(key, options)));
    }
    if (entry.write) {
      attach(`write${capitalize(entry.key)}`, ((value, options) => instrument.writeParam(key, value, options)));
    }
  }
  for (const entry of spec.actions ?? []) {
    attach(entry.key, ((options) => instrument.runAction(entry.key, options)));
  }
  return instrument;
}

export { AsyncQueue, BinaryChannel, DEFAULT_PORT_OPTIONS, Deferred, EMPTY_CHUNK, Instrument, Link, WebSerialTransport, bytesToHex, concatBytes, createConsoleLogger, createInstrument, delay, hexToBytes, noopLogger, remainingTime, withPortDefaults };
//# sourceMappingURL=chunk-ZRL2DAVD.js.map
//# sourceMappingURL=chunk-ZRL2DAVD.js.map