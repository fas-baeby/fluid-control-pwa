export { ASM142_CYCLE_STATUS, ASM142_GASES, ASM142_PRESSURE_LEVELS, ASM142_UNITS, Asm142DetectorStatus, Asm142DeviceInfo, Asm142Instrument, asm142, asm142DetectorStatus, asm142Errors, createAsm142, readAsm142DeviceInfo } from './devices/agilent-asm142.js';
export { ASM340_CYCLE_STATUS, ASM340_GASES, ASM340_PRESSURE_LEVELS, ASM340_TEST_MODES, ASM340_UNITS, Asm340Instrument, Asm340InternalLeak, Asm340StatusBits, asm340, asm340DetectorStatus, asm340Errors, asm340InternalLeak, asm340PumpSpeed, asm340StatusBits, asm340StatusString, createAsm340, readAsm340DeviceInfo } from './devices/agilent-asm340.js';
import { C as ChipregInstrument } from './index-rT8WWapv.js';
export { A as ACK, a as CAN, b as CHIPREG_ERRORS, c as CHIPREG_EXPECTED_LENGTHS, d as CHIPREG_FRAME_OVERHEAD, e as ChipregDevice, f as ChipregOptions, E as EOT, F as FirmwareInput, N as NAK, S as SOH, g as STX, h as SUB, Y as YmodemOptions, i as YmodemProgress, j as YmodemResult, k as buildYmodemBlock, l as buildYmodemHeaderPayload, m as chipregCalibration, n as chipregConfiguration, o as chipregExtendedConfiguration, p as chipregFrameLength, q as chipregIdentification, r as chipregPayload, s as createChipreg, t as decodeChipregFrame, u as normalizeChipregAddress, v as normalizeFirmwareInput, w as sendChipregFirmware, x as sendYmodem } from './index-rT8WWapv.js';
import { R as RequestOptions } from './instrument-BtbrzcJ6.js';
import { S as StructCodec, a as StructOutput, F as Field } from './struct-GZ2q60gQ.js';
export { KISTLER_LOW_PASS_FILTERS, KISTLER_TIME_CONSTANTS, Kistler5015Instrument, createKistler5015, encodeKistlerScientific, kistler5015, kistlerErrorFlags } from './devices/kistler-5015.js';
export { ScaleReading, scale, scaleDevice, scaleReading } from './devices/scale.js';
export { SYLVAC_ERRORS, SYLVAC_MODES, SylvacIdentification, SylvacReading, SylvacSDialInstrument, SylvacSettings, SylvacTolerance, createSylvacSDial, encodeSylvacPreset, sylvacIdentification, sylvacPreset, sylvacReading, sylvacSDial, sylvacSettings } from './devices/sylvac-sdial.js';
export { Tsi4000Instrument, TsiDisplayMode, TsiDisplayModeInput, TsiFlowUnits, TsiMeasurement, TsiMeasurementRequest, TsiSeries, TsiTrigger, TsiTriggerInput, buildTsiMeasurementCommand, createTsi4000, encodeTsiDisplayMode, encodeTsiDisplayUnits, encodeTsiTrigger, parseTsiMeasurement, readTsiIdentity, readTsiMeasurement, tsi4000, tsiDisplayMode, tsiDisplayUnits, tsiFlowUnits, tsiSeriesOf, tsiTriggerCodec } from './devices/tsi4000.js';
import './descriptor-4xm6FaU-.js';
import './codec-C_X5zMVV.js';
import './primitives-CP8ivAQc.js';
import './bits-cVmwxCUN.js';

declare const BOOTLOADER_MAGIC = "B007C0DE";
declare const PATCHER_MAGIC = "B007CACE";
declare const APPLICATION_MAGIC = "DEADBEEF";
declare const BOOTLOADER_ACK = "UPBO";
declare const PATCHER_ACK = "UPPA";
declare const APPLICATION_ACK = "UPAP";
declare function requestBootloaderUpdate(instrument: ChipregInstrument, options?: RequestOptions): Promise<string>;
declare function confirmBootloaderChallenge(instrument: ChipregInstrument, challenge: string, options?: RequestOptions): Promise<void>;
declare function requestPatcherUpdate(instrument: ChipregInstrument, options?: RequestOptions): Promise<string>;
declare function confirmPatcherChallenge(instrument: ChipregInstrument, challenge: string, options?: RequestOptions): Promise<void>;
declare function requestApplicationUpdate(instrument: ChipregInstrument, options?: RequestOptions): Promise<void>;
type FirmwareStepName = "jumpToBootloader" | "requestBootloaderUpdate" | "confirmBootloaderChallenge" | "requestPatcherUpdate" | "confirmPatcherChallenge" | "requestApplicationUpdate";
interface FirmwareStep {
    name: FirmwareStepName;
    ok: boolean;
    value?: string;
    error?: string;
}
interface FirmwareSequenceResult {
    success: boolean;
    steps: FirmwareStep[];
    failedStep?: FirmwareStepName;
    error?: string;
}
interface FirmwareSequenceOptions {
    onStep?: (step: FirmwareStep) => void;
    /** Skip the reset when the device already sits in the bootloader. */
    skipJump?: boolean;
    request?: RequestOptions;
}
/**
 * Unlock sequence preceding the YMODEM transfer. Reported step by step because an
 * operator needs to know where it stopped, not just that it failed.
 */
declare function runFirmwareUpdateSequence(instrument: ChipregInstrument, options?: FirmwareSequenceOptions): Promise<FirmwareSequenceResult>;

/** IDER is mixed: 107 ASCII characters of identity, then packed hex values. */
declare const IDER: StructCodec<StructOutput<{
    readonly partNumber: Field<string>;
    readonly suffix: Field<string>;
    readonly description: Field<string>;
    readonly serialNumber: Field<string>;
    readonly swVersion: Field<string>;
    readonly hwVersion: Field<string>;
    readonly calibrationDate: Field<string>;
    readonly calibrationGas: Field<number>;
    readonly calFullScaleInt: Field<number>;
    readonly calFullScaleDec: Field<number>;
    readonly deviceGas: Field<number>;
    readonly devFullScaleInt: Field<number>;
    readonly devFullScaleDec: Field<number>;
    readonly deviceUnit: Field<number>;
    readonly pressureRef: Field<number>;
    readonly temperatureRefMilli: Field<number>;
    readonly calibrationPressure: Field<number>;
    readonly calibrationTemperatureMilli: Field<number>;
    readonly fullScaleAccuracyMilli: Field<number>;
    readonly readingAccuracyMilli: Field<number>;
}>>;
declare const CFXR: StructCodec<StructOutput<{
    readonly fileName: Field<string>;
    readonly floatNvmCtrlRobustSlowPid: Field<[number, number, number]>;
    readonly floatNvmCtrlRobustMediumPid: Field<[number, number, number]>;
    readonly floatNvmCtrlRobustFastPid: Field<[number, number, number]>;
    readonly floatNvmCtrlRobustUserPid: Field<[number, number, number]>;
    readonly int16NvmCtrlRobustBoostParameter: Field<number[]>;
}>>;
declare const CONR: StructCodec<StructOutput<{
    readonly floatNvmCtrlValveCurrentSlowPid: Field<[number, number, number]>;
    readonly floatNvmCtrlValveCurrentMediumPid: Field<[number, number, number]>;
    readonly floatNvmCtrlValveCurrentFastPid: Field<[number, number, number]>;
    readonly floatNvmCtrlMassFlowSlowPid: Field<[number, number, number]>;
    readonly floatNvmCtrlMassFlowMediumPid: Field<[number, number, number]>;
    readonly floatNvmCtrlMassFlowFastPid: Field<[number, number, number]>;
    readonly floatNvmCtrlValveCurrentUserPid: Field<[number, number, number]>;
    readonly floatNvmCtrlMassFlowUserPid: Field<[number, number, number]>;
    readonly uint8NvmSetpointInputSelection: Field<number>;
    readonly uint8NvmControlType: Field<number>;
    readonly uint8NvmControllerType: Field<number>;
    readonly uint8NvmAnalogOutputDac1Selection: Field<number>;
    readonly floatNvmMflsGasCoefficient: Field<number[]>;
    readonly floatNvmMflsUserGasCoefficient: Field<number>;
    readonly uint8NvmMflsUserGasUnit: Field<number>;
    readonly int16NvmCtrlBoostParameter: Field<number[]>;
    readonly uint8NvmDeviceAddress: Field<number>;
    readonly uint8NvmRs485Impedance: Field<number>;
    readonly uint32NvmBaudRate: Field<number>;
}>>;
/** 208 hex chars confirmed on hardware (2026-10-06); the firmware sends nothing past the temperature coefficient. */
declare const CALR: StructCodec<StructOutput<{
    readonly floatNvmScaledAdcSetpointSlope: Field<number>;
    readonly floatNvmScaledAdcSetpointOffset: Field<number>;
    readonly floatNvmRawDac1Slope: Field<number>;
    readonly floatNvmRawDac1Offset: Field<number>;
    readonly int16NvmMflsBound: Field<number[]>;
    readonly floatNvmMflsMathFuncCoeff: Field<number[][]>;
    readonly floatNvmMflsGlobalMathFuncCoeff: Field<number[]>;
    readonly int16NvmMflsRawTemperatureReference: Field<number>;
    readonly int16NvmMflsScaledTemperatureReference: Field<number>;
    readonly floatNvmMflsTemperatureCoefficient: Field<number>;
}>>;
declare const CHIPREG_FRAME_SIZES: {
    readonly IDER: number;
    readonly CFXR: number;
    readonly CONR: number;
    readonly CALR: number;
};

export { APPLICATION_ACK, APPLICATION_MAGIC, BOOTLOADER_ACK, BOOTLOADER_MAGIC, CALR, CFXR, CHIPREG_FRAME_SIZES, CONR, ChipregInstrument, type FirmwareSequenceOptions, type FirmwareSequenceResult, type FirmwareStep, type FirmwareStepName, IDER, PATCHER_ACK, PATCHER_MAGIC, confirmBootloaderChallenge, confirmPatcherChallenge, requestApplicationUpdate, requestBootloaderUpdate, requestPatcherUpdate, runFirmwareUpdateSequence };
