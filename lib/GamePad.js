(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
if (GLOBAL["WebModule"]["publish"]) {
    Object.assign(GLOBAL, entity["PAD_KEYS"]); // publish PAD_KEYS to global
}
return entity;

})("GamePad", function moduleClosure(global) {
"use strict";

// --- dependency modules ----------------------------------
// --- define / local variables ----------------------------
var PAD_KEYS = {
    // --- D-PAD ---
    "PAD_KEY_U":     0,
    "PAD_KEY_R":     1,
    "PAD_KEY_D":     2,
    "PAD_KEY_L":     3,
    // --- DIGITAL ---
    "PAD_KEY_A":     4,
    "PAD_KEY_B":     5,
    "PAD_KEY_C":     6,
    "PAD_KEY_X":     7,
    "PAD_KEY_Y":     8,
    "PAD_KEY_Z":     9,
    "PAD_KEY_L1":   10,
    "PAD_KEY_R1":   11,
    "PAD_KEY_L3":   12,
    "PAD_KEY_R3":   13,
    "PAD_KEY_S1":   14,
    "PAD_KEY_S2":   15,
    // --- ANALOG ---
    "PAD_KEY_LX":   16,
    "PAD_KEY_LY":   17,
    "PAD_KEY_RX":   18,
    "PAD_KEY_RY":   19,
    "PAD_KEY_L2":   20,
    "PAD_KEY_R2":   21,
};
var DIGITAL = 0x1;
var ANALOG  = 0x2;
var DEVICE_LIST = {
    "8Bitdo FC30 GamePad (Vendor: 0000 Product: 0000)": "FC30",
    "BUFFALO BGC-FC801 USB Gamepad (Vendor: 0411 Product: 00c6)": "FC801",
    "USB,2-axis 8-button gamepad   (STANDARD GAMEPAD Vendor: 0583 Product: 2060)": "SFC801",
    "USB  GAMEPAD         (Vendor: 0773 Product: 0102)": "CTV9",
    "ASUS Gamepad (Vendor: 0b05 Product: 4500)": "NexusPlayer",
};
var DEVICE_DATA = {
  // DEVICE         DATA
    "UNKNOWN":      [DIGITAL],
    "FC30":         [DIGITAL],
    "FC801":        [DIGITAL],
    "SFC801":       [DIGITAL],
    "CTV9":         [DIGITAL], // http://www.ns-technology.co.jp/nstdirect/index.php?main_page=product_info&products_id=21
    "NexusPlayer":  [DIGITAL | ANALOG],
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
GamePad["PAD_KEYS"]    = PAD_KEYS;
GamePad["DEVICE_LIST"] = DEVICE_LIST;
GamePad["DEVICE_DATA"] = DEVICE_DATA;
GamePad["repository"] = "https://github.com/uupaa/GamePad.js";
GamePad["prototype"] = Object.create(GamePad, {
    "constructor": { "value": GamePad           }, // new GamePad(connect:Function = null, disconnect:Function = null):GamePad
    "handleEvent": { "value": handleEvent       }, // [INTERNAL]
    "connected":   { "get":   GamePad_connected }, // GamePad#connected:Boolean
    "input":       { "value": GamePad_input     }, // GamePad#input():void
});
Object.assign(GamePad, PAD_KEYS);

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

function handleEvent(event) {
    var index  = event["gamepad"]["index"] || 0;
    var id     = event["gamepad"]["id"]    || "";
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

