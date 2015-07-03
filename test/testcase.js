var ModuleTestGamePad = (function(global) {

global["BENCHMARK"] = false;

var test = new Test("GamePad", {
        disable:    false, // disable all tests.
        browser:    true,  // enable browser test.
        worker:     true,  // enable worker test.
        node:       true,  // enable node test.
        nw:         true,  // enable nw.js test.
        button:     true,  // show button.
        both:       true,  // test the primary and secondary modules.
        ignoreError:false, // ignore error.
        callback:   function() {
        },
        errorback:  function(error) {
        }
    }).add([
    ]);

if (IN_BROWSER || IN_NW) {
    test.add([
        testGamePad_GamePadID,
    ]);
} else if (IN_WORKER) {
    test.add([
        // worker test
    ]);
} else if (IN_NODE) {
    test.add([
        // node.js and io.js test
    ]);
}

// --- test cases ------------------------------------------
function testGamePad_GamePadID(test, pass, miss) {
    test.done(pass());
}

return test.run();

})(GLOBAL);

