/*
    Tunnel recovery and dropped-club safety.
*/

(function () {
    Ball.tunnelSlopeAcceleration = 0.05;
    Ball.tunnelSlopeMaximumSpeed = 1.6;
    Ball.tunnelSlowSpeedThreshold = 0.18;
    Ball.tunnelSlowFrameThreshold = 30;
    Ball.tunnelRescueMinimumSpeed = 0.45;
    Ball.windmillTunnelSlowFrames = 0;

    Ball.isInsideWindmillTunnel = function () {
        const windmill = Hole.windmill;

        if (!windmill) {
            return false;
        }

        const guideLength = 55;

        return (
            this.x >= windmill.x - guideLength &&
            this.x <= windmill.x + windmill.width + guideLength &&
            this.y >= windmill.tunnelTop + this.radius &&
            this.y <= windmill.tunnelBottom - this.radius
        );
    };

    Ball.applyWindmillTunnelSlope = function () {
        if (!this.isInsideWindmillTunnel()) {
            this.windmillTunnelSlowFrames = 0;
            return;
        }

        const windmill = Hole.windmill;
        const tunnelCenterX = windmill.x + windmill.width / 2;
        const distanceFromCenter = this.x - tunnelCenterX;

        let slopeDirection;

        if (Math.abs(distanceFromCenter) <= this.tunnelCenterDeadZone) {
            slopeDirection = this.velocityX !== 0
                ? Math.sign(this.velocityX)
                : -1;
        } else {
            slopeDirection = Math.sign(distanceFromCenter);
        }

        if (Math.abs(this.velocityX) < this.tunnelSlopeMaximumSpeed) {
            this.velocityX += slopeDirection * this.tunnelSlopeAcceleration;
        }

        const totalSpeed = Math.hypot(this.velocityX, this.velocityY);

        if (totalSpeed < this.tunnelSlowSpeedThreshold) {
            this.windmillTunnelSlowFrames++;
        } else {
            this.windmillTunnelSlowFrames = 0;
        }

        if (this.windmillTunnelSlowFrames >= this.tunnelSlowFrameThreshold) {
            this.velocityX = slopeDirection * Math.max(
                Math.abs(this.velocityX),
                this.tunnelRescueMinimumSpeed
            );

            this.windmillTunnelSlowFrames = 0;
        }
    };

    Player.isDroppedClubPositionAccessible = function (x, y, radius = 10) {
        const canvasMargin = radius + 4;

        if (
            x < canvasMargin ||
            x > canvas.width - canvasMargin ||
            y < canvasMargin ||
            y > canvas.height - canvasMargin
        ) {
            return false;
        }

        for (const wall of Hole.walls) {
            if (!wall.blocksPlayer) {
                continue;
            }

            const closestX = Math.max(wall.x, Math.min(x, wall.x + wall.width));
            const closestY = Math.max(wall.y, Math.min(y, wall.y + wall.height));
            const distanceX = x - closestX;
            const distanceY = y - closestY;

            if (
                distanceX * distanceX + distanceY * distanceY <
                radius * radius
            ) {
                return false;
            }
        }

        return true;
    };

    Player.findAccessibleClubDropPosition = function (
        preferredAngle,
        preferredDistance
    ) {
        const dropRadius = 10;
        const angleStep = Math.PI / 12;

        for (let distanceOffset = 0; distanceOffset <= 60; distanceOffset += 15) {
            const distances = [
                preferredDistance - distanceOffset,
                preferredDistance + distanceOffset
            ];

            for (const distance of distances) {
                if (distance < 28) {
                    continue;
                }

                for (let angleIndex = 0; angleIndex < 24; angleIndex++) {
                    const signedIndex = angleIndex === 0
                        ? 0
                        : Math.ceil(angleIndex / 2) *
                          (angleIndex % 2 === 0 ? -1 : 1);

                    const angle = preferredAngle + signedIndex * angleStep;
                    const x = this.x + Math.cos(angle) * distance;
                    const y = this.y + Math.sin(angle) * distance;

                    if (
                        this.isDroppedClubPositionAccessible(
                            x,
                            y,
                            dropRadius
                        )
                    ) {
                        return { x, y };
                    }
                }
            }
        }

        for (let radius = 28; radius <= 80; radius += 8) {
            for (let angleIndex = 0; angleIndex < 24; angleIndex++) {
                const angle = angleIndex * Math.PI * 2 / 24;
                const x = this.x + Math.cos(angle) * radius;
                const y = this.y + Math.sin(angle) * radius;

                if (
                    this.isDroppedClubPositionAccessible(
                        x,
                        y,
                        dropRadius
                    )
                ) {
                    return { x, y };
                }
            }
        }

        return { x: this.x, y: this.y };
    };

    Player.dropEquippedClub = function (attackerX, attackerY) {
        if (!this.equippedClub || this.droppedClub) {
            return;
        }

        const awayX = this.x - attackerX;
        const awayY = this.y - attackerY;

        let baseAngle = Math.atan2(awayY, awayX);

        baseAngle += (
            Math.random() * 70 - 35
        ) * Math.PI / 180;

        const dropDistance = 65 + Math.random() * 55;
        const safePosition = this.findAccessibleClubDropPosition(
            baseAngle,
            dropDistance
        );

        this.droppedClub = {
            club: this.equippedClub,
            x: safePosition.x,
            y: safePosition.y,
            radius: 10
        };

        this.equippedClub = null;
        updateDeveloperButtons();
    };
})();