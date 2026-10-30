export { SYLVAC_ERRORS, SYLVAC_MODES, createSylvacSDial, encodeSylvacPreset, sylvacIdentification, sylvacPreset, sylvacReading, sylvacSDial, sylvacSettings } from './chunk-RTJCU2Q7.js';
export { buildTsiMeasurementCommand, createTsi4000, encodeTsiDisplayMode, encodeTsiDisplayUnits, encodeTsiTrigger, parseTsiMeasurement, readTsiIdentity, readTsiMeasurement, tsi4000, tsiDisplayMode, tsiDisplayUnits, tsiFlowUnits, tsiSeriesOf, tsiTriggerCodec } from './chunk-KGEZEL4S.js';
import './chunk-MQUFHSGT.js';
export { ASM142_CYCLE_STATUS, ASM142_GASES, ASM142_PRESSURE_LEVELS, ASM142_UNITS, asm142, asm142DetectorStatus, asm142Errors, createAsm142, readAsm142DeviceInfo } from './chunk-DKEWM7II.js';
export { ASM340_CYCLE_STATUS, ASM340_GASES, ASM340_PRESSURE_LEVELS, ASM340_TEST_MODES, ASM340_UNITS, asm340, asm340DetectorStatus, asm340Errors, asm340InternalLeak, asm340PumpSpeed, asm340StatusBits, asm340StatusString, createAsm340, readAsm340DeviceInfo } from './chunk-N2DX6TSE.js';
import './chunk-USUAA7GO.js';
import './chunk-ORYSOKQF.js';
import { decodeChipregFrame } from './chunk-OOWXULII.js';
export { ACK, CALR, CAN, CFXR, CHIPREG_ERRORS, CHIPREG_EXPECTED_LENGTHS, CHIPREG_FRAME_OVERHEAD, CHIPREG_FRAME_SIZES, CONR, EOT, IDER, NAK, SOH, STX, SUB, buildYmodemBlock, buildYmodemHeaderPayload, chipregCalibration, chipregConfiguration, chipregExtendedConfiguration, chipregFrameLength, chipregIdentification, chipregPayload, createChipreg, decodeChipregFrame, normalizeChipregAddress, normalizeFirmwareInput, sendChipregFirmware, sendYmodem } from './chunk-OOWXULII.js';
import './chunk-6XMHCNHO.js';
import './chunk-7V5XXNHL.js';
export { KISTLER_LOW_PASS_FILTERS, KISTLER_TIME_CONSTANTS, createKistler5015, encodeKistlerScientific, kistler5015, kistlerErrorFlags } from './chunk-OTGRR4Q3.js';
import './chunk-MZ3FVZAH.js';
import './chunk-Z5NZJSCE.js';
import './chunk-ZRL2DAVD.js';
export { scale, scaleDevice, scaleReading } from './chunk-G2ERIBM2.js';
import './chunk-X46GM2F5.js';
import './chunk-EM4MNF4I.js';
import { DeviceError } from './chunk-R5M3P5DD.js';

/* @fas/webserial-core - GENERATED, ne pas editer. Source: src/ */

// src/devices/chipreg/firmware.ts
var BOOTLOADER_MAGIC = "B007C0DE";
var PATCHER_MAGIC = "B007CACE";
var APPLICATION_MAGIC = "DEADBEEF";
var BOOTLOADER_ACK = "UPBO";
var PATCHER_ACK = "UPPA";
var APPLICATION_ACK = "UPAP";
var CHALLENGE = /^[0-9A-Fa-f]{8}$/;
async function exchange(instrument, command, payload, options = {}) {
  return decodeChipregFrame(await instrument.raw(command, payload, options));
}
async function requestChallenge(instrument, magic, label, options) {
  const challenge = await exchange(instrument, "FWDW", magic, options);
  if (!CHALLENGE.test(challenge)) {
    throw new DeviceError(
      `${label} : code de defi attendu sur 8 caracteres hexadecimaux, recu "${challenge}".`
    );
  }
  return challenge.toUpperCase();
}
async function confirmChallenge(instrument, challenge, expected, label, options) {
  if (!CHALLENGE.test(challenge)) {
    throw new DeviceError(`${label} : code de defi invalide "${challenge}".`);
  }
  const answer = await exchange(instrument, "FWCW", challenge.toUpperCase(), options);
  if (answer !== expected) {
    throw new DeviceError(`${label} : reponse inattendue "${answer}", "${expected}" attendu.`);
  }
}
function requestBootloaderUpdate(instrument, options) {
  return requestChallenge(instrument, BOOTLOADER_MAGIC, "Mise a jour bootloader", options);
}
function confirmBootloaderChallenge(instrument, challenge, options) {
  return confirmChallenge(instrument, challenge, BOOTLOADER_ACK, "Mise a jour bootloader", options);
}
function requestPatcherUpdate(instrument, options) {
  return requestChallenge(instrument, PATCHER_MAGIC, "Mise a jour patcher", options);
}
function confirmPatcherChallenge(instrument, challenge, options) {
  return confirmChallenge(instrument, challenge, PATCHER_ACK, "Mise a jour patcher", options);
}
async function requestApplicationUpdate(instrument, options) {
  const answer = await exchange(instrument, "FWDW", APPLICATION_MAGIC, options);
  if (answer !== APPLICATION_ACK) {
    throw new DeviceError(
      `Mise a jour application : reponse inattendue "${answer}", "${APPLICATION_ACK}" attendu.`
    );
  }
}
async function runFirmwareUpdateSequence(instrument, options = {}) {
  const { onStep, skipJump = false, request } = options;
  const steps = [];
  const run = async (name, operation) => {
    try {
      const value = await operation();
      const step = { name, ok: true, ...value ? { value } : {} };
      steps.push(step);
      onStep?.(step);
      return value ?? void 0;
    } catch (error) {
      const step = {
        name,
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      };
      steps.push(step);
      onStep?.(step);
      throw Object.assign(error instanceof Error ? error : new Error(step.error), { step: name });
    }
  };
  try {
    if (!skipJump) {
      await run("jumpToBootloader", () => instrument.jumpToBootloader().then(() => void 0));
    }
    const bootChallenge = await run(
      "requestBootloaderUpdate",
      () => requestBootloaderUpdate(instrument, request)
    );
    await run(
      "confirmBootloaderChallenge",
      () => confirmBootloaderChallenge(instrument, bootChallenge, request)
    );
    const patcherChallenge = await run(
      "requestPatcherUpdate",
      () => requestPatcherUpdate(instrument, request)
    );
    await run(
      "confirmPatcherChallenge",
      () => confirmPatcherChallenge(instrument, patcherChallenge, request)
    );
    await run("requestApplicationUpdate", () => requestApplicationUpdate(instrument, request));
    return { success: true, steps };
  } catch (error) {
    const failed = error.step;
    return {
      success: false,
      steps,
      ...failed ? { failedStep: failed } : {},
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export { APPLICATION_ACK, APPLICATION_MAGIC, BOOTLOADER_ACK, BOOTLOADER_MAGIC, PATCHER_ACK, PATCHER_MAGIC, confirmBootloaderChallenge, confirmPatcherChallenge, requestApplicationUpdate, requestBootloaderUpdate, requestPatcherUpdate, runFirmwareUpdateSequence };
//# sourceMappingURL=devices.js.map
//# sourceMappingURL=devices.js.map