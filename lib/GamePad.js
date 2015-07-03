(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
return entity;

})("GamePad", function moduleClosure(global) {
"use strict";

// --- dependency modules ----------------------------------
var Catalog = global["WebModule"]["GamePadCatalog"];

// --- define / local variables ----------------------------
var PADS = Catalog["PADS"];
var NOP = function() {};

// --- class / interfaces ----------------------------------
function GamePad(gamepad) { // @arg Gamepad
    this._player  = gamepad["index"];
    this._type    = PADS[gamepad["id"]];
    this._last    = {}; // last value
    this._edge    = {}; // edge value
    this._value   = {}; // current value
    this._handler = GamePad[this._type];
    // --- setup keycode handler ---
    this._keyCode       = null;
    this._oncontextmenu = null;
    this._onkeydown     = null;
    this._onkeyup       = null;

    this._handler["setup"].call(this);
    this["scan"](gamepad);
}

GamePad["repository"] = "https://github.com/uupaa/GamePad.js";
GamePad["prototype"] = Object.create(GamePad, {
    "constructor":  { "value": GamePad                              }, // new GamePad(gamepad:Gamepad):GamePad
    "type":         { "get":   function()  { return this._type;   } }, // GamePad#type:GamePadTypeString
    "scan":         { "value": GamePad_scan                         }, // GamePad#scan(gamepad:Gamepad):void
    "edge":         { "get":   function()  { return this._edge;   } }, // GamePad#edge:GamePadEdgeStateObject
    "value":        { "get":   function()  { return this._value;  } }, // GamePad#value:GamePadValueObject
    "disconnect":   { "value": GamePad_disconnect                   }, // GamePad#disconnect():void
});
GamePad["NexusPlayer"] = {
    "scan":     GamePad_NexusPlayer_scan,
    "setup":    NOP,
    "tearDown": NOP
};
GamePad["FC801"] = {
    "scan":     GamePad_FC801_scan,
    "setup":    NOP,
    "tearDown": NOP
};
GamePad["SFC801"] = {
    "scan":     GamePad_SFC801_scan,
    "setup":    NOP,
    "tearDown": NOP
};
GamePad["FC30"] = {
    "scan":     GamePad_FC30_scan,
    "setup":    GamePad_FC30_setup,
    "tearDown": GamePad_FC30_tearDown
};

// --- implements ------------------------------------------
function GamePad_scan(pad) { // @arg Gamepad
    var last = this._value;
    var curt = this._handler["scan"].call(this, pad["buttons"], pad["axes"]); // { U,R,D,L,A,B,X,Y,L1,R1,L2,R2,L3,R3,LSX,LSY,RSX,RSY,U32 }

    this._last  = last;
    this._value = curt;
    this._edge  = {
        // --- D-PAD ---
        "U":    last["U"]   !== curt["U"],
        "R":    last["R"]   !== curt["R"],
        "D":    last["D"]   !== curt["D"],
        "L":    last["L"]   !== curt["L"],
        // --- DIGITAL ---
        "A":    last["A"]   !== curt["A"],
        "B":    last["B"]   !== curt["B"],
        "X":    last["X"]   !== curt["X"],
        "Y":    last["Y"]   !== curt["Y"],
        "L1":   last["L1"]  !== curt["L1"],
        "R1":   last["R1"]  !== curt["R1"],
        "L3":   last["L3"]  !== curt["L3"],
        "R3":   last["R3"]  !== curt["R3"],
        // --- ANALOG ---
        "LSX":  last["LSX"] !== curt["LSX"],
        "LSY":  last["LSY"] !== curt["LSY"],
        "RSX":  last["RSX"] !== curt["RSX"],
        "RSY":  last["RSY"] !== curt["RSY"],
        "L2":   last["L2"]  !== curt["L2"],
        "R2":   last["R2"]  !== curt["R2"],
    };
}

function GamePad_disconnect() {
    this._handler["tearDown"].call(this);
}

// === Nexus Player ========================================
function GamePad_NexusPlayer_scan(buttons, // @arg GamePadButtonObjects
                                  axes) {  // @arg GamePadAxesObjects
                                           // @ret GamePadValueObject
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
    var R3  = buttons[14]["pressed"] ? 1 : 0; // 0 or 1 | L STICK PRESSED
    // --- ANALOG ---
    var LSX = (axes[0] + 1) * 7 | 0; // 0 ... 7 ... 14 | L STICK X
    var LSY = (axes[1] + 1) * 7 | 0; // 0 ... 7 ... 14 | L STICK Y
    var RSX = (axes[2] + 1) * 7 | 0; // 0 ... 7 ... 14 | R STICK X
    var RSY = (axes[5] + 1) * 7 | 0; // 0 ... 7 ... 14 | R STICK Y
    var L2  = (axes[3] + 1) * 1 | 0; // 0 ... 2 | L2
    var R2  = (axes[4] + 1) * 1 | 0; // 0 ... 2 | R2

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

    return {
        // --- D-PAD ---
        "U":    U,
        "R":    R,
        "D":    D,
        "L":    L,
        // --- DIGITAL ---
        "A":    A,
        "B":    B,
        "X":    X,
        "Y":    Y,
        "L1":   L1,
        "R1":   R1,
        "L3":   L3,
        "R3":   R3,
        // --- ANALOG ---
        "LSX":  LSX,
        "LSY":  LSY,
        "RSX":  RSX,
        "RSY":  RSY,
        "L2":   L2,
        "R2":   R2,
        // --- key buffer ---
        // |FEDCBA9876543210|FEDCBA9876543210|
        // |----            |                | LSX, Left  Stick X (0 .. 7 .. 14) NEUTRAL is 7
        // |    ----        |                | LSY, Left  Stick Y (0 .. 7 .. 14) NEUTRAL is 7
        // |        ----    |                | RSX, Right Stick X (0 .. 7 .. 14) NEUTRAL is 7
        // |            ----|                | RSY, Right Stick Y (0 .. 7 .. 14) NEUTRAL is 7
        // |                |-               | L1                 (0 or 1)
        // |                | -              | R1                 (0 or 1)
        // |                |  --            | L2                 (0 .. 2) NEUTRAL is 0
        // |                |    --          | R2                 (0 .. 2) NEUTRAL is 0
        // |                |      -         | L3                 (0 or 1)
        // |                |       -        | R3                 (0 or 1)
        // |                |        -       | A                  (0 or 1)
        // |                |         -      | B                  (0 or 1)
        // |                |          -     | X                  (0 or 1)
        // |                |           -    | Y                  (0 or 1)
        // |                |            -   | U,  D-PAD Up       (0 or 1)
        // |                |             -  | R,  D-PAD Right    (0 or 1)
        // |                |              - | D,  D-PAD Down     (0 or 1)
        // |                |               -| L,  D-PAD Left     (0 or 1)
        "U32":  (LSX << 28 | LSY << 24 | RSX << 20 | RSY << 16 |
                 L1  << 15 | R1  << 14 | L2  << 12 | R2  << 10 | L3 << 9 | R3 << 8 |
                 A   <<  7 | B   <<  6 | X   <<  5 | Y   <<  4 |
                 U   <<  3 | R   <<  2 | D   <<  1 | L) >>> 0
    };
}

// === FC801 ===============================================
function GamePad_FC801_scan(buttons, // @arg GamePadButtonObjects
                            axes) {  // @arg GamePadAxesObjects
                                     // @ret GamePadValueObject
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
    // --- ANALOG ---
    var LSX = 7;
    var LSY = 7;
    var RSX = 7;
    var RSY = 7;
    var L2  = 0;
    var R2  = 0;

    return {
        // --- D-PAD ---
        "U":    U,
        "R":    R,
        "D":    D,
        "L":    L,
        // --- DIGITAL ---
        "A":    A,
        "B":    B,
        "X":    X,
        "Y":    Y,
        "L1":   L1,
        "R1":   R1,
        "L3":   L3,
        "R3":   R3,
        // --- ANALOG ---
        "LSX":  LSX,
        "LSY":  LSY,
        "RSX":  RSX,
        "RSY":  RSY,
        "L2":   L2,
        "R2":   R2,
        // --- key buffer ---
        "U32":  (LSX << 28 | LSY << 24 | RSX << 20 | RSY << 16 |
                 L1  << 15 | R1  << 14 | L2  << 12 | R2  << 10 | L3 << 9 | R3 << 8 |
                 A   <<  7 | B   <<  6 | X   <<  5 | Y   <<  4 |
                 U   <<  3 | R   <<  2 | D   <<  1 | L) >>> 0
    };
}

// === SFC801 ===============================================
function GamePad_SFC801_scan(buttons, // @arg GamePadButtonObjects
                             axes) {  // @arg GamePadAxesObjects
                                      // @ret GamePadValueObject
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
    // --- ANALOG ---
    var LSX = 7;
    var LSY = 7;
    var RSX = 7;
    var RSY = 7;
    var L2  = 0;
    var R2  = 0;

    return {
        // --- D-PAD ---
        "U":    U,
        "R":    R,
        "D":    D,
        "L":    L,
        // --- DIGITAL ---
        "A":    A,
        "B":    B,
        "X":    X,
        "Y":    Y,
        "L1":   L1,
        "R1":   R1,
        "L3":   L3,
        "R3":   R3,
        // --- ANALOG ---
        "LSX":  LSX,
        "LSY":  LSY,
        "RSX":  RSX,
        "RSY":  RSY,
        "L2":   L2,
        "R2":   R2,
        // --- key buffer ---
        "U32":  (LSX << 28 | LSY << 24 | RSX << 20 | RSY << 16 |
                 L1  << 15 | R1  << 14 | L2  << 12 | R2  << 10 | L3 << 9 | R3 << 8 |
                 A   <<  7 | B   <<  6 | X   <<  5 | Y   <<  4 |
                 U   <<  3 | R   <<  2 | D   <<  1 | L) >>> 0
    };
}

// === FC30 ================================================
function GamePad_FC30_setup() {
    this._keyCode       = { U: 0, R: 0, D: 0, L: 0 };

    this._oncontextmenu = oncontextmenu.bind(this);
    this._onkeydown     = onkeydown.bind(this);
    this._onkeyup       = onkeyup.bind(this);

    document.addEventListener("contextmenu", this._oncontextmenu); // Ignore the contextmenu event. Because B button firing it.
    document.addEventListener("keydown", this._onkeydown);         // key code buffer. D-PAD fired keyboard event.
    document.addEventListener("keyup", this._onkeyup);
}

function GamePad_FC30_tearDown() {
    document.removeEventListener("contextmenu", this._oncontextmenu);
    document.removeEventListener("keydown", this._onkeydown);
    document.removeEventListener("keyup", this._onkeyup);
}

function oncontextmenu(event) {
    event.preventDefault();
}
function onkeydown(event) {
    switch (event.keyCode) {
    case 38: this._keyCode.U = 1; break;
    case 39: this._keyCode.R = 1; break;
    case 40: this._keyCode.D = 1; break;
    case 37: this._keyCode.L = 1; break;
    default:
             console.log(event.keyCode);
    }
}
function onkeyup(event) {
    switch (event.keyCode) {
    case 38: this._keyCode.U = 0; break;
    case 39: this._keyCode.R = 0; break;
    case 40: this._keyCode.D = 0; break;
    case 37: this._keyCode.L = 0; break;
    }
}

function GamePad_FC30_scan(buttons) { // @arg GamePadButtonObjects
                                      // @ret GamePadValueObject
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
    var L3  = 0;
    var R3  = 0;
    // --- ANALOG ---
    var LSX = 7;
    var LSY = 7;
    var RSX = 7;
    var RSY = 7;
    var L2  = 0;
    var R2  = 0;

    return {
        // --- D-PAD ---
        "U":    U,
        "R":    R,
        "D":    D,
        "L":    L,
        // --- DIGITAL ---
        "A":    A,
        "B":    B,
        "X":    X,
        "Y":    Y,
        "L1":   L1,
        "R1":   R1,
        "L3":   L3,
        "R3":   R3,
        // --- ANALOG ---
        "LSX":  LSX,
        "LSY":  LSY,
        "RSX":  RSX,
        "RSY":  RSY,
        "L2":   L2,
        "R2":   R2,
        // --- key buffer ---
        "U32":  (LSX << 28 | LSY << 24 | RSX << 20 | RSY << 16 |
                 L1  << 15 | R1  << 14 | L2  << 12 | R2  << 10 | L3 << 9 | R3 << 8 |
                 A   <<  7 | B   <<  6 | X   <<  5 | Y   <<  4 |
                 U   <<  3 | R   <<  2 | D   <<  1 | L) >>> 0
    };
}

return GamePad; // return entity

});

