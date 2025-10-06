/**
 * MakeCode editor extension for HX711 Differential 24 bit A/D for weight sensors
 * by David Ferrer - (c)2019
 * MIT License
 */

namespace HX711 {
    let PD_SCK = DigitalPin.P0;
    let DOUT = DigitalPin.P8;
    let GAIN: number = 0.0;
    let OFFSET: number = 0;	// used for tare weight
    let SCALE: number = 1;	// used to return weight in grams, kg, ounces, whatever

    export function SetPIN_DOUT(pinDOUT: DigitalPin): void {
        DOUT = pinDOUT;
    }

    export function SetPIN_SCK(pinPD_SCK: DigitalPin): void {
        PD_SCK = pinPD_SCK;
    }

    export function begin() {
        set_gain(128); //default gain 128
    }

    export function is_ready(): boolean {
        return (pins.digitalReadPin(DOUT) == 0);
    }

    export function set_gain(gain: number) {
        switch (gain) {
            case 128:
                GAIN = 1;
                break;
            case 64:
                GAIN = 3;
                break;
            case 32:
                GAIN = 2;
                break;
        }
        pins.digitalWritePin(PD_SCK, 0);
        read();
    }

    export function shiftInSlow(bitOrder: number): number {
        let value: number = 0;
        for (let i = 0; i < 8; ++i) {
            pins.digitalWritePin(PD_SCK, 1);
            control.waitMicros(1);
            if (bitOrder == 0)
                value |= pins.digitalReadPin(DOUT) << i;
            else
                value |= pins.digitalReadPin(DOUT) << (7 - i);
            pins.digitalWritePin(PD_SCK, 0);
            control.waitMicros(1);
        }
        return value;
    }

    export function read(): number {
        wait_ready(0);

        let value: number = 0;
        let data: number[] = [0, 0, 0];
        let filler: number = 0x00;

        data[2] = shiftInSlow(1);
        data[1] = shiftInSlow(1);
        data[0] = shiftInSlow(1);

        for (let i = 0; i < GAIN; i++) {
            pins.digitalWritePin(PD_SCK, 1);
            control.waitMicros(1);
            pins.digitalWritePin(PD_SCK, 0);
            control.waitMicros(1);
        }

        filler = (data[2] & 0x80) ? 0xFF : 0x00;
        data[2] = data[2] ^ 0x80;

        value = (filler << 24) | (data[2] << 16) | (data[1] << 8) | (data[0]);
        return value;
    }

    export function wait_ready(delay_ms: number) {
        while (!is_ready()) {
            basic.pause(delay_ms);
        }
    }

    export function wait_ready_retry(retries: number, delay_ms: number): boolean {
        let count: number = 0;
        while (count < retries) {
            if (is_ready()) return true;
            basic.pause(delay_ms);
            count++;
        }
        return false;
    }

    export function wait_ready_timeout(timeout: number, delay_ms: number): boolean {
        let millisStarted: number = input.runningTime();
        while (input.runningTime() - millisStarted < timeout) {
            if (is_ready()) return true;
            basic.pause(delay_ms);
        }
        return false;
    }

    export function read_average(times: number): number {
        let sum: number = 0;
        for (let i = 0; i < times; i++) {
            sum += read();
            basic.pause(0);
        }
        return sum / times;
    }

    export function get_value(times: number): number {
        return read_average(times) - OFFSET;
    }

    export function get_units(times: number): number {
        let valor = get_value(times) / SCALE;
        return valor;
    }

    export function tare(times: number) {
        let sum = read_average(times);
        set_offset(sum);
    }

    export function set_scale(scale: number) {
        SCALE = scale;
    }

    export function get_scale(): number {
        return SCALE;
    }

    export function set_offset(offset: number) {
        OFFSET = offset;
    }

    export function get_offset(): number {
        return OFFSET;
    }

    export function power_down() {
        pins.digitalWritePin(PD_SCK, 0);
        pins.digitalWritePin(PD_SCK, 1);
    }

    export function power_up() {
        pins.digitalWritePin(PD_SCK, 0);
    }
}
