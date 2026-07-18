/*
    Zombie developer controls and circular golfer visual.

    This module is intentionally loaded after the existing player-boundary
    module so it can keep the fixed-camera boundary while simplifying the
    golfer artwork.
*/

(function () {
    const ZombieDebug = {
        isPaused: false,

        togglePause() {
            this.isPaused = !this.isPaused;
            this.updateButtons();
        },

        removeAll() {
            Zombies.clear();
            this.updateButtons();
        },

        updateButtons() {
            if (this.pauseButton) {
                this.pauseButton.textContent =
                    this.isPaused
                        ? "Resume Zombies"
                        : "Pause Zombies";

                this.pauseButton.style.backgroundColor =
                    this.isPaused
                        ? "#a83f3f"
                        : "#3f7f4c";
            }

            if (this.removeButton) {
                this.removeButton.textContent =
                    `Remove Zombies (${Zombies.items.length})`;
            }
        }
    };

    window.ZombieDebug = ZombieDebug;

    /*
        Pause zombie thinking, movement, and attacks while leaving the player,
        ball, aiming, and course animation active. Frozen zombies still behave
        as physical obstacles for the ball.
    */
    const originalZombieUpdate =
        Zombies.update.bind(Zombies);

    Zombies.update = function (deltaTime) {
        if (ZombieDebug.isPaused) {
            for (const zombie of this.items) {
                zombie.velocityX = 0;
                zombie.velocityY = 0;
            }

            return;
        }

        originalZombieUpdate(deltaTime);
    };

    const originalHandlePlayerAttacks =
        Zombies.handlePlayerAttacks.bind(Zombies);

    Zombies.handlePlayerAttacks = function () {
        if (ZombieDebug.isPaused) {
            return;
        }

        originalHandlePlayerAttacks();
    };

    /*
        Build the controls here instead of hard-coding them into the page.
        This keeps the debug feature removable as one module later.
    */
    const developerControls =
        document.getElementById("developerControls");

    const pauseButton = document.createElement("button");
    pauseButton.id = "pauseZombiesButton";
    pauseButton.addEventListener(
        "click",
        () => ZombieDebug.togglePause()
    );

    const removeButton = document.createElement("button");
    removeButton.id = "removeZombiesButton";
    removeButton.style.backgroundColor = "#6f3434";
    removeButton.addEventListener(
        "click",
        () => ZombieDebug.removeAll()
    );

    developerControls.appendChild(pauseButton);
    developerControls.appendChild(removeButton);

    ZombieDebug.pauseButton = pauseButton;
    ZombieDebug.removeButton = removeButton;
    ZombieDebug.updateButtons();

    /*
        Keyboard shortcuts:
        Z = pause/resume zombies
        X = remove zombies from the current hole
    */
    document.addEventListener(
        "keydown",
        event => {
            if (event.repeat) {
                return;
            }

            if (event.key.toLowerCase() === "z") {
                ZombieDebug.togglePause();
            }

            if (event.key.toLowerCase() === "x") {
                ZombieDebug.removeAll();
            }
        }
    );

    /*
        Return to the compact circular arcade silhouette. The original head,
        cap, face, aiming guide, dropped club, and equipped-club animation are
        still drawn by player.js and the equipped-club modules.
    */
    Player.drawGolferBody = function () {
        if (this.isDead) {
            return;
        }

        const bodyCenterY = this.y + 18;
        const bodyRadius = 17;

        ctx.save();

        /* Circular shirt/body. */
        ctx.beginPath();
        ctx.arc(
            this.x,
            bodyCenterY,
            bodyRadius,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = "#d9e2ef";
        ctx.fill();
        ctx.strokeStyle = "#526b86";
        ctx.lineWidth = 2;
        ctx.stroke();

        /* Polo collar. */
        ctx.beginPath();
        ctx.moveTo(this.x - 6, this.y + 6);
        ctx.lineTo(this.x, this.y + 12);
        ctx.lineTo(this.x + 6, this.y + 6);
        ctx.strokeStyle = "#7990aa";
        ctx.lineWidth = 2;
        ctx.stroke();

        /* A simple shirt stripe gives the circle a readable front. */
        ctx.beginPath();
        ctx.arc(
            this.x,
            bodyCenterY,
            bodyRadius - 5,
            0.35,
            Math.PI - 0.35
        );
        ctx.strokeStyle = "rgba(61, 115, 199, 0.75)";
        ctx.lineWidth = 4;
        ctx.stroke();

        /* Small feet keep movement direction visually grounded. */
        ctx.beginPath();
        ctx.moveTo(this.x - 11, bodyCenterY + 16);
        ctx.lineTo(this.x - 3, bodyCenterY + 16);
        ctx.moveTo(this.x + 3, bodyCenterY + 16);
        ctx.lineTo(this.x + 11, bodyCenterY + 16);
        ctx.strokeStyle = "#252525";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.restore();
    };

    /*
        The circular body does not extend as far downward as the previous
        torso-and-legs artwork, so use the regular circular boundary clearance.
    */
    Player.clampToScreen = function () {
        const minimumX =
            this.radius + this.screenBoundaryPadding;

        const maximumX =
            canvas.width -
            this.radius -
            this.screenBoundaryPadding;

        const minimumY =
            this.radius + this.screenBoundaryPadding;

        const circularBodyClearance = 24;

        const maximumY =
            canvas.height -
            this.radius -
            circularBodyClearance -
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

    function drawZombieDeveloperHud() {
        const panelWidth = 225;
        const panelHeight = 150;
        const panelX = canvas.width - panelWidth - 18;
        const panelY = 18;

        const clubName = Player.equippedClub
            ? Player.equippedClub.name
            : "Dropped";

        ctx.save();

        ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
        ctx.fillRect(
            panelX,
            panelY,
            panelWidth,
            panelHeight
        );

        ctx.strokeStyle = ZombieDebug.isPaused
            ? "#e35a5a"
            : "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = 2;
        ctx.strokeRect(
            panelX,
            panelY,
            panelWidth,
            panelHeight
        );

        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.font = "bold 15px Arial";

        ctx.fillText(
            "DEVELOPER STATUS",
            panelX + 14,
            panelY + 24
        );

        ctx.font = "14px Arial";

        const lines = [
            `Hole: ${Hole.number} — Par ${Hole.par}`,
            `Zombies: ${Zombies.items.length}`,
            `Zombie AI: ${ZombieDebug.isPaused ? "PAUSED" : "Running"}`,
            `Club: ${clubName}`,
            `Health: ${Player.health} / ${Player.maximumHealth}`
        ];

        lines.forEach((line, index) => {
            ctx.fillStyle =
                index === 2 && ZombieDebug.isPaused
                    ? "#ff7777"
                    : "white";

            ctx.fillText(
                line,
                panelX + 14,
                panelY + 49 + index * 20
            );
        });

        ctx.restore();
    }

    /* Draw the status panel after the golfer and shot guide. */
    const originalPlayerDraw =
        Player.draw.bind(Player);

    Player.draw = function () {
        originalPlayerDraw();
        drawZombieDeveloperHud();
        ZombieDebug.updateButtons();
    };
})();
