import { D as DeviceSpec } from './descriptor-4xm6FaU-.js';
import { a as StructOutput, F as Field } from './struct-GZ2q60gQ.js';
import { C as Codec } from './codec-C_X5zMVV.js';
import { B as BinaryChannel, I as InstrumentOf, L as Link } from './instrument-BtbrzcJ6.js';

declare const SOH = 1;
declare const STX = 2;
declare const EOT = 4;
declare const ACK = 6;
declare const NAK = 21;
declare const CAN = 24;
declare const SUB = 26;
interface YmodemProgress {
    sentBytes: number;
    totalBytes: number;
    block: number;
    percent: number;
}
interface YmodemOptions {
    fileName?: string;
    blockSize?: 128 | 1024;
    blockTimeout?: number;
    maxRetries?: number;
    /** Settling time after the reset, before the bootloader listens. */
    bootDelay?: number;
    /** The bootloader erases flash after the header, delaying the first data block. */
    postHeaderDelay?: number;
    firstBlockTimeout?: number;
    /** The device is still flashing right after an ACK and drops an immediate next block. */
    interBlockDelay?: number;
    validationTimeout?: number;
    /** Settling windows used to swallow the boot banner and the erase chatter. */
    preHeaderDrain?: number;
    postHeaderDrain?: number;
    onProgress?: (progress: YmodemProgress) => void;
    /** CHIPREG checksums blocks with Modbus, not the CCITT of the YMODEM standard. */
    crc?: (bytes: Uint8Array) => number;
}
interface YmodemResult {
    bytesSent: number;
    blocks: number;
    fileName: string;
    validated: boolean;
}
/** Block 0 payload: "<name>\0<size>\0" in a zero-filled 128-byte frame. */
declare function buildYmodemHeaderPayload(fileName: string, fileSize: number): Uint8Array;
declare function buildYmodemBlock(startByte: number, blockNumber: number, payload: Uint8Array, crc?: (bytes: Uint8Array) => number): Uint8Array;
/**
 * Drives a YMODEM send over an already-open binary channel. The caller owns entering and
 * leaving binary mode, because the surrounding reset sequence is device-specific.
 */
declare function sendYmodem(channel: BinaryChannel, bytes: Uint8Array, options?: YmodemOptions): Promise<YmodemResult>;
interface FirmwareInput {
    bytes: Uint8Array;
    fileName: string;
}
declare function normalizeFirmwareInput(source: Uint8Array | ArrayBuffer | Blob, explicitName?: string): Promise<FirmwareInput>;

declare const CHIPREG_ERRORS: Record<number, string>;
/** Header (address + separator + command) plus the trailing checksum. */
declare const CHIPREG_FRAME_OVERHEAD = 12;
declare function chipregFrameLength(dataLength: number): number;
/**
 * Frame sizes derived from the documented layouts. Only SMFR and MFSW are declared as
 * `responseLength`: the others are transcribed from the manual and unverified against a
 * device, and an over-declared length would never match, whereas checksum delimitation
 * works whatever the real size turns out to be.
 */
declare const CHIPREG_EXPECTED_LENGTHS: {
    readonly IDER: number;
    readonly CALR: number;
    readonly CONR: number;
    readonly CFXR: number;
    readonly SMFR: number;
    readonly MFSW: number;
};
/** Every reply arrives as a full frame: reject ERRN, verify the checksum, keep the data. */
declare function decodeChipregFrame(frame: string): string;
declare const chipregIdentification: Codec<{
    calibrationFullScale: string;
    deviceFullScale: string;
    temperatureRef: number;
    calibrationTemperature: number;
    fullScaleAccuracy: number;
    readingAccuracy: number;
    partNumber: string;
    suffix: string;
    description: string;
    serialNumber: string;
    swVersion: string;
    hwVersion: string;
    calibrationDate: string;
    calibrationGas: number;
    calFullScaleInt: number;
    calFullScaleDec: number;
    deviceGas: number;
    devFullScaleInt: number;
    devFullScaleDec: number;
    deviceUnit: number;
    pressureRef: number;
    temperatureRefMilli: number;
    calibrationPressure: number;
    calibrationTemperatureMilli: number;
    fullScaleAccuracyMilli: number;
    readingAccuracyMilli: number;
}>;
declare const chipregCalibration: Codec<StructOutput<{
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
declare const chipregConfiguration: Codec<StructOutput<{
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
declare const chipregExtendedConfiguration: Codec<StructOutput<{
    readonly fileName: Field<string>;
    readonly floatNvmCtrlRobustSlowPid: Field<[number, number, number]>;
    readonly floatNvmCtrlRobustMediumPid: Field<[number, number, number]>;
    readonly floatNvmCtrlRobustFastPid: Field<[number, number, number]>;
    readonly floatNvmCtrlRobustUserPid: Field<[number, number, number]>;
    readonly int16NvmCtrlRobustBoostParameter: Field<number[]>;
}>>;
/** Realtime values stay raw: the UI plots the payload without decoding it. */
declare const chipregPayload: Codec<string>;
interface ChipregOptions {
    /** Slave address as two hex characters; `ff` broadcasts. */
    address?: string;
}
interface ChipregDevice {
    spec: ReturnType<typeof buildChipregSpec>;
    /** Mutable so the address can change without rebuilding the descriptor. */
    state: {
        address: string;
    };
}
declare function normalizeChipregAddress(address: string | number): string;
declare function buildChipregSpec(state: {
    address: string;
}): DeviceSpec<readonly [{
    readonly key: "identification";
    readonly label: "Identification";
    readonly read: "IDER";
    readonly write: "IDEW";
    readonly codec: Codec<{
        calibrationFullScale: string;
        deviceFullScale: string;
        temperatureRef: number;
        calibrationTemperature: number;
        fullScaleAccuracy: number;
        readingAccuracy: number;
        partNumber: string;
        suffix: string;
        description: string;
        serialNumber: string;
        swVersion: string;
        hwVersion: string;
        calibrationDate: string;
        calibrationGas: number;
        calFullScaleInt: number;
        calFullScaleDec: number;
        deviceGas: number;
        devFullScaleInt: number;
        devFullScaleDec: number;
        deviceUnit: number;
        pressureRef: number;
        temperatureRefMilli: number;
        calibrationPressure: number;
        calibrationTemperatureMilli: number;
        fullScaleAccuracyMilli: number;
        readingAccuracyMilli: number;
    }>;
    readonly encode: (hex: string) => string;
    readonly description: "Référence, numéro de série, versions, conditions d'étalonnage.";
}, {
    readonly key: "calibration";
    readonly label: "Calibration";
    readonly read: "CALR";
    readonly write: "CALW";
    readonly codec: Codec<StructOutput<{
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
    readonly encode: (hex: string) => string;
}, {
    readonly key: "configuration";
    readonly label: "Configuration";
    readonly read: "CONR";
    readonly write: "CONW";
    readonly codec: Codec<StructOutput<{
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
    readonly encode: (hex: string) => string;
}, {
    readonly key: "extendedConfiguration";
    readonly label: "Configuration étendue";
    readonly read: "CFXR";
    readonly write: "CFXW";
    readonly codec: Codec<StructOutput<{
        readonly fileName: Field<string>;
        readonly floatNvmCtrlRobustSlowPid: Field<[number, number, number]>;
        readonly floatNvmCtrlRobustMediumPid: Field<[number, number, number]>;
        readonly floatNvmCtrlRobustFastPid: Field<[number, number, number]>;
        readonly floatNvmCtrlRobustUserPid: Field<[number, number, number]>;
        readonly int16NvmCtrlRobustBoostParameter: Field<number[]>;
    }>>;
    readonly encode: (hex: string) => string;
}, {
    readonly key: "realtimeValues";
    readonly label: "Valeurs temps réel";
    readonly read: "SMFR";
    readonly codec: Codec<string>;
    readonly responseLength: number;
    readonly timeout: 500;
    readonly description: "Charge utile brute des valeurs de process, décodée côté interface.";
}, {
    readonly key: "setpoint";
    readonly label: "Consigne de débit";
    readonly write: "MFSW";
    readonly codec: Codec<string>;
    readonly encode: (hex: string) => string;
    readonly responseLength: number;
    readonly timeout: 500;
    readonly description: "Consigne Uint16 sur 4 caractères hexadécimaux.";
}, {
    readonly key: "factoryPassword";
    readonly label: "Mot de passe usine";
    readonly write: "FPWW";
    readonly codec: Codec<string>;
    readonly encode: (hex: string) => string;
}, {
    readonly key: "controlDisable";
    readonly label: "Désactivation de la régulation";
    readonly write: "CTRW";
    readonly codec: Codec<string>;
    readonly encode: (hex: string) => string;
}], readonly [{
    readonly key: "writeFlashMemory";
    readonly label: "Écrire en mémoire flash";
    readonly command: "NMWM";
    readonly category: "service";
    readonly description: "Rend permanents les paramètres écrits en mémoire volatile.";
}, {
    readonly key: "jumpToBootloader";
    readonly label: "Redémarrer en bootloader";
    readonly command: "GOBW";
    readonly category: "firmware";
    readonly description: "L'appareil redémarre : la liaison doit ensuite être rouverte.";
}]>;
type ChipregInstrument = InstrumentOf<ReturnType<typeof buildChipregSpec>["params"], NonNullable<ReturnType<typeof buildChipregSpec>["actions"]>> & {
    readonly deviceAddress: string;
    setDeviceAddress(address: string | number): void;
};
declare function createChipreg(options?: ChipregOptions, link?: Link): ChipregInstrument;
/**
 * Streams a firmware image to the bootloader. Binary mode is entered here and always left,
 * so a failed transfer cannot strand the link in raw mode.
 */
declare function sendChipregFirmware(instrument: ChipregInstrument, source: Uint8Array | ArrayBuffer | Blob, options?: YmodemOptions): Promise<YmodemResult>;

export { ACK as A, type ChipregInstrument as C, EOT as E, type FirmwareInput as F, NAK as N, SOH as S, type YmodemOptions as Y, CAN as a, CHIPREG_ERRORS as b, CHIPREG_EXPECTED_LENGTHS as c, CHIPREG_FRAME_OVERHEAD as d, type ChipregDevice as e, type ChipregOptions as f, STX as g, SUB as h, type YmodemProgress as i, type YmodemResult as j, buildYmodemBlock as k, buildYmodemHeaderPayload as l, chipregCalibration as m, chipregConfiguration as n, chipregExtendedConfiguration as o, chipregFrameLength as p, chipregIdentification as q, chipregPayload as r, createChipreg as s, decodeChipregFrame as t, normalizeChipregAddress as u, normalizeFirmwareInput as v, sendChipregFirmware as w, sendYmodem as x };
