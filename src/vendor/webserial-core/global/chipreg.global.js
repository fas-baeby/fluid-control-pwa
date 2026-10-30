/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */
"use strict";
(() => {
  // src/codec/crc.ts
  function modbus(at, length) {
    let crc = 65535;
    for (let i = 0; i < length; i += 1) {
      crc ^= at(i);
      for (let bit = 0; bit < 8; bit += 1) {
        crc = (crc & 1) !== 0 ? crc >> 1 ^ 40961 : crc >> 1;
      }
    }
    return crc & 65535;
  }
  function crc16Modbus(data) {
    return modbus((i) => data.charCodeAt(i), data.length).toString(16).padStart(4, "0");
  }
  function crc16ModbusBytes(bytes) {
    return modbus((i) => bytes[i], bytes.length);
  }
  function isCrcValid(frame, compute = crc16Modbus) {
    if (frame.length < 4) return false;
    const received = frame.slice(-4);
    return received.toLowerCase() === compute(frame.slice(0, -4)).toLowerCase();
  }

  // src/core/errors.ts
  var WebSerialError = class extends Error {
    constructor(message, options) {
      super(message, options);
      this.name = new.target.name;
    }
  };
  var TransportError = class extends WebSerialError {
  };
  var TimeoutError = class extends TransportError {
  };
  var ProtocolError = class extends WebSerialError {
  };
  var DeviceError = class extends WebSerialError {
    code;
    constructor(message, code, options) {
      super(message, options);
      this.code = code;
    }
  };
  var ConfigurationError = class extends WebSerialError {
  };
  var PORT_FAILURE_MESSAGES = {
    NotFoundError: "Aucun port serie selectionne.",
    SecurityError: "Acces au port refuse : la page doit etre servie en HTTPS (ou localhost) et l'appel doit suivre une action utilisateur.",
    NetworkError: "Port deja utilise par une autre application, ou permissions insuffisantes (Linux : groupe dialout).",
    InvalidStateError: "Le port est deja ouvert.",
    NotSupportedError: "Parametres de port non supportes par le pilote.",
    BreakError: "Interruption detectee sur la ligne serie.",
    FramingError: "Erreur de trame : verifier baudrate, bits de donnees et parite.",
    ParityError: "Erreur de parite : verifier la configuration du port.",
    BufferOverrunError: "Debordement du tampon de reception."
  };
  function toMessage(error) {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return String(error);
  }
  function describePortFailure(error) {
    if (error instanceof Error && error.name in PORT_FAILURE_MESSAGES) {
      return PORT_FAILURE_MESSAGES[error.name];
    }
    return toMessage(error);
  }
  function isSerialSupported() {
    return typeof navigator !== "undefined" && "serial" in navigator;
  }
  function assertSerialSupported() {
    if (!isSerialSupported()) {
      throw new TransportError(
        "Web Serial API indisponible : requiert Edge/Chrome 89+ sur desktop, en contexte securise (https ou localhost)."
      );
    }
  }

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

  // src/codec/codec.ts
  function defineCodec(name, decode, encode) {
    return encode ? { name, decode, encode } : { name, decode };
  }

  // src/core/async.ts
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

  // src/framing/crc-frame.ts
  var DEFAULTS = {
    separator: "->",
    headerLength: 8,
    checksumLength: 4,
    skipMarker: "XXXX",
    errorCommand: "ERRN",
    maxErrorFrameLength: 24
  };
  function crcFraming(options = {}) {
    const {
      separator = DEFAULTS.separator,
      headerLength = DEFAULTS.headerLength,
      checksumLength = DEFAULTS.checksumLength,
      compute = crc16Modbus,
      skipMarker = DEFAULTS.skipMarker,
      errorCommand = DEFAULTS.errorCommand,
      maxErrorFrameLength = DEFAULTS.maxErrorFrameLength
    } = options;
    const encoder = new TextEncoder();
    const minimumLength = headerLength + checksumLength;
    const separatorAt = headerLength - separator.length - 4;
    const checksumMatches = (candidate) => {
      const received = candidate.slice(-checksumLength);
      const expected = compute(candidate.slice(0, -checksumLength));
      return received.toLowerCase() === expected.toLowerCase();
    };
    const wellFormed = (candidate) => candidate.length >= minimumLength && candidate.slice(separatorAt, separatorAt + separator.length) === separator;
    const commandOf = (buffer) => buffer.slice(separatorAt + separator.length, headerLength);
    const scan = (buffer, from, to) => {
      for (let end = from; end <= to; end += 1) {
        const candidate = buffer.slice(0, end);
        if (checksumMatches(candidate)) {
          return { message: candidate, consumed: end };
        }
      }
      return null;
    };
    return {
      name: "crc",
      encode(payload) {
        if (payload instanceof Uint8Array) return payload;
        const frame = payload.endsWith(skipMarker) ? payload : `${payload}${compute(payload)}`;
        return encoder.encode(frame);
      },
      extract(buffer, context) {
        if (!wellFormed(buffer)) return null;
        if (commandOf(buffer) === errorCommand) {
          return scan(buffer, minimumLength, Math.min(buffer.length, maxErrorFrameLength));
        }
        const expected = context?.expectedLength;
        if (expected !== void 0) {
          if (buffer.length < expected) return null;
          const candidate = buffer.slice(0, expected);
          return checksumMatches(candidate) ? { message: candidate, consumed: expected } : null;
        }
        return scan(buffer, minimumLength, buffer.length);
      }
    };
  }
  function splitCrcFrame(frame, options = {}) {
    const {
      separator = DEFAULTS.separator,
      headerLength = DEFAULTS.headerLength,
      checksumLength = DEFAULTS.checksumLength
    } = options;
    const separatorAt = headerLength - separator.length - 4;
    return {
      address: frame.slice(0, separatorAt),
      command: frame.slice(separatorAt + separator.length, headerLength),
      data: frame.slice(headerLength, frame.length - checksumLength),
      checksum: frame.slice(-checksumLength),
      raw: frame
    };
  }
  function assertNoErrorFrame(frame, options = {}) {
    const { errorCommand = DEFAULTS.errorCommand, messages = {} } = options;
    const parts = splitCrcFrame(frame);
    if (parts.command !== errorCommand) return frame;
    const code = Number.parseInt(parts.data, 16);
    const label = messages[code] ?? `Code d'erreur inconnu 0x${code.toString(16)}`;
    throw new DeviceError(`${errorCommand} 0x${code.toString(16).padStart(2, "0")} : ${label}.`, code);
  }

  // src/core/result.ts
  function ok(value = {}) {
    return { success: true, ...value };
  }
  function err(error, extra = {}) {
    return { success: false, error, ...extra };
  }

  // src/codec/hex.ts
  var HexCursor = class {
    constructor(source, label = "trame") {
      this.source = source;
      this.label = label;
    }
    #pos = 0;
    get offset() {
      return this.#pos;
    }
    get remaining() {
      return Math.max(this.source.length - this.#pos, 0);
    }
    get exhausted() {
      return this.remaining === 0;
    }
    seek(position) {
      this.#pos = position;
    }
    skip(chars) {
      this.#pos += chars;
    }
    peek(chars) {
      return this.source.slice(this.#pos, this.#pos + chars);
    }
    take(chars) {
      if (this.#pos + chars > this.source.length) {
        throw new ProtocolError(
          `${this.label} tronquee : ${chars} caracteres demandes a l'offset ${this.#pos}, ${this.remaining} disponibles.`
        );
      }
      const slice = this.source.slice(this.#pos, this.#pos + chars);
      this.#pos += chars;
      return slice;
    }
    rest() {
      return this.take(this.remaining);
    }
    ascii(chars, options = {}) {
      const raw = this.take(chars);
      return options.trim === false ? raw : raw.trim();
    }
    uint8() {
      return this.#integer(2);
    }
    uint16() {
      return this.#integer(4);
    }
    uint32() {
      return this.#integer(8);
    }
    int16() {
      const value = this.#integer(4);
      return value > 32767 ? value - 65536 : value;
    }
    int32() {
      const value = this.#integer(8);
      return value > 2147483647 ? value - 4294967296 : value;
    }
    float32(littleEndian = false) {
      return hexToFloat32(this.take(8), littleEndian);
    }
    #integer(chars) {
      const raw = this.take(chars);
      const value = Number.parseInt(raw, 16);
      if (!Number.isInteger(value)) {
        throw new ProtocolError(`${this.label} : hexadecimal invalide "${raw}" a l'offset ${this.#pos - chars}.`);
      }
      return value;
    }
  };
  function hexToFloat32(hex, littleEndian = false) {
    if (hex.length !== 8) {
      throw new ProtocolError(`float32 attend 8 caracteres hexadecimaux, recu ${hex.length}.`);
    }
    const view = new DataView(new ArrayBuffer(4));
    for (let i = 0; i < 4; i += 1) {
      const byte = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
      if (!Number.isInteger(byte)) {
        throw new ProtocolError(`float32 : hexadecimal invalide "${hex}".`);
      }
      view.setUint8(i, byte);
    }
    return view.getFloat32(0, littleEndian);
  }

  // src/codec/struct.ts
  var VARIABLE_SIZE = -1;
  function field(name, size, read) {
    return { name, size, read };
  }
  var uint8 = field("uint8", 2, (cursor) => cursor.uint8());
  var uint16 = field("uint16", 4, (cursor) => cursor.uint16());
  var uint32 = field("uint32", 8, (cursor) => cursor.uint32());
  var int16 = field("int16", 4, (cursor) => cursor.int16());
  var int32 = field("int32", 8, (cursor) => cursor.int32());
  var float32 = field("float32", 8, (cursor) => cursor.float32());
  var rest = field("rest", VARIABLE_SIZE, (cursor) => cursor.rest());
  function ascii(chars, options = {}) {
    return field("ascii", chars, (cursor) => cursor.ascii(chars, options));
  }
  function array(item, count) {
    const size = item.size === VARIABLE_SIZE ? VARIABLE_SIZE : item.size * count;
    return field(`${item.name}[${count}]`, size, (cursor) => {
      const values = [];
      for (let i = 0; i < count; i += 1) values.push(item.read(cursor));
      return values;
    });
  }
  function pid() {
    return field("pid", 24, (cursor) => [cursor.float32(), cursor.float32(), cursor.float32()]);
  }
  function struct(shape, options = {}) {
    const name = options.name ?? "struct";
    const entries = Object.entries(shape);
    const size = entries.some(([, f]) => f.size === VARIABLE_SIZE) ? VARIABLE_SIZE : entries.reduce((total, [, f]) => total + f.size, 0);
    function decode(hex) {
      const cursor = new HexCursor(hex, name);
      const output = {};
      for (const [key, spec] of entries) {
        const value = spec.read(cursor);
        if (!spec.skip) output[key] = value;
      }
      return output;
    }
    return {
      name,
      size,
      fields: entries.map(([key]) => key),
      decode,
      decodeResult(hex) {
        try {
          const decoded = decode(hex);
          return ok({
            ...decoded,
            rawData: hex,
            dataLength: hex.length,
            isComplete: size === VARIABLE_SIZE || hex.length >= size
          });
        } catch (error) {
          return err(`Failed to parse ${name} data: ${toMessage(error)}`, { rawData: hex });
        }
      }
    };
  }

  // src/devices/chipreg/layout.ts
  var IDER = struct(
    {
      partNumber: ascii(13),
      suffix: ascii(8),
      description: ascii(32),
      serialNumber: ascii(22),
      swVersion: ascii(9),
      hwVersion: ascii(9),
      calibrationDate: ascii(14),
      calibrationGas: uint8,
      calFullScaleInt: uint16,
      calFullScaleDec: uint16,
      deviceGas: uint8,
      devFullScaleInt: uint16,
      devFullScaleDec: uint16,
      deviceUnit: uint8,
      pressureRef: uint16,
      temperatureRefMilli: uint16,
      calibrationPressure: uint16,
      calibrationTemperatureMilli: uint16,
      fullScaleAccuracyMilli: uint16,
      readingAccuracyMilli: uint16
    },
    { name: "IDER" }
  );
  var CFXR = struct(
    {
      fileName: ascii(24),
      floatNvmCtrlRobustSlowPid: pid(),
      floatNvmCtrlRobustMediumPid: pid(),
      floatNvmCtrlRobustFastPid: pid(),
      floatNvmCtrlRobustUserPid: pid(),
      int16NvmCtrlRobustBoostParameter: array(int16, 1)
    },
    { name: "CFXR" }
  );
  var CONR = struct(
    {
      floatNvmCtrlValveCurrentSlowPid: pid(),
      floatNvmCtrlValveCurrentMediumPid: pid(),
      floatNvmCtrlValveCurrentFastPid: pid(),
      floatNvmCtrlMassFlowSlowPid: pid(),
      floatNvmCtrlMassFlowMediumPid: pid(),
      floatNvmCtrlMassFlowFastPid: pid(),
      floatNvmCtrlValveCurrentUserPid: pid(),
      floatNvmCtrlMassFlowUserPid: pid(),
      uint8NvmSetpointInputSelection: uint8,
      uint8NvmControlType: uint8,
      uint8NvmControllerType: uint8,
      uint8NvmAnalogOutputDac1Selection: uint8,
      floatNvmMflsGasCoefficient: array(float32, 5),
      floatNvmMflsUserGasCoefficient: float32,
      uint8NvmMflsUserGasUnit: uint8,
      // Boost[11] carries the sliding-average scale.
      int16NvmCtrlBoostParameter: array(int16, 12),
      uint8NvmDeviceAddress: uint8,
      uint8NvmRs485Impedance: uint8,
      uint32NvmBaudRate: uint32
    },
    { name: "CONR" }
  );
  var CALR = struct(
    {
      floatNvmScaledAdcSetpointSlope: float32,
      floatNvmScaledAdcSetpointOffset: float32,
      floatNvmRawDac1Slope: float32,
      floatNvmRawDac1Offset: float32,
      int16NvmMflsBound: array(int16, 6),
      floatNvmMflsMathFuncCoeff: array(array(float32, 3), 5),
      floatNvmMflsGlobalMathFuncCoeff: array(float32, 2),
      int16NvmMflsRawTemperatureReference: int16,
      int16NvmMflsScaledTemperatureReference: int16,
      floatNvmMflsTemperatureCoefficient: float32
    },
    { name: "CALR" }
  );
  var CHIPREG_FRAME_SIZES = {
    IDER: IDER.size,
    CFXR: CFXR.size,
    CONR: CONR.size,
    CALR: CALR.size
  };

  // src/devices/chipreg/ymodem.ts
  var SOH = 1;
  var STX = 2;
  var EOT = 4;
  var ACK = 6;
  var NAK = 21;
  var CAN = 24;
  var SUB = 26;
  var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  function buildYmodemHeaderPayload(fileName, fileSize) {
    const encoder = new TextEncoder();
    const nameBytes = encoder.encode(fileName).subarray(0, 100);
    const sizeBytes = encoder.encode(String(fileSize));
    const payload = new Uint8Array(128);
    let pos = 0;
    payload.set(nameBytes, pos);
    pos += nameBytes.length;
    payload[pos] = 0;
    pos += 1;
    payload.set(sizeBytes, pos);
    pos += sizeBytes.length;
    payload[pos] = 0;
    return payload;
  }
  function buildYmodemBlock(startByte, blockNumber, payload, crc = crc16ModbusBytes) {
    const block = new Uint8Array(3 + payload.length + 2);
    block[0] = startByte;
    block[1] = blockNumber & 255;
    block[2] = 255 - (blockNumber & 255) & 255;
    block.set(payload, 3);
    const checksum = crc(payload);
    block[3 + payload.length] = checksum >> 8 & 255;
    block[4 + payload.length] = checksum & 255;
    return block;
  }
  function describeByte(byte) {
    if (byte === null) return "TIMEOUT";
    if (byte === ACK) return "ACK";
    if (byte === NAK) return "NAK";
    if (byte === CAN) return "CAN";
    return `0x${byte.toString(16)}`;
  }
  async function sendBlockWithAck(channel, block, timeout, maxRetries, label) {
    let last = null;
    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      await channel.write(block);
      last = await channel.readByte(timeout);
      if (last === ACK) return;
      if (last === CAN) {
        throw new TransportError(`YMODEM : transfert annule par l'appareil sur ${label}.`);
      }
    }
    throw new TransportError(
      `YMODEM : ${label} sans acquittement apres ${maxRetries} tentatives (dernier octet : ${describeByte(last)}).`
    );
  }
  async function sendEot(channel, timeout, maxRetries) {
    let last = null;
    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      await channel.write(new Uint8Array([EOT]));
      last = await channel.readByte(timeout);
      if (last === ACK) return;
    }
    throw new TransportError(
      `YMODEM : fin de transmission non acquittee (dernier octet : ${describeByte(last)}).`
    );
  }
  async function sendYmodem(channel, bytes, options = {}) {
    const {
      fileName = "firmware.bin",
      blockSize = 1024,
      blockTimeout = 1e3,
      maxRetries = 10,
      bootDelay = 1500,
      postHeaderDelay = 2e3,
      firstBlockTimeout = 8e3,
      interBlockDelay = 20,
      validationTimeout = 2e4,
      preHeaderDrain = 300,
      postHeaderDrain = 200,
      onProgress,
      crc = crc16ModbusBytes
    } = options;
    if (bytes.length === 0) {
      throw new TransportError("YMODEM : image de firmware vide.");
    }
    try {
      if (bootDelay > 0) await sleep(bootDelay);
      if (preHeaderDrain > 0) await channel.drain(preHeaderDrain);
      await sendBlockWithAck(
        channel,
        buildYmodemBlock(SOH, 0, buildYmodemHeaderPayload(fileName, bytes.length), crc),
        blockTimeout,
        maxRetries,
        "bloc d'entete"
      );
      if (postHeaderDelay > 0) await sleep(postHeaderDelay);
      if (postHeaderDrain > 0) await channel.drain(postHeaderDrain);
      const dataStartByte = blockSize === 1024 ? STX : SOH;
      let offset = 0;
      let blockNumber = 1;
      let blocks = 0;
      while (offset < bytes.length) {
        const slice = bytes.subarray(offset, offset + blockSize);
        const payload = new Uint8Array(blockSize).fill(SUB);
        payload.set(slice, 0);
        await sendBlockWithAck(
          channel,
          buildYmodemBlock(dataStartByte, blockNumber, payload, crc),
          blocks === 0 ? Math.max(blockTimeout, firstBlockTimeout) : blockTimeout,
          maxRetries,
          `bloc ${blockNumber}`
        );
        offset += slice.length;
        blocks += 1;
        onProgress?.({
          sentBytes: Math.min(offset, bytes.length),
          totalBytes: bytes.length,
          block: blockNumber,
          percent: Math.round(Math.min(offset, bytes.length) / bytes.length * 100)
        });
        blockNumber = blockNumber + 1 & 255;
        if (interBlockDelay > 0 && offset < bytes.length) await sleep(interBlockDelay);
      }
      await sendEot(channel, blockTimeout, maxRetries);
      const validation = await channel.readByte(validationTimeout);
      if (validation === NAK || validation === CAN) {
        throw new TransportError("YMODEM : validation du bootloader refusee (NAK).");
      }
      return { bytesSent: bytes.length, blocks, fileName, validated: validation === ACK };
    } catch (error) {
      await channel.write(new Uint8Array([CAN, CAN, CAN])).catch(() => void 0);
      throw error;
    }
  }
  async function normalizeFirmwareInput(source, explicitName) {
    if (source instanceof Uint8Array) {
      return { bytes: source, fileName: explicitName ?? "firmware.bin" };
    }
    if (source instanceof ArrayBuffer) {
      return { bytes: new Uint8Array(source), fileName: explicitName ?? "firmware.bin" };
    }
    const bytes = new Uint8Array(await source.arrayBuffer());
    const name = explicitName ?? (source instanceof File ? source.name : "firmware.bin");
    return { bytes, fileName: name };
  }

  // src/devices/chipreg/index.ts
  var CHIPREG_ERRORS = {
    1: "R\xE9serv\xE9",
    2: "R\xE9serv\xE9",
    3: "Erreur CRC16 : le calcul de contr\xF4le est incorrect",
    4: "Erreur d'int\xE9grit\xE9 : caract\xE8re hexad\xE9cimal invalide",
    5: "Erreur de plage : valeur hors bornes",
    6: "R\xE9serv\xE9",
    7: "Erreur de mot de passe usine",
    8: "Op\xE9ration n\xE9cessitant la r\xE9gulation d\xE9sactiv\xE9e",
    9: "Op\xE9ration n\xE9cessitant la r\xE9gulation activ\xE9e"
  };
  var CHIPREG_FRAME_OVERHEAD = 12;
  function chipregFrameLength(dataLength) {
    return CHIPREG_FRAME_OVERHEAD + dataLength;
  }
  var CHIPREG_EXPECTED_LENGTHS = {
    IDER: chipregFrameLength(IDER.size),
    CALR: chipregFrameLength(CALR.size),
    CONR: chipregFrameLength(CONR.size),
    CFXR: chipregFrameLength(CFXR.size),
    SMFR: chipregFrameLength(4),
    MFSW: chipregFrameLength(0)
  };
  function decodeChipregFrame(frame) {
    assertNoErrorFrame(frame, { messages: CHIPREG_ERRORS });
    return splitCrcFrame(frame).data;
  }
  function structCodec(layout) {
    return defineCodec(layout.name, (frame) => layout.decode(decodeChipregFrame(frame)));
  }
  var chipregIdentification = defineCodec("IDER", (frame) => {
    const fields = IDER.decode(decodeChipregFrame(frame));
    return {
      ...fields,
      calibrationFullScale: `${fields.calFullScaleInt}.${String(fields.calFullScaleDec).padStart(3, "0")}`,
      deviceFullScale: `${fields.devFullScaleInt}.${String(fields.devFullScaleDec).padStart(3, "0")}`,
      temperatureRef: fields.temperatureRefMilli / 1e3,
      calibrationTemperature: fields.calibrationTemperatureMilli / 1e3,
      fullScaleAccuracy: fields.fullScaleAccuracyMilli / 1e3,
      readingAccuracy: fields.readingAccuracyMilli / 1e3
    };
  });
  var chipregCalibration = structCodec(CALR);
  var chipregConfiguration = structCodec(CONR);
  var chipregExtendedConfiguration = structCodec(CFXR);
  var chipregPayload = defineCodec(
    "payload",
    (frame) => decodeChipregFrame(frame)
  );
  function normalizeChipregAddress(address) {
    if (typeof address === "number") {
      if (!Number.isInteger(address) || address < 0 || address > 255) {
        throw new ConfigurationError(`Adresse CHIPREG invalide : ${address}.`);
      }
      return address.toString(16).padStart(2, "0");
    }
    const text = address.trim().toLowerCase();
    if (!/^[0-9a-f]{2}$/.test(text)) {
      throw new ConfigurationError(`Adresse CHIPREG invalide : "${address}".`);
    }
    return text;
  }

  // src/devices/chipreg/firmware.ts
  var BOOTLOADER_MAGIC = "B007C0DE";
  var PATCHER_MAGIC = "B007CACE";
  var APPLICATION_MAGIC = "DEADBEEF";
  var BOOTLOADER_ACK = "UPBO";
  var PATCHER_ACK = "UPPA";
  var APPLICATION_ACK = "UPAP";

  // src/compat/chipreg-mfc.ts
  function fail(error, extra = {}) {
    return { success: false, error, ...extra };
  }
  function toLegacyResponse(frame) {
    if (!frame || frame.length < 12) {
      return { success: false, error: "Invalid response length", raw: frame };
    }
    const parts = splitCrcFrame(frame);
    if (frame.slice(2, 4) !== "->") {
      return { success: false, error: "Invalid frame separator", raw: frame };
    }
    if (parts.command === "ERRN") {
      const errorCode = Number.parseInt(parts.data, 16);
      return {
        success: false,
        isError: true,
        errorCode,
        errorMessage: CHIPREG_ERRORS[errorCode] ?? `Unknown error code: 0x${errorCode.toString(16)}`,
        raw: frame
      };
    }
    return {
      success: true,
      address: parts.address,
      command: parts.command,
      data: parts.data,
      crc: parts.checksum,
      crcValid: isCrcValid(frame),
      raw: frame
    };
  }
  function structResult(layout, data) {
    return layout.decodeResult(data);
  }
  var ChipregMFC = class {
    deviceAddress;
    baudRate;
    responseTimeout;
    transport;
    link;
    constructor(options = {}) {
      this.deviceAddress = normalizeChipregAddress(options.address ?? "ff");
      this.baudRate = options.baudRate ?? 115200;
      this.responseTimeout = options.responseTimeout ?? 3e3;
      this.transport = options.transport ?? new WebSerialTransport();
      this.link = new Link({
        framing: crcFraming(),
        transport: this.transport,
        portOptions: { baudRate: this.baudRate },
        defaultTimeout: this.responseTimeout,
        logger: options.logger ?? createConsoleLogger()
      });
    }
    get isConnected() {
      return this.link.isOpen;
    }
    isDeviceConnected() {
      return this.link.isOpen;
    }
    setDeviceAddress(address) {
      this.deviceAddress = normalizeChipregAddress(address);
    }
    setResponseTimeout(timeout) {
      this.responseTimeout = timeout;
      this.link.defaultTimeout = timeout;
    }
    // --- Connection -------------------------------------------------------
    async connect(baudRate = this.baudRate) {
      try {
        this.baudRate = baudRate;
        await this.link.open({ baudRate });
        return { success: true };
      } catch (error) {
        return fail(toMessage(error));
      }
    }
    async disconnect() {
      try {
        await this.link.close();
        return { success: true };
      } catch (error) {
        return fail(toMessage(error));
      }
    }
    async reconnect(newBaudRate = null) {
      try {
        if (newBaudRate) this.baudRate = newBaudRate;
        await this.link.reopen({ baudRate: this.baudRate });
        return { success: true };
      } catch (error) {
        return fail(toMessage(error));
      }
    }
    async reconnectWithRetries(options = {}) {
      const { attempts = 4, delay = 800, initialDelay = 0, baudRate } = options;
      const sleep2 = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      if (initialDelay > 0) await sleep2(initialDelay);
      let last = { success: false, error: "No attempt made" };
      for (let attempt = 1; attempt <= attempts; attempt += 1) {
        last = await this.reconnect(baudRate ?? null);
        if (last.success) return { ...last, attempts: attempt };
        if (attempt < attempts) await sleep2(delay);
      }
      return { ...last, attempts };
    }
    // --- Raw commands -----------------------------------------------------
    buildCommand(command, data = "") {
      const body = `${this.deviceAddress}->${command}${data}`;
      return `${body}${crc16Modbus(body)}`;
    }
    computeCRC16(data) {
      return crc16Modbus(data);
    }
    async sendCommand(command, data = "", skipCRC = false) {
      if (!this.link.isOpen) return fail("Not connected to device");
      const expectedLength = CHIPREG_EXPECTED_LENGTHS[command] !== void 0 && (command === "SMFR" || command === "MFSW") ? CHIPREG_EXPECTED_LENGTHS[command] : void 0;
      try {
        const frame = await this.link.request(
          `${this.deviceAddress}->${command}${data}${skipCRC ? "XXXX" : ""}`,
          {
            timeout: this.responseTimeout,
            context: {
              expectedCommand: command,
              ...expectedLength !== void 0 ? { expectedLength } : {}
            }
          }
        );
        return toLegacyResponse(frame);
      } catch (error) {
        return fail(toMessage(error));
      }
    }
    // --- Parsers (safe to pass around detached) ---------------------------
    parseResponse = (response) => toLegacyResponse(response);
    parseIDER = (data) => {
      const parsed = structResult(IDER, data);
      if (!parsed["success"]) return parsed;
      const int = (key) => Number(parsed[key] ?? 0);
      return {
        ...parsed,
        calibrationFullScale: `${int("calFullScaleInt")}.${String(int("calFullScaleDec")).padStart(3, "0")}`,
        deviceFullScale: `${int("devFullScaleInt")}.${String(int("devFullScaleDec")).padStart(3, "0")}`,
        temperatureRef: int("temperatureRefMilli") / 1e3,
        calibrationTemperature: int("calibrationTemperatureMilli") / 1e3,
        fullScaleAccuracy: int("fullScaleAccuracyMilli") / 1e3,
        readingAccuracy: int("readingAccuracyMilli") / 1e3
      };
    };
    parseCALR = (data) => structResult(CALR, data);
    parseCONR = (data) => structResult(CONR, data);
    parseCFXR = (data) => structResult(CFXR, data);
    // --- Read commands ----------------------------------------------------
    async readIdentification() {
      return this.#decorate("IDER", "Device Identification", "deviceId");
    }
    async readCalibration() {
      return this.#decorate("CALR", "Calibration Data", "calibrationData");
    }
    async readConfiguration() {
      return this.#decorate("CONR", "Configuration Data", "configurationData");
    }
    async readExtendedConfiguration() {
      return this.#decorate("CFXR", "Extended Configuration", "extendedConfigurationData");
    }
    async readRealtimeValues() {
      return this.#decorate("SMFR", "Realtime Process Values", "realtimePayload");
    }
    // --- Write commands ---------------------------------------------------
    writeSetpoint(data) {
      return this.#write("MFSW", data, "Setpoint written");
    }
    writeIdentification(data) {
      return this.#write("IDEW", data, "Identification written");
    }
    writeCalibration(data) {
      return this.#write("CALW", data, "Calibration written");
    }
    writeConfiguration(data) {
      return this.#write("CONW", data, "Configuration written");
    }
    writeExtendedConfiguration(data) {
      return this.#write("CFXW", data, "Extended configuration written");
    }
    writeFactoryPassword(password) {
      return this.#write("FPWW", password, "Factory password accepted");
    }
    writeControlDisable(data) {
      return this.#write("CTRW", data, "Control disable written");
    }
    writeFlashMemory() {
      return this.sendCommand("NMWM", "");
    }
    // --- Firmware ---------------------------------------------------------
    async jumpToBootloader() {
      return this.#decorate("GOBW", "Jumped to bootloader");
    }
    async requestBootloaderUpdate() {
      return this.#challenge(BOOTLOADER_MAGIC, "Bootloader update requested");
    }
    async requestPatcherUpdate() {
      return this.#challenge(PATCHER_MAGIC, "Patcher update requested");
    }
    async confirmBootloaderChallenge(challenge) {
      return this.#confirm(challenge, BOOTLOADER_ACK, "Bootloader update accepted");
    }
    async confirmPatcherChallenge(challenge) {
      return this.#confirm(challenge, PATCHER_ACK, "Patcher update accepted");
    }
    async requestApplicationUpdate() {
      const response = await this.sendCommand("FWDW", APPLICATION_MAGIC);
      if (!response.success) return response;
      const acknowledged = response.data === APPLICATION_ACK;
      return {
        ...response,
        acknowledged,
        parsed: {
          description: acknowledged ? "Application update accepted" : `Unexpected application response: ${response.data}`
        }
      };
    }
    async sendFirmwareYmodem(file, options = {}) {
      let fileName = options.fileName ?? "firmware.bin";
      try {
        const normalized = await normalizeFirmwareInput(file, options.fileName);
        fileName = normalized.fileName;
        if (!this.link.isOpen) return { success: false, error: "Not connected to device" };
        const channel = this.link.binary();
        try {
          const result = await sendYmodem(channel, normalized.bytes, { ...options, fileName });
          return { success: true, ...result };
        } finally {
          this.link.endBinary();
        }
      } catch (error) {
        return { success: false, error: toMessage(error), fileName };
      }
    }
    // --- Internals --------------------------------------------------------
    async #decorate(command, description, dataKey) {
      const response = await this.sendCommand(command);
      if (!response.success) return response;
      return {
        ...response,
        parsed: { ...dataKey ? { [dataKey]: response.data } : {}, description }
      };
    }
    async #write(command, data, description) {
      if (!data && command !== "NMWM") {
        return fail(`Data is required for ${command} command`);
      }
      const response = await this.sendCommand(command, data);
      if (!response.success) return response;
      return { ...response, parsed: { description } };
    }
    async #challenge(magic, description) {
      const response = await this.sendCommand("FWDW", magic);
      if (!response.success) return response;
      return {
        ...response,
        challenge: response.data,
        parsed: { description, challenge: response.data }
      };
    }
    async #confirm(challenge, expected, description) {
      if (!challenge || !/^[0-9A-Fa-f]{8}$/.test(challenge)) {
        return fail("A valid 8-digit hex challenge code is required for FWCW");
      }
      const response = await this.sendCommand("FWCW", challenge.toUpperCase());
      if (!response.success) return response;
      const acknowledged = response.data === expected;
      return {
        ...response,
        acknowledged,
        parsed: {
          description: acknowledged ? description : `Unexpected response: ${response.data}`
        }
      };
    }
  };

  // src/global/chipreg.ts
  globalThis.ChipregMFC = ChipregMFC;
})();
//# sourceMappingURL=chipreg.global.js.map