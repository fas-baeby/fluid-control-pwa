import { crc16Modbus } from './chunk-7V5XXNHL.js';
import { DeviceError } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

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

export { assertNoErrorFrame, crcFraming, splitCrcFrame };
//# sourceMappingURL=chunk-6XMHCNHO.js.map
//# sourceMappingURL=chunk-6XMHCNHO.js.map