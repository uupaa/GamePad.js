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
};

// --- class / interfaces ----------------------------------
function GamePadDevice(gamepad) { // @arg GamepadObject - { index, id, buttons, axes }
    var id     = gamepad["id"];
    var device = global["WebModule"]["GamePad"]["DEVICE_LIST"][id] || "UNKNOWN";

    this._index   = gamepad["index"];
    this._device  = device;
    this._last    = new Uint8Array(16 + 6);
    this._changed = new Uint8Array(16 + 6);
    this._current = new Uint8Array(16 + 6);
    this._keyCode = { U: 0, R: 0, D: 0, L: 0 };
    this._inputHandler = INPUT_HANDLERS[device];

    if (SETUP_HANDLERS[device]) {
        SETUP_HANDLERS[device](this);
    }
    this["input"](gamepad);
}

GamePadDevice["VERBOSE"] = false;
GamePadDevice["prototype"] = Object.create(GamePadDevice, {
    "constructor":  { "value": GamePadDevice                         }, // new GamePadDevice(gamepad:GamepadObject):GamePadDevice
    "handleEvent":  { "value": handleEvent                           }, // [INTERNAL]
    "input":        { "value": GamePadDevice_input                   }, // GamePadDevice#input(gamepad:GamepadObject):void
    "device":       { "get":   function()  { return this._device;  } }, // GamePadDevice#device:GamePadDeviceNameString
    "changed":      { "get":   function()  { return this._changed; } }, // GamePadDevice#changed:Uint8Array
    "current":      { "get":   function()  { return this._current; } }, // GamePadDevice#current:Uint8Array
    "disconnect":   { "value": GamePadDevice_disconnect              }, // GamePadDevice#disconnect():void
});
// --- key buffer ---
GamePadDevice["pack"]       = GamePadDevice_pack;       // GamePadDevice.pack(current:Uint8Array):Uint8Array
GamePadDevice["unpack"]     = GamePadDevice_unpack;     // GamePadDevice.unpack(buffer:Uint8Array):Uint8Array
GamePadDevice["getChanged"] = GamePadDevice_getChanged; // GamePadDevice.getChanged(current:Uint8Array, last:Uint8Array):Uint8Array

// --- implements ------------------------------------------
function GamePadDevice_input(gamepad) { // @arg Gamepad - { buttons, axes }
    this._last.set(this._current); // copy

//{@dev
    if (GamePadDevice["VERBOSE"]) { _dump(gamepad); }
//}@dev
    this._inputHandler(gamepad["buttons"], gamepad["axes"]);
    this._changed.set(GamePadDevice_getChanged(this._current, this._last));
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
function _dump(gamepad) {
    var buttons = gamepad["buttons"];
    var axes = gamepad["axes"];
    var s = [];

    // --- D-PAD ---
    if (axes[1] === -1) { s.push("U"); }
    if (axes[0] ===  1) { s.push("L"); }
    if (axes[1] ===  1) { s.push("D"); }
    if (axes[0] === -1) { s.push("R"); }
    // --- DIGITAL ---
    if (buttons[ 0]["pressed"]) { s.push("A"); }
    if (buttons[ 1]["pressed"]) { s.push("B"); }
    if (buttons[ 2]["pressed"]) { s.push("C"); }
    if (buttons[ 3]["pressed"]) { s.push("X"); }
    if (buttons[ 4]["pressed"]) { s.push("Y"); }
    if (buttons[ 5]["pressed"]) { s.push("Z"); }
    if (buttons[ 6]["pressed"]) { s.push("L1"); }
    if (buttons[ 7]["pressed"]) { s.push("R1"); }
    if (buttons[13]["pressed"]) { s.push("L3"); }
    if (buttons[14]["pressed"]) { s.push("R3"); }

    if (buttons[ 8]["pressed"]) { s.push("8"); }
    if (buttons[ 9]["pressed"]) { s.push("9"); }
    if (buttons[10]["pressed"]) { s.push("10"); }
    if (buttons[11]["pressed"]) { s.push("11"); }
    if (buttons[12]["pressed"]) { s.push("12"); }

    // --- ANALOG ---
    var LX  = (axes[0] + 1) * 7 | 0;
    var LY  = (axes[1] + 1) * 7 | 0;
    var RX  = (axes[2] + 1) * 7 | 0;
    var RY  = (axes[5] + 1) * 7 | 0;
    var L2  = (axes[3] + 1) * 7 | 0;
    var R2  = (axes[4] + 1) * 7 | 0;

    console.log(s.join(","), LX, LY, RX, RY, L2, R2);
}
//}@dev

// === UNKNOWN =============================================
function input_UNKNOWN() {
    this._current.set([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
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

    this._current.set([
    //  U, R, D, L, A, B, C, X, Y, Z, L1, R1, L3, R3, S1, S2, LX, LY, RX, RY, L2, R2
        U, R, D, L, A, B, 0, X, Y, 0, L1, R1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0
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
    var L3  = buttons[ 6]["pressed"] ? 1 : 0; // 0 or 1 // START
    var R3  = buttons[ 7]["pressed"] ? 1 : 0; // 0 or 1 // SELECT

    this._current.set([
    //  U, R, D, L, A, B, C, X, Y, Z, L1, R1, L3, R3, S1, S2, LX, LY, RX, RY, L2, R2
        U, R, D, L, A, B, 0, X, Y, 0, L1, R1, L3, R3,  0,  0,  0,  0,  0,  0,  0,  0
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
    var L3  = buttons[ 6]["pressed"] ? 1 : 0; // 0 or 1 // START
    var R3  = buttons[ 7]["pressed"] ? 1 : 0; // 0 or 1 // SELECT

    this._current.set([
    //  U, R, D, L, A, B, C, X, Y, Z, L1, R1, L3, R3, S1, S2, LX, LY, RX, RY, L2, R2
        U, R, D, L, A, B, 0, X, Y, 0, L1, R1, L3, R3,  0,  0,  0,  0,  0,  0,  0,  0
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

    this._current.set([
    //  U, R, D, L, A, B, C, X, Y, Z, L1, R1, L3, R3, S1, S2, LX, LY, RX, RY, L2, R2
        U, R, D, L, A, B, C, X, Y, Z, L1, R1,  0,  0, S1, S2,  0,  0,  0,  0,  0,  0
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
    var L3  = buttons[13]["pressed"] ? 1 : 0; // 0 or 1 | L STICK PRESSED
    var R3  = buttons[14]["pressed"] ? 1 : 0; // 0 or 1 | R STICK PRESSED
    // --- ANALOG ---
    var LX  = (axes[0] + 1) * 7 | 0; // 0 ... 14 | L STICK X
    var LY  = (axes[1] + 1) * 7 | 0; // 0 ... 14 | L STICK Y
    var RX  = (axes[2] + 1) * 7 | 0; // 0 ... 14 | R STICK X
    var RY  = (axes[5] + 1) * 7 | 0; // 0 ... 14 | R STICK Y
    var L2  = (axes[3] + 1) * 7 | 0; // 0 ... 14 | L2
    var R2  = (axes[4] + 1) * 7 | 0; // 0 ... 14 | R2

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

    this._current.set([
    //  U, R, D, L, A, B, C, X, Y, Z, L1, R1, L3, R3, S1, S2, LX, LY, RX, RY, L2, R2
        U, R, D, L, A, B, 0, X, Y, 0, L1, R1, L3, R3,  0,  0, LX, LY, RX, RY, L2, R2
    ]);
}

// --- key buffer ---
function GamePadDevice_pack(current) { // @arg Uint8Array - Uint8Array(22)
                                       // @ret Uint8Array - Uint8Array(5)
    var curt = current;

    return new Uint8Array([
        curt[0]  << 7 | curt[1]  << 6 | curt[2]  << 5 | curt[3]  << 4 |
        curt[4]  << 3 | curt[5]  << 2 | curt[6]  << 1 | curt[7],
        curt[8]  << 7 | curt[9]  << 6 | curt[10] << 5 | curt[11] << 4 |
        curt[12] << 3 | curt[13] << 2 | curt[14] << 1 | curt[15],
        curt[16] << 4 | curt[17],
        curt[18] << 4 | curt[19],
        curt[20] << 4 | curt[21],
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
        (byte0 >> 7) & 1, (byte0 >> 6) & 1, (byte0 >> 5) & 1, (byte0 >> 4) & 1,
        (byte0 >> 3) & 1, (byte0 >> 1) & 1, (byte0 >> 2) & 1,  byte0       & 1,
        (byte1 >> 7) & 1, (byte1 >> 6) & 1, (byte1 >> 5) & 1, (byte1 >> 4) & 1,
        (byte1 >> 3) & 1, (byte1 >> 1) & 1, (byte1 >> 2) & 1,  byte1       & 1,
        (byte2 >> 4) & 7,  byte2       & 7,
        (byte3 >> 4) & 7,  byte3       & 7,
        (byte4 >> 4) & 7,  byte4       & 7,
    ]);
}

function GamePadDevice_getChanged(current, // @arg Uint8Array - Uint8Array(22)
                                  last) {  // @arg Uint8Array - Uint8Array(22)
                                           // @arg Uint8Array - Uint8Array(22)
    var curt = current;

    return new Uint8Array([
        // --- D-PAD ---
        +(last[0]  !== curt[0]),  // D-PAD UP
        +(last[1]  !== curt[1]),  // D-PAD RIGHT
        +(last[2]  !== curt[2]),  // D-PAD DOWN
        +(last[3]  !== curt[3]),  // D-PAD LEFT
        // --- DIGITAL ---
        +(last[4]  !== curt[4]),  // A BUTTON
        +(last[5]  !== curt[5]),  // B BUTTON
        +(last[6]  !== curt[6]),  // C BUTTON
        +(last[7]  !== curt[7]),  // X BUTTON
        +(last[8]  !== curt[8]),  // Y BUTTON
        +(last[9]  !== curt[9]),  // Z BUTTON
        +(last[10] !== curt[10]), // L1 BUTTON
        +(last[11] !== curt[11]), // R1 BUTTON
        +(last[12] !== curt[12]), // L3 BUTTON / THROTTLE
        +(last[13] !== curt[13]), // R3 BUTTON / THROTTLE
        +(last[14] !== curt[14]), // SELECT BUTTON
        +(last[15] !== curt[15]), // START  BUTTON
        // --- ANALOG ---
        +(last[16] !== curt[16]), // LEFT  STICK X
        +(last[17] !== curt[17]), // LEFT  STICK Y
        +(last[18] !== curt[18]), // RIGHT STICK X
        +(last[19] !== curt[19]), // RIGHT STICK Y
        +(last[20] !== curt[20]), // LEFT  STICK PRESSED
        +(last[21] !== curt[21]), // RIGHT STICK PRESSED
    ]);

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
    // |        |        |----    |        |        | PAD_KEY_LX  (-7 .. 0 .. 7) NEUTRAL is 0
    // |        |        |    ----|        |        | PAD_KEY_LY  (-7 .. 0 .. 7) NEUTRAL is 0
    // |        |        |        |----    |        | PAD_KEY_RX  (-7 .. 0 .. 7) NEUTRAL is 0
    // |        |        |        |    ----|        | PAD_KEY_RY  (-7 .. 0 .. 7) NEUTRAL is 0
    // |        |        |        |        |----    | PAD_KEY_L2  (0 .. 7) NEUTRAL is 0
    // |        |        |        |        |    ----| PAD_KEY_R2  (0 .. 7) NEUTRAL is 0
}

return GamePadDevice; // return entity

});

