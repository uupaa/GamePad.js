var ModuleTestGamePad = (function(global) {

global["BENCHMARK"] = false;

var test = new Test("GamePad", {
        disable:    false, // disable all tests.
        browser:    true,  // enable browser test.
        worker:     true,  // enable worker test.
        node:       true,  // enable node test.
        nw:         true,  // enable nw.js test.
        el:         true,  // enable electron (render process) test.
        button:     true,  // show button.
        both:       true,  // test the primary and secondary modules.
        ignoreError:false, // ignore error.
        callback:   function() {
        },
        errorback:  function(error) {
            console.error(error.message);
        }
    }).add([
    ]);

if (IN_BROWSER || IN_NW || IN_EL) {
    test.add([
        testGamePad_GamePadID,
    ]);
} else if (IN_WORKER) {
    test.add([
        // WebWorkers test
    ]);
} else if (IN_NODE) {
    test.add([
        // Node.js test
    ]);
}

// --- test cases ------------------------------------------
function testGamePad_GamePadID(test, pass, miss) {
    test.done(pass());
}

return test.run();

})(GLOBAL);

