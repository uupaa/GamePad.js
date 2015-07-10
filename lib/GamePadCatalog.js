(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
return entity;

})("GamePadCatalog", function moduleClosure() {
"use strict";

var PADS = {
    // IDENT                                                                         TYPE
    "ASUS Gamepad (Vendor: 0b05 Product: 4500)":                                    "NexusPlayer",
    "8Bitdo FC30 GamePad (Vendor: 0000 Product: 0000)":                             "FC30",
    "BUFFALO BGC-FC801 USB Gamepad (Vendor: 0411 Product: 00c6)":                   "FC801",
    "USB,2-axis 8-button gamepad   (STANDARD GAMEPAD Vendor: 0583 Product: 2060)":  "SFC801",
};

return {
    "PADS": PADS,
};

});

