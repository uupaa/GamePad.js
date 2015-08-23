(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
return entity;

})("GamePadPlayer", function moduleClosure(global) {
"use strict";

// --- dependency modules ----------------------------------
// --- define / local variables ----------------------------
var GamePadDevice = global["WebModule"]["GamePadDevice"];

// --- class / interfaces ----------------------------------
function GamePadPlayer(buffer,  // @arg Uint8Array
                       bytes) { // @arg UINT8
    this._changed       = new Uint8Array(16 + 6);
    this._current       = new Uint8Array(16 + 6);
    this._bytes         = bytes;
    this._buffer        = buffer;
    this._bufferCursor  = 0;
}

GamePadPlayer["prototype"] = Object.create(GamePadPlayer, {
    "constructor":  { "value": GamePadPlayer                          }, // new GamePadPlayer(buffer:Uint32Array):GamePadPlayer
    "input":        { "value": GamePadPlayer_input                    }, // GamePadPlayer#input():void
    "device":       { "get":   function()  { return "BufferPlayer"; } }, // GamePadPlayer#device:GamePadDeviceNameString
    "changed":      { "get":   function()  { return this._changed;  } }, // GamePadPlayer#changed:Uint8Array
    "current":      { "get":   function()  { return this._current;  } }, // GamePadPlayer#current:Uint8Array
    "disconnect":   { "value": function()  {}                         }, // GamePadPlayer#disconnect():void
});

// --- implements ------------------------------------------
function GamePadPlayer_input() {
    var bytes = this._buffer.subarray(this._bufferCursor,
                                      this._bufferCursor + this._bytes);
    var last  = this._current;

    this._current = GamePadDevice.unpack(bytes);
    this._changed.set(GamePadDevice.getChanged(this._current, last));

    this._bufferCursor += this._bytes;
    if (this._bufferCursor >= this._buffer.length) {
        this._bufferCursor = 0;
    }
}


return GamePadPlayer; // return entity

});

