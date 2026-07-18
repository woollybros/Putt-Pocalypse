/*
    Player boundary and visual redesign.

    Keeps the player inside the fixed camera viewport and gives the golfer a
    clearer body silhouette. The equipped club is anchored beside the body
    instead of through the center of the face.
*/

(function () {
    Player.screenBoundaryPadding = 12;

    Player.clampToScreen = function () {
        const minimumX =
            this.radius + this.screenBoundaryPadding;

        const maximumX =
            canvas.width -
            this.radius -
            this.screenBoundaryPadding;

        /*
            Leave extra vertical room for the cap and the newly drawn torso.
        */
        const minimumY =
            this.radius + this.screenBoundaryPadding;

        const maximumY =
            canvas.height -
            this.radius -
            20 -
            this.screenBoundaryPadding;

        this.x = Math.max(
            minimumX,
            Math.min(maximumX, this.x)
        );

        this.y = Math.max(
            minimumY,
            Math.min(maximumY, this.y)
        );
    };

    const originalPlayerUpdate =
        Player.update.bind(Player);

    Player.update = function (deltaTime) {
        originalPlayerUpdate(deltaTime);

        /*
            Clamp after every update so normal movement, aiming stance motion,
            and zombie knockback all respect the temporary viewport boundary.
        */
        this.clampToScreen();
    };

    const originalWorldDraw =
        World.draw.bind(World);

    World.draw = function () {
        originalWorldDraw();

        /*
            Temporary course fence for the fixed-camera version of the game.
            This can be removed when the camera begins following the player.
        */
        const inset = 6;

        ctx.save();
        ctx.strokeStyle = "rgba(43, 58, 38, 0.85)";
        ctx.lineWidth = 8;
        ctx.strokeRect(
            inset,
            inset,
            canvas.width - inset * 2,
            canvas.height - inset * 2
        );

        ctx.strokeStyle = "rgba(205, 220, 190, 0.35)";
        ctx.lineWidth = 2;
        ctx.strokeRect(
            inset + 5,
            inset + 5,
            canvas.width - (inset + 5) * 2,
            canvas.height - (inset + 5) * 2
        );
        ctx.restore();
    };

    Player.drawGolferBody = function () {
        if (this.isDead) {
            return;
        }

        ctx.save();

        /* Torso */
        ctx.beginPath();
        ctx.roundRect(
            this.x - 13,
            this.y + 10,
            26,
            25,
            8
        );
        ctx.fillStyle = "#d9e2ef";
        ctx.fill();
        ctx.strokeStyle = "#5c7088";
        ctx.lineWidth = 2;
        ctx.stroke();

        /* Shirt collar */
        ctx.beginPath();
        ctx.moveTo(this.x - 6, this.y + 11);
        ctx.lineTo(this.x, this.y + 17);
        ctx.lineTo(this.x + 6, this.y + 11);
        ctx.strokeStyle = "#7f95ae";
        ctx.lineWidth = 2;
        ctx.stroke();

        /* Legs */
        ctx.beginPath();
        ctx.moveTo(this.x - 6, this.y + 33);
        ctx.lineTo(this.x - 8, this.y + 43);
        ctx.moveTo(this.x + 6, this.y + 33);
        ctx.lineTo(this.x + 8, this.y + 43);
        ctx.strokeStyle = "#33465d";
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.stroke();

        /* Shoes */
        ctx.beginPath();
        ctx.moveTo(this.x - 11, this.y + 44);
        ctx.lineTo(this.x - 4, this.y + 44);
        ctx.moveTo(this.x + 4, this.y + 44);
        ctx.lineTo(this.x + 11, this.y + 44);
        ctx.strokeStyle = "#252525";
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.restore();
    };

    const originalPlayerDraw =
        Player.draw.bind(Player);

    Player.draw = function () {
        /*
            Draw the body first. player.js then draws the existing head, cap,
            face, dropped club, aiming guide, and equipped club over it.
        */
        this.drawGolferBody();
        originalPlayerDraw();
    };

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

            clubAngle = angleToBall + swingOffset;
            shaftLength = 34;
        } else {
            clubAngle = angleToBall + Math.PI * 0.72;
            shaftLength = 31;
        }

        const directionX = Math.cos(clubAngle);
        const directionY = Math.sin(clubAngle);
        const normalX = -directionY;
        const normalY = directionX;

        /*
            Put the hands on the side of the golfer nearest the club shaft.
            This keeps the grip outside the face instead of starting at its
            center.
        */
        const sideSign =
            Math.cos(angleToBall) >= 0 ? 1 : -1;

        const handX =
            this.x + normalX * 11 * sideSign;

        const handY =
            this.y + 13 + normalY * 4 * sideSign;

        const shaftEndX =
            handX + directionX * shaftLength;

        const shaftEndY =
            handY + directionY * shaftLength;

        ctx.save();

        /* Arms reaching from the shoulders to the grip. */
        ctx.beginPath();
        ctx.moveTo(this.x - 9, this.y + 15);
        ctx.lineTo(handX - normalX * 2.5, handY);
        ctx.moveTo(this.x + 9, this.y + 15);
        ctx.lineTo(handX + normalX * 2.5, handY);
        ctx.strokeStyle = "#f2c79b";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.stroke();

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
        ctx.stroke();

        /* Shaft */
        ctx.beginPath();
        ctx.moveTo(handX, handY);
        ctx.lineTo(shaftEndX, shaftEndY);
        ctx.strokeStyle = shaftColor;
        ctx.lineWidth = 3;
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
        ctx.stroke();

        /* Hands around the grip. */
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