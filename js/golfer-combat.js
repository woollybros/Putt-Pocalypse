/*
    Golfer melee combat.

    Space (or the on-screen Swing Club button) performs a short club swing.
    Zombies inside the swing arc take damage, are knocked backward, and are
    removed when their health reaches zero.
*/
(function () {
    const ATTACK_DURATION = 0.38;
    const ACTIVE_START = 0.11;
    const ACTIVE_END = 0.25;
    const ATTACK_RANGE = 64;
    const ATTACK_HALF_ANGLE = Math.PI * 0.55;
    const ATTACK_DAMAGE = 25;
    const KNOCKBACK_DISTANCE = 48;

    let attackRequested = false;

    function gameplayIsActive() {
        return !window.MenuController ||
            window.MenuController.state === "playing";
    }

    function requestAttack() {
        if (!gameplayIsActive()) {
            return;
        }

        attackRequested = true;
    }

    document.addEventListener("keydown", event => {
        if (event.code !== "Space" || event.repeat) {
            return;
        }

        event.preventDefault();
        requestAttack();
    });

    const attackButton = document.createElement("button");
    attackButton.id = "attackClubButton";
    attackButton.textContent = "Swing Club";
    attackButton.setAttribute("aria-label", "Swing club at nearby zombies");

    Object.assign(attackButton.style, {
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: "12",
        padding: "14px 18px",
        border: "2px solid rgba(255,255,255,0.85)",
        borderRadius: "999px",
        background: "rgba(113, 40, 35, 0.9)",
        color: "white",
        font: "bold 15px Arial, sans-serif",
        cursor: "pointer",
        boxShadow: "0 5px 16px rgba(0,0,0,0.35)",
        touchAction: "manipulation"
    });

    attackButton.addEventListener("pointerdown", event => {
        event.preventDefault();
        requestAttack();
    });

    document.body.appendChild(attackButton);

    Player.attackElapsed = 0;
    Player.attackDirectionX = 1;
    Player.attackDirectionY = 0;
    Player.attackHitZombies = new Set();

    Player.beginClubAttack = function () {
        if (
            this.isDead ||
            !this.equippedClub ||
            this.state !== "idle"
        ) {
            return false;
        }

        let directionX = Pointer.x - this.x;
        let directionY = Pointer.y - this.y;
        let directionLength = Math.hypot(directionX, directionY);

        /*
            Keyboard users may not have moved the pointer. Aim toward the
            nearest zombie in that case so the attack remains practical.
        */
        if (directionLength < 8 && Zombies.items.length > 0) {
            let nearestZombie = Zombies.items[0];
            let nearestDistance = Infinity;

            for (const zombie of Zombies.items) {
                const distance = Math.hypot(
                    zombie.x - this.x,
                    zombie.y - this.y
                );

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestZombie = zombie;
                }
            }

            directionX = nearestZombie.x - this.x;
            directionY = nearestZombie.y - this.y;
            directionLength = Math.hypot(directionX, directionY);
        }

        if (directionLength < 0.001) {
            directionX = this.aimDirectionX || 1;
            directionY = this.aimDirectionY || 0;
            directionLength = Math.hypot(directionX, directionY) || 1;
        }

        this.attackDirectionX = directionX / directionLength;
        this.attackDirectionY = directionY / directionLength;
        this.attackElapsed = 0;
        this.attackHitZombies.clear();
        this.state = "attacking";

        Pointer.isDown = false;
        Pointer.wasPressed = false;
        Pointer.wasReleased = false;

        return true;
    };

    Player.resolveClubAttackHits = function () {
        const attackAngle = Math.atan2(
            this.attackDirectionY,
            this.attackDirectionX
        );

        for (const zombie of Zombies.items) {
            if (this.attackHitZombies.has(zombie)) {
                continue;
            }

            const offsetX = zombie.x - this.x;
            const offsetY = zombie.y - this.y;
            const distance = Math.hypot(offsetX, offsetY);

            if (distance > ATTACK_RANGE + zombie.radius) {
                continue;
            }

            const zombieAngle = Math.atan2(offsetY, offsetX);
            const angleDifference = Math.atan2(
                Math.sin(zombieAngle - attackAngle),
                Math.cos(zombieAngle - attackAngle)
            );

            if (Math.abs(angleDifference) > ATTACK_HALF_ANGLE) {
                continue;
            }

            this.attackHitZombies.add(zombie);
            zombie.takeClubHit(
                ATTACK_DAMAGE,
                this.attackDirectionX,
                this.attackDirectionY
            );
        }
    };

    const originalPlayerUpdate = Player.update.bind(Player);

    Player.update = function (deltaTime) {
        if (attackRequested) {
            attackRequested = false;
            this.beginClubAttack();
        }

        originalPlayerUpdate(deltaTime);

        if (this.state !== "attacking") {
            return;
        }

        this.attackElapsed += deltaTime;

        if (
            this.attackElapsed >= ACTIVE_START &&
            this.attackElapsed <= ACTIVE_END
        ) {
            this.resolveClubAttackHits();
        }

        if (this.attackElapsed >= ATTACK_DURATION) {
            this.attackElapsed = 0;
            this.attackHitZombies.clear();
            this.state = "idle";
        }
    };

    Zombie.prototype.ensureCombatStats = function () {
        if (typeof this.maximumHealth !== "number") {
            this.maximumHealth = 100;
            this.health = this.maximumHealth;
            this.clubHitFlash = 0;
        }
    };

    Zombie.prototype.takeClubHit = function (
        damage,
        directionX,
        directionY
    ) {
        this.ensureCombatStats();

        this.health = Math.max(0, this.health - damage);
        this.clubHitFlash = 0.16;
        this.velocityX = 0;
        this.velocityY = 0;

        const originalX = this.x;
        const originalY = this.y;

        this.x += directionX * KNOCKBACK_DISTANCE;
        this.y += directionY * KNOCKBACK_DISTANCE;

        if (this.isTouchingWall()) {
            this.x = originalX;
            this.y = originalY;

            /* Try half the distance before giving up on the knockback. */
            this.x += directionX * KNOCKBACK_DISTANCE * 0.5;
            this.y += directionY * KNOCKBACK_DISTANCE * 0.5;

            if (this.isTouchingWall()) {
                this.x = originalX;
                this.y = originalY;
            }
        }
    };

    const originalZombieUpdate = Zombie.prototype.update;

    Zombie.prototype.update = function (deltaTime) {
        this.ensureCombatStats();

        if (this.clubHitFlash > 0) {
            this.clubHitFlash = Math.max(
                0,
                this.clubHitFlash - deltaTime
            );
        }

        originalZombieUpdate.call(this, deltaTime);
    };

    const originalZombiesUpdate = Zombies.update.bind(Zombies);

    Zombies.update = function (deltaTime) {
        originalZombiesUpdate(deltaTime);

        this.items = this.items.filter(zombie => {
            zombie.ensureCombatStats();
            return zombie.health > 0;
        });
    };

    const originalZombieDraw = Zombie.prototype.draw;

    Zombie.prototype.draw = function () {
        this.ensureCombatStats();

        if (this.clubHitFlash > 0) {
            ctx.save();
            ctx.globalAlpha = 0.55;
            ctx.fillStyle = "#fff2a8";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        originalZombieDraw.call(this);

        const healthRatio = Math.max(
            0,
            Math.min(1, this.health / this.maximumHealth)
        );

        const barWidth = 30;
        const barHeight = 5;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.radius - 12;

        ctx.save();
        ctx.fillStyle = "rgba(30, 0, 0, 0.8)";
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = healthRatio > 0.5 ? "#78bd59" : "#d9534f";
        ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);
        ctx.strokeStyle = "rgba(255,255,255,0.75)";
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        ctx.restore();
    };

    function drawAttackClub() {
        const progress = Math.min(
            1,
            Player.attackElapsed / ATTACK_DURATION
        );

        const baseAngle = Math.atan2(
            Player.attackDirectionY,
            Player.attackDirectionX
        );

        const swingAngle =
            baseAngle - 1.45 + progress * 2.9;

        const handDistance = 12;
        const clubLength = 43;
        const handX = Player.x + Math.cos(baseAngle) * handDistance;
        const handY = Player.y + 13 + Math.sin(baseAngle) * handDistance;
        const clubEndX = handX + Math.cos(swingAngle) * clubLength;
        const clubEndY = handY + Math.sin(swingAngle) * clubLength;
        const normalX = -Math.sin(swingAngle);
        const normalY = Math.cos(swingAngle);

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(Player.x - 8, Player.y + 14);
        ctx.lineTo(handX, handY);
        ctx.moveTo(Player.x + 8, Player.y + 14);
        ctx.lineTo(handX, handY);
        ctx.strokeStyle = "#f2c79b";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(handX, handY);
        ctx.lineTo(clubEndX, clubEndY);
        ctx.strokeStyle = "#aeb6bf";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(clubEndX - normalX * 7, clubEndY - normalY * 7);
        ctx.lineTo(clubEndX + normalX * 7, clubEndY + normalY * 7);
        ctx.strokeStyle = "#59636e";
        ctx.lineWidth = 7;
        ctx.stroke();

        if (progress >= ACTIVE_START / ATTACK_DURATION &&
            progress <= ACTIVE_END / ATTACK_DURATION) {
            ctx.beginPath();
            ctx.arc(
                Player.x,
                Player.y + 8,
                ATTACK_RANGE,
                baseAngle - ATTACK_HALF_ANGLE,
                baseAngle + ATTACK_HALF_ANGLE
            );
            ctx.strokeStyle = "rgba(255, 238, 150, 0.5)";
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        ctx.restore();
    }

    const originalPlayerDraw = Player.draw.bind(Player);

    Player.draw = function () {
        if (this.state !== "attacking") {
            originalPlayerDraw();
            return;
        }

        /* Hide the regular carried-club pose during the melee animation. */
        const equippedClub = this.equippedClub;
        this.equippedClub = null;
        originalPlayerDraw();
        this.equippedClub = equippedClub;

        drawAttackClub();
    };

    const originalResetHole = resetHole;

    resetHole = function (...args) {
        const result = originalResetHole(...args);

        Player.attackElapsed = 0;
        Player.attackHitZombies.clear();
        attackRequested = false;

        if (Player.state === "attacking") {
            Player.state = "idle";
        }

        return result;
    };

    function updateAttackButtonVisibility() {
        const visible =
            gameplayIsActive() &&
            !Player.isDead;

        attackButton.style.display = visible ? "block" : "none";
        attackButton.disabled =
            !Player.equippedClub ||
            Player.state !== "idle";
        attackButton.style.opacity =
            attackButton.disabled ? "0.45" : "1";

        requestAnimationFrame(updateAttackButtonVisibility);
    }

    updateAttackButtonVisibility();
})();