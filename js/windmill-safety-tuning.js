/*
    Windmill safety and balance tuning.

    This file loads after windmill-physics.js so it can refine the
    obstacle without duplicating the general ball physics code.
*/

(function () {
    const windmillLayout = HoleLayouts.find(
        layout => layout.name === "Tilting at Windmills"
    );

    if (windmillLayout?.windmill) {
        const windmill = windmillLayout.windmill;

        /*
            Widen the tunnel from 44 pixels to 56 pixels.
        */
        windmill.tunnelTop = 272;
        windmill.tunnelBottom = 328;

        for (const wall of windmillLayout.walls) {
            /* Upper windmill body. */
            if (
                wall.x === 590 &&
                wall.y === 210 &&
                wall.width === 120 &&
                wall.height === 68 &&
                wall.blocksBall
            ) {
                wall.height = 62;
            }

            /* Lower windmill body. */
            if (
                wall.x === 590 &&
                wall.y === 322 &&
                wall.width === 120 &&
                wall.height === 68 &&
                wall.blocksBall
            ) {
                wall.y = 328;
                wall.height = 62;
            }

            /* Upper tunnel guide walls. */
            if (
                wall.y === 265 &&
                wall.height === 13 &&
                (wall.x === 535 || wall.x === 710)
            ) {
                wall.y = 259;
            }

            /* Lower tunnel guide walls. */
            if (
                wall.y === 322 &&
                wall.height === 13 &&
                (wall.x === 535 || wall.x === 710)
            ) {
                wall.y = 328;
            }
        }
    }

    /*
        Slow the blades enough to create a readable timing window while
        preserving the moving-obstacle challenge.
    */
    if (Hole.windmillAnimation) {
        Hole.windmillAnimation.rotationSpeed = 0.65;
    }

    Ball.windmillBladeCollisionCooldownDuration = 14;
    Ball.windmillBladeContactLocked = false;
    Ball.windmillBladeClearance = 1.5;

    Ball.isOverlappingBlockingWall = function () {
        for (const wall of Hole.walls) {
            if (!wall.blocksBall) {
                continue;
            }

            const closestX = Math.max(
                wall.x,
                Math.min(this.x, wall.x + wall.width)
            );

            const closestY = Math.max(
                wall.y,
                Math.min(this.y, wall.y + wall.height)
            );

            const distanceX = this.x - closestX;
            const distanceY = this.y - closestY;

            if (
                distanceX * distanceX +
                distanceY * distanceY <
                this.radius * this.radius
            ) {
                return true;
            }
        }

        return false;
    };

    Ball.moveSafelyFromBlade = function (
        movementX,
        movementY
    ) {
        const maximumStep = 1.25;
        const stepCount = Math.max(
            1,
            Math.ceil(
                Math.hypot(movementX, movementY) /
                maximumStep
            )
        );

        const stepX = movementX / stepCount;
        const stepY = movementY / stepCount;

        for (
            let stepIndex = 0;
            stepIndex < stepCount;
            stepIndex++
        ) {
            const previousX = this.x;
            const previousY = this.y;

            this.x += stepX;

            if (this.isOverlappingBlockingWall()) {
                this.x = previousX;
            }

            this.y += stepY;

            if (this.isOverlappingBlockingWall()) {
                this.y = previousY;
            }
        }
    };

    Ball.getAllWindmillBladeCollisions = function () {
        const windmill = Hole.windmill;

        if (!windmill) {
            return [];
        }

        const baseAngle =
            windmill.bladeAngle ??
            Hole.windmillAnimation?.angle ??
            0;

        const collisions = [];

        for (
            let bladeIndex = 0;
            bladeIndex < 4;
            bladeIndex++
        ) {
            const collision =
                this.getWindmillBladeCollision(
                    baseAngle +
                    bladeIndex * Math.PI / 2
                );

            if (collision) {
                collisions.push(collision);
            }
        }

        return collisions;
    };

    Ball.handleWindmillBladeCollisions = function () {
        if (!Hole.windmill) {
            this.windmillBladeContactLocked = false;
            return;
        }

        const collisions =
            this.getAllWindmillBladeCollisions();

        if (this.windmillBladeContactLocked) {
            if (
                collisions.length === 0 &&
                this.windmillBladeCollisionCooldown <= 0
            ) {
                this.windmillBladeContactLocked = false;
            }

            return;
        }

        if (
            this.windmillBladeCollisionCooldown > 0 ||
            collisions.length === 0
        ) {
            return;
        }

        const collision = collisions[0];

        /*
            Move out of the blade in small collision-tested steps. This
            prevents blade separation from teleporting the ball through
            the windmill body or a guide wall.
        */
        this.moveSafelyFromBlade(
            collision.normalX *
                (
                    collision.overlap +
                    this.windmillBladeClearance
                ),
            collision.normalY *
                (
                    collision.overlap +
                    this.windmillBladeClearance
                )
        );

        const velocityAlongNormal =
            this.velocityX * collision.normalX +
            this.velocityY * collision.normalY;

        if (velocityAlongNormal < 0) {
            this.velocityX -=
                1.45 *
                velocityAlongNormal *
                collision.normalX;

            this.velocityY -=
                1.45 *
                velocityAlongNormal *
                collision.normalY;
        }

        const angularSpeed =
            Hole.windmillAnimation?.rotationSpeed ??
            0.65;

        const bladeVelocityX =
            -collision.contactRelativeY *
            angularSpeed /
            60;

        const bladeVelocityY =
            collision.contactRelativeX *
            angularSpeed /
            60;

        const bladeSpeedIntoBall =
            bladeVelocityX * collision.normalX +
            bladeVelocityY * collision.normalY;

        const knockAwaySpeed = Math.max(
            1.2,
            Math.abs(bladeSpeedIntoBall) * 1.7
        );

        this.velocityX +=
            collision.normalX * knockAwaySpeed +
            bladeVelocityX * 0.25;

        this.velocityY +=
            collision.normalY * knockAwaySpeed +
            bladeVelocityY * 0.25;

        /*
            Resolve any pre-existing edge contact once after the impact.
            New blade displacement itself is already protected above.
        */
        this.handleWallCollisions();

        this.windmillBladeCollisionCooldown =
            this.windmillBladeCollisionCooldownDuration;

        this.windmillBladeContactLocked = true;

        AudioManager.play(
            "wallBounce",
            {
                volume: 0.42,
                playbackRate: 0.82
            }
        );
    };
})();
