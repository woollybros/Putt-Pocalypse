/*
    Windmill ball physics.

    This file loads after ball.js and extends Ball.update() with:
    - collision against the same rotating blade geometry used for drawing
    - a gentle center-crowned tunnel slope that rolls slow balls toward
      the nearest tunnel opening
*/

Ball.windmillBladeCollisionCooldown = 0;
Ball.windmillBladeCollisionCooldownDuration = 6;

Ball.tunnelSlopeAcceleration = 0.018;
Ball.tunnelSlopeMaximumSpeed = 1.35;
Ball.tunnelCenterDeadZone = 2;

Ball.isInsideWindmillTunnel = function () {
    const windmill = Hole.windmill;

    if (!windmill) {
        return false;
    }

    return (
        this.x >= windmill.x &&
        this.x <= windmill.x + windmill.width &&
        this.y >= windmill.tunnelTop + this.radius &&
        this.y <= windmill.tunnelBottom - this.radius
    );
};

Ball.applyWindmillTunnelSlope = function () {
    if (!this.isInsideWindmillTunnel()) {
        return;
    }

    const windmill = Hole.windmill;
    const tunnelCenterX =
        windmill.x + windmill.width / 2;

    const distanceFromCenter =
        this.x - tunnelCenterX;

    let slopeDirection = 0;

    if (
        distanceFromCenter <
        -this.tunnelCenterDeadZone
    ) {
        slopeDirection = -1;
    } else if (
        distanceFromCenter >
        this.tunnelCenterDeadZone
    ) {
        slopeDirection = 1;
    } else if (this.velocityX !== 0) {
        /*
            At the exact crown, preserve the direction the ball was
            already traveling rather than allowing it to balance there.
        */
        slopeDirection =
            Math.sign(this.velocityX);
    } else {
        /*
            A perfectly stopped ball at the crown rolls toward the
            nearest side based on its tiny positional offset. If it is
            mathematically exact, favor the tee-side opening.
        */
        slopeDirection =
            distanceFromCenter > 0 ? 1 : -1;
    }

    const horizontalSpeed =
        Math.abs(this.velocityX);

    if (
        horizontalSpeed <
        this.tunnelSlopeMaximumSpeed
    ) {
        this.velocityX +=
            slopeDirection *
            this.tunnelSlopeAcceleration;
    }
};

Ball.getWindmillBladeCollision = function (
    bladeAngle
) {
    const windmill = Hole.windmill;

    if (!windmill) {
        return null;
    }

    const cosine = Math.cos(bladeAngle);
    const sine = Math.sin(bladeAngle);

    const relativeX =
        this.x - windmill.hubX;

    const relativeY =
        this.y - windmill.hubY;

    /*
        Transform the ball center into blade-local coordinates.
        The blade rectangle begins 8 pixels from the hub, matching
        windmill-animation.js exactly.
    */
    const localX =
        relativeX * cosine +
        relativeY * sine;

    const localY =
        -relativeX * sine +
        relativeY * cosine;

    const bladeStartX = 8;
    const bladeEndX =
        bladeStartX + windmill.bladeLength;

    const bladeHalfWidth =
        windmill.bladeWidth / 2;

    const closestLocalX = Math.max(
        bladeStartX,
        Math.min(bladeEndX, localX)
    );

    const closestLocalY = Math.max(
        -bladeHalfWidth,
        Math.min(bladeHalfWidth, localY)
    );

    let differenceX =
        localX - closestLocalX;

    let differenceY =
        localY - closestLocalY;

    let distance = Math.hypot(
        differenceX,
        differenceY
    );

    if (distance >= this.radius) {
        return null;
    }

    let localNormalX;
    let localNormalY;

    if (distance > 0) {
        localNormalX =
            differenceX / distance;

        localNormalY =
            differenceY / distance;
    } else {
        /*
            The ball center is inside the blade rectangle. Resolve it
            through whichever blade edge is nearest.
        */
        const distanceToStart =
            localX - bladeStartX;

        const distanceToEnd =
            bladeEndX - localX;

        const distanceToTop =
            localY + bladeHalfWidth;

        const distanceToBottom =
            bladeHalfWidth - localY;

        const minimumEdgeDistance = Math.min(
            distanceToStart,
            distanceToEnd,
            distanceToTop,
            distanceToBottom
        );

        if (
            minimumEdgeDistance ===
            distanceToStart
        ) {
            localNormalX = -1;
            localNormalY = 0;
        } else if (
            minimumEdgeDistance ===
            distanceToEnd
        ) {
            localNormalX = 1;
            localNormalY = 0;
        } else if (
            minimumEdgeDistance ===
            distanceToTop
        ) {
            localNormalX = 0;
            localNormalY = -1;
        } else {
            localNormalX = 0;
            localNormalY = 1;
        }

        distance = 0;
    }

    const normalX =
        localNormalX * cosine -
        localNormalY * sine;

    const normalY =
        localNormalX * sine +
        localNormalY * cosine;

    const contactLocalX = closestLocalX;
    const contactLocalY = closestLocalY;

    const contactRelativeX =
        contactLocalX * cosine -
        contactLocalY * sine;

    const contactRelativeY =
        contactLocalX * sine +
        contactLocalY * cosine;

    return {
        normalX,
        normalY,
        overlap: this.radius - distance,
        contactRelativeX,
        contactRelativeY
    };
};

Ball.handleWindmillBladeCollisions = function () {
    const windmill = Hole.windmill;

    if (
        !windmill ||
        this.windmillBladeCollisionCooldown > 0
    ) {
        return;
    }

    const baseAngle =
        windmill.bladeAngle ??
        Hole.windmillAnimation?.angle ??
        0;

    for (
        let bladeIndex = 0;
        bladeIndex < 4;
        bladeIndex++
    ) {
        const bladeAngle =
            baseAngle +
            bladeIndex * Math.PI / 2;

        const collision =
            this.getWindmillBladeCollision(
                bladeAngle
            );

        if (!collision) {
            continue;
        }

        /*
            First separate the ball from the blade so repeated frames
            cannot leave it embedded in the obstacle.
        */
        this.x +=
            collision.normalX *
            (collision.overlap + 0.5);

        this.y +=
            collision.normalY *
            (collision.overlap + 0.5);

        const velocityAlongNormal =
            this.velocityX * collision.normalX +
            this.velocityY * collision.normalY;

        if (velocityAlongNormal < 0) {
            /*
                Reflect incoming ball velocity with modest energy loss.
            */
            this.velocityX -=
                1.7 *
                velocityAlongNormal *
                collision.normalX;

            this.velocityY -=
                1.7 *
                velocityAlongNormal *
                collision.normalY;
        }

        /*
            Convert blade rotational velocity to the ball's existing
            per-frame velocity scale. The game currently uses roughly
            60 physics updates per second.
        */
        const angularSpeed =
            Hole.windmillAnimation?.rotationSpeed ??
            0.9;

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
            2.2,
            Math.abs(bladeSpeedIntoBall) * 2.4
        );

        this.velocityX +=
            collision.normalX *
            knockAwaySpeed +
            bladeVelocityX * 0.35;

        this.velocityY +=
            collision.normalY *
            knockAwaySpeed +
            bladeVelocityY * 0.35;

        this.windmillBladeCollisionCooldown =
            this.windmillBladeCollisionCooldownDuration;

        AudioManager.play(
            "wallBounce",
            {
                volume: 0.55,
                playbackRate: 0.78
            }
        );

        break;
    }
};

const originalBallUpdate =
    Ball.update.bind(Ball);

Ball.update = function () {
    if (
        this.windmillBladeCollisionCooldown > 0
    ) {
        this.windmillBladeCollisionCooldown--;
    }

    originalBallUpdate();

    if (this.isSunk) {
        return;
    }

    this.applyWindmillTunnelSlope();
    this.handleWindmillBladeCollisions();
};
