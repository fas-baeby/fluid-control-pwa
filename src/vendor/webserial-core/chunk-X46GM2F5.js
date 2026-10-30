/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/framing/line.ts
function lineFraming(options = {}) {
  const {
    terminator = "\r\n",
    outboundTerminator = terminator,
    appendTerminator = true,
    includeTerminator = false,
    trim = true,
    stripEchoedCommand = false
  } = options;
  const encoder = new TextEncoder();
  return {
    name: "line",
    encode(payload) {
      if (payload instanceof Uint8Array) return payload;
      return encoder.encode(appendTerminator ? `${payload}${outboundTerminator}` : payload);
    },
    extract(buffer, context) {
      const index = buffer.indexOf(terminator);
      if (index < 0) return null;
      const end = index + terminator.length;
      let raw = buffer.slice(0, includeTerminator ? end : index);
      const echoed = stripEchoedCommand ? context?.expectedCommand : void 0;
      if (echoed && raw.trimStart().toUpperCase().startsWith(echoed.toUpperCase())) {
        raw = raw.trimStart().slice(echoed.length);
      }
      return { message: trim ? raw.trim() : raw, consumed: end };
    }
  };
}

export { lineFraming };
//# sourceMappingURL=chunk-X46GM2F5.js.map
//# sourceMappingURL=chunk-X46GM2F5.js.map