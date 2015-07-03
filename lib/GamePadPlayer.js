(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
return entity;

})("GamePadPlayer", function moduleClosure() {
"use strict";

// --- dependency modules ----------------------------------
// --- define / local variables ----------------------------
// --- class / interfaces ----------------------------------
function GamePadPlayer(buffer) { // @arg Uint32Array
    this._type          = "BufferPlayer";
    this._edge          = null; // edge status
    this._value         = {};   // current value
    this._buffer        = buffer;
    this._bufferCursor  = 0;
}

GamePadPlayer["prototype"] = Object.create(GamePadPlayer, {
    "constructor":  { "value": GamePadPlayer                       }, // new GamePadPlayer(id:GamePadIDString, buffer:Uint32Array):GamePadPlayer
    "type":         { "get":   function()  { return this._type;  } }, // GamePadPlayer#type:GamePadTypeString
    "scan":         { "value": GamePadPlayer_scan                  }, // GamePadPlayer#scan():this
    "edge":         { "get":   function()  { return this._edge;  } }, // GamePadPlayer#edge:GamePadEdgeObject
    "value":        { "get":   function()  { return this._value; } }, // GamePadPlayer#value:GamePadValueObject
    "connected":    { "get":   function()  { return true;        } }, // GamePadPlayer#connected:Boolean
});

// --- implements ------------------------------------------
function GamePadPlayer_scan() { // @ret this
    _update.call(this, this._buffer[this._bufferCursor++] >>> 0, this._value);

    if (this._bufferCursor >= this._buffer.length) {
        this._bufferCursor = 0;
    }
    return this;
}

function _update(u32, last) {
    this._value = {
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
        // --- D-PAD ---
        "U":    (u32 >>>  3) & 0x1,
        "R":    (u32 >>>  2) & 0x1,
        "D":    (u32 >>>  1) & 0x1,
        "L":    (u32 >>>  0) & 0x1,
        // --- button ---
        "A":    (u32 >>>  7) & 0x1,
        "B":    (u32 >>>  6) & 0x1,
        "X":    (u32 >>>  5) & 0x1,
        "Y":    (u32 >>>  4) & 0x1,
        "L1":   (u32 >>> 15) & 0x1,
        "R1":   (u32 >>> 14) & 0x1,
        "L3":   (u32 >>>  9) & 0x1,
        "R3":   (u32 >>>  8) & 0x1,
        // --- axis ---
        "LSX":  (u32 >>> 28) & 0xf,
        "LSY":  (u32 >>> 24) & 0xf,
        "RSX":  (u32 >>> 20) & 0xf,
        "RSY":  (u32 >>> 16) & 0xf,
        "L2":   (u32 >>> 12) & 0x3,
        "R2":   (u32 >>> 10) & 0x3,
    };

    var curt = this._value;

    this._edge = {
        // --- D-PAD ---
        "U":    last["U"]   !== curt["U"],
        "R":    last["R"]   !== curt["R"],
        "D":    last["D"]   !== curt["D"],
        "L":    last["L"]   !== curt["L"],
        // --- button ---       utton ---
        "A":    last["A"]   !== curt["A"],
        "B":    last["B"]   !== curt["B"],
        "X":    last["X"]   !== curt["X"],
        "Y":    last["Y"]   !== curt["Y"],
        "L1":   last["L1"]  !== curt["L1"],
        "R1":   last["R1"]  !== curt["R1"],
        "L3":   last["L3"]  !== curt["L3"],
        "R3":   last["R3"]  !== curt["R3"],
        // --- axis ---         xis ---
        "LSX":  last["LSX"] !== curt["LSX"],
        "LSY":  last["LSY"] !== curt["LSY"],
        "RSX":  last["RSX"] !== curt["RSX"],
        "RSY":  last["RSY"] !== curt["RSY"],
        "L2":   last["L2"]  !== curt["L2"],
        "R2":   last["R2"]  !== curt["R2"],
    };
}

return GamePadPlayer; // return entity

});

