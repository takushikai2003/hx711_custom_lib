enum SimplePin {
    //% block="P0"
    P0 = DigitalPin.P0,
    //% block="P1"
    P1 = DigitalPin.P1,
    //% block="P2"
    P2 = DigitalPin.P2
}

// ラゲッジスケールに合わせた値
let offset_value = -8873577;
let scale_value = 58.24;

//% weight=100 color=#ee7800 icon="\uf24e" block="重さセンサ"
namespace hx711_custom {
    //% block="重さセンサを使う準備\nデータピン %dat クロックピン %clk"
    //% dat.defl=SimplePin.P0
    //% clk.defl=SimplePin.P1
    //% weight=100
    export function sensor_init(
        dat: SimplePin,
        clk: SimplePin,
    ): void {
        HX711.SetPIN_DOUT(dat as any);//DigitalPinへの型チェク回避
        HX711.SetPIN_SCK(clk as any);
        HX711.set_offset(offset_value);
        HX711.set_scale(scale_value);
        HX711.begin();
    }

    //% block="値を取得"
    //% weight=90
    export function get_value(): number {
        return HX711.get_units(10);
    }

    //% block="オフセット値を設定 %offset"
    //% weight=70
    export function set_offset_value(offset:number){
        offset_value = offset;
        HX711.set_offset(offset_value);
    }

    //% block="スケール値を設定 %scale"
    //% weight=60
    export function set_scale_value(scale:number){
        scale_value = scale;
        HX711.set_scale(scale_value);
    }
}
