import { assertNoErrorFrame, splitCrcFrame, crcFraming } from './chunk-6XMHCNHO.js';
import { struct, uint16, uint8, ascii, array, int16, pid, uint32, float32, crc16ModbusBytes, crc16Modbus } from './chunk-7V5XXNHL.js';
import { createInstrument } from './chunk-ZRL2DAVD.js';
import { defineDevice, action, param } from './chunk-EM4MNF4I.js';
import { defineCodec, TransportError, ConfigurationError } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

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
var HEX = /^[0-9A-Fa-f]*$/;
function requireHex(value, label, length) {
  const text = String(value ?? "").trim();
  if (!HEX.test(text)) {
    throw new ConfigurationError(`${label} : charge utile hexadecimale attendue, recu "${value}".`);
  }
  if (length !== void 0 && text.length !== length) {
    throw new ConfigurationError(
      `${label} : ${length} caracteres attendus, ${text.length} fournis.`
    );
  }
  return text;
}
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
function buildChipregSpec(state) {
  return defineDevice({
    id: "chipreg-mfc",
    label: "CHIPREG MFC",
    framing: crcFraming({ compute: crc16Modbus }),
    portOptions: { baudRate: 115200, dataBits: 8, stopBits: 1, parity: "none" },
    defaultTimeout: 3e3,
    buildRequest: (command, payload) => `${state.address}->${command}${payload}`,
    params: [
      param({
        key: "identification",
        label: "Identification",
        read: "IDER",
        write: "IDEW",
        codec: chipregIdentification,
        encode: (hex) => requireHex(hex, "IDEW"),
        description: "R\xE9f\xE9rence, num\xE9ro de s\xE9rie, versions, conditions d'\xE9talonnage."
      }),
      param({
        key: "calibration",
        label: "Calibration",
        read: "CALR",
        write: "CALW",
        codec: chipregCalibration,
        encode: (hex) => requireHex(hex, "CALW")
      }),
      param({
        key: "configuration",
        label: "Configuration",
        read: "CONR",
        write: "CONW",
        codec: chipregConfiguration,
        encode: (hex) => requireHex(hex, "CONW")
      }),
      param({
        key: "extendedConfiguration",
        label: "Configuration \xE9tendue",
        read: "CFXR",
        write: "CFXW",
        codec: chipregExtendedConfiguration,
        encode: (hex) => requireHex(hex, "CFXW")
      }),
      param({
        key: "realtimeValues",
        label: "Valeurs temps r\xE9el",
        read: "SMFR",
        codec: chipregPayload,
        responseLength: chipregFrameLength(4),
        timeout: 500,
        description: "Charge utile brute des valeurs de process, d\xE9cod\xE9e c\xF4t\xE9 interface."
      }),
      param({
        key: "setpoint",
        label: "Consigne de d\xE9bit",
        write: "MFSW",
        codec: chipregPayload,
        encode: (hex) => requireHex(hex, "MFSW", 4),
        responseLength: chipregFrameLength(0),
        timeout: 500,
        description: "Consigne Uint16 sur 4 caract\xE8res hexad\xE9cimaux."
      }),
      param({
        key: "factoryPassword",
        label: "Mot de passe usine",
        write: "FPWW",
        codec: chipregPayload,
        encode: (hex) => requireHex(hex, "FPWW")
      }),
      param({
        key: "controlDisable",
        label: "D\xE9sactivation de la r\xE9gulation",
        write: "CTRW",
        codec: chipregPayload,
        encode: (hex) => requireHex(hex, "CTRW")
      })
    ],
    actions: [
      action({
        key: "writeFlashMemory",
        label: "\xC9crire en m\xE9moire flash",
        command: "NMWM",
        category: "service",
        description: "Rend permanents les param\xE8tres \xE9crits en m\xE9moire volatile."
      }),
      action({
        key: "jumpToBootloader",
        label: "Red\xE9marrer en bootloader",
        command: "GOBW",
        category: "firmware",
        description: "L'appareil red\xE9marre : la liaison doit ensuite \xEAtre rouverte."
      })
    ]
  });
}
function createChipreg(options = {}, link) {
  const state = { address: normalizeChipregAddress(options.address ?? "ff") };
  const instrument = createInstrument(buildChipregSpec(state), link);
  Object.defineProperty(instrument, "deviceAddress", {
    get: () => state.address,
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(instrument, "setDeviceAddress", {
    value: (address) => {
      state.address = normalizeChipregAddress(address);
    },
    enumerable: false,
    configurable: true
  });
  return instrument;
}
async function sendChipregFirmware(instrument, source, options = {}) {
  const { bytes, fileName } = await normalizeFirmwareInput(source, options.fileName);
  const channel = instrument.link.binary();
  try {
    return await sendYmodem(channel, bytes, { ...options, fileName });
  } finally {
    instrument.link.endBinary();
  }
}

export { ACK, CALR, CAN, CFXR, CHIPREG_ERRORS, CHIPREG_EXPECTED_LENGTHS, CHIPREG_FRAME_OVERHEAD, CHIPREG_FRAME_SIZES, CONR, EOT, IDER, NAK, SOH, STX, SUB, buildYmodemBlock, buildYmodemHeaderPayload, chipregCalibration, chipregConfiguration, chipregExtendedConfiguration, chipregFrameLength, chipregIdentification, chipregPayload, createChipreg, decodeChipregFrame, normalizeChipregAddress, normalizeFirmwareInput, sendChipregFirmware, sendYmodem };
//# sourceMappingURL=chunk-OOWXULII.js.map
//# sourceMappingURL=chunk-OOWXULII.js.map