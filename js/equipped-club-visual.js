/*
    Equipped club visual.

    This file loads after player.js and replaces Player.drawClub() so the
    player always visibly carries an equipped club. While aiming, the club
    is placed in an address position toward the ball. While swinging, it
    follows the existing swing timing. When the club is dropped,
    Player.equippedClub becomes null and nothing is drawn in the player's
    hands.
*/

(function () {
    Player.drawClub = function () {
        if (!this.equippedClub || this.isDead) {
            return;
        }

        const clubName = this.equippedClub.name || "";

        let shaftColor = "#7a7a7a";
        let headColor = "#4a4a4a";
        let gripColor = "#2c2c2c";

        if (clubName === "Rusty Putter") {
            shaftColor = "#8a6547";
            headColor = "#6d4934";
            gripColor = "#3a2a22";
        } else if (clubName === "Sporting Goods Putter") {
            shaftColor = "#aeb6bf";
            headColor = "#59636e";
            gripColor = "#23384f";
        } else if (clubName === "Tournament Putter") {
            shaftColor = "#d6d8dc";
            headColor = "#c6a64b";
            gripColor = "#171717";
        }

        const angleToBall = Math.atan2(
            Ball.y - this.y,
            Ball.x - this.x
        );

        let clubAngle;
        let shaftLength;
        let handDistance;

        if (
            this.state === "aiming" ||
            this.state === "swinging"
        ) {
            let swingOffset = 0;

            if (this.state === "swinging") {
                const swingProgress = Math.min(
                    this.swingElapsed /
                        this.equippedClub.swingDuration,
                    1
                );

                if (swingProgress < 0.45) {
                    swingOffset =
                        -0.78 *
                        (swingProgress / 0.45);
                } else {
                    swingOffset =
                        -0.78 +
                        1.42 *
                        (
                            (swingProgress - 0.45) /
                            0.55
                        );
                }
            }

            /*
                In the address position the club points toward the ball,
                making the player's stance read clearly as lining up a shot.
            */
            clubAngle = angleToBall + swingOffset;
            shaftLength = 34;
            handDistance = 7;
        } else {
            /*
                Idle carry pose: rest the club diagonally beside the golfer.
                It still loosely faces the ball so the pose works from any
                side of the course.
            */
            clubAngle = angleToBall + Math.PI * 0.72;
            shaftLength = 30;
            handDistance = 6;
        }

        const directionX = Math.cos(clubAngle);
        const directionY = Math.sin(clubAngle);
        const normalX = -directionY;
        const normalY = directionX;

        const handX =
            this.x + directionX * handDistance;

        const handY =
            this.y + directionY * handDistance;

        const shaftEndX =
            handX + directionX * shaftLength;

        const shaftEndY =
            handY + directionY * shaftLength;

        ctx.save();

        /* Grip */
        ctx.beginPath();
        ctx.moveTo(
            handX - directionX * 5,
            handY - directionY * 5
        );
        ctx.lineTo(
            handX + directionX * 4,
            handY + directionY * 4
        );
        ctx.strokeStyle = gripColor;
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.stroke();

        /* Shaft */
        ctx.beginPath();
        ctx.moveTo(handX, handY);
        ctx.lineTo(shaftEndX, shaftEndY);
        ctx.strokeStyle = shaftColor;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.stroke();

        /* Putter head */
        const headHalfWidth =
            clubName === "Tournament Putter" ? 7 : 6;

        ctx.beginPath();
        ctx.moveTo(
            shaftEndX - normalX * headHalfWidth,
            shaftEndY - normalY * headHalfWidth
        );
        ctx.lineTo(
            shaftEndX + normalX * headHalfWidth,
            shaftEndY + normalY * headHalfWidth
        );
        ctx.strokeStyle = headColor;
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.stroke();

        /* Hands gripping the club */
        ctx.beginPath();
        ctx.arc(
            handX - normalX * 2.5,
            handY - normalY * 2.5,
            3.2,
            0,
            Math.PI * 2
        );
        ctx.arc(
            handX + normalX * 2.5,
            handY + normalY * 2.5,
            3.2,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = "#f2c79b";
        ctx.fill();

        ctx.restore();
    };
})();
