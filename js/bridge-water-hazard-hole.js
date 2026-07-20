/*
    Bridge water-hazard hole.

    Adds a new course layout where the ball must cross a narrow bridge. A ball
    that enters the surrounding water returns to the tee and receives one
    penalty stroke in addition to the stroke used to hit it.
*/
(function () {
    const WATER_PENALTY_STROKES = 1;
    const PENALTY_MESSAGE_DURATION = 1.6;

    HoleLayouts.push({
        name: "Dead Man's Crossing",
        par: 4,

        tee: {
            x: 465,
            y: 300
        },

        cup: {
            x: 825,
            y: 300,
            radius: 11
        },

        waterHazard: {
            x: 595,
            y: 145,
            width: 155,
            height: 310
        },

        bridge: {
            x: 580,
            y: 272,
            width: 185,
            height: 56
        },

        walls: [
            // Outer course boundary.
            {
                x: 395,
                y: 125,
                width: 500,
                height: 20,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },
            {
                x: 395,
                y: 455,
                width: 500,
                height: 20,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },
            {
                x: 395,
                y: 125,
                width: 20,
                height: 350,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },
            {
                x: 875,
                y: 125,
                width: 20,
                height: 350,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Approach bumpers make lining up the bridge a deliberate shot.
            {
                x: 530,
                y: 145,
                width: 22,
                height: 105,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },
            {
                x: 530,
                y: 350,
                width: 22,
                height: 105,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Exit-side bumpers punish a poorly aligned crossing.
            {
                x: 790,
                y: 145,
                width: 22,
                height: 105,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },
            {
                x: 790,
                y: 350,
                width: 22,
                height: 105,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            }
        ]
    });

    Hole.waterHazard = null;
    Hole.bridge = null;

    const originalHoleLoad = Hole.load.bind(Hole);

    Hole.load = function (index) {
        const loaded = originalHoleLoad(index);

        if (!loaded) {
            return false;
        }

        const layout = HoleLayouts[index];

        this.waterHazard = layout.waterHazard
            ? { ...layout.waterHazard }
            : null;

        this.bridge = layout.bridge
            ? { ...layout.bridge }
            : null;

        return true;
    };

    // Refresh the already-loaded hole through the extended loader.
    Hole.load(Hole.currentIndex);

    let penaltyMessageRemaining = 0;

    function drawWaterAndBridge() {
        if (!Hole.waterHazard || !Hole.bridge) {
            return;
        }

        const water = Hole.waterHazard;
        const bridge = Hole.bridge;

        ctx.save();

        // Water body and subtle horizontal ripples.
        ctx.fillStyle = "#247e9c";
        ctx.fillRect(water.x, water.y, water.width, water.height);

        ctx.strokeStyle = "rgba(190, 238, 255, 0.38)";
        ctx.lineWidth = 2;

        for (let y = water.y + 18; y < water.y + water.height; y += 24) {
            ctx.beginPath();
            ctx.moveTo(water.x + 10, y);
            ctx.lineTo(water.x + water.width - 10, y);
            ctx.stroke();
        }

        ctx.strokeStyle = "#155368";
        ctx.lineWidth = 3;
        ctx.strokeRect(water.x, water.y, water.width, water.height);

        // Wooden bridge deck.
        ctx.fillStyle = "#9a6b3f";
        ctx.fillRect(bridge.x, bridge.y, bridge.width, bridge.height);

        ctx.strokeStyle = "#4d321f";
        ctx.lineWidth = 3;
        ctx.strokeRect(bridge.x, bridge.y, bridge.width, bridge.height);

        ctx.strokeStyle = "rgba(55, 32, 17, 0.65)";
        ctx.lineWidth = 2;

        for (let x = bridge.x + 10; x < bridge.x + bridge.width; x += 16) {
            ctx.beginPath();
            ctx.moveTo(x, bridge.y + 3);
            ctx.lineTo(x, bridge.y + bridge.height - 3);
            ctx.stroke();
        }

        // Bridge edge rails are visual only, so an inaccurate ball can fall in.
        ctx.strokeStyle = "#d0a66f";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(bridge.x, bridge.y + 3);
        ctx.lineTo(bridge.x + bridge.width, bridge.y + 3);
        ctx.moveTo(bridge.x, bridge.y + bridge.height - 3);
        ctx.lineTo(bridge.x + bridge.width, bridge.y + bridge.height - 3);
        ctx.stroke();

        ctx.restore();
    }

    function drawPenaltyMessage() {
        if (penaltyMessageRemaining <= 0) {
            return;
        }

        ctx.save();
        ctx.fillStyle = "rgba(15, 35, 45, 0.88)";
        ctx.fillRect(canvas.width / 2 - 125, 82, 250, 56);
        ctx.strokeStyle = "#b9ecff";
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width / 2 - 125, 82, 250, 56);
        ctx.fillStyle = "white";
        ctx.font = "bold 19px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Water Hazard — +1 Stroke", canvas.width / 2, 116);
        ctx.restore();
    }

    const originalHoleDraw = Hole.draw.bind(Hole);

    Hole.draw = function () {
        drawWaterAndBridge();
        originalHoleDraw();
        drawPenaltyMessage();
    };

    function circleTouchesRectangle(circleX, circleY, radius, rectangle) {
        const closestX = Math.max(
            rectangle.x,
            Math.min(circleX, rectangle.x + rectangle.width)
        );

        const closestY = Math.max(
            rectangle.y,
            Math.min(circleY, rectangle.y + rectangle.height)
        );

        const offsetX = circleX - closestX;
        const offsetY = circleY - closestY;

        return offsetX * offsetX + offsetY * offsetY < radius * radius;
    }

    function ballIsSafelyOnBridge() {
        const bridge = Hole.bridge;

        if (!bridge) {
            return false;
        }

        return (
            Ball.x >= bridge.x &&
            Ball.x <= bridge.x + bridge.width &&
            Ball.y - Ball.radius >= bridge.y &&
            Ball.y + Ball.radius <= bridge.y + bridge.height
        );
    }

    function applyWaterPenalty() {
        GameState.currentHoleStrokes += WATER_PENALTY_STROKES;

        Ball.x = Hole.tee.x;
        Ball.y = Hole.tee.y;
        Ball.velocityX = 0;
        Ball.velocityY = 0;
        Ball.isSunk = false;
        Ball.cupCollisionCooldown = 0;

        Player.state = "idle";
        Player.pendingShot = null;
        Player.swingElapsed = 0;
        Player.swingHasHitBall = false;

        Pointer.isDown = false;
        Pointer.wasPressed = false;
        Pointer.wasReleased = false;

        penaltyMessageRemaining = PENALTY_MESSAGE_DURATION;
        AudioManager.play("wallBounce");
    }

    const originalBallUpdate = Ball.update.bind(Ball);

    Ball.update = function (...args) {
        originalBallUpdate(...args);

        if (
            Hole.waterHazard &&
            !this.isSunk &&
            circleTouchesRectangle(this.x, this.y, this.radius, Hole.waterHazard) &&
            !ballIsSafelyOnBridge()
        ) {
            applyWaterPenalty();
        }
    };

    const originalGameUpdate = update;

    update = function (deltaTime) {
        originalGameUpdate(deltaTime);

        if (penaltyMessageRemaining > 0) {
            penaltyMessageRemaining = Math.max(
                0,
                penaltyMessageRemaining - deltaTime
            );
        }
    };
})();