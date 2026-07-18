/*
    Zombie stun and club durability.

    Club attacks briefly stun struck zombies, creating a window to line up a
    putt. Repeated melee swings wear down the equipped club and progressively
    increase both aiming-guide wobble and final shot variance.
*/
(function () {
    const ZOMBIE_STUN_DURATION = 1.15;
    const DEFAULT_MAX_DURABILITY = 100;
    const DURABILITY_LOSS_PER_ATTACK = 4;
    const MAX_EXTRA_GUIDE_WOBBLE = 0.12;
    const MAX_SHOT_VARIANCE = 7 * Math.PI / 180;

    function ensureClubDurability(club) {
        if (!club) {
            return;
        }

        if (typeof club.maximumDurability !== "number") {
            club.maximumDurability = DEFAULT_MAX_DURABILITY;
        }

        if (typeof club.durability !== "number") {
            club.durability = club.maximumDurability;
        }

        club.durability = Math.max(
            0,
            Math.min(club.maximumDurability, club.durability)
        );
    }

    function getDurabilityRatio(club) {
        ensureClubDurability(club);

        if (!club || club.maximumDurability <= 0) {
            return 1;
        }

        return club.durability / club.maximumDurability;
    }

    function wearEquippedClub() {
        const club = Player.equippedClub;

        if (!club) {
            return;
        }

        ensureClubDurability(club);
        club.durability = Math.max(
            0,
            club.durability - DURABILITY_LOSS_PER_ATTACK
        );
    }

    for (const club of Object.values(Clubs)) {
        if (club && typeof club === "object") {
            ensureClubDurability(club);
        }
    }

    if (Array.isArray(window.DeveloperClubs)) {
        for (const club of DeveloperClubs) {
            ensureClubDurability(club);
        }
    }

    /*
        Consume durability when an attack actually begins. Failed button presses
        while putting, paused, dead, or unarmed do not damage the club.
    */
    const originalBeginClubAttack = Player.beginClubAttack.bind(Player);

    Player.beginClubAttack = function () {
        const attackStarted = originalBeginClubAttack();

        if (attackStarted) {
            wearEquippedClub();
        }

        return attackStarted;
    };

    /*
        Add a stun after the existing damage and knockback behavior. The stun is
        refreshed by another successful hit rather than stacked indefinitely.
    */
    const originalTakeClubHit = Zombie.prototype.takeClubHit;

    Zombie.prototype.takeClubHit = function (...args) {
        originalTakeClubHit.apply(this, args);
        this.stunRemaining = ZOMBIE_STUN_DURATION;
    };

    const originalZombieUpdate = Zombie.prototype.update;

    Zombie.prototype.update = function (deltaTime) {
        this.ensureCombatStats();

        if (this.stunRemaining > 0) {
            this.stunRemaining = Math.max(
                0,
                this.stunRemaining - deltaTime
            );

            this.velocityX = 0;
            this.velocityY = 0;

            if (this.clubHitFlash > 0) {
                this.clubHitFlash = Math.max(
                    0,
                    this.clubHitFlash - deltaTime
                );
            }

            return;
        }

        originalZombieUpdate.call(this, deltaTime);
    };

    const originalHandlePlayerAttack = Zombie.prototype.handlePlayerAttack;

    Zombie.prototype.handlePlayerAttack = function () {
        if (this.stunRemaining > 0) {
            return;
        }

        originalHandlePlayerAttack.call(this);
    };

    /* Draw a small rotating daze marker while a zombie is stunned. */
    const originalZombieDraw = Zombie.prototype.draw;

    Zombie.prototype.draw = function () {
        originalZombieDraw.call(this);

        if (!(this.stunRemaining > 0)) {
            return;
        }

        const pulse = performance.now() / 180;
        const markerY = this.y - this.radius - 22;

        ctx.save();
        ctx.fillStyle = "#ffe27a";
        ctx.font = "bold 15px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            "✦",
            this.x + Math.cos(pulse) * 10,
            markerY + Math.sin(pulse) * 3
        );
        ctx.fillText(
            "✦",
            this.x + Math.cos(pulse + Math.PI) * 10,
            markerY + Math.sin(pulse + Math.PI) * 3
        );
        ctx.restore();
    };

    /*
        Replace the normal aiming calculation with the same base behavior plus
        wear-driven wobble. A worn club makes the preview line visibly less
        trustworthy before the shot is released.
    */
    Player.updatePuttingAim = function () {
        if (!this.equippedClub) {
            this.state = "idle";
            return;
        }

        ensureClubDurability(this.equippedClub);

        const pullX = Ball.x - Pointer.x;
        const pullY = Ball.y - Pointer.y;
        const pullDistance = Math.hypot(pullX, pullY);

        if (pullDistance <= 0) {
            return;
        }

        const baseAngle = Math.atan2(pullY, pullX);
        const instability = 1 - this.equippedClub.aimStability;
        const durabilityRatio = getDurabilityRatio(this.equippedClub);
        const wear = 1 - durabilityRatio;

        const normalWobble = instability * 0.09;
        const durabilityWobble = wear * MAX_EXTRA_GUIDE_WOBBLE;
        const maximumWobble = normalWobble + durabilityWobble;

        const wobble =
            Math.sin(this.aimingElapsed * 3.1) * maximumWobble +
            Math.sin(this.aimingElapsed * 7.3) * maximumWobble * 0.35 +
            Math.sin(this.aimingElapsed * 12.7 + 1.4) *
                durabilityWobble * 0.3;

        const adjustedAngle = baseAngle + wobble;

        this.aimDirectionX = Math.cos(adjustedAngle);
        this.aimDirectionY = Math.sin(adjustedAngle);
    };

    /*
        Apply a small hidden release variance in addition to the visible guide
        wobble. New clubs remain exact; heavily worn clubs can deviate by up to
        seven degrees in either direction.
    */
    const originalHandlePuttingRelease = Player.handlePuttingRelease.bind(Player);

    Player.handlePuttingRelease = function () {
        const previousState = this.state;
        originalHandlePuttingRelease();

        if (
            previousState !== "aiming" ||
            this.state !== "swinging" ||
            !this.pendingShot ||
            !this.equippedClub
        ) {
            return;
        }

        const wear = 1 - getDurabilityRatio(this.equippedClub);
        const variance = (Math.random() * 2 - 1) *
            MAX_SHOT_VARIANCE * wear;

        const shotAngle = Math.atan2(
            this.pendingShot.directionY,
            this.pendingShot.directionX
        ) + variance;

        this.pendingShot.directionX = Math.cos(shotAngle);
        this.pendingShot.directionY = Math.sin(shotAngle);
    };

    function durabilityLabel(club) {
        if (!club) {
            return "No club";
        }

        ensureClubDurability(club);
        return `${Math.ceil(club.durability)} / ${club.maximumDurability}`;
    }

    /* Add durability feedback beside the attack control. */
    const durabilityPanel = document.createElement("div");
    durabilityPanel.id = "clubDurabilityPanel";

    Object.assign(durabilityPanel.style, {
        position: "fixed",
        right: "20px",
        bottom: "78px",
        zIndex: "12",
        minWidth: "145px",
        padding: "9px 12px",
        border: "1px solid rgba(255,255,255,0.65)",
        borderRadius: "8px",
        background: "rgba(20,20,20,0.78)",
        color: "white",
        font: "bold 13px Arial, sans-serif",
        textAlign: "center",
        pointerEvents: "none"
    });

    document.body.appendChild(durabilityPanel);

    function updateDurabilityPanel() {
        const gameplayActive =
            !window.MenuController ||
            window.MenuController.state === "playing";

        const club = Player.equippedClub;
        const ratio = club ? getDurabilityRatio(club) : 0;

        durabilityPanel.style.display = gameplayActive ? "block" : "none";
        durabilityPanel.textContent =
            `Club Durability: ${durabilityLabel(club)}`;

        durabilityPanel.style.borderColor =
            ratio > 0.5
                ? "rgba(132, 211, 119, 0.9)"
                : ratio > 0.2
                    ? "rgba(239, 194, 87, 0.95)"
                    : "rgba(226, 84, 75, 0.95)";

        requestAnimationFrame(updateDurabilityPanel);
    }

    updateDurabilityPanel();

    /* A brand-new Start or Dev Start repairs all clubs for a fresh run. */
    if (window.MenuController) {
        const originalBeginGame = MenuController.beginGame.bind(MenuController);

        MenuController.beginGame = function (developerMode) {
            for (const club of Object.values(Clubs)) {
                if (club && typeof club === "object") {
                    ensureClubDurability(club);
                    club.durability = club.maximumDurability;
                }
            }

            originalBeginGame(developerMode);
        };
    }
})();
