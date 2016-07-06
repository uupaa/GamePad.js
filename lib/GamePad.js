(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
if (GLOBAL["WebModule"]["publish"]) {
    Object.assign(GLOBAL, entity["KEYS"]); // publish GAMEPAD_KEYS to global
}
return entity;

})("GamePad", function moduleClosure(global) {
"use strict";

// --- dependency modules ----------------------------------
// --- define / local variables ----------------------------
var GAMEPAD_KEYS = {
    // --- D-PAD ---
    "GAMEPAD_KEY_U":     0, // up
    "GAMEPAD_KEY_R":     1, // right
    "GAMEPAD_KEY_D":     2, // down
    "GAMEPAD_KEY_L":     3, // left
    // --- DIGITAL ---
    "GAMEPAD_KEY_A":     4,
    "GAMEPAD_KEY_B":     5,
    "GAMEPAD_KEY_C":     6,
    "GAMEPAD_KEY_X":     7,
    "GAMEPAD_KEY_Y":     8,
    "GAMEPAD_KEY_Z":     9,
    "GAMEPAD_KEY_L1":   10,
    "GAMEPAD_KEY_R1":   11,
    "GAMEPAD_KEY_L3":   12,
    "GAMEPAD_KEY_R3":   13,
    "GAMEPAD_KEY_S1":   14, // select
    "GAMEPAD_KEY_S2":   15, // start
    // --- ANALOG ---
    "GAMEPAD_KEY_LX":   16,
    "GAMEPAD_KEY_LY":   17,
    "GAMEPAD_KEY_RX":   18,
    "GAMEPAD_KEY_RY":   19,
    "GAMEPAD_KEY_L2":   20,
    "GAMEPAD_KEY_R2":   21,
};
var HAS_DIGITAL_KEYS = 0x1;
var HAS_ANALOG_KEYS  = 0x2;
var DEVICE_LIST = {
    "8BitdoFC30GamePad(Vendor:0000Product:0000)": "FC30",
    "BUFFALOBGC-FC801USBGamepad(Vendor:0411Product:00c6)": "FC801",
    "USB,2-axis8-buttongamepad(STANDARDGAMEPADVendor:0583Product:2060)": "SFC801",
    "USBGAMEPAD(Vendor:0773Product:0102)": "CTV9",
    "ASUSGamepad(Vendor:0b05Product:4500)": "NexusPlayer",
    "WirelessController(STANDARDGAMEPADVendor:054cProduct:05c4)": "DualShock4", // PS4
    "Xbox360Controller(STANDARDGAMEPADVendor:028eProduct:045e)": "Xbox360",
};
var DEVICE_DATA = {
    "UNKNOWN":      [HAS_DIGITAL_KEYS],
    "FC30":         [HAS_DIGITAL_KEYS],
    "FC801":        [HAS_DIGITAL_KEYS],
    "SFC801":       [HAS_DIGITAL_KEYS],
    "CTV9":         [HAS_DIGITAL_KEYS], // http://www.ns-technology.co.jp/nstdirect/index.php?main_page=product_info&products_id=21
    "NexusPlayer":  [HAS_DIGITAL_KEYS | HAS_ANALOG_KEYS],
    "DualShock4":   [HAS_DIGITAL_KEYS | HAS_ANALOG_KEYS],
};

// --- class / interfaces ----------------------------------
function GamePad(connect,      // @arg Function = null - connect(index:Number):void
                 disconnect) { // @arg Function = null - disconnect(index:Number):void
    if (IN_NW || IN_BROWSER) {
        global.addEventListener("gamepadconnected",    this); // event -> handleEvent
        global.addEventListener("gamepaddisconnected", this); // event -> handleEvent
    }
    this._connect    = connect    || function() {};
    this._disconnect = disconnect || function() {};
    this._connectedDeviceCount = 0;
    // --- GamePad Devices ---
    this[0] = null; // GAME_PAD_I
    this[1] = null; // GAME_PAD_II
    this[2] = null; // GAME_PAD_III
    this[3] = null; // GAME_PAD_IV
    this[4] = null; // tracer device
}

GamePad["VERBOSE"]     = false;
GamePad["KEYS"]        = GAMEPAD_KEYS;
GamePad["DEVICE_LIST"] = DEVICE_LIST;
GamePad["DEVICE_DATA"] = DEVICE_DATA;
GamePad["repository"] = "https://github.com/uupaa/GamePad.js";
GamePad["prototype"] = Object.create(GamePad, {
    "constructor": { "value": GamePad           }, // new GamePad(connect:Function = null, disconnect:Function = null):GamePad
    "handleEvent": { "value": handleEvent       }, // [INTERNAL]
    "connected":   { "get":   GamePad_connected }, // GamePad#connected:Boolean
    "input":       { "value": GamePad_input     }, // GamePad#input():void
});
Object.assign(GamePad, GAMEPAD_KEYS);

// --- implements ------------------------------------------
function GamePad_connected() { // @ret Boolean
    return !!this._connectedDeviceCount;
}

function GamePad_input() {
    var pads = navigator["getGamepads"]();

    if (this[0] && pads[0]) { this[0]["input"](pads[0]); }
    if (this[1] && pads[1]) { this[1]["input"](pads[1]); }
    if (this[2] && pads[2]) { this[2]["input"](pads[2]); }
    if (this[3] && pads[3]) { this[3]["input"](pads[3]); }
    if (this[4])            { this[4]["input"](); }
}

function handleEvent(event) { // @arg Event - { type, gamepad }
    var index  = event["gamepad"]["index"] || 0;
    var id     = event["gamepad"]["id"].replace(/\s+/g, "") || "";
    var device = DEVICE_LIST[id] || "UNKNOWN"; // detected device. "NexusPlayer", "FC30", "FC801", ...

    if (GamePad["VERBOSE"]) {
        console.log(event.type, id, index, device);
    }
    switch (event.type) {
    case "gamepadconnected":
        var GamePadDevice = global["WebModule"]["GamePadDevice"];

        // create instance
        this[index] = new GamePadDevice(event["gamepad"]);
        this._connectedDeviceCount++;
        if (this._connect) {
            this._connect(index);
        }
        break;
    case "gamepaddisconnected":
        if (this[index]) {
            this[index]["disconnect"]();
            this[index] = null;
            this._connectedDeviceCount--;
            if (this._disconnect) {
                this._disconnect(index);
            }
        }
    }
}

return GamePad; // return entity

});

