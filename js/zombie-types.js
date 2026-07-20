/*
    Specialized zombie variants and late-hole population tuning.

    Fast zombies pressure the golfer directly, ball chasers prioritize the ball,
    and king zombies carry a club that can launch the ball with extreme force.
*/
(function () {
    const TYPES = {
        STANDARD: "standard",
        FAST: "fast",
        BALL_CHASER: "ballChaser",
        KING: "king"
    };

    const KING_SMASH_RANGE = 58;
    const KING_SMASH_POWER = 15;
    const KING_SMASH_COOLDOWN = 1.8;
    const KING_SWING_DURATION = 0.38;

    function applyZombieType(zombie, type) {
        zombie.zombieType = type || TYPES.STANDARD;

        if (zombie.zombieType === TYPES.FAST) {
            zombie.radius = 12;
            zombie.speed = Math.max(zombie.speed, 88);
            zombie.detectionDistance = Math.max(zombie.detectionDistance, 330);
            zombie.loseInterestDistance = Math.max(zombie.loseInterestDistance, 500);
            zombie.attackStrength = Math.max(zombie.attackStrength, 11);
            zombie.attackCooldownDuration = Math.min(zombie.attackCooldownDuration, 0.8);
            zombie.clubDropChance = Math.max(zombie.clubDropChance, 0.18);
            zombie.variantMaximumHealth = 75;
        }

        if (zombie.zombieType === TYPES.BALL_CHASER) {
            zombie.radius = 14;
            zombie.speed = Math.max(zombie.speed, 62);
            zombie.detectionDistance = Math.max(zombie.detectionDistance, 260);
            zombie.loseInterestDistance = Math.max(zombie.loseInterestDistance, 430);
            zombie.kickPower = Math.max(zombie.kickPower, 6.5);
            zombie.variantMaximumHealth = 100;
        }

        if (zombie.zombieType === TYPES.KING) {
            zombie.radius = 22;
            zombie.speed = Math.max(zombie.speed, 38);
            zombie.detectionDistance = Math.max(zombie.detectionDistance, 310);
            zombie.loseInterestDistance = Math.max(zombie.loseInterestDistance, 520);
            zombie.attackStrength = Math.max(zombie.attackStrength, 24);
            zombie.attackReach = Math.max(zombie.attackReach, 9);
            zombie.clubDropChance = Math.max(zombie.clubDropChance, 0.4);
            zombie.variantMaximumHealth = 200;
            zombie.kingSmashCooldown = 0;
            zombie.kingSwingRemaining = 0;
            zombie.kingSwingAngle = 0;
        }

        if (typeof zombie.ensureCombatStats === "function") {
            zombie.ensureCombatStats();

            if (typeof zombie.variantMaximumHealth === "number") {
                zombie.maximumHealth = zombie.variantMaximumHealth;
                zombie.health = zombie.maximumHealth;
            }
        }

        return zombie;
    }

    const originalSpawn = Zombies.spawn.bind(Zombies);

    Zombies.spawn = function (x, y, options = {}) {
        const zombie = originalSpawn(x, y, options);
        return applyZombieType(zombie, options.zombieType || TYPES.STANDARD);
    };

    /*
        The existing respawn system reconstructs zombies from their combat stats.
        Capture defeated variant types before it runs, then apply those types to the
        replacements that are appended during the same update.
    */
    const originalZombiesUpdate = Zombies.update.bind(Zombies);

    Zombies.update = function (deltaTime) {
        const defeatedTypes = this.items
            .filter(zombie =>
                typeof zombie.health === "number" && zombie.health <= 0
            )
            .map(zombie => zombie.zombieType || TYPES.STANDARD);

        const zombiesBeforeUpdate = new Set(this.items);
        originalZombiesUpdate(deltaTime);

        const replacements = this.items.filter(zombie =>
            !zombiesBeforeUpdate.has(zombie)
        );

        for (let index = 0; index < replacements.length; index++) {
            applyZombieType(
                replacements[index],
                defeatedTypes[index] || TYPES.STANDARD
            );
        }
    };

    const originalUpdateMovement = Zombie.prototype.updateMovement;

    Zombie.prototype.updateMovement = function (deltaTime) {
        if (
            this.zombieType !== TYPES.BALL_CHASER ||
            this.stunRemaining > 0 ||
            Ball.isSunk
        ) {
            originalUpdateMovement.call(this, deltaTime);
            return;
        }

        const offsetX = Ball.x - this.x;
        const offsetY = Ball.y - this.y;
        const distanceToBall = Math.hypot(offsetX, offsetY);

        if (distanceToBall <= this.radius + Ball.radius + 3) {
            this.velocityX = 0;
            this.velocityY = 0;
            return;
        }

        this.isPursuing = false;
        this.velocityX = offsetX / distanceToBall * this.speed;
        this.velocityY = offsetY / distanceToBall * this.speed;
        this.moveWithWallCollisions(deltaTime);
    };

    const originalZombieUpdate = Zombie.prototype.update;

    Zombie.prototype.update = function (deltaTime) {
        if (this.zombieType === TYPES.KING) {
            this.kingSmashCooldown = Math.max(
                0,
                (this.kingSmashCooldown || 0) - deltaTime
            );

            this.kingSwingRemaining = Math.max(
                0,
                (this.kingSwingRemaining || 0) - deltaTime
            );
        }

        originalZombieUpdate.call(this, deltaTime);
    };

    function kingCanSmashBall(zombie) {
        if (
            zombie.zombieType !== TYPES.KING ||
            zombie.stunRemaining > 0 ||
            zombie.kingSmashCooldown > 0 ||
            Ball.isSunk
        ) {
            return false;
        }

        return Math.hypot(Ball.x - zombie.x, Ball.y - zombie.y) <=
            KING_SMASH_RANGE + Ball.radius;
    }

    function smashBall(zombie) {
        let directionX = Ball.x - zombie.x;
        let directionY = Ball.y - zombie.y;
        let directionLength = Math.hypot(directionX, directionY);

        if (directionLength < 0.001) {
            const randomAngle = Math.random() * Math.PI * 2;
            directionX = Math.cos(randomAngle);
            directionY = Math.sin(randomAngle);
            directionLength = 1;
        }

        const baseAngle = Math.atan2(directionY, directionX);
        const spread = (Math.random() - 0.5) * 0.34;
        const launchAngle = baseAngle + spread;

        Ball.velocityX = Math.cos(launchAngle) * KING_SMASH_POWER;
        Ball.velocityY = Math.sin(launchAngle) * KING_SMASH_POWER;
        Ball.cupCollisionCooldown = Math.max(Ball.cupCollisionCooldown, 8);

        zombie.kingSmashCooldown = KING_SMASH_COOLDOWN;
        zombie.kingSwingRemaining = KING_SWING_DURATION;
        zombie.kingSwingAngle = launchAngle;
        zombie.velocityX = 0;
        zombie.velocityY = 0;

        AudioManager.play("wallBounce", {
            volume: 0.9,
            playbackRate: 0.72
        });
    }

    const originalHandleBallCollision = Zombie.prototype.handleBallCollision;

    Zombie.prototype.handleBallCollision = function () {
        if (kingCanSmashBall(this)) {
            smashBall(this);
            return;
        }

        originalHandleBallCollision.call(this);
    };

    const originalZombieDraw = Zombie.prototype.draw;

    Zombie.prototype.draw = function () {
        originalZombieDraw.call(this);

        if (this.zombieType === TYPES.STANDARD || !this.zombieType) {
            return;
        }

        ctx.save();

        if (this.zombieType === TYPES.FAST) {
            ctx.strokeStyle = "#ffb347";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#ffcf7a";
            ctx.font = "bold 10px Arial";
            ctx.textAlign = "center";
            ctx.fillText("FAST", this.x, this.y - this.radius - 18);
        }

        if (this.zombieType === TYPES.BALL_CHASER) {
            ctx.strokeStyle = "#70cfff";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.radius - 19, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#263238";
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        if (this.zombieType === TYPES.KING) {
            drawKingZombieDetails(this);
        }

        ctx.restore();
    };

    function drawKingZombieDetails(zombie) {
        const crownY = zombie.y - zombie.radius - 8;

        ctx.fillStyle = "#f4d03f";
        ctx.strokeStyle = "#6e5711";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(zombie.x - 15, crownY + 10);
        ctx.lineTo(zombie.x - 13, crownY - 3);
        ctx.lineTo(zombie.x - 5, crownY + 4);
        ctx.lineTo(zombie.x, crownY - 7);
        ctx.lineTo(zombie.x + 6, crownY + 4);
        ctx.lineTo(zombie.x + 14, crownY - 3);
        ctx.lineTo(zombie.x + 15, crownY + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const swingProgress = zombie.kingSwingRemaining > 0
            ? 1 - zombie.kingSwingRemaining / KING_SWING_DURATION
            : 0;

        const baseAngle = zombie.kingSwingRemaining > 0
            ? zombie.kingSwingAngle - 1.2 + swingProgress * 2.4
            : -0.45;

        const handX = zombie.x + 5;
        const handY = zombie.y + 8;
        const clubEndX = handX + Math.cos(baseAngle) * 48;
        const clubEndY = handY + Math.sin(baseAngle) * 48;

        ctx.strokeStyle = "#c7cdd1";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(handX, handY);
        ctx.lineTo(clubEndX, clubEndY);
        ctx.stroke();

        ctx.strokeStyle = "#4c5358";
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(
            clubEndX - Math.sin(baseAngle) * 8,
            clubEndY + Math.cos(baseAngle) * 8
        );
        ctx.lineTo(
            clubEndX + Math.sin(baseAngle) * 8,
            clubEndY - Math.cos(baseAngle) * 8
        );
        ctx.stroke();

        ctx.fillStyle = "#f4d03f";
        ctx.font = "bold 11px Arial";
        ctx.textAlign = "center";
        ctx.fillText("KING", zombie.x, zombie.y - zombie.radius - 25);
    }

    function spawnVariant(x, y, type, options = {}) {
        return Zombies.spawn(x, y, {
            ...options,
            zombieType: type
        });
    }

    const originalLoadZombiesForCurrentHole = loadZombiesForCurrentHole;

    loadZombiesForCurrentHole = function () {
        originalLoadZombiesForCurrentHole();

        switch (Hole.number) {
            case 4:
                spawnVariant(
                    Hole.tee.x + 90,
                    Hole.tee.y + 195,
                    TYPES.FAST
                );
                break;

            case 5:
                spawnVariant(
                    Hole.tee.x + 175,
                    Hole.tee.y + 35,
                    TYPES.FAST
                );

                spawnVariant(
                    Hole.cup.x - 135,
                    Hole.cup.y - 115,
                    TYPES.BALL_CHASER
                );
                break;

            case 6:
                spawnVariant(470, 405, TYPES.BALL_CHASER);
                spawnVariant(815, 190, TYPES.KING, {
                    speed: 40,
                    attackStrength: 25
                });
                break;

            case 7:
                /* Tee-side pressure on Dead Man's Crossing. */
                spawnVariant(500, 205, TYPES.FAST);

                /* Bridge guardian that focuses on disrupting the ball. */
                spawnVariant(675, 300, TYPES.BALL_CHASER, {
                    speed: 66,
                    kickPower: 7
                });

                /* Cup-side boss capable of blasting the ball back over the water. */
                spawnVariant(835, 385, TYPES.KING, {
                    speed: 40,
                    attackStrength: 26
                });
                break;
        }
    };

    window.ZombieTypes = TYPES;
})();
