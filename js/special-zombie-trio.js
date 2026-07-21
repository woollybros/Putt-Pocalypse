/*
    Special zombie trio.

    Ball chasers hunt and kick the ball, gobblers trap the ball until defeated,
    and king zombies use oversized clubs to launch either the golfer or the ball.
*/
(function () {
    const BALL_CHASER_COOLDOWN = 2.5;
    const BALL_CHASER_KICK_POWER = 6.2;
    const GOBBLER_CAPTURE_SPEED = 0.35;
    const KING_SWING_DURATION = 0.52;
    const KING_IMPACT_TIME = 0.24;
    const KING_SWING_COOLDOWN = 1.9;
    const KING_CLUB_RANGE = 92;
    const KING_BALL_POWER = 13;
    const KING_PLAYER_DAMAGE = 30;
    const KING_PLAYER_KNOCKBACK = 105;

    function configureSpecialZombie(zombie, type) {
        zombie.specialType = type;

        if (type === "ballChaser") {
            zombie.radius = 14;
            zombie.speed = 58;
            zombie.detectionDistance = 270;
            zombie.loseInterestDistance = 405;
            zombie.maximumHealth = 85;
            zombie.health = zombie.maximumHealth;
            zombie.ballChaserCooldown = 0;
            zombie.kickPower = BALL_CHASER_KICK_POWER;
            zombie.attackStrength = 0;
            zombie.clubDropChance = 0;
        }

        if (type === "gobbler") {
            zombie.radius = 25;
            zombie.speed = 0;
            zombie.maximumHealth = 140;
            zombie.health = zombie.maximumHealth;
            zombie.attackStrength = 0;
            zombie.clubDropChance = 0;
            zombie.hasSwallowedBall = false;
        }

        if (type === "king") {
            zombie.radius = 31;
            zombie.speed = 25;
            zombie.detectionDistance = 330;
            zombie.loseInterestDistance = 480;
            zombie.maximumHealth = 300;
            zombie.health = zombie.maximumHealth;
            zombie.attackStrength = 0;
            zombie.clubDropChance = 0;
            zombie.kingSwingCooldown = 0;
            zombie.kingSwingRemaining = 0;
            zombie.kingSwingImpactDone = false;
            zombie.kingSwingTarget = null;
            zombie.kingSwingDirectionX = 1;
            zombie.kingSwingDirectionY = 0;
        }

        return zombie;
    }

    const originalSpawn = Zombies.spawn.bind(Zombies);

    Zombies.spawn = function (x, y, options = {}) {
        const zombie = originalSpawn(x, y, options);

        if (options.specialType) {
            configureSpecialZombie(zombie, options.specialType);
        }

        return zombie;
    };

    function moveZombieToward(zombie, x, y, speed, deltaTime) {
        const offsetX = x - zombie.x;
        const offsetY = y - zombie.y;
        const distance = Math.hypot(offsetX, offsetY);

        if (distance <= 0.001) {
            zombie.velocityX = 0;
            zombie.velocityY = 0;
            return;
        }

        zombie.velocityX = offsetX / distance * speed;
        zombie.velocityY = offsetY / distance * speed;
        zombie.moveWithWallCollisions(deltaTime);
    }

    const originalUpdateMovement = Zombie.prototype.updateMovement;

    Zombie.prototype.updateMovement = function (deltaTime) {
        if (this.specialType === "gobbler") {
            this.isPursuing = false;
            this.velocityX = 0;
            this.velocityY = 0;
            return;
        }

        if (this.specialType === "ballChaser") {
            if (
                this.ballChaserCooldown > 0 ||
                Ball.isSunk ||
                Ball.isCaptured
            ) {
                this.isPursuing = false;
                this.velocityX = 0;
                this.velocityY = 0;
                return;
            }

            const distanceToBall = Math.hypot(
                Ball.x - this.x,
                Ball.y - this.y
            );

            if (distanceToBall <= this.detectionDistance) {
                this.isPursuing = true;
                moveZombieToward(
                    this,
                    Ball.x,
                    Ball.y,
                    this.speed,
                    deltaTime
                );
                return;
            }

            this.isPursuing = false;
            const distanceToCup = Math.hypot(
                Hole.cup.x - this.x,
                Hole.cup.y - this.y
            );

            if (distanceToCup > 165) {
                moveZombieToward(
                    this,
                    Hole.cup.x,
                    Hole.cup.y,
                    this.speed * 0.7,
                    deltaTime
                );
            } else {
                this.velocityX = 0;
                this.velocityY = 0;
            }

            return;
        }

        originalUpdateMovement.call(this, deltaTime);
    };

    function captureBall(gobbler) {
        if (Ball.isCaptured || Ball.isSunk) {
            return;
        }

        Ball.isCaptured = true;
        Ball.capturedBy = gobbler;
        Ball.velocityX = 0;
        Ball.velocityY = 0;
        Ball.isSunk = false;
        gobbler.hasSwallowedBall = true;

        Player.state = "idle";
        Player.pendingShot = null;
        Player.swingElapsed = 0;
        Player.swingHasHitBall = false;

        Pointer.isDown = false;
        Pointer.wasPressed = false;
        Pointer.wasReleased = false;
    }

    function releaseCapturedBall(gobbler) {
        if (!gobbler.hasSwallowedBall || Ball.capturedBy !== gobbler) {
            return;
        }

        gobbler.hasSwallowedBall = false;
        Ball.isCaptured = false;
        Ball.capturedBy = null;
        Ball.x = gobbler.x + gobbler.radius + Ball.radius + 8;
        Ball.y = gobbler.y;
        Ball.velocityX = 0;
        Ball.velocityY = 0;
        Ball.isSunk = false;
        Ball.cupCollisionCooldown = 0;
    }

    function kickBallFromChaser(chaser) {
        let directionX = Ball.x - chaser.x;
        let directionY = Ball.y - chaser.y;
        let distance = Math.hypot(directionX, directionY);

        if (distance <= 0.001) {
            const angle = Math.random() * Math.PI * 2;
            directionX = Math.cos(angle);
            directionY = Math.sin(angle);
            distance = 1;
        }

        const baseAngle = Math.atan2(directionY, directionX);
        const randomAngle = baseAngle + (Math.random() - 0.5) * 0.7;

        Ball.x = chaser.x + Math.cos(randomAngle) *
            (chaser.radius + Ball.radius + 2);
        Ball.y = chaser.y + Math.sin(randomAngle) *
            (chaser.radius + Ball.radius + 2);
        Ball.velocityX = Math.cos(randomAngle) * BALL_CHASER_KICK_POWER;
        Ball.velocityY = Math.sin(randomAngle) * BALL_CHASER_KICK_POWER;
        chaser.ballChaserCooldown = BALL_CHASER_COOLDOWN;
        chaser.velocityX = 0;
        chaser.velocityY = 0;

        AudioManager.play("wallBounce", {
            volume: 0.65,
            playbackRate: 1.18
        });
    }

    const originalHandleBallCollision = Zombie.prototype.handleBallCollision;

    Zombie.prototype.handleBallCollision = function () {
        if (this.specialType === "gobbler") {
            if (this.hasSwallowedBall || Ball.isCaptured || Ball.isSunk) {
                return;
            }

            const distance = Math.hypot(
                Ball.x - this.x,
                Ball.y - this.y
            );
            const ballSpeed = Math.hypot(
                Ball.velocityX,
                Ball.velocityY
            );

            if (
                distance <= this.radius + Ball.radius &&
                ballSpeed >= GOBBLER_CAPTURE_SPEED
            ) {
                captureBall(this);
            }

            return;
        }

        if (this.specialType === "ballChaser") {
            if (
                this.ballChaserCooldown > 0 ||
                Ball.isCaptured ||
                Ball.isSunk
            ) {
                return;
            }

            const distance = Math.hypot(
                Ball.x - this.x,
                Ball.y - this.y
            );

            if (distance <= this.radius + Ball.radius + 3) {
                kickBallFromChaser(this);
            }

            return;
        }

        if (this.specialType === "king") {
            return;
        }

        originalHandleBallCollision.call(this);
    };

    const originalHandlePlayerAttack = Zombie.prototype.handlePlayerAttack;

    Zombie.prototype.handlePlayerAttack = function () {
        if (
            this.specialType === "ballChaser" ||
            this.specialType === "gobbler" ||
            this.specialType === "king"
        ) {
            return;
        }

        originalHandlePlayerAttack.call(this);
    };

    function chooseKingTarget(king) {
        const playerDistance = Player.isDead
            ? Infinity
            : Math.hypot(Player.x - king.x, Player.y - king.y);
        const ballDistance = Ball.isSunk || Ball.isCaptured
            ? Infinity
            : Math.hypot(Ball.x - king.x, Ball.y - king.y);

        if (playerDistance > KING_CLUB_RANGE && ballDistance > KING_CLUB_RANGE) {
            return null;
        }

        return ballDistance <= playerDistance ? "ball" : "player";
    }

    function beginKingSwing(king, target) {
        const targetX = target === "ball" ? Ball.x : Player.x;
        const targetY = target === "ball" ? Ball.y : Player.y;
        let directionX = targetX - king.x;
        let directionY = targetY - king.y;
        const distance = Math.hypot(directionX, directionY) || 1;

        king.kingSwingTarget = target;
        king.kingSwingDirectionX = directionX / distance;
        king.kingSwingDirectionY = directionY / distance;
        king.kingSwingRemaining = KING_SWING_DURATION;
        king.kingSwingImpactDone = false;
        king.kingSwingCooldown = KING_SWING_COOLDOWN;
        king.velocityX = 0;
        king.velocityY = 0;
    }

    function performKingImpact(king) {
        const directionX = king.kingSwingDirectionX;
        const directionY = king.kingSwingDirectionY;

        if (king.kingSwingTarget === "ball" && !Ball.isCaptured && !Ball.isSunk) {
            const distance = Math.hypot(Ball.x - king.x, Ball.y - king.y);

            if (distance <= KING_CLUB_RANGE + Ball.radius + 18) {
                Ball.x = king.x + directionX *
                    (king.radius + Ball.radius + 5);
                Ball.y = king.y + directionY *
                    (king.radius + Ball.radius + 5);
                Ball.velocityX = directionX * KING_BALL_POWER;
                Ball.velocityY = directionY * KING_BALL_POWER;
            }
        }

        if (king.kingSwingTarget === "player" && !Player.isDead) {
            const distance = Math.hypot(Player.x - king.x, Player.y - king.y);

            if (distance <= KING_CLUB_RANGE + Player.radius + 18) {
                const damaged = Player.takeDamage(
                    KING_PLAYER_DAMAGE,
                    king.x,
                    king.y,
                    0.12
                );

                if (damaged) {
                    Player.x += directionX * KING_PLAYER_KNOCKBACK;
                    Player.y += directionY * KING_PLAYER_KNOCKBACK;
                }
            }
        }

        AudioManager.play("wallBounce", {
            volume: 0.85,
            playbackRate: 0.72
        });
    }

    const originalZombieUpdate = Zombie.prototype.update;

    Zombie.prototype.update = function (deltaTime) {
        if (this.ballChaserCooldown > 0) {
            this.ballChaserCooldown = Math.max(
                0,
                this.ballChaserCooldown - deltaTime
            );
        }

        if (this.kingSwingCooldown > 0) {
            this.kingSwingCooldown = Math.max(
                0,
                this.kingSwingCooldown - deltaTime
            );
        }

        originalZombieUpdate.call(this, deltaTime);

        if (this.specialType !== "king" || this.stunRemaining > 0) {
            return;
        }

        if (this.kingSwingRemaining > 0) {
            this.kingSwingRemaining = Math.max(
                0,
                this.kingSwingRemaining - deltaTime
            );
            this.velocityX = 0;
            this.velocityY = 0;

            if (
                !this.kingSwingImpactDone &&
                this.kingSwingRemaining <= KING_IMPACT_TIME
            ) {
                this.kingSwingImpactDone = true;
                performKingImpact(this);
            }

            return;
        }

        if (this.kingSwingCooldown <= 0) {
            const target = chooseKingTarget(this);

            if (target) {
                beginKingSwing(this, target);
            }
        }
    };

    const originalTakeClubHit = Zombie.prototype.takeClubHit;

    Zombie.prototype.takeClubHit = function (...args) {
        originalTakeClubHit.apply(this, args);

        if (
            this.specialType === "gobbler" &&
            this.health <= 0
        ) {
            releaseCapturedBall(this);
        }
    };

    Ball.isCaptured = false;
    Ball.capturedBy = null;

    const originalBallUpdate = Ball.update.bind(Ball);

    Ball.update = function (...args) {
        if (this.isCaptured && this.capturedBy) {
            this.x = this.capturedBy.x;
            this.y = this.capturedBy.y;
            this.velocityX = 0;
            this.velocityY = 0;
            return;
        }

        originalBallUpdate(...args);
    };

    const originalBallDraw = Ball.draw.bind(Ball);

    Ball.draw = function () {
        if (this.isCaptured) {
            return;
        }

        originalBallDraw();
    };

    const originalHandlePuttingStart = Player.handlePuttingStart.bind(Player);

    Player.handlePuttingStart = function () {
        if (Ball.isCaptured) {
            return;
        }

        originalHandlePuttingStart();
    };

    function drawHealthBar(zombie, width, verticalOffset) {
        const ratio = Math.max(
            0,
            Math.min(1, zombie.health / zombie.maximumHealth)
        );
        const x = zombie.x - width / 2;
        const y = zombie.y - verticalOffset;

        ctx.save();
        ctx.fillStyle = "rgba(35,0,0,0.85)";
        ctx.fillRect(x, y, width, 6);
        ctx.fillStyle = ratio > 0.5 ? "#79bd59" : "#d9534f";
        ctx.fillRect(x, y, width * ratio, 6);
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.strokeRect(x, y, width, 6);
        ctx.restore();
    }

    function drawGobbler(gobbler) {
        ctx.save();

        if (gobbler.clubHitFlash > 0) {
            ctx.fillStyle = "rgba(255,240,150,0.55)";
            ctx.beginPath();
            ctx.ellipse(
                gobbler.x,
                gobbler.y + 5,
                gobbler.radius + 9,
                gobbler.radius * 0.85,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        ctx.fillStyle = "#758b45";
        ctx.beginPath();
        ctx.ellipse(
            gobbler.x,
            gobbler.y + 7,
            gobbler.radius + 6,
            gobbler.radius * 0.72,
            0,
            Math.PI,
            Math.PI * 2
        );
        ctx.lineTo(gobbler.x + gobbler.radius + 6, gobbler.y + 16);
        ctx.lineTo(gobbler.x - gobbler.radius - 6, gobbler.y + 16);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#35452a";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = "#fff2b1";
        ctx.beginPath();
        ctx.arc(gobbler.x - 9, gobbler.y - 4, 3, 0, Math.PI * 2);
        ctx.arc(gobbler.x + 9, gobbler.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();

        if (gobbler.hasSwallowedBall) {
            ctx.fillStyle = "#91a95b";
            ctx.beginPath();
            ctx.arc(gobbler.x - 15, gobbler.y + 7, 9, 0, Math.PI * 2);
            ctx.arc(gobbler.x + 15, gobbler.y + 7, 9, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#2d251d";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(gobbler.x - 10, gobbler.y + 9);
            ctx.quadraticCurveTo(
                gobbler.x,
                gobbler.y + 14,
                gobbler.x + 10,
                gobbler.y + 9
            );
            ctx.stroke();
        } else {
            ctx.fillStyle = "#201412";
            ctx.beginPath();
            ctx.ellipse(
                gobbler.x,
                gobbler.y + 10,
                17,
                10,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.fillStyle = "#a54a53";
            ctx.beginPath();
            ctx.ellipse(
                gobbler.x,
                gobbler.y + 14,
                10,
                4,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        ctx.restore();
        drawHealthBar(gobbler, 44, gobbler.radius + 18);
    }

    function drawBallChaserMarker(zombie) {
        ctx.save();
        ctx.strokeStyle = "rgba(80,190,255,0.9)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(zombie.x, zombie.y, zombie.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#eaf8ff";
        ctx.beginPath();
        ctx.arc(zombie.x, zombie.y - zombie.radius - 18, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#5abbe8";
        ctx.stroke();
        ctx.restore();
    }

    function drawKingDetails(king) {
        const swingProgress = king.kingSwingRemaining > 0
            ? 1 - king.kingSwingRemaining / KING_SWING_DURATION
            : 0;
        const baseAngle = Math.atan2(
            king.kingSwingDirectionY,
            king.kingSwingDirectionX
        );
        const clubAngle = king.kingSwingRemaining > 0
            ? baseAngle - 1.65 + swingProgress * 3.3
            : baseAngle - 0.8;
        const gripX = king.x + Math.cos(baseAngle) * 10;
        const gripY = king.y + 5 + Math.sin(baseAngle) * 10;
        const clubX = gripX + Math.cos(clubAngle) * 62;
        const clubY = gripY + Math.sin(clubAngle) * 62;
        const normalX = -Math.sin(clubAngle);
        const normalY = Math.cos(clubAngle);

        ctx.save();

        ctx.fillStyle = "#d8b33f";
        ctx.beginPath();
        ctx.moveTo(king.x - 20, king.y - king.radius + 4);
        ctx.lineTo(king.x - 13, king.y - king.radius - 17);
        ctx.lineTo(king.x - 3, king.y - king.radius - 6);
        ctx.lineTo(king.x + 8, king.y - king.radius - 19);
        ctx.lineTo(king.x + 19, king.y - king.radius + 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#765814";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(gripX, gripY);
        ctx.lineTo(clubX, clubY);
        ctx.strokeStyle = "#bcc2c7";
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(clubX - normalX * 12, clubY - normalY * 12);
        ctx.lineTo(clubX + normalX * 12, clubY + normalY * 12);
        ctx.strokeStyle = "#454b50";
        ctx.lineWidth = 11;
        ctx.stroke();

        ctx.restore();
    }

    const originalZombieDraw = Zombie.prototype.draw;

    Zombie.prototype.draw = function () {
        if (this.specialType === "gobbler") {
            drawGobbler(this);
            return;
        }

        originalZombieDraw.call(this);

        if (this.specialType === "ballChaser") {
            drawBallChaserMarker(this);
        }

        if (this.specialType === "king") {
            drawKingDetails(this);
        }
    };

    function spawnSpecial(type, x, y) {
        return Zombies.spawn(x, y, {
            specialType: type
        });
    }

    const originalLoadZombiesForCurrentHole = loadZombiesForCurrentHole;

    loadZombiesForCurrentHole = function () {
        originalLoadZombiesForCurrentHole();

        switch (Hole.number) {
            case 3:
                spawnSpecial(
                    "ballChaser",
                    Hole.tee.x + (Hole.cup.x - Hole.tee.x) * 0.62,
                    Hole.tee.y - 62
                );
                break;

            case 4:
                spawnSpecial(
                    "gobbler",
                    Hole.tee.x + (Hole.cup.x - Hole.tee.x) * 0.58,
                    Hole.tee.y + 65
                );
                break;

            case 5:
                spawnSpecial(
                    "ballChaser",
                    Hole.tee.x + (Hole.cup.x - Hole.tee.x) * 0.42,
                    Hole.tee.y - 75
                );
                spawnSpecial(
                    "gobbler",
                    Hole.tee.x + (Hole.cup.x - Hole.tee.x) * 0.72,
                    Hole.tee.y + 80
                );
                break;

            case 6:
                spawnSpecial("ballChaser", 535, 415);
                spawnSpecial("king", 810, 210);
                break;

            case 7:
                spawnSpecial("ballChaser", 660, 300);
                spawnSpecial("gobbler", 820, 390);
                spawnSpecial("king", 820, 205);
                break;
        }
    };

    const originalResetHole = window.resetHole;

    window.resetHole = function (...args) {
        if (Ball.capturedBy) {
            Ball.capturedBy.hasSwallowedBall = false;
        }

        Ball.isCaptured = false;
        Ball.capturedBy = null;
        return originalResetHole.apply(this, args);
    };
})();