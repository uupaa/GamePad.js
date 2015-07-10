# GamePad.js [![Build Status](https://travis-ci.org/uupaa/GamePad.js.svg)](https://travis-ci.org/uupaa/GamePad.js)

[![npm](https://nodei.co/npm/uupaa.gamepad.js.svg?downloads=true&stars=true)](https://nodei.co/npm/uupaa.gamepad.js/)

Easy way to using GamePad API.

- Please refer to [Spec](https://github.com/uupaa/GamePad.js/wiki/) and [API Spec](https://github.com/uupaa/GamePad.js/wiki/GamePad) links.
- [MultiGamePad demo](http://uupaa.github.io/Examples/demo/GamePad.js/test/index.html)
- The GamePad.js is made of [WebModule](https://github.com/uupaa/WebModule).

## Browser and NW.js(node-webkit)

```js
<script src="<module-dir>/lib/WebModule.js"></script>
<script src="<module-dir>/lib/GamePadCatalog.js"></script>
<script src="<module-dir>/lib/GamePadConnector.js"></script>
<script src="<module-dir>/lib/GamePad.js"></script>
<script>
GamePads.VERBOSE = true;

var players = [{ ... }, { ... }];

var pads = new GamePads();

function gameLoop() {
    if (pads.active) {
        pads.scan();

        if (pads[0]) {
            input(pads[0].value, pads[0].edge);
        }
        if (pads[1]) {
            input(pads[1].value, pads[1].edge);
        }
    }
    update();
    render();
    requestAnimationFrame(gameLoop);
}
gameLoop();


function input(curt, edge) {
    // --- Jump ---
    if (edge.A) {
        if (curt.A) {  // A BUTTON OFF -> ON
            startJump(...);
        } else {       // A BUTTON ON -> OFF
            endJump(...);
        }
    }

    // --- D-PAD ---
    if (curt.L) {
        moveLeft(...);
    } else if (curt.R) {
        moveRight(...);
    }
}

</script>
```


