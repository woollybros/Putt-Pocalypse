const Ball = {
    x: Hole.tee.x,
    y: Hole.tee.y,

    radius: 7,

    velocityX: 0,
    velocityY: 0,

    friction: 0.985,
    minimumSpeed: 0.05,

    isSunk: false,
    sinkSpeedLimit: 2.5,

    cupCollisionCooldown: 0,
    cupSpeedRetention: 0.6,

    isMoving() {
        return(
            Math.abs(this.velocityX) > this.minimumSpeed ||
            Math.abs(this.velocityY) > this.minimumSpeed
        );
    },

    shoot(directionX, directionY, power) {
        this.velocityX = directionX * power;
        this.velocityY = directionY * power;
    },

    update() {
        if (this.isSunk) {
            return;
        }

        if (this.cupCollisionCooldown > 0) {
            this.cupCollisionCooldown--;
        }

        const previousX = this.x;
        const previousY = this.y;

        this.x += this.velocityX;
        this.y += this.velocityY;

        this.handleWallCollisions();

        this.handleCupCollision(
            previousX,
            previousY
        );

        this.velocityX *= this.friction;
        this.velocityY *= this.friction;

        if (
            Math.abs(this.velocityX) <
            this.minimumSpeed
        ) {
            this.velocityX = 0;
        }

        if (
            Math.abs(this.velocityY) <
            this.minimumSpeed
        ) {
            this.velocityY = 0;
        }
    },

    handleWallCollisions() {
        let strongestImpactSpeed = 0;

        for (const wall of Hole.walls) {
            if (!wall.blocksBall) {
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
                distanceSquared >=
                this.radius * this.radius
            ) {
                continue;
            }

            /*
                Record the ball's speed before changing
                its direction.
            */
            const impactSpeed = Math.hypot(
                this.velocityX,
                this.velocityY
            );

            strongestImpactSpeed = Math.max(
                strongestImpactSpeed,
                impactSpeed
            );

            const overlapX =
                this.radius -
                Math.abs(distanceX);

            const overlapY =
                this.radius -
                Math.abs(distanceY);

            if (overlapX < overlapY) {
                if (this.x < closestX) {
                    this.x -= overlapX;
                } else {
                    this.x += overlapX;
                }

                this.velocityX *= -1;
            } else {
                if (this.y < closestY) {
                    this.y -= overlapY;
                } else {
                    this.y += overlapY;
                }

                this.velocityY *= -1;
            }
        }

        /*
            Play only once, even when the ball strikes
            two walls at a corner.
        */
        if (strongestImpactSpeed > 0.5) {
            AudioManager.play(
                "wallBounce",
                {
                    volume: Math.min(
                        0.2 +
                        strongestImpactSpeed / 20,
                        0.7
                    ),

                    playbackRate:
                        0.92 +
                        Math.random() * 0.12
                }
            );
        }
    },

    handleCupCollision(previousX, previousY) {
        if (this.isSunk || this.cupCollisionCooldown > 0) {
            return;
        }

        const movementX = this.x - previousX;
        const movementY = this.y - previousY;

        const movementLengthSquared =
            movementX * movementX +
            movementY * movementY;

        let closestX = this.x;
        let closestY = this.y;

        if (movementLengthSquared > 0) {
            const cupFromStartX =
                Hole.cup.x - previousX;

            const cupFromStartY =
                Hole.cup.y - previousY;

            let segmentPercent =
                (
                    cupFromStartX * movementX +
                    cupFromStartY * movementY
                ) /
                movementLengthSquared;

            segmentPercent = Math.max(
                0,
                Math.min(1, segmentPercent)
            );

            closestX =
                previousX +
                movementX * segmentPercent;

            closestY =
                previousY +
                movementY * segmentPercent;
        }

        const distanceX = closestX - Hole.cup.x;
        const distanceY = closestY - Hole.cup.y;

        const closestDistance = Math.hypot(
            distanceX,
            distanceY
        );

        const speed = Math.hypot(
            this.velocityX,
            this.velocityY
        );

        const sinkRadius =
            Hole.cup.radius - this.radius * 0.25;

        const lipRadius =
            Hole.cup.radius + this.radius * 0.45;

        if (
            closestDistance <= sinkRadius &&
            speed <= this.sinkSpeedLimit
        ) {
            this.isSunk = true;

            this.x = Hole.cup.x;
            this.y = Hole.cup.y;

            this.velocityX = 0;
            this.velocityY = 0;

            return;
        }

        if (
            closestDistance <= lipRadius &&
            speed > this.sinkSpeedLimit
        ) {
            this.x = closestX;
            this.y = closestY;

            const crossProduct =
                (previousX - Hole.cup.x) *
                this.velocityY -
                (previousY - Hole.cup.y) *
                this.velocityX;

            const turnDirection =
                crossProduct >= 0 ? 1 : -1;

            const deflectionAngle =
                turnDirection * 0.22;

            const cosine =
                Math.cos(deflectionAngle);

            const sine =
                Math.sin(deflectionAngle);

            const originalVelocityX =
                this.velocityX;

            const originalVelocityY =
                this.velocityY;

            this.velocityX =
                (
                    originalVelocityX * cosine -
                    originalVelocityY * sine
                ) *
                this.cupSpeedRetention;

            this.velocityY =
                (
                    originalVelocityX * sine +
                    originalVelocityY * cosine
                ) *
                this.cupSpeedRetention;

            this.cupCollisionCooldown = 8;
        }
    },

    draw() {
        
        if (this.isSunk) {
            return;
        }

        //Soft shadow beneath the ball
        ctx.beginPath();
        ctx.ellipse(
            this.x + 2.5,
            this.y + 3.5,
            this.radius * 1.05,
            this.radius * 0.6,
            0,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fill();

        //Golf ball with a lit, slightly dimpled look
        const shading = ctx.createRadialGradient(
            this.x - this.radius * 0.35,
            this.y - this.radius * 0.4,
            this.radius * 0.1,
            this.x,
            this.y,
            this.radius
        );
        shading.addColorStop(0, "#ffffff");
        shading.addColorStop(0.65, "#f1f1ea");
        shading.addColorStop(1, "#c9c9bd");

        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = shading;
        ctx.fill();

        //Thin outline so it remains visible
        ctx.strokeStyle = "rgba(90, 90, 80, 0.55)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }
};