let previousTime = 0;

let developerClubIndex = 0;

let holeCompleteShown = false;
let gameOverShown = false;

const holeCompletePanel =
    document.getElementById(
        "holeCompletePanel"
    );

const holeCompleteTitle =
    document.getElementById(
        "holeCompleteTitle"
    );

const holeCompleteName =
    document.getElementById(
        "holeCompleteName"
    );

const holeCompletePar =
    document.getElementById(
        "holeCompletePar"
    );

const holeCompleteStrokes =
    document.getElementById(
        "holeCompleteStrokes"
    );

const holeCompleteResult =
    document.getElementById(
        "holeCompleteResult"
    );

const continueButton =
    document.getElementById(
        "continueButton"
    );

const resetButton =
    document.getElementById("resetButton");

const switchClubButton =
    document.getElementById("switchClubButton");

function loadZombiesForCurrentHole() {
    /*
        Remove zombies from the previous attempt
        or previous hole.
    */
    Zombies.clear();

    /*
        Temporary hole-specific zombie placement.

        These can eventually move into the hole
        definitions themselves.
    */
    switch (Hole.number) {
        case 1:
            Zombies.spawn(
                Hole.tee.x + 220,
                Hole.tee.y - 40,
                {
                    speed: 45,
                    detectionDistance: 240,
                    loseInterestDistance: 400,
                    kickPower: 4,
                    attackStrength: 15,
                    attackCooldownDuration: 1.2,
                    clubDropChance: 0.25
                }
            );
            break;

        case 2:
            Zombies.spawn(
                Hole.tee.x + 260,
                Hole.tee.y + 80,
                {
                    speed: 50,
                    detectionDistance: 280,
                    kickPower: 4,
                    attackStrength: 15,
                    attackCooldownDuration: 1.2,
                    clubDropChance: 0.25
                }
            );
            break;

        case 3:
            Zombies.spawn(
                Hole.tee.x + 180,
                Hole.tee.y - 100,
                {
                    speed: 55,
                    detectionDistance: 300,
                    kickPower: 4,
                    attackStrength: 15,
                    attackCooldownDuration: 1.2,
                    clubDropChance: 0.25
                }
            );

            Zombies.spawn(
                Hole.tee.x + 320,
                Hole.tee.y + 100,
                {
                    speed: 40,
                    detectionDistance: 220,
                    kickPower: 4,
                    attackStrength: 15,
                    attackCooldownDuration: 1.2,
                    clubDropChance: 0.25
                }
            );
            break;

         case 4:
            Zombies.spawn(
                Hole.tee.x + 150,
                Hole.tee.y + 130,
                {
                    speed: 48,
                    detectionDistance: 260,
                    loseInterestDistance: 420,
                    kickPower: 4.2,
                    attackStrength: 16,
                    attackCooldownDuration: 1.15,
                    clubDropChance: 0.28
                }
            );

            Zombies.spawn(
                Hole.tee.x + 285,
                Hole.tee.y - 10,
                {
                    speed: 52,
                    detectionDistance: 280,
                    loseInterestDistance: 430,
                    kickPower: 4.2,
                    attackStrength: 16,
                    attackCooldownDuration: 1.1,
                    clubDropChance: 0.28
                }
            );

            Zombies.spawn(
                Hole.tee.x + 365,
                Hole.tee.y + 150,
                {
                    speed: 44,
                    detectionDistance: 240,
                    loseInterestDistance: 400,
                    kickPower: 4,
                    attackStrength: 18,
                    attackCooldownDuration: 1.3,
                    clubDropChance: 0.32
                }
            );
            break;

        case 5:
            Zombies.spawn(
                Hole.tee.x + 120,
                Hole.tee.y + 145,
                {
                    speed: 50,
                    detectionDistance: 280,
                    loseInterestDistance: 440,
                    kickPower: 4.3,
                    attackStrength: 17,
                    attackCooldownDuration: 1.1,
                    clubDropChance: 0.3
                }
            );

            Zombies.spawn(
                Hole.tee.x + 230,
                Hole.tee.y - 5,
                {
                    speed: 56,
                    detectionDistance: 300,
                    loseInterestDistance: 460,
                    kickPower: 4.3,
                    attackStrength: 17,
                    attackCooldownDuration: 1.05,
                    clubDropChance: 0.3
                }
            );

            Zombies.spawn(
                Hole.tee.x + 345,
                Hole.tee.y + 140,
                {
                    speed: 50,
                    detectionDistance: 285,
                    loseInterestDistance: 440,
                    kickPower: 4.4,
                    attackStrength: 18,
                    attackCooldownDuration: 1.1,
                    clubDropChance: 0.32
                }
            );

            Zombies.spawn(
                Hole.tee.x + 405,
                Hole.tee.y + 35,
                {
                    speed: 42,
                    detectionDistance: 250,
                    loseInterestDistance: 410,
                    kickPower: 4.1,
                    attackStrength: 20,
                    attackCooldownDuration: 1.35,
                    clubDropChance: 0.35
                }
            );
            break;

        case 6:
            /*
                Upper-path zombie.
            */
            Zombies.spawn(
                555,
                185,
                {
                    speed: 48,

                    detectionDistance: 250,
                    loseInterestDistance: 390,

                    kickPower: 4.2,

                    attackStrength: 16,
                    attackCooldownDuration: 1.15,

                    clubDropChance: 0.28
                }
            );

            /*
                Lower-path zombie.
            */
            Zombies.spawn(
                745,
                415,
                {
                    speed: 50,

                    detectionDistance: 270,
                    loseInterestDistance: 420,

                    kickPower: 4.2,

                    attackStrength: 17,
                    attackCooldownDuration: 1.1,

                    clubDropChance: 0.3
                }
            );

            /*
                Zombie near the cup side of the course.
            */
            Zombies.spawn(
                820,
                235,
                {
                    speed: 44,

                    detectionDistance: 235,
                    loseInterestDistance: 380,

                    kickPower: 4,

                    attackStrength: 18,
                    attackCooldownDuration: 1.25,

                    clubDropChance: 0.32
                }
            );
            break;
    }
}

function resetHole(
    resetStrokeCount = true,
    restoreHealth = false
) {
    /*
        Reset the ball to the current tee.
    */
    Ball.x = Hole.tee.x;
    Ball.y = Hole.tee.y;

    Ball.velocityX = 0;
    Ball.velocityY = 0;

    Ball.isSunk = false;
    Ball.cupCollisionCooldown = 0;

    /*
        Recover whichever club the player had
        before the reset.
    */
    const clubToRestore =
        Player.equippedClub ??
        Player.droppedClub?.club ??
        Clubs.rustyPutter;

    /*
        Reset the player near the tee.
    */
    Player.x = Hole.tee.x - 70;
    Player.y = Hole.tee.y;

    if (restoreHealth) {
        Player.health =
            Player.maximumHealth;
    }

    Player.damageCooldown = 0;

    Player.isDead = false;

    Player.equippedClub =
        clubToRestore;

    Player.droppedClub = null;

    Player.state = "idle";

    Player.stanceAngle = 0;

    Player.stanceRadius =
        Player.stanceDistance;

    Player.swingElapsed = 0;
    Player.swingHasHitBall = false;

    Player.pendingShot = null;

    /*
        Cancel any active pointer interaction.
    */
    Pointer.isDown = false;
    Pointer.wasPressed = false;
    Pointer.wasReleased = false;

    holeCompleteShown = false;
    gameOverShown = false;

    if (resetStrokeCount) {
        GameState.currentHoleStrokes = 0;
    }

    loadZombiesForCurrentHole();

    continueButton.dataset.mode = "";

    hideHoleCompletePanel();

    updateDeveloperButtons();
}

function advanceToNextHole() {
    GameState.courseScores.push({
        holeNumber: Hole.number,
        name: Hole.name,
        par: Hole.par,
        strokes: GameState.currentHoleStrokes
    });

    const loadedNextHole =
        Hole.next();

    if (!loadedNextHole) {
        showCourseComplete();

        return;
    }

    resetHole(true, false);
}

function switchDeveloperClub() {
    developerClubIndex++;

    if (
        developerClubIndex >=
        DeveloperClubs.length
    ) {
        developerClubIndex = 0;
    }

    Player.equippedClub =
        DeveloperClubs[developerClubIndex];

    Player.droppedClub = null;

    /*
        Cancel an unfinished shot when changing clubs.
    */
    Player.state = "idle";
    Player.pendingShot = null;
    Player.swingElapsed = 0;
    Player.swingHasHitBall = false;

    updateDeveloperButtons();
}

function updateDeveloperButtons() {
    if (!Player.equippedClub) {
        switchClubButton.textContent =
            "Club: Dropped";

        return;
    }

    switchClubButton.textContent =
        "Club: " +
        Player.equippedClub.name;
}

function drawDeveloperHud() {
    const club =
        Player.equippedClub;
    
    if (!club) {
        return;
    }

    ctx.save();

    ctx.fillStyle =
        "rgba(0, 0, 0, 0.55)";

    ctx.fillRect(
        16,
        16,
        270,
        132
    );

    ctx.fillStyle = "white";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "left";

    ctx.fillText(
        club.name,
        30,
        43
    );

    ctx.font = "15px Arial";

    ctx.fillText(
        "Power: " +
        club.maximumPower,
        30,
        70
    );

    ctx.fillText(
        "Maximum pull: " +
        club.maximumDragDistance,
        30,
        93
    );

    ctx.fillText(
        "Guide length: " +
        club.guideLength,
        30,
        116
    );

    ctx.fillText(
        "Bank previews: " +
        club.maxBankPreview,
        30,
        139
    );

    ctx.restore();
}

function handleDeveloperKeyboardControls() {
    if (Keys["r"]) {
        resetHole();
        Keys["r"] = false;
    }

    if (Keys["c"]) {
        switchDeveloperClub();
        Keys["c"] = false;
    }
}

function getScoreName(
    strokes,
    par
) {
    const difference =
        strokes - par;

    if (strokes === 1) {
        return "Hole in One!";
    }

    if (difference <= -3) {
        return "Albatross";
    }

    if (difference === -2) {
        return "Eagle";
    }

    if (difference === -1) {
        return "Birdie";
    }

    if (difference === 0) {
        return "Par";
    }

    if (difference === 1) {
        return "Bogey";
    }

    if (difference === 2) {
        return "Double Bogey";
    }

    if (difference === 3) {
        return "Triple Bogey";
    }

    return `+${difference}`;
}

function showHoleCompletePanel() {
    holeCompleteShown = true;

    continueButton.dataset.mode = "";

    Player.state = "holeComplete";

    AudioManager.play(
        "holeComplete",
        {
            volume: 0.65
        }
    );

    const scoreName =
        getScoreName(
            GameState.currentHoleStrokes,
            Hole.par
        );

    holeCompleteTitle.textContent =
        `Hole ${Hole.number} Complete`;

    holeCompleteName.textContent =
        Hole.name;

    holeCompletePar.textContent =
        Hole.par;

    holeCompleteStrokes.textContent =
        GameState.currentHoleStrokes;

    holeCompleteResult.textContent =
        scoreName;

    holeCompletePanel.classList.remove(
        "hidden"
    );

    if (Hole.isLastHole) {
        continueButton.textContent =
            "View Final Score";
    } else {
        continueButton.textContent =
            "Continue";
    }
}

function hideHoleCompletePanel() {
    holeCompletePanel.classList.add(
        "hidden"
    );
}

function showGameOver() {
    if (gameOverShown) {
        return;
    }

    gameOverShown = true;

    Player.state = "dead";

    continueButton.dataset.mode =
        "restartAfterDeath";

    holeCompleteTitle.textContent =
        "Game Over";

    holeCompleteName.textContent =
        "You were overwhelmed by the undead.";

    holeCompletePar.textContent =
        Hole.par;

    holeCompleteStrokes.textContent =
        GameState.currentHoleStrokes;

    holeCompleteResult.textContent =
        "Try Again";

    continueButton.textContent =
        "Restart Hole";

    holeCompletePanel.classList.remove(
        "hidden"
    );
}

function showCourseComplete() {
    const totalPar =
        GameState.courseScores.reduce(
            (
                total,
                score
            ) =>
                total +
                score.par,
            0
        );

    const totalStrokes =
        GameState.courseScores.reduce(
            (
                total,
                score
            ) =>
                total +
                score.strokes,
            0
        );

    const difference =
        totalStrokes -
        totalPar;

    let totalResult = "Even";

    if (difference > 0) {
        totalResult =
            `+${difference}`;
    }

    if (difference < 0) {
        totalResult =
            `${difference}`;
    }

    holeCompleteTitle.textContent =
        "Course Complete";

    holeCompleteName.textContent =
        `${Hole.count} Holes Finished`;

    holeCompletePar.textContent =
        totalPar;

    holeCompleteStrokes.textContent =
        totalStrokes;

    holeCompleteResult.textContent =
        totalResult;

    continueButton.textContent =
        "Play Again";

    holeCompletePanel.classList.remove(
        "hidden"
    );

    continueButton.dataset.mode =
        "restartCourse";
}

function update(deltaTime) {
    handleDeveloperKeyboardControls();

    /*
        Freeze gameplay while the
        completion panel is open.
    */
    if (!holeCompleteShown && !gameOverShown) {
        Player.update(deltaTime);

        /*
            Move zombies toward the player.
        */
        Zombies.update(deltaTime);

        /*
            Zombies attack after movement so contact
            is detected at the zombie's new position.
        */
        Zombies.handlePlayerAttacks();

        /*
            Move the ball using its normal physics.
        */
        Ball.update(deltaTime);

        /*
            Resolve zombie/ball collisions after
            both entities have moved.
        */
        Zombies.handleBallCollisions();
    }

    if (
        Player.isDead &&
        !gameOverShown
    ) {
        showGameOver();
    }

    if (
        Ball.isSunk &&
        !holeCompleteShown &&
        !gameOverShown
    ) {
        showHoleCompletePanel();
    }

    Pointer.endFrame();
}

function drawPlayerHealthBar() {
    const barX = 20;
    const barY = 20;

    const barWidth = 220;
    const barHeight = 22;

    const healthPercent = Math.max(
        0,
        Math.min(
            Player.health /
            Player.maximumHealth,
            1
        )
    );

    ctx.save();

    /*
        Outer panel.
    */
    ctx.fillStyle =
        "rgba(0, 0, 0, 0.65)";

    ctx.fillRect(
        barX - 8,
        barY - 8,
        barWidth + 16,
        barHeight + 34
    );

    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "left";

    ctx.fillText(
        "HEALTH",
        barX,
        barY + 13
    );

    /*
        Empty health-bar background.
    */
    ctx.fillStyle =
        "rgba(80, 0, 0, 0.9)";

    ctx.fillRect(
        barX,
        barY + 20,
        barWidth,
        barHeight
    );

    /*
        Health remaining.
    */
    ctx.fillStyle =
        healthPercent > 0.3
            ? "#4caf50"
            : "#d64545";

    ctx.fillRect(
        barX,
        barY + 20,
        barWidth * healthPercent,
        barHeight
    );

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    ctx.strokeRect(
        barX,
        barY + 20,
        barWidth,
        barHeight
    );

    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        `${Player.health} / ${Player.maximumHealth}`,
        barX + barWidth / 2,
        barY + 36
    );

    ctx.restore();
}

function draw() {
    World.draw();

    Hole.draw();

    Zombies.draw();

    Ball.draw();

    Player.draw();

    //drawDeveloperHud();
}

/*
    Fixed-timestep simulation.

    Ball physics is tuned per 60 Hz step, so the game advances in fixed
    1/60 s steps regardless of monitor refresh rate. Frame times close to
    1/60 are snapped to avoid occasional double/skipped steps from jitter.
*/
const FIXED_STEP = 1 / 60;
const MAX_STEPS_PER_FRAME = 5;
let stepAccumulator = 0;

function loop(currentTime) {
    let frameTime = previousTime
        ? (currentTime - previousTime) / 1000
        : FIXED_STEP;

    previousTime = currentTime;

    if (Math.abs(frameTime - FIXED_STEP) < 0.002) {
        frameTime = FIXED_STEP;
    }

    stepAccumulator += Math.min(Math.max(frameTime, 0), 0.25);

    let steps = 0;

    while (
        stepAccumulator >= FIXED_STEP &&
        steps < MAX_STEPS_PER_FRAME
    ) {
        update(FIXED_STEP);
        stepAccumulator -= FIXED_STEP;
        steps++;
    }

    if (steps === MAX_STEPS_PER_FRAME) {
        stepAccumulator = 0;
    }

    draw();

    requestAnimationFrame(loop);
}

function initializeAudio() {
    AudioManager.initialize();

    document.removeEventListener(
        "pointerdown",
        initializeAudio
    );

    document.removeEventListener(
        "keydown",
        initializeAudio
    );
}

document.addEventListener(
    "pointerdown",
    initializeAudio
);

document.addEventListener(
    "keydown",
    initializeAudio
);

resetButton.addEventListener(
    "click",
    () => {
        resetHole(true, true);
    }
);

switchClubButton.addEventListener(
    "click",
    switchDeveloperClub
);

continueButton.addEventListener(
    "click",
    () => {
        if (
            continueButton.dataset.mode ===
            "restartAfterDeath"
        ) {
            continueButton.dataset.mode = "";

            resetHole(true, true);

            return;
        }

        if (
            continueButton.dataset.mode ===
            "restartCourse"
        ) {
            continueButton.dataset.mode =
                "";

            GameState.courseScores.length = 0;

            Hole.load(0);

            resetHole(true, true);

            return;
        }

        advanceToNextHole();
    }
);

updateDeveloperButtons();
resetHole();

requestAnimationFrame(loop);