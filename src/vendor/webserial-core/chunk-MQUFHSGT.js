import { DeviceError } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/framing/acknowledged.ts
function acknowledgedFraming(options = {}) {
  const {
    terminator = "\r\n",
    outboundTerminator = "\r",
    ack = /^OK$/i,
    error = /^ERR/i
  } = options;
  const encoder = new TextEncoder();
  const readLine = (buffer, from) => {
    const index = buffer.indexOf(terminator, from);
    if (index < 0) return null;
    return { line: buffer.slice(from, index).trim(), end: index + terminator.length };
  };
  const rejectOnError = (line) => {
    if (error.test(line)) {
      throw new DeviceError(`L'instrument a repondu ${line}.`, line);
    }
  };
  return {
    name: "acknowledged",
    encode(payload) {
      if (payload instanceof Uint8Array) return payload;
      return encoder.encode(`${payload}${outboundTerminator}`);
    },
    extract(buffer, context) {
      const first = readLine(buffer, 0);
      if (!first) return null;
      rejectOnError(first.line);
      if (!ack.test(first.line)) {
        return { message: first.line, consumed: first.end };
      }
      if (context?.expectsValue !== true) {
        return { message: "", consumed: first.end };
      }
      const second = readLine(buffer, first.end);
      if (!second) return null;
      rejectOnError(second.line);
      return { message: second.line, consumed: second.end };
    }
  };
}

export { acknowledgedFraming };
//# sourceMappingURL=chunk-MQUFHSGT.js.map
//# sourceMappingURL=chunk-MQUFHSGT.js.map