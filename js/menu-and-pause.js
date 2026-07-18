/*
    Start menu, developer start, and pause menu.

    This module loads after the game scripts so it can place a lightweight
    state gate around the existing update loop without changing game physics.
*/
(function () {
    const startScreen = document.getElementById("startScreen");
    const pausePanel = document.getElementById("pausePanel");
    const startButton = document.getElementById("startGameButton");
    const devStartButton = document.getElementById("devStartGameButton");
    const pauseButton = document.getElementById("pauseGameButton");
    const resumeButton = document.getElementById("resumeGameButton");
    const pauseResetButton = document.getElementById("pauseResetButton");
    const exitToMenuButton = document.getElementById("exitToMenuButton");
    const developerControls = document.getElementById("developerControls");

    const MenuController = {
        state: "menu",
        developerMode: false,

        setDeveloperMode(enabled) {
            this.developerMode = enabled;
            window.DeveloperModeActive = enabled;

            developerControls.classList.toggle(
                "hidden",
                !enabled || this.state !== "playing"
            );

            document.body.classList.toggle(
                "developer-mode",
                enabled
            );
        },

        beginGame(developerMode) {
            this.state = "playing";
            this.setDeveloperMode(developerMode);

            startScreen.classList.add("hidden");
            pausePanel.classList.add("hidden");
            pauseButton.classList.remove("hidden");

            GameState.courseScores.length = 0;
            Hole.load(0);
            resetHole(true, true);

            if (window.ZombieDebug) {
                ZombieDebug.isPaused = false;
                ZombieDebug.updateButtons();
            }
        },

        pause() {
            if (this.state !== "playing") {
                return;
            }

            this.state = "paused";
            pausePanel.classList.remove("hidden");
            pauseButton.classList.add("hidden");
            developerControls.classList.add("hidden");

            Pointer.isDown = false;
            Pointer.wasPressed = false;
            Pointer.wasReleased = false;
        },

        resume() {
            if (this.state !== "paused") {
                return;
            }

            this.state = "playing";
            pausePanel.classList.add("hidden");
            pauseButton.classList.remove("hidden");
            this.setDeveloperMode(this.developerMode);
        },

        resetCurrentHole() {
            resetHole(true, true);
            this.resume();
        },

        exitToMenu() {
            this.state = "menu";
            this.setDeveloperMode(false);

            pausePanel.classList.add("hidden");
            startScreen.classList.remove("hidden");
            pauseButton.classList.add("hidden");
            developerControls.classList.add("hidden");

            if (window.ZombieDebug) {
                ZombieDebug.isPaused = false;
                ZombieDebug.updateButtons();
            }

            hideHoleCompletePanel();
            Pointer.isDown = false;
            Pointer.wasPressed = false;
            Pointer.wasReleased = false;
        }
    };

    window.MenuController = MenuController;
    window.DeveloperModeActive = false;

    /* Freeze game simulation while on the title or pause screen. */
    const originalGameUpdate = update;

    update = function (deltaTime) {
        if (MenuController.state !== "playing") {
            Pointer.endFrame();
            return;
        }

        originalGameUpdate(deltaTime);
    };

    startButton.addEventListener(
        "click",
        () => MenuController.beginGame(false)
    );

    devStartButton.addEventListener(
        "click",
        () => MenuController.beginGame(true)
    );

    pauseButton.addEventListener(
        "click",
        () => MenuController.pause()
    );

    resumeButton.addEventListener(
        "click",
        () => MenuController.resume()
    );

    pauseResetButton.addEventListener(
        "click",
        () => MenuController.resetCurrentHole()
    );

    exitToMenuButton.addEventListener(
        "click",
        () => MenuController.exitToMenu()
    );

    /*
        Block every developer-only keyboard shortcut unless Dev Start is active.
        Capture phase runs before the existing input and developer listeners.
    */
    document.addEventListener(
        "keydown",
        event => {
            const developerKeys = [
                "r",
                "c",
                "[",
                "]",
                "z",
                "x"
            ];

            const key = event.key.toLowerCase();

            if (
                developerKeys.includes(key) &&
                (
                    MenuController.developerMode !== true ||
                    MenuController.state !== "playing"
                )
            ) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        },
        true
    );

    document.addEventListener(
        "keydown",
        event => {
            if (event.repeat) {
                return;
            }

            if (event.key === "Escape" || event.key.toLowerCase() === "p") {
                if (MenuController.state === "playing") {
                    MenuController.pause();
                } else if (MenuController.state === "paused") {
                    MenuController.resume();
                }
            }
        }
    );

    /* Initial title-screen state. */
    developerControls.classList.add("hidden");
    pausePanel.classList.add("hidden");
    pauseButton.classList.add("hidden");
    startScreen.classList.remove("hidden");
})();
