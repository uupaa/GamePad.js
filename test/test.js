var ctx = document.getElementById("canvas").getContext("2d");

var players = [{
        x:  100.0,
        y:  175.0,
        velocity: { x: 0.0, y: 0.0 },
        highJump: -12.0, // 大ジャンプの到達点
        lowJump:  -4.0,  // 小ジャンプの高さ
        onGround: false  // 地面に接しているか
    }, {
        x:  100.0,
        y:  175.0,
        velocity: { x: 0.0, y: 0.0 },
        highJump: -12.0, // 大ジャンプの到達点
        lowJump:  -4.0,  // 小ジャンプの高さ
        onGround: false  // 地面に接しているか
    }, {
        x:  100.0,
        y:  175.0,
        velocity: { x: 0.0, y: 0.0 },
        highJump: -12.0, // 大ジャンプの到達点
        lowJump:  -4.0,  // 小ジャンプの高さ
        onGround: false  // 地面に接しているか
    }, {
        x:  100.0,
        y:  175.0,
        velocity: { x: 0.0, y: 0.0 },
        highJump: -12.0, // 大ジャンプの到達点
        lowJump:  -4.0,  // 小ジャンプの高さ
        onGround: false  // 地面に接しているか
    }, {
        x:  100.0,
        y:  175.0,
        velocity: { x: 0.0, y: 0.0 },
        highJump: -12.0, // 大ジャンプの到達点
        lowJump:  -4.0,  // 小ジャンプの高さ
        onGround: false  // 地面に接しているか
    }];

var scene = {
        gravity: { x: 0.0, y: 0.5 }
    };


//GamePad.VERBOSE = true;
//GamePadDevice.VERBOSE = true;

var keyBuffer       = new Uint8Array(5 * 10 * 60 * 60); // 5byte * 10min * 60sec * 60frame = 175KB
var keyBufferCursor = 0;
var keyBufferBytes  = 5;

function _addKeyBuffer(pad) {
    keyBuffer.set(GamePadDevice.pack(pad.current), keyBufferCursor);
    keyBufferCursor += keyBufferBytes;

    if (keyBufferCursor >= keyBuffer.length) {
        keyBufferCursor = 0;
    }
}

var pad = new GamePad(function connect(player) {
        if (player === 0) {
            if (!pad[4]) {
                setTimeout(function() {
                    // add Controller I tracer
                    pad[4] = new GamePadPlayer(keyBuffer, keyBufferBytes);
                }, 3000);
            }
        }
    }, function disconnect(player) {
        //
    });

gameLoop();
function gameLoop() {
    if (pad.connected) {
        pad.input();
        if (pad[0]) { move(players[0], pad[0]); _addKeyBuffer(pad[0]); }
        if (pad[1]) { move(players[1], pad[1]); }
        if (pad[2]) { move(players[2], pad[2]); }
        if (pad[3]) { move(players[3], pad[3]); }
        if (pad[4]) { move(players[4], pad[4]); }
    }

    update(players[0]);
    update(players[1]);
    update(players[2]);
    update(players[3]);
    update(players[4]);

    render();
    requestAnimationFrame(gameLoop);
}

function move(player, pad) {
    var curt = pad.current; // current value. Uint8Array
    var diff = pad.changed; // value was changed. Uint8Array

    // --- B DASH ---
    var dash  = curt[PAD_KEY_B] || curt[PAD_KEY_X];
    var speed = dash ? 1.5 : 1; // ダッシュ中は普段の1.5倍速で動作可能

    // --- A Jump ---
    if (diff[PAD_KEY_A] || diff[PAD_KEY_Y]) { // change jump button state
        if (curt[PAD_KEY_A] || curt[PAD_KEY_Y]) {
            _startJump(player, speed); // A OFF -> ON
        } else {
            _endJump(player);          // A ON -> OFF
        }
    }
    // --- MOVE LEFT OR RIGHT ---
    if (curt[PAD_KEY_L]) {
        player.velocity.x -= 2 * speed;
        if (player.velocity.x <= -4 * speed) {
            player.velocity.x  = -4 * speed;
        }
    } else if (curt[PAD_KEY_R]) {
        player.velocity.x += 2 * speed;
        if (player.velocity.x >= 4 * speed) {
            player.velocity.x  = 4 * speed;
        }
    }

    function _startJump(player, speed) {
        if (player.onGround) {
            player.onGround = false;
            player.velocity.y = player.highJump * speed;
        }
    }
    function _endJump(player) {
        if (player.velocity.y < player.lowJump) { // 一瞬だけ押された場合は、小ジャンプに
            player.velocity.y = player.lowJump;
        }
    }
}

function update(player) {
    player.velocity.x += scene.gravity.x; // 重力方向に速度を加速
    player.velocity.y += scene.gravity.y; // 重力方向に速度を加速
    player.y += player.velocity.y;        // 座標に速度を加算
    player.x += player.velocity.x;        // 座標に速度を加算

    if (player.y > 175.0) { // 地面との接触
        player.y = 175.0;
        player.velocity.y = 0.0;
        player.onGround = true;
    }
    if (player.onGround) { // 地面の摩擦
        if (player.velocity.x >= 0) {
            player.velocity.x >>= 1;
        } else {
            player.velocity.x = -(-player.velocity.x >> 1); // 負の値は反転してからビットシフト
        }
    }
}

function render() {
    ctx.clearRect(0, 0, 800, 200);

    ctx.beginPath();
    ctx.moveTo(0,175);
    ctx.lineTo(800,175);
    ctx.strokeStyle = "black";
    ctx.stroke();

    // player 1
    ctx.strokeStyle = "blue";
    ctx.strokeRect(players[0].x - 10, players[0].y - 20, 20, 20);

    // player 2
    ctx.strokeStyle = "red";
    ctx.strokeRect(players[1].x - 10, players[1].y - 20, 20, 20);

    // player 3
    ctx.strokeStyle = "pink";
    ctx.strokeRect(players[2].x - 10, players[2].y - 20, 20, 20);

    // player 4
    ctx.strokeStyle = "yellow";
    ctx.strokeRect(players[3].x - 10, players[3].y - 20, 20, 20);

    // tracer
    ctx.fillStyle = "black";
    ctx.fillRect(players[4].x - 10, players[4].y - 20, 20, 20);
}

