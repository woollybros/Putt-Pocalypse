class Zombie {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;

        this.radius = options.radius ?? 14;

        this.speed = options.speed ?? 45;
        this.detectionDistance =
            options.detectionDistance ?? 240;

        this.loseInterestDistance =
            options.loseInterestDistance ??
            this.detectionDistance * 1.5;

        this.isPursuing = false;

        /*
            Each zombie aims for a slightly different
            location around the player. This reduces
            perfect single-file clustering.
        */
        const pursuitAngle =
            Math.random() *
            Math.PI *
            2;

        const pursuitOffsetDistance =
            options.pursuitOffsetDistance ??
            12;

        this.pursuitOffsetX =
            Math.cos(pursuitAngle) *
            pursuitOffsetDistance;

        this.pursuitOffsetY =
            Math.sin(pursuitAngle) *
            pursuitOffsetDistance;

        this.kickPower = options.kickPower ?? 4;
        this.bounceRetention =
            options.bounceRetention ?? 0.85;

        this.velocityX = 0;
        this.velocityY = 0;

        this.ballCollisionCooldown = 0;
        this.ballCollisionCooldownDuration = 0.2;

        this.attackStrength =
            options.attackStrength ?? 15;

        this.attackReach =
            options.attackReach ?? 4;

        this.attackCooldown = 0;

        this.attackCooldownDuration =
            options.attackCooldownDuration ?? 1.2;

        this.clubDropChance =
            options.clubDropChance ?? 0.25;
    }

    update(deltaTime) {
        if (this.ballCollisionCooldown > 0) {
            this.ballCollisionCooldown -=
                deltaTime;
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown -=
                deltaTime;

            if (this.attackCooldown < 0) {
                this.attackCooldown = 0;
            }
        }

        this.updateMovement(deltaTime);
    }

    updateMovement(deltaTime) {
        const targetX =
        Player.x +
        this.pursuitOffsetX;

    const targetY =
        Player.y +
        this.pursuitOffsetY;

    const playerDistanceX =
        targetX - this.x;

    const playerDistanceY =
        targetY - this.y;

        const distanceToPlayer = Math.hypot(
            playerDistanceX,
            playerDistanceY
        );

        /*
            Begin pursuing when the player enters
            the detection radius.
        */
        if (
            !this.isPursuing &&
            distanceToPlayer <=
                this.detectionDistance
        ) {
            this.isPursuing = true;
        }

        /*
            Once pursuing, the player must move farther
            away before the zombie loses interest.
        */
        if (
            this.isPursuing &&
            distanceToPlayer >
                this.loseInterestDistance
        ) {
            this.isPursuing = false;
        }

        /*
            Remain idle when not pursuing.
        */
        if (
            !this.isPursuing ||
            distanceToPlayer === 0
        ) {
            this.velocityX = 0;
            this.velocityY = 0;
            return;
        }

        const directionX =
            playerDistanceX / distanceToPlayer;

        const directionY =
            playerDistanceY / distanceToPlayer;

        this.velocityX =
            directionX * this.speed;

        this.velocityY =
            directionY * this.speed;

        this.moveWithWallCollisions(deltaTime);
    }

    moveWithWallCollisions(deltaTime) {
        const movementX =
            this.velocityX * deltaTime;

        const movementY =
            this.velocityY * deltaTime;

        /*
            Move one axis at a time so the zombie
            can slide along walls.
        */
        this.x += movementX;

        if (this.isTouchingWall()) {
            this.x -= movementX;
            this.velocityX = 0;
        }

        this.y += movementY;

        if (this.isTouchingWall()) {
            this.y -= movementY;
            this.velocityY = 0;
        }
    }

    isTouchingWall() {
        for (const wall of Hole.walls) {
            if (wall.blocksZombie === false) {
                continue;
            }

            const closestX = Math.max(
                wall.x,
                Math.min(
                    this.x,
                    wall.x + wall.width
                )
            );

            const closestY = Math.max(
                wall.y,
                Math.min(
                    this.y,
                    wall.y + wall.height
                )
            );

            const distanceX =
                this.x - closestX;

            const distanceY =
                this.y - closestY;

            const distanceSquared =
                distanceX * distanceX +
                distanceY * distanceY;

            if (
                distanceSquared <
                this.radius * this.radius
            ) {
                return true;
            }
        }

        return false;
    }

    handlePlayerAttack() {
        if (
            Player.isDead ||
            this.attackCooldown > 0
        ) {
            return;
        }

        const distanceX =
            Player.x - this.x;

        const distanceY =
            Player.y - this.y;

        const distanceToPlayer =
            Math.hypot(
                distanceX,
                distanceY
            );

        const attackDistance =
            this.radius +
            Player.radius +
            this.attackReach;

        if (
            distanceToPlayer >
            attackDistance
        ) {
            return;
        }

        const attackSucceeded =
            Player.takeDamage(
                this.attackStrength,
                this.x,
                this.y,
                this.clubDropChance
            );

        if (!attackSucceeded) {
            return;
        }

        this.attackCooldown =
            this.attackCooldownDuration;

        /*
            Pause briefly at the moment of attack.
        */
        this.velocityX = 0;
        this.velocityY = 0;
    }

    handleBallCollision() {
        if (
            Ball.isSunk ||
            this.ballCollisionCooldown > 0
        ) {
            return;
        }

        const distanceX =
            Ball.x - this.x;

        const distanceY =
            Ball.y - this.y;

        const combinedRadius =
            Ball.radius + this.radius;

        const distanceSquared =
            distanceX * distanceX +
            distanceY * distanceY;

        if (
            distanceSquared >=
            combinedRadius * combinedRadius
        ) {
            return;
        }

        let distance = Math.sqrt(
            distanceSquared
        );

        /*
            Protect against both centers being at
            exactly the same position.
        */
        let normalX = 1;
        let normalY = 0;

        if (distance > 0) {
            normalX = distanceX / distance;
            normalY = distanceY / distance;
        }
        /*
            Push the ball outside the zombie so it
            does not remain trapped inside it.
        */
        const overlap =
            combinedRadius - distance;

        Ball.x += normalX * overlap;
        Ball.y += normalY * overlap;

        if (Ball.isMoving()) {
            this.deflectMovingBall(
                normalX,
                normalY
            );
        } else {
            this.kickBall();
        }
        this.ballCollisionCooldown =
            this.ballCollisionCooldownDuration;
    }

    deflectMovingBall(normalX, normalY) {
        /*
            Reflect the ball's velocity around the
            collision normal.
        */
        const velocityAlongNormal =
            Ball.velocityX * normalX +
            Ball.velocityY * normalY;

        /*
            Only reflect when the ball is moving
            toward the zombie.
        */
        if (velocityAlongNormal >= 0) {
            return;
        }

        Ball.velocityX =
            (
                Ball.velocityX -
                2 *
                velocityAlongNormal *
                normalX
            ) *
            this.bounceRetention;

        Ball.velocityY =
            (
                Ball.velocityY -
                2 *
                velocityAlongNormal *
                normalY
            ) *
            this.bounceRetention;       
        /*
            Give the ball a slight push in the
            zombie's walking direction.
        */
        const zombieSpeed = Math.hypot(
            this.velocityX,
            this.velocityY
        );

        if (zombieSpeed > 0) {
            const directionX =
                this.velocityX / zombieSpeed;

            const directionY =
                this.velocityY / zombieSpeed;

            Ball.velocityX += directionX * 0.5;
            Ball.velocityY += directionY * 0.5;
        }

        AudioManager.play("wallBounce");
    }

    kickBall() {
        /*
            Direction from the ball toward the hole.

            We treat this as 0 degrees.
        */
        const holeDirectionAngle =
            Math.atan2(
                Hole.cup.y - Ball.y,
                Hole.cup.x - Ball.x
            );

        /*
            Choose a kick zone.

            15% chance:
            Toward the hole
            -60 to +60 degrees

            30% chance:
            Sideways
            +60 to +120 degrees
            or
            -60 to -120 degrees

            55% chance:
            Away from the hole
            +120 to +180 degrees
            or
            -120 to -180 degrees
        */
        const zoneRoll = Math.random();

        let minimumAngle;
        let maximumAngle;

        if (zoneRoll < 0.15) {
            /*
                Low chance of kicking generally
                toward the hole.
            */
            minimumAngle = -60;
            maximumAngle = 60;
        } else if (zoneRoll < 0.45) {
            /*
                Moderate chance of kicking sideways.
            */
            if (Math.random() < 0.5) {
                minimumAngle = 60;
                maximumAngle = 120;
            } else {
                minimumAngle = -120;
                maximumAngle = -60;
            }
        } else {
            /*
                High chance of kicking generally
                away from the hole.
            */
            if (Math.random() < 0.5) {
                minimumAngle = 120;
                maximumAngle = 180;
            } else {
                minimumAngle = -180;
                maximumAngle = -120;
            }
        }

        const randomOffsetDegrees =
            minimumAngle +
            Math.random() *
            (
                maximumAngle -
                minimumAngle
            );

        const randomOffsetRadians =
            randomOffsetDegrees *
            Math.PI /
            180;

        const kickAngle =
            holeDirectionAngle +
            randomOffsetRadians;

        Ball.velocityX =
            Math.cos(kickAngle) *
            this.kickPower;

        Ball.velocityY =
            Math.sin(kickAngle) *
            this.kickPower;

        AudioManager.play("wallBounce");
    }

    draw() {
        /*
            Temporary zombie artwork.
        */
        ctx.save();
        // Shadow
        ctx.beginPath();
        ctx.ellipse(
            this.x + 2,
            this.y + this.radius * 0.7,
            this.radius,
            this.radius * 0.55,
            0,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "rgba(0, 0, 0, 0.25)";

        ctx.fill();

        // Body
        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#6f8f55";
        ctx.fill();

        ctx.strokeStyle = "#35452a";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Eyes
        const eyeOffsetX = 5;
        const eyeY = this.y - 3;

        ctx.fillStyle = "#fff4bb";

        ctx.beginPath();
        ctx.arc(
            this.x - eyeOffsetX,
            eyeY,
            2.5,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.beginPath();
        ctx.arc(
            this.x + eyeOffsetX,
            eyeY,
            2.5,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Pupils
        ctx.fillStyle = "#202020";

        ctx.beginPath();
        ctx.arc(
            this.x - eyeOffsetX,
            eyeY,
            1,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.beginPath();
        ctx.arc(
            this.x + eyeOffsetX,
            eyeY,
            1,
            0,
            Math.PI * 2
        );
        ctx.fill();

        /*
            Optional detection-radius debug view.

            Uncomment when tuning detection distance.
        */

        /*
        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            this.detectionDistance,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "rgba(255, 0, 0, 0.2)";

        ctx.lineWidth = 1;
        ctx.stroke();
        */
       ctx.restore();
    }
}

const Zombies = {
    items: [],

    spawn(x, y, options = {}) {
        const zombie = new Zombie(
            x,
            y,
            options
        );

        this.items.push(zombie);

        return zombie;
    },

    clear() {
        this.items = [];
    },

    update(deltaTime) {
        for (const zombie of this.items) {
            zombie.update(deltaTime);
        }

        /*
            Moving zombies may converge on the same
            position while chasing the player.

            Run the separation pass twice so larger
            groups settle without stacking.
        */
        this.resolveOverlaps();
        this.resolveOverlaps();
    },

    resolveOverlaps() {
        for (
            let firstIndex = 0;
            firstIndex < this.items.length;
            firstIndex++
        ) {
            const firstZombie =
                this.items[firstIndex];

            for (
                let secondIndex =
                    firstIndex + 1;

                secondIndex <
                    this.items.length;

                secondIndex++
            ) {
                const secondZombie =
                    this.items[secondIndex];

                let distanceX =
                    secondZombie.x -
                    firstZombie.x;

                let distanceY =
                    secondZombie.y -
                    firstZombie.y;

                let distance = Math.hypot(
                    distanceX,
                    distanceY
                );

                const zombieSpacing = 4;
                const minimumDistance =
                    firstZombie.radius +
                    secondZombie.radius +
                    zombieSpacing;

                if (
                    distance >= minimumDistance
                ) {
                    continue;
                }

                /*
                    If the zombies have exactly the same
                    center, choose a random direction so
                    they can still be separated.
                */
                if (distance === 0) {
                    const randomAngle =
                        Math.random() *
                        Math.PI *
                        2;

                    distanceX =
                        Math.cos(randomAngle);

                    distanceY =
                        Math.sin(randomAngle);

                    distance = 1;
                }

                const normalX =
                    distanceX / distance;

                const normalY =
                    distanceY / distance;

                const overlap =
                    minimumDistance -
                    distance;

                /*
                    Each zombie moves half of the required
                    separation distance.
                */
                const separationDistance =
                    overlap / 2;

                firstZombie.x -=
                    normalX *
                    separationDistance;

                firstZombie.y -=
                    normalY *
                    separationDistance;

                secondZombie.x +=
                    normalX *
                    separationDistance;

                secondZombie.y +=
                    normalY *
                    separationDistance;
            }
        }
    },

    handleBallCollisions() {
        for (const zombie of this.items) {
            zombie.handleBallCollision();
        }
    },

    handlePlayerAttacks() {
        for (const zombie of this.items) {
            zombie.handlePlayerAttack();
        }
    },

    draw() {
        for (const zombie of this.items) {
            zombie.draw();
        }
    }
};