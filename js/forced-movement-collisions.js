/*
    Shared collision-safe movement for forced motion.

    Normal walking already checks walls, but knockback and zombie
    separation previously changed coordinates directly. Large forced
    movements could therefore place an entity inside or beyond a wall.
*/
(function () {
    const MAX_MOVEMENT_STEP = 6;

    function moveCircleWithWallCollisions(
        entity,
        movementX,
        movementY,
        wallBlocksEntity
    ) {
        const movementDistance = Math.hypot(
            movementX,
            movementY
        );

        const stepCount = Math.max(
            1,
            Math.ceil(
                movementDistance /
                MAX_MOVEMENT_STEP
            )
        );

        const stepX = movementX / stepCount;
        const stepY = movementY / stepCount;

        let movedX = 0;
        let movedY = 0;

        for (
            let stepIndex = 0;
            stepIndex < stepCount;
            stepIndex++
        ) {
            entity.x += stepX;

            if (
                isCircleTouchingBlockingWall(
                    entity,
                    wallBlocksEntity
                )
            ) {
                entity.x -= stepX;
            } else {
                movedX += stepX;
            }

            entity.y += stepY;

            if (
                isCircleTouchingBlockingWall(
                    entity,
                    wallBlocksEntity
                )
            ) {
                entity.y -= stepY;
            } else {
                movedY += stepY;
            }
        }

        return {
            x: movedX,
            y: movedY
        };
    }

    function isCircleTouchingBlockingWall(
        entity,
        wallBlocksEntity
    ) {
        for (const wall of Hole.walls) {
            if (!wallBlocksEntity(wall)) {
                continue;
            }

            const closestX = Math.max(
                wall.x,
                Math.min(
                    entity.x,
                    wall.x + wall.width
                )
            );

            const closestY = Math.max(
                wall.y,
                Math.min(
                    entity.y,
                    wall.y + wall.height
                )
            );

            const distanceX =
                entity.x - closestX;

            const distanceY =
                entity.y - closestY;

            if (
                distanceX * distanceX +
                distanceY * distanceY <
                entity.radius * entity.radius
            ) {
                return true;
            }
        }

        return false;
    }

    function wallBlocksPlayer(wall) {
        return wall.blocksPlayer === true;
    }

    function wallBlocksZombie(wall) {
        return wall.blocksZombie !== false;
    }

    const originalPlayerUpdateMovement =
        Player.updateMovement;

    Player.updateMovement = function (deltaTime) {
        const startX = this.x;
        const startY = this.y;

        originalPlayerUpdateMovement.call(
            this,
            deltaTime
        );

        const movementX = this.x - startX;
        const movementY = this.y - startY;

        this.x = startX;
        this.y = startY;

        moveCircleWithWallCollisions(
            this,
            movementX,
            movementY,
            wallBlocksPlayer
        );
    };

    const originalPlayerTakeDamage =
        Player.takeDamage;

    Player.takeDamage = function (
        damageAmount,
        attackerX,
        attackerY,
        clubDropChance = 0
    ) {
        const startX = this.x;
        const startY = this.y;

        const attackSucceeded =
            originalPlayerTakeDamage.call(
                this,
                damageAmount,
                attackerX,
                attackerY,
                clubDropChance
            );

        if (!attackSucceeded) {
            return false;
        }

        const knockbackX = this.x - startX;
        const knockbackY = this.y - startY;

        this.x = startX;
        this.y = startY;

        moveCircleWithWallCollisions(
            this,
            knockbackX,
            knockbackY,
            wallBlocksPlayer
        );

        return true;
    };

    const originalUpdatePuttingStance =
        Player.updatePuttingStance;

    Player.updatePuttingStance = function (
        deltaTime
    ) {
        const startX = this.x;
        const startY = this.y;

        originalUpdatePuttingStance.call(
            this,
            deltaTime
        );

        const movementX = this.x - startX;
        const movementY = this.y - startY;

        this.x = startX;
        this.y = startY;

        moveCircleWithWallCollisions(
            this,
            movementX,
            movementY,
            wallBlocksPlayer
        );
    };

    Zombie.prototype.moveWithWallCollisions =
        function (deltaTime) {
            const requestedX =
                this.velocityX * deltaTime;

            const requestedY =
                this.velocityY * deltaTime;

            const movement =
                moveCircleWithWallCollisions(
                    this,
                    requestedX,
                    requestedY,
                    wallBlocksZombie
                );

            if (
                Math.abs(movement.x) <
                Math.abs(requestedX) - 0.0001
            ) {
                this.velocityX = 0;
            }

            if (
                Math.abs(movement.y) <
                Math.abs(requestedY) - 0.0001
            ) {
                this.velocityY = 0;
            }
        };

    Zombies.resolveOverlaps = function () {
        for (
            let firstIndex = 0;
            firstIndex < this.items.length;
            firstIndex++
        ) {
            const firstZombie =
                this.items[firstIndex];

            for (
                let secondIndex = firstIndex + 1;
                secondIndex < this.items.length;
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

                const minimumDistance =
                    firstZombie.radius +
                    secondZombie.radius +
                    4;

                if (distance >= minimumDistance) {
                    continue;
                }

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
                    minimumDistance - distance;

                const halfSeparation =
                    overlap / 2;

                const firstMovement =
                    moveCircleWithWallCollisions(
                        firstZombie,
                        -normalX * halfSeparation,
                        -normalY * halfSeparation,
                        wallBlocksZombie
                    );

                const secondMovement =
                    moveCircleWithWallCollisions(
                        secondZombie,
                        normalX * halfSeparation,
                        normalY * halfSeparation,
                        wallBlocksZombie
                    );

                const firstMoved = Math.hypot(
                    firstMovement.x,
                    firstMovement.y
                );

                const secondMoved = Math.hypot(
                    secondMovement.x,
                    secondMovement.y
                );

                const remainingSeparation = Math.max(
                    0,
                    overlap -
                    firstMoved -
                    secondMoved
                );

                if (remainingSeparation <= 0) {
                    continue;
                }

                if (firstMoved < secondMoved) {
                    moveCircleWithWallCollisions(
                        secondZombie,
                        normalX * remainingSeparation,
                        normalY * remainingSeparation,
                        wallBlocksZombie
                    );
                } else {
                    moveCircleWithWallCollisions(
                        firstZombie,
                        -normalX * remainingSeparation,
                        -normalY * remainingSeparation,
                        wallBlocksZombie
                    );
                }
            }
        }
    };
})();
