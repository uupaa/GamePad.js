(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
return entity;

})("GamePads", function moduleClosure(global) {
"use strict";

// --- dependency modules ----------------------------------
var Catalog = global["WebModule"]["GamePadCatalog"];
var GamePad = global["WebModule"]["GamePad"];

// --- define / local variables ----------------------------
var PADS = Catalog["PADS"];

// --- class / interfaces ----------------------------------
function GamePads(connect,      // @arg Function = null - connect(player:UINT8):void
                  disconnect) { // @arg Function = null - disconnect(player:UINT8):void
    connect    = connect    || function() {};
    disconnect = disconnect || function() {};

    if (IN_NW || IN_BROWSER) {
        global.addEventListener("gamepadconnected",    _handleEvent);
        global.addEventListener("gamepaddisconnected", _handleEvent);
    }

    var that = this;

    this._connect = 0;
    this[0] = null; // Player I
    this[1] = null; // Player II
    this[2] = null; // Player III
    this[3] = null; // Player IV
    this[4] = null; // reserved

    function _handleEvent(event) {
        var player = event["gamepad"]["index"] || 0; // player index
        var id     = event["gamepad"]["id"]   || "";
        var type   = PADS[id] || "UNKNOWN"; // "NexusPlayer", "FC30", "FC801", "UNKNOWN", ...

        switch (event.type) {
        case "gamepadconnected":
            if (GamePads["VERBOSE"]) {
                console.log("Gamepad connected = " + id + ", player = " + player + ", type = " + type);
            }
            that[player] = new GamePad(event["gamepad"]);
            that._connect++;
            connect(player);
            break;

        case "gamepaddisconnected":
            if (GamePads["VERBOSE"]) {
                console.log("Gamepad disconnected = " + id + ", player = " + player + ", type = " + type);
            }
            if (that[player]) {
                that[player]["disconnect"]();
                that[player] = null;

                that._connect--;
                disconnect(player);
            }
        }
    }
}

GamePads["VERBOSE"] = false;
GamePads["prototype"] = Object.create(GamePads, {
    "constructor": { "value": GamePads                               }, // new GamePads(connect:Function = null, disconnect:Function = null):GamePads
    "active":      { "get":   function() { return !!this._connect; } }, // GamePads#active:Boolean
    "scan":        { "value": GamePads_scan                          }, // GamePads#scan():void
});

// --- implements ------------------------------------------
function GamePads_scan() {
    var pads = navigator["getGamepads"]();

    if (this[0]) { this[0].scan(pads[0]); }
    if (this[1]) { this[1].scan(pads[1]); }
    if (this[2]) { this[2].scan(pads[2]); }
    if (this[3]) { this[3].scan(pads[3]); }
    if (this[4]) { this[4].scan(); }
}

return GamePads; // return entity

});

