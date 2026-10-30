/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

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
var ChecksumError = class extends ProtocolError {
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

// src/codec/codec.ts
function defineCodec(name, decode, encode) {
  return encode ? { name, decode, encode } : { name, decode };
}
function mapCodec(source, transform, name = `${source.name}->mapped`) {
  return { name, decode: (raw) => transform(source.decode(raw)) };
}

export { ChecksumError, ConfigurationError, DeviceError, ProtocolError, TimeoutError, TransportError, WebSerialError, assertSerialSupported, defineCodec, describePortFailure, isSerialSupported, mapCodec, toMessage };
//# sourceMappingURL=chunk-R5M3P5DD.js.map
//# sourceMappingURL=chunk-R5M3P5DD.js.map