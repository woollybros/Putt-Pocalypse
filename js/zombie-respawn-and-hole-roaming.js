/*
    Zombie population persistence and anti-kiting behavior.

    Defeated zombies are replaced at a random point along the play-space border.
    Zombies that are not actively pursuing the golfer migrate back toward the cup
    until they are within the configured guard radius.
*/
(function () {
    const HOLE_GUARD_RADIUS = 165;
    const ROAM_SPEED_MULTIPLIER = 0.7;
    const BORDER_PADDING = 10;
    const MINIMUM_PLAYER_SPAWN_DISTANCE = 180;
    const SPAWN_ATTEMPTS = 28;

    function getRespawnOptions(zombie) {
        return {
            radius: zombie.radius,
            speed: zombie.speed,
            detectionDistance: zombie.detectionDistance,
            loseInterestDistance: zombie.loseInterestDistance,
            kickPower: zombie.kickPower,
            bounceRetention: zombie.bounceRetention,
            attackStrength: zombie.attackStrength,
            attackReach: zombie.attackReach,
            attackCooldownDuration: zombie.attackCooldownDuration,
            clubDropChance: zombie.clubDropChance
        };
    }

    function getRandomBorderPosition(radius) {
        const inset = radius + BORDER_PADDING;
        const minimumX = inset;
        const maximumX = Math.max(inset, canvas.width - inset);
        const minimumY = inset;
        const maximumY = Math.max(inset, canvas.height - inset);
        const side = Math.floor(Math.random() * 4);

        if (side === 0) {
            return {
                x: minimumX + Math.random() * (maximumX - minimumX),
                y: minimumY
            };
        }

        if (side === 1) {
            return {
                x: maximumX,
                y: minimumY + Math.random() * (maximumY - minimumY)
            };
        }

        if (side === 2) {
            return {
                x: minimumX + Math.random() * (maximumX - minimumX),
                y: maximumY
            };
        }

        return {
            x: minimumX,
            y: minimumY + Math.random() * (maximumY - minimumY)
        };
    }

    function positionIsUsable(position, options) {
        const testZombie = new Zombie(position.x, position.y, options);

        if (testZombie.isTouchingWall()) {
            return false;
        }

        const distanceToPlayer = Math.hypot(
            position.x - Player.x,
            position.y - Player.y
        );

        if (distanceToPlayer < MINIMUM_PLAYER_SPAWN_DISTANCE) {
            return false;
        }

        return true;
    }

    function respawnZombieFrom(defeatedZombie) {
        const options = getRespawnOptions(defeatedZombie);
        let fallbackPosition = getRandomBorderPosition(options.radius);

        for (let attempt = 0; attempt < SPAWN_ATTEMPTS; attempt++) {
            const candidate = getRandomBorderPosition(options.radius);
            fallbackPosition = candidate;

            if (!positionIsUsable(candidate, options)) {
                continue;
            }

            const replacement = Zombies.spawn(
                candidate.x,
                candidate.y,
                options
            );

            replacement.isPursuing = false;
            replacement.velocityX = 0;
            replacement.velocityY = 0;
            return replacement;
        }

        const replacement = Zombies.spawn(
            fallbackPosition.x,
            fallbackPosition.y,
            options
        );

        replacement.isPursuing = false;
        replacement.velocityX = 0;
        replacement.velocityY = 0;
        return replacement;
    }

    /*
        Preserve the normal pursuit behavior. When a zombie is idle, give it a
        slower migration target at the cup so it cannot remain stranded after
        being lured far away from the active portion of the hole.
    */
    const originalUpdateMovement = Zombie.prototype.updateMovement;

    Zombie.prototype.updateMovement = function (deltaTime) {
        originalUpdateMovement.call(this, deltaTime);

        if (this.isPursuing || this.stunRemaining > 0) {
            return;
        }

        const offsetX = Hole.cup.x - this.x;
        const offsetY = Hole.cup.y - this.y;
        const distanceToHole = Math.hypot(offsetX, offsetY);

        if (distanceToHole <= HOLE_GUARD_RADIUS || distanceToHole === 0) {
            this.velocityX = 0;
            this.velocityY = 0;
            return;
        }

        const roamSpeed = this.speed * ROAM_SPEED_MULTIPLIER;
        this.velocityX = offsetX / distanceToHole * roamSpeed;
        this.velocityY = offsetY / distanceToHole * roamSpeed;
        this.moveWithWallCollisions(deltaTime);
    };

    /*
        Combat marks a zombie's health as zero during Player.update(), then the
        existing Zombies.update() removes it. Capture those defeated zombies
        before that filter runs and replace each one after the update completes.
        Zombies removed with the developer clear button are not treated as kills.
    */
    const originalZombiesUpdate = Zombies.update.bind(Zombies);

    Zombies.update = function (deltaTime) {
        const defeatedZombies = this.items.filter(zombie =>
            typeof zombie.health === "number" && zombie.health <= 0
        );

        originalZombiesUpdate(deltaTime);

        for (const defeatedZombie of defeatedZombies) {
            respawnZombieFrom(defeatedZombie);
        }
    };
})();
