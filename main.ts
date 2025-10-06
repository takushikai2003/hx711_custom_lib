hx711_custom.sensor_init(SimplePin.P0, SimplePin.P1)
basic.forever(function () {
    serial.writeString("One Reading: ")
    serial.writeLine("" + (Math.round(hx711_custom.get_value())))
    basic.pause(1000)
})
