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

var pads = GamePads);

function gameLoop() {
    pads.scan();
    if (pads[0]) {
        input(pads[0].value, pads[0].edge);
    }
    update();
    render();
    requestAnimationFrame(gameLoop);
}
gameLoop();


function input(curt, edge) {
    // --- B DASH ---
    var dash  = curt.X || curt.B;
    var ratio = dash ? 1.5 : 1; // x1.5 move

    // --- Jump ---
    if (edge.A) {
        if (curt.A) {  // A BUTTON OFF -> ON
            startJump();
        } else {       // A BUTTON ON -> OFF
            endJump();
        }
    }


    // --- D-PAD ---
    if (curt.L) {
        player.velocity.x -= 2 * ratio;
        if (player.velocity.x <= -4 * ratio) {
            player.velocity.x  = -4 * ratio;
        }
    } else if (curt.R) {
        player.velocity.x += 2 * ratio;
        if (player.velocity.x >= 4 * ratio) {
            player.velocity.x  = 4 * ratio;
        }
    }
}

</script>
```


