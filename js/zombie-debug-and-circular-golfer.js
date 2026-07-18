/*
    Zombie developer controls and circular golfer visual.

    Debug controls remain installed, but only become interactive and visible
    when the game is launched through Dev Start.
*/
(function () {
    const ZombieDebug = {
        isPaused: false,

        togglePause() {
            if (window.DeveloperModeActive !== true) {
                return;
            }

            this.isPaused = !this.isPaused;
            this.updateButtons();
        },

        removeAll() {
            if (window.DeveloperModeActive !== true) {
                return;
            }

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

    const originalZombieUpdate =
        Zombies.update.bind(Zombies);

    Zombies.update = function (deltaTime) {
        if (
            window.DeveloperModeActive === true &&
            ZombieDebug.isPaused
        ) {
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
        if (
            window.DeveloperModeActive === true &&
            ZombieDebug.isPaused
        ) {
            return;
        }

        originalHandlePlayerAttacks();
    };

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

    document.addEventListener(
        "keydown",
        event => {
            if (
                event.repeat ||
                window.DeveloperModeActive !== true ||
                window.MenuController?.state !== "playing"
            ) {
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

    /* Compact circular arcade silhouette. */
    Player.drawGolferBody = function () {
        if (this.isDead) {
            return;
        }

        const bodyCenterY = this.y + 18;
        const bodyRadius = 17;

        ctx.save();

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

        /* Shirt stripe. */
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

        /* Small feet. */
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
        if (window.DeveloperModeActive !== true) {
            return;
        }

        const panelWidth = 225;
        const panelHeight = 150;
        const panelX = canvas.width - panelWidth - 18;
        const panelY = 18;

        const clubName = Player.equippedClub
            ? Player.equippedClub.name
            : "Dropped";

        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

        ctx.strokeStyle = ZombieDebug.isPaused
            ? "#e35a5a"
            : "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

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

    const originalPlayerDraw =
        Player.draw.bind(Player);

    Player.draw = function () {
        originalPlayerDraw();
        drawZombieDeveloperHud();

        if (window.DeveloperModeActive === true) {
            ZombieDebug.updateButtons();
        }
    };
})();
