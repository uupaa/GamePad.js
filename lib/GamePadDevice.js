(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
return entity;

})("GamePadDevice", function moduleClosure(global) {
"use strict";

// --- dependency modules ----------------------------------
// --- define / local variables ----------------------------
var SETUP_HANDLERS = {
    "FC30":         _attachKeyEvent,
};
var TEARDOWN_HANDLERS = {
    "FC30":         _detachKeyEvent,
};
var INPUT_HANDLERS = {
    "UNKNOWN":      input_UNKNOWN,
    "FC30":         input_FC30,
    "FC801":        input_FC801,
    "SFC801":       input_SFC801,
    "CTV9":         input_CTV9,
    "NexusPlayer":  input_NexusPlayer,
    "DualShock4":   input_DualShock4,
    "Xbox360":      input_Xbox360,
};

// --- class / interfaces ----------------------------------
function GamePadDevice(gamepad) { // @arg GamepadObject - { index, id, buttons, axes }
    var id     = gamepad["id"].replace(/\s+/g, "");
    var device = global["WebModule"]["GamePad"]["DEVICE_LIST"][id] || "UNKNOWN";

    this._index   = gamepad["index"];
    this._device  = device;
    this._keyCode = { U: 0, R: 0, D: 0, L: 0 };
    this._scan    = INPUT_HANDLERS[device];
    // --- values ---
    this._diffValues    = new Uint8Array(16 + 6); // diff key values
    this._lastValues    = new Uint8Array(16 + 6); // last key values
    this._currentValues = new Uint8Array(16 + 6); // current key values

    if (SETUP_HANDLERS[device]) {
        SETUP_HANDLERS[device](this);
    }
    this["input"](gamepad);
}

GamePadDevice["VERBOSE"] = false;
GamePadDevice["prototype"] = Object.create(GamePadDevice, {
    "constructor": { "value": GamePadDevice                              }, // new GamePadDevice(gamepad:GamepadObject):GamePadDevice
    "handleEvent": { "value": handleEvent                                }, // [INTERNAL]
    "input":       { "value": GamePadDevice_input                        }, // GamePadDevice#input(gamepad:GamepadObject):void
    "device":      { "get":   function() { return this._device;        } }, // GamePadDevice#device:GamePadDeviceNameString
    "diffs":       { "get":   function() { return this._diffValues;    } }, // GamePadDevice#diffs:Uint8Array
    "values":      { "get":   function() { return this._currentValues; } }, // GamePadDevice#values:Uint8Array
    "disconnect":  { "value": GamePadDevice_disconnect                   }, // GamePadDevice#disconnect():void
});
// --- key buffer ---
GamePadDevice["diff"]   = GamePadDevice_diff;   // GamePadDevice.diff(values:Uint8Array, lastState:Uint8Array):Uint8Array
GamePadDevice["pack"]   = GamePadDevice_pack;   // GamePadDevice.pack(values:Uint8Array):Uint8Array
GamePadDevice["unpack"] = GamePadDevice_unpack; // GamePadDevice.unpack(buffer:Uint8Array):Uint8Array

// --- implements ------------------------------------------
function GamePadDevice_input(gamepad) { // @arg Gamepad - { buttons, axes }
    this._lastValues.set(this._currentValues); // copy

    this._scan(gamepad["buttons"], gamepad["axes"]);
    this._diffValues.set(GamePadDevice_diff(this._currentValues, this._lastValues));

//{@dev
    if (GamePadDevice["VERBOSE"]) {
        _scanRawValues(gamepad["buttons"], gamepad["axes"]);
        _dumpValues(this._currentValues);
    }
//}@dev
}

function GamePadDevice_disconnect() {
    if (TEARDOWN_HANDLERS[this._device]) {
        TEARDOWN_HANDLERS[this._device](this);
    }
}

function handleEvent(event) {
    var down = event.type === "keydown";

    switch (event.type) {
    case "contextmenu": event.preventDefault(); break;
    case "keydown":
    case "keyup":
        switch (event.keyCode) {
        case 38: this._keyCode.U = down ? 1 : 0; break;
        case 39: this._keyCode.R = down ? 1 : 0; break;
        case 40: this._keyCode.D = down ? 1 : 0; break;
        case 37: this._keyCode.L = down ? 1 : 0; break;
        }
    }
}

function _attachKeyEvent(that) {
    document.addEventListener("contextmenu", that); // Ignore the contextmenu event. Because B button firing it.
    document.addEventListener("keydown", that);     // key code buffer. D-PAD fired keyboard event.
    document.addEventListener("keyup", that);
}

function _detachKeyEvent(that) {
    document.removeEventListener("contextmenu", that);
    document.removeEventListener("keydown", that);
    document.removeEventListener("keyup", that);
}

//{@dev
function _scanRawValues(buttons, axes) {
    var s = [axes.length, buttons.length];

    // --- ANALOG ---
    if (axes.length) {
        if (axes.length >  0) { s.push("A0(" + axes[0].toFixed(2) + ")"); }
        if (axes.length >  1) { s.push("A1(" + axes[1].toFixed(2) + ")"); }
        if (axes.length >  2) { s.push("A2(" + axes[2].toFixed(2) + ")"); }
        if (axes.length >  3) { s.push("A3(" + axes[3].toFixed(2) + ")"); }
        if (axes.length >  4) { s.push("A4(" + axes[4].toFixed(2) + ")"); }
        if (axes.length >  5) { s.push("A5(" + axes[5].toFixed(2) + ")"); }
        if (axes.length >  6) { s.push("A6(" + axes[6].toFixed(2) + ")"); }
        if (axes.length >  7) { s.push("A7(" + axes[7].toFixed(2) + ")"); }
        if (axes.length >  8) { s.push("A8(" + axes[8].toFixed(2) + ")"); }
        if (axes.length >  9) { s.push("A9(" + axes[9].toFixed(2) + ")"); }
        if (axes.length > 10) { s.push("A10(" + axes[10].toFixed(2) + ")"); }
    }
    // --- DIGITAL ---
    if (axes.length) {
        if (buttons.length >  0) { if (buttons[ 0]["pressed"]) { s.push("D0"); } }
        if (buttons.length >  1) { if (buttons[ 1]["pressed"]) { s.push("D1"); } }
        if (buttons.length >  2) { if (buttons[ 2]["pressed"]) { s.push("D2"); } }
        if (buttons.length >  3) { if (buttons[ 3]["pressed"]) { s.push("D3"); } }
        if (buttons.length >  4) { if (buttons[ 4]["pressed"]) { s.push("D4"); } }
        if (buttons.length >  5) { if (buttons[ 5]["pressed"]) { s.push("D5"); } }
        if (buttons.length >  6) { if (buttons[ 6]["pressed"]) { s.push("D6"); } }
        if (buttons.length >  7) { if (buttons[ 7]["pressed"]) { s.push("D7"); } }
        if (buttons.length >  8) { if (buttons[ 8]["pressed"]) { s.push("D8"); } }
        if (buttons.length >  9) { if (buttons[ 9]["pressed"]) { s.push("D9"); } }
        if (buttons.length > 10) { if (buttons[10]["pressed"]) { s.push("D10"); } }
        if (buttons.length > 11) { if (buttons[11]["pressed"]) { s.push("D11"); } }
        if (buttons.length > 12) { if (buttons[12]["pressed"]) { s.push("D12"); } }
        if (buttons.length > 13) { if (buttons[13]["pressed"]) { s.push("D13"); } }
        if (buttons.length > 14) { if (buttons[14]["pressed"]) { s.push("D14"); } }
        if (buttons.length > 15) { if (buttons[15]["pressed"]) { s.push("D15"); } }
        if (buttons.length > 16) { if (buttons[16]["pressed"]) { s.push("D16"); } }
        if (buttons.length > 17) { if (buttons[17]["pressed"]) { s.push("D17"); } }
        if (buttons.length > 18) { if (buttons[18]["pressed"]) { s.push("D18"); } }
        if (buttons.length > 19) { if (buttons[19]["pressed"]) { s.push("D19"); } }
    }

    console.log(s.join(","));
}

function _dumpValues(v) { // @arg Uint8Array
    var s = [];

    s.push(
        v[0] ? "U" : "-",
        v[1] ? "R" : "-",
        v[2] ? "D" : "-",
        v[3] ? "L" : "-",
        v[4] ? "A" : "-",
        v[5] ? "B" : "-",
        v[6] ? "C" : "-",
        v[7] ? "X" : "-",
        v[8] ? "Y" : "-",
        v[9] ? "Z" : "-",
        v[10] ? "L1" : "-",
        v[11] ? "R1" : "-",
        v[12] ? "L3" : "-",
        v[13] ? "R3" : "-",
        v[14] ? "S1" : "-",
        v[15] ? "S2" : "-",
        v[16] !== 7 ? "LX" : "--",
        v[17] !== 7 ? "LY" : "--",
        v[18] !== 7 ? "RX" : "--",
        v[19] !== 7 ? "RY" : "--",
        v[20] ? "L2" : "--",
        v[21] ? "R2" : "--"
    );
    console.log(s.join(""));

    //  byte0    byte1    byte2    byte3    byte4
    // |76543210|76543210|76543210|76543210|76543210|
    // |-       |        |        |        |        | PAD_KEY_U   (0 or 1)
    // | -      |        |        |        |        | PAD_KEY_R   (0 or 1)
    // |  -     |        |        |        |        | PAD_KEY_D   (0 or 1)
    // |   -    |        |        |        |        | PAD_KEY_L   (0 or 1)
    // |    -   |        |        |        |        | PAD_KEY_A   (0 or 1)
    // |     -  |        |        |        |        | PAD_KEY_B   (0 or 1)
    // |      - |        |        |        |        | PAD_KEY_C   (0 or 1)
    // |       -|        |        |        |        | PAD_KEY_X   (0 or 1)
    // |        |-       |        |        |        | PAD_KEY_Y   (0 or 1)
    // |        | -      |        |        |        | PAD_KEY_Z   (0 or 1)
    // |        |  -     |        |        |        | PAD_KEY_L1  (0 or 1)
    // |        |   -    |        |        |        | PAD_KEY_R1  (0 or 1)
    // |        |    -   |        |        |        | PAD_KEY_L3  (0 or 1)
    // |        |     -  |        |        |        | PAD_KEY_R3  (0 or 1)
    // |        |      - |        |        |        | PAD_KEY_S1  (0 or 1)
    // |        |       -|        |        |        | PAD_KEY_S2  (0 or 1)
    // |        |        |----    |        |        | PAD_KEY_LX  (0 .. 7 .. 14) NEUTRAL is 0
    // |        |        |    ----|        |        | PAD_KEY_LY  (0 .. 7 .. 14) NEUTRAL is 0
    // |        |        |        |----    |        | PAD_KEY_RX  (0 .. 7 .. 14) NEUTRAL is 0
    // |        |        |        |    ----|        | PAD_KEY_RY  (0 .. 7 .. 14) NEUTRAL is 0
    // |        |        |        |        |----    | PAD_KEY_L2  (0 .. 14) NEUTRAL is 0
    // |        |        |        |        |    ----| PAD_KEY_R2  (0 .. 14) NEUTRAL is 0

}
//}@dev

function GamePadDevice_diff(a,   // @arg Uint8Array - values A. Uint8Array(22)
                            b) { // @arg Uint8Array - values B. Uint8Array(22)
                                 // @arg Uint8Array - diff values. Uint8Array(22)
    return new Uint8Array([
        // --- D-PAD ---
        +(a[0]  !== b[0]),  // D-PAD UP
        +(a[1]  !== b[1]),  // D-PAD RIGHT
        +(a[2]  !== b[2]),  // D-PAD DOWN
        +(a[3]  !== b[3]),  // D-PAD LEFT
        // --- DIGITAL ---
        +(a[4]  !== b[4]),  // A BUTTON
        +(a[5]  !== b[5]),  // B BUTTON
        +(a[6]  !== b[6]),  // C BUTTON
        +(a[7]  !== b[7]),  // X BUTTON
        +(a[8]  !== b[8]),  // Y BUTTON
        +(a[9]  !== b[9]),  // Z BUTTON
        +(a[10] !== b[10]), // L1 BUTTON
        +(a[11] !== b[11]), // R1 BUTTON
        +(a[12] !== b[12]), // L3 BUTTON / THROTTLE
        +(a[13] !== b[13]), // R3 BUTTON / THROTTLE
        +(a[14] !== b[14]), // SELECT BUTTON
        +(a[15] !== b[15]), // START  BUTTON
        // --- ANALOG ---
        +(a[16] !== b[16]), // LEFT  STICK X
        +(a[17] !== b[17]), // LEFT  STICK Y
        +(a[18] !== b[18]), // RIGHT STICK X
        +(a[19] !== b[19]), // RIGHT STICK Y
        +(a[20] !== b[20]), // LEFT  STICK PRESSED
        +(a[21] !== b[21]), // RIGHT STICK PRESSED
    ]);

    //  byte0    byte1    byte2    byte3    byte4
    // |76543210|76543210|76543210|76543210|76543210|
    // |-       |        |        |        |        | PAD_KEY_U   (0 or 1)
    // | -      |        |        |        |        | PAD_KEY_R   (0 or 1)
    // |  -     |        |        |        |        | PAD_KEY_D   (0 or 1)
    // |   -    |        |        |        |        | PAD_KEY_L   (0 or 1)
    // |    -   |        |        |        |        | PAD_KEY_A   (0 or 1)
    // |     -  |        |        |        |        | PAD_KEY_B   (0 or 1)
    // |      - |        |        |        |        | PAD_KEY_C   (0 or 1)
    // |       -|        |        |        |        | PAD_KEY_X   (0 or 1)
    // |        |-       |        |        |        | PAD_KEY_Y   (0 or 1)
    // |        | -      |        |        |        | PAD_KEY_Z   (0 or 1)
    // |        |  -     |        |        |        | PAD_KEY_L1  (0 or 1)
    // |        |   -    |        |        |        | PAD_KEY_R1  (0 or 1)
    // |        |    -   |        |        |        | PAD_KEY_L3  (0 or 1)
    // |        |     -  |        |        |        | PAD_KEY_R3  (0 or 1)
    // |        |      - |        |        |        | PAD_KEY_S1  (0 or 1)
    // |        |       -|        |        |        | PAD_KEY_S2  (0 or 1)
    // |        |        |----    |        |        | PAD_KEY_LX  (0 .. 7 .. 14) NEUTRAL is 0
    // |        |        |    ----|        |        | PAD_KEY_LY  (0 .. 7 .. 14) NEUTRAL is 0
    // |        |        |        |----    |        | PAD_KEY_RX  (0 .. 7 .. 14) NEUTRAL is 0
    // |        |        |        |    ----|        | PAD_KEY_RY  (0 .. 7 .. 14) NEUTRAL is 0
    // |        |        |        |        |----    | PAD_KEY_L2  (0 .. 14) NEUTRAL is 0
    // |        |        |        |        |    ----| PAD_KEY_R2  (0 .. 14) NEUTRAL is 0
}

function GamePadDevice_pack(values) { // @arg Uint8Array - Uint8Array(22)
                                      // @ret Uint8Array - Uint8Array(5)
    var v = values;

    return new Uint8Array([
        v[0]  << 7 |    // PAD_KEY_U
        v[1]  << 6 |    // PAD_KEY_R
        v[2]  << 5 |    // PAD_KEY_D
        v[3]  << 4 |    // PAD_KEY_L
        v[4]  << 3 |    // PAD_KEY_A
        v[5]  << 2 |    // PAD_KEY_B
        v[6]  << 1 |    // PAD_KEY_C
        v[7],           // PAD_KEY_X
        v[8]  << 7 |    // PAD_KEY_Y
        v[9]  << 6 |    // PAD_KEY_Z
        v[10] << 5 |    // PAD_KEY_L1
        v[11] << 4 |    // PAD_KEY_R1
        v[12] << 3 |    // PAD_KEY_L3
        v[13] << 2 |    // PAD_KEY_R3
        v[14] << 1 |    // PAD_KEY_S1
        v[15],          // PAD_KEY_S2
        v[16] << 4 |    // PAD_KEY_LX 4bits
        v[17],          // PAD_KEY_LY 4bits
        v[18] << 4 |    // PAD_KEY_RX 4bits
        v[19],          // PAD_KEY_RY 4bits
        v[20] << 4 |    // PAD_KEY_L2 4bits
        v[21],          // PAD_KEY_R2 4bits
    ]);
}

function GamePadDevice_unpack(buffer) { // @arg Uint8Array - Uint8Array(5)
                                        // @ret Uint8Array - Uint8Array(22)
    var byte0 = buffer[0];
    var byte1 = buffer[1];
    var byte2 = buffer[2];
    var byte3 = buffer[3];
    var byte4 = buffer[4];

    return new Uint8Array([
        (byte0 >> 7) & 1,
        (byte0 >> 6) & 1,
        (byte0 >> 5) & 1,
        (byte0 >> 4) & 1,
        (byte0 >> 3) & 1,
        (byte0 >> 2) & 1,
        (byte0 >> 1) & 1,
         byte0       & 1,
        (byte1 >> 7) & 1,
        (byte1 >> 6) & 1,
        (byte1 >> 5) & 1,
        (byte1 >> 4) & 1,
        (byte1 >> 3) & 1,
        (byte1 >> 2) & 1,
        (byte1 >> 1) & 1,
         byte1       & 1,
        (byte2 >> 4) & 7,
         byte2       & 7,
        (byte3 >> 4) & 7,
         byte3       & 7,
        (byte4 >> 4) & 7,
         byte4       & 7,
    ]);
}

// === UNKNOWN =============================================
function input_UNKNOWN() { // unknown device handler
    this._currentValues.set([
    //  U, R, D, L, A, B, C, X, Y, Z, L1, R1, L3, R3, S1, S2, LX, LY, RX, RY, L2, R2
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0,  0,  0,  0,  0,  0,  7,  7,  7,  7,  0,  0
    ]);
}

// === FC30 ================================================
function input_FC30(buttons) { // @arg GamePadButtonObjects
    // --- D-PAD ---
    var U   = this._keyCode.U;
    var R   = this._keyCode.R;
    var D   = this._keyCode.D;
    var L   = this._keyCode.L;
    // --- DIGITAL ---
    var A   = buttons[ 0]["pressed"] ? 1 : 0; // 0 or 1
    var B   = buttons[ 1]["pressed"] ? 1 : 0; // 0 or 1
    var X   = buttons[ 3]["pressed"] ? 1 : 0; // 0 or 1
    var Y   = buttons[ 4]["pressed"] ? 1 : 0; // 0 or 1
    var L1  = buttons[ 6]["pressed"] ? 1 : 0; // 0 or 1
    var R1  = buttons[ 7]["pressed"] ? 1 : 0; // 0 or 1

    this._currentValues.set([
    //  U, R, D, L, A, B, C, X, Y, Z, L1, R1, L3, R3, S1, S2, LX, LY, RX, RY, L2, R2
        U, R, D, L, A, B, 0, X, Y, 0, L1, R1,  0,  0,  0,  0,  7,  7,  7,  7,  0,  0
    ]);
}

// === FC801 ===============================================
function input_FC801(buttons, // @arg GamePadButtonObjects
                     axes) {  // @arg GamePadAxesObjects
    // --- D-PAD ---
    var U   = axes[1] === -1 ? 1 : 0;
    var R   = axes[0] ===  1 ? 1 : 0;
    var D   = axes[1] ===  1 ? 1 : 0;
    var L   = axes[0] === -1 ? 1 : 0;
    // --- DIGITAL ---
    var A   = buttons[ 0]["pressed"] ? 1 : 0; // 0 or 1
    var B   = buttons[ 1]["pressed"] ? 1 : 0; // 0 or 1
    var X   = buttons[ 2]["pressed"] ? 1 : 0; // 0 or 1
    var Y   = buttons[ 3]["pressed"] ? 1 : 0; // 0 or 1
    var L1  = buttons[ 4]["pressed"] ? 1 : 0; // 0 or 1
    var R1  = buttons[ 5]["pressed"] ? 1 : 0; // 0 or 1
    var S1  = buttons[ 6]["pressed"] ? 1 : 0; // 0 or 1 // START
    var S2  = buttons[ 7]["pressed"] ? 1 : 0; // 0 or 1 // SELECT

    this._currentValues.set([
    //  U, R, D, L, A, B, C, X, Y, Z, L1, R1, L3, R3, S1, S2, LX, LY, RX, RY, L2, R2
        U, R, D, L, A, B, 0, X, Y, 0, L1, R1,  0,  0, S1, S2,  7,  7,  7,  7,  0,  0
    ]);
}

// === SFC801 ===============================================
function input_SFC801(buttons, // @arg GamePadButtonObjects
                      axes) {  // @arg GamePadAxesObjects
    // --- D-PAD ---
    var U   = axes[1] === -1 ? 1 : 0;
    var R   = axes[0] ===  1 ? 1 : 0;
    var D   = axes[1] ===  1 ? 1 : 0;
    var L   = axes[0] === -1 ? 1 : 0;
    // --- DIGITAL ---
    var A   = buttons[ 1]["pressed"] ? 1 : 0; // 0 or 1
    var B   = buttons[ 0]["pressed"] ? 1 : 0; // 0 or 1
    var X   = buttons[ 3]["pressed"] ? 1 : 0; // 0 or 1
    var Y   = buttons[ 2]["pressed"] ? 1 : 0; // 0 or 1
    var L1  = buttons[ 4]["pressed"] ? 1 : 0; // 0 or 1
    var R1  = buttons[ 5]["pressed"] ? 1 : 0; // 0 or 1
    var S1  = buttons[ 6]["pressed"] ? 1 : 0; // 0 or 1 // START
    var S2  = buttons[ 7]["pressed"] ? 1 : 0; // 0 or 1 // SELECT

    this._currentValues.set([
    //  U, R, D, L, A, B, C, X, Y, Z, L1, R1, L3, R3, S1, S2, LX, LY, RX, RY, L2, R2
        U, R, D, L, A, B, 0, X, Y, 0, L1, R1,  0,  0, S1, S2,  7,  7,  7,  7,  0,  0
    ]);
}

// === CT-V9 ===============================================
function input_CTV9(buttons, // @arg GamePadButtonObjects
                    axes) {  // @arg GamePadAxesObjects
    // --- D-PAD ---
    var U   = axes[1] === -1 ? 1 : 0;
    var R   = axes[0] ===  1 ? 1 : 0;
    var D   = axes[1] ===  1 ? 1 : 0;
    var L   = axes[0] === -1 ? 1 : 0;
    // --- DIGITAL ---
    var A   = buttons[ 0]["pressed"] ? 1 : 0; // 0 or 1 // BTN1
    var B   = buttons[ 1]["pressed"] ? 1 : 0; // 0 or 1 // BTN2
    var C   = buttons[ 2]["pressed"] ? 1 : 0; // 0 or 1 // BTN3
    var X   = buttons[ 3]["pressed"] ? 1 : 0; // 0 or 1 // BTN4
    var Y   = buttons[ 4]["pressed"] ? 1 : 0; // 0 or 1 // BTN5
    var Z   = buttons[ 5]["pressed"] ? 1 : 0; // 0 or 1 // BTN6
    var L1  = buttons[ 6]["pressed"] ? 1 : 0; // 0 or 1 // BTN7
    var R1  = buttons[ 7]["pressed"] ? 1 : 0; // 0 or 1 // BTN8
    var S1  = buttons[ 8]["pressed"] ? 1 : 0; // 0 or 1 // BTN9 SELECT
    var S2  = buttons[ 9]["pressed"] ? 1 : 0; // 0 or 1 // BTN10 START

    this._currentValues.set([
    //  U, R, D, L, A, B, C, X, Y, Z, L1, R1, L3, R3, S1, S2, LX, LY, RX, RY, L2, R2
        U, R, D, L, A, B, C, X, Y, Z, L1, R1,  0,  0, S1, S2,  7,  7,  7,  7,  0,  0
    ]);
}

// === Nexus Player ========================================
function input_NexusPlayer(buttons, // @arg GamePadButtonObjects
                           axes) {  // @arg GamePadAxesObjects
    // --- D-PAD ---
    var U   = 0;
    var R   = 0;
    var D   = 0;
    var L   = 0;
    // --- DIGITAL ---
    var A   = buttons[ 0]["pressed"] ? 1 : 0; // 0 or 1
    var B   = buttons[ 1]["pressed"] ? 1 : 0; // 0 or 1
    var X   = buttons[ 3]["pressed"] ? 1 : 0; // 0 or 1
    var Y   = buttons[ 4]["pressed"] ? 1 : 0; // 0 or 1
    var L1  = buttons[ 6]["pressed"] ? 1 : 0; // 0 or 1
    var R1  = buttons[ 7]["pressed"] ? 1 : 0; // 0 or 1
    var L3  = buttons[13]["pressed"] ? 1 : 0; // 0 or 1 // L STICK PRESSED
    var R3  = buttons[14]["pressed"] ? 1 : 0; // 0 or 1 // R STICK PRESSED
    // --- ANALOG ---
    var LX  = (axes[0] + 1) * 7 + 0.5 | 0; // 0 .. 7 .. 14 // L STICK X
    var LY  = (axes[1] + 1) * 7 + 0.5 | 0; // 0 .. 7 .. 14 // L STICK Y
    var RX  = (axes[2] + 1) * 7 + 0.5 | 0; // 0 .. 7 .. 14 // R STICK X
    var RY  = (axes[5] + 1) * 7 + 0.5 | 0; // 0 .. 7 .. 14 // R STICK Y
    var L2  = (axes[3] + 1) * 7 + 0.5 | 0; // 0 ... 14 // L2
    var R2  = (axes[4] + 1) * 7 + 0.5 | 0; // 0 ... 14 // R2

    // --- D-PAD ---
    //  axes[9] is D_PAD input
    //              value + offset
    //      NEUTRAL: 1.28 + 1.0 = 2.28
    //      L+U:     1.00 + 1.0 = 2.00
    //      L:       0.71 + 1.0 = 1.71
    //      D+L:     0.42 + 1.0 = 1.42
    //      D:       0.14 + 1.0 = 1.14
    //      R+D:    -0.14 + 1.0 = 0.86
    //      R:      -0.42 + 1.0 = 0.58
    //      U+R:    -0.71 + 1.0 = 0.29
    //      U:      -1.00 + 1.0 = 0.00
    var D_PAD = axes[9] + 1; // 1 is offset

    if (D_PAD > 2.00 + 0.05) { /*NEUTRAL*/ } else
    if (D_PAD > 2.00 - 0.05) { U = L = 1;  } else
    if (D_PAD > 1.71 - 0.05) {     L = 1;  } else
    if (D_PAD > 1.42 - 0.05) { L = D = 1;  } else
    if (D_PAD > 1.14 - 0.05) {     D = 1;  } else
    if (D_PAD > 0.86 - 0.05) { D = R = 1;  } else
    if (D_PAD > 0.58 - 0.05) {     R = 1;  } else
    if (D_PAD > 0.29 - 0.05) { R = U = 1;  } else
    if (D_PAD > 0.00 - 0.05) {     U = 1;  }

    this._currentValues.set([
    //  U, R, D, L, A, B, C, X, Y, Z, L1, R1, L3, R3, S1, S2, LX, LY, RX, RY, L2, R2
        U, R, D, L, A, B, 0, X, Y, 0, L1, R1, L3, R3,  0,  0, LX, LY, RX, RY, L2, R2
    ]);
}

// === DualShock 4 =========================================
function input_DualShock4(buttons, // @arg GamePadButtonObjects
                          axes) {  // @arg GamePadAxesObjects
    // D0  -> X
    // D1  -> O
    // D2  -> []
    // D3  -> Δ
    // D4  -> L1
    // D5  -> R1
    // D6  -> L2
    // D7  -> R2
    // D8  -> SHARE
    // D9  -> OPTIONS
    // D10 -> L3
    // D11 -> R3
    // D12 -> UP
    // D13 -> DOWN
    // D14 -> LEFT
    // D15 -> RIGHT
    // D16 -> PS LOGO
    // D17 -> TOUCH_PAD PRESSED
    // A1  -> LY
    // A2  -> RX
    // A3  -> RY
    // --- D-PAD ---
    var U   = buttons[12]["pressed"] ? 1 : 0; // 0 or 1
    var R   = buttons[15]["pressed"] ? 1 : 0; // 0 or 1
    var D   = buttons[13]["pressed"] ? 1 : 0; // 0 or 1
    var L   = buttons[14]["pressed"] ? 1 : 0; // 0 or 1
    // --- DIGITAL ---
    var A   = buttons[ 1]["pressed"] ? 1 : 0; // 0 or 1 // O
    var B   = buttons[ 0]["pressed"] ? 1 : 0; // 0 or 1 // X
    var X   = buttons[ 3]["pressed"] ? 1 : 0; // 0 or 1 // Δ
    var Y   = buttons[ 2]["pressed"] ? 1 : 0; // 0 or 1 // []
    var L1  = buttons[ 4]["pressed"] ? 1 : 0; // 0 or 1
    var R1  = buttons[ 5]["pressed"] ? 1 : 0; // 0 or 1
    var L2  = buttons[ 6]["pressed"] ? 1 : 0; // 0 or 1
    var R2  = buttons[ 7]["pressed"] ? 1 : 0; // 0 or 1
    var S1  = buttons[ 8]["pressed"] ? 1 : 0; // 0 or 1 // SHARE
    var S2  = buttons[ 9]["pressed"] ? 1 : 0; // 0 or 1 // OPTIONS
    var L3  = buttons[10]["pressed"] ? 1 : 0; // 0 or 1 // L STICK PRESSED
    var R3  = buttons[11]["pressed"] ? 1 : 0; // 0 or 1 // R STICK PRESSED
    // --- ANALOG ---
    var LY  = (axes[1] + 1) * 7 + 0.5 | 0; // 0 .. 7 .. 14 | L STICK Y
    var RX  = (axes[2] + 1) * 7 + 0.5 | 0; // 0 .. 7 .. 14 | R STICK X
    var RY  = (axes[3] + 1) * 7 + 0.5 | 0; // 0 .. 7 .. 14 | R STICK Y

    this._currentValues.set([
    //  U, R, D, L, A, B, C, X, Y, Z, L1, R1, L3, R3, S1, S2, LX, LY, RX, RY, L2, R2
        U, R, D, L, A, B, 0, X, Y, 0, L1, R1, L3, R3, S1, S2,  7, LY, RX, RY, L2, R2
    ]);
}

// === Xbox360 =============================================
function input_Xbox360(buttons, // @arg GamePadButtonObjects
                       axes) {  // @arg GamePadAxesObjects
    // D0  -> A
    // D1  -> B
    // D2  -> X
    // D3  -> Y
    // D4  -> L1
    // D5  -> R1
    // D6  -> L2
    // D7  -> R2
    // D8  -> BACK
    // D9  -> START
    // D10 -> L3 (L STICK PRESSED)
    // D11 -> R3 (R STICK PRESSED)
    // D12 -> UP
    // D13 -> DOWN
    // D14 -> LEFT
    // D15 -> RIGHT
    // D16 -> Xbox360 LOGO
    // A0  -> LX
    // A1  -> LY
    // A2  -> RX
    // A3  -> RY
    // --- D-PAD ---
    var U   = buttons[12]["pressed"] ? 1 : 0; // 0 or 1
    var R   = buttons[15]["pressed"] ? 1 : 0; // 0 or 1
    var D   = buttons[13]["pressed"] ? 1 : 0; // 0 or 1
    var L   = buttons[14]["pressed"] ? 1 : 0; // 0 or 1
    // --- DIGITAL ---
    var A   = buttons[ 1]["pressed"] ? 1 : 0; // 0 or 1
    var B   = buttons[ 0]["pressed"] ? 1 : 0; // 0 or 1
    var X   = buttons[ 3]["pressed"] ? 1 : 0; // 0 or 1
    var Y   = buttons[ 2]["pressed"] ? 1 : 0; // 0 or 1
    var L1  = buttons[ 4]["pressed"] ? 1 : 0; // 0 or 1
    var R1  = buttons[ 5]["pressed"] ? 1 : 0; // 0 or 1
    var L2  = buttons[ 6]["pressed"] ? 1 : 0; // 0 or 1
    var R2  = buttons[ 7]["pressed"] ? 1 : 0; // 0 or 1
    var S1  = buttons[ 8]["pressed"] ? 1 : 0; // 0 or 1 // SHARE
    var S2  = buttons[ 9]["pressed"] ? 1 : 0; // 0 or 1 // OPTIONS
    var L3  = buttons[10]["pressed"] ? 1 : 0; // 0 or 1 // L STICK PRESSED
    var R3  = buttons[11]["pressed"] ? 1 : 0; // 0 or 1 // R STICK PRESSED
    // --- ANALOG ---
    var LX  = (axes[0] + 1) * 7 + 0.5 | 0; // 0 .. 7 .. 14 | L STICK X
    var LY  = (axes[1] + 1) * 7 + 0.5 | 0; // 0 .. 7 .. 14 | L STICK Y
    var RX  = (axes[2] + 1) * 7 + 0.5 | 0; // 0 .. 7 .. 14 | R STICK X
    var RY  = (axes[3] + 1) * 7 + 0.5 | 0; // 0 .. 7 .. 14 | R STICK Y

    this._currentValues.set([
    //  U, R, D, L, A, B, C, X, Y, Z, L1, R1, L3, R3, S1, S2, LX, LY, RX, RY, L2, R2
        U, R, D, L, A, B, 0, X, Y, 0, L1, R1, L3, R3, S1, S2, LX, LY, RX, RY, L2, R2
    ]);
}

return GamePadDevice; // return entity

});

