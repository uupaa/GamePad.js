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
    this._diffValues    = new Uint8Array(16 + 6);
    this._currentValues = new Uint8Array(16 + 6);
    this._bytes         = bytes;
    this._buffer        = buffer;
    this._bufferCursor  = 0;
}

GamePadPlayer["prototype"] = Object.create(GamePadPlayer, {
    "constructor": { "value": GamePadPlayer                              }, // new GamePadPlayer(buffer:Uint32Array):GamePadPlayer
    "input":       { "value": GamePadPlayer_input                        }, // GamePadPlayer#input():void
    "device":      { "get":   function() { return "BufferPlayer";      } }, // GamePadPlayer#device:GamePadDeviceNameString
    "diffs":       { "get":   function() { return this._diffValues;    } }, // GamePadPlayer#diffs:Uint8Array
    "values":      { "get":   function() { return this._currentValues; } }, // GamePadPlayer#values:Uint8Array
    "disconnect":  { "value": function() {}                              }, // GamePadPlayer#disconnect():void
});

// --- implements ------------------------------------------
function GamePadPlayer_input() {
    var bytes = this._buffer.subarray(this._bufferCursor,
                                      this._bufferCursor + this._bytes);
    var lastValues = this._currentValues;

    this._currentValues = GamePadDevice.unpack(bytes);
    this._diffValues.set(GamePadDevice.diff(this._currentValues, lastValues));

    this._bufferCursor += this._bytes;
    if (this._bufferCursor >= this._buffer.length) {
        this._bufferCursor = 0;
    }
}

return GamePadPlayer; // return entity

});

