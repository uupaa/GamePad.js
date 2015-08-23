# GamePad.js [![Build Status](https://travis-ci.org/uupaa/GamePad.js.svg)](https://travis-ci.org/uupaa/GamePad.js)

[![npm](https://nodei.co/npm/uupaa.gamepad.js.svg?downloads=true&stars=true)](https://nodei.co/npm/uupaa.gamepad.js/)

Easy way to using GamePad API.


This module made of [WebModule](https://github.com/uupaa/WebModule).

## Documentation
- [Spec](https://github.com/uupaa/GamePad.js/wiki/)
- [API Spec](https://github.com/uupaa/GamePad.js/wiki/GamePad)

## Browser, NW.js and Electron

```js
<script src="<module-dir>/lib/WebModule.js"></script>
<script src="<module-dir>/lib/GamePadDevice.js"></script>
<script src="<module-dir>/lib/GamePad.js"></script>
<script>
GamePads.VERBOSE = true;

var players = [{ ... }, { ... }];

var pads = new GamePads();

function gameLoop() {
    if (pads.connected) {
        pads.input();

        if (pads[0]) {
            input(pads[0].values, pads[0].diffs);
        }
        if (pads[1]) {
            input(pads[1].values, pads[1].diffs);
        }
    }
    update();
    render();
    requestAnimationFrame(gameLoop);
}
gameLoop();


function input(current, diffs) {
    // --- Jump ---
    if (diffs[GAMEPAD_KEY_A]) {
        if (current[GAMEPAD_KEY_A]) {  // A BUTTON OFF -> ON
            startJump(...);
        } else {       // A BUTTON ON -> OFF
            endJump(...);
        }
    }

    // --- D-PAD ---
    if (current[GAMEPAD_KEY_L]) {
        moveLeft(...);
    } else if (current[GAMEPAD_KEY_R]) {
        moveRight(...);
    }
}

</script>
```


