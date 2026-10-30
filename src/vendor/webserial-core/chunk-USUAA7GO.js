import { DeviceError } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/framing/prefixed.ts
var ACK = "";
var NAK = "";
function prefixedFraming(options = {}) {
  const {
    terminator = "\r",
    outboundTerminator = terminator,
    ack = ACK,
    nak = NAK,
    ackToken = /\s*\bAK\s*$/i,
    nakToken = /\s*\bNK\s*$/i
  } = options;
  const encoder = new TextEncoder();
  return {
    name: "prefixed",
    encode(payload) {
      if (payload instanceof Uint8Array) return payload;
      return encoder.encode(`${payload}${outboundTerminator}`);
    },
    extract(buffer) {
      const index = buffer.indexOf(terminator);
      if (index < 0) return null;
      const raw = buffer.slice(0, index);
      const consumed = index + terminator.length;
      if (raw.includes(nak) || nakToken.test(raw)) {
        throw new DeviceError("Commande refusee par le detecteur (NK).", "NK");
      }
      const message = raw.split(ack).join("").replace(ackToken, "").trim();
      return { message, consumed };
    }
  };
}

export { ACK, NAK, prefixedFraming };
//# sourceMappingURL=chunk-USUAA7GO.js.map
//# sourceMappingURL=chunk-USUAA7GO.js.map