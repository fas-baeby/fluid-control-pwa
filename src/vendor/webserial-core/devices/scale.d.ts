import { D as DeviceSpec } from '../descriptor-4xm6FaU-.js';
import { C as Codec } from '../codec-C_X5zMVV.js';

interface ScaleReading {
    value: number;
    unit: string | null;
    status: string | null;
    mode: string | null;
}
declare const scaleReading: Codec<ScaleReading>;
/** The read command varies per vendor (SI for MT-SICS), hence the factory. */
declare function scaleDevice(command?: string): DeviceSpec<readonly [{
    readonly key: "weight";
    readonly label: "Poids";
    readonly read: string;
    readonly codec: Codec<ScaleReading>;
    readonly description: "Mesure courante renvoyee par la balance.";
}], []>;
declare const scale: DeviceSpec<readonly [{
    readonly key: "weight";
    readonly label: "Poids";
    readonly read: string;
    readonly codec: Codec<ScaleReading>;
    readonly description: "Mesure courante renvoyee par la balance.";
}], []>;

export { type ScaleReading, scale, scaleDevice, scaleReading };
