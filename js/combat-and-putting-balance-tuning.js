/*
    Small combat and putting balance adjustments.

    Extends zombie stun slightly, reduces the camera shake produced by routine
    bank shots, and allows the golfer to begin lining up a new shot while the
    ball is still rolling very slowly.
*/
(function () {
    const ZOMBIE_STUN_DURATION = 1.45;
    const MAXIMUM_PUTTABLE_ROLL_SPEED = 0.75;
    const MAXIMUM_BANK_NUDGE = 1.25;
    const BANK_NUDGE_DURATION = 65;

    /*
        The stun module applies its normal duration first. Set the final value
        after every successful club hit so this tuning remains isolated.
    */
    const originalTakeClubHit = Zombie.prototype.takeClubHit;

    Zombie.prototype.takeClubHit = function (...args) {
        originalTakeClubHit.apply(this, args);

        if (this.health > 0) {
            this.stunRemaining = ZOMBIE_STUN_DURATION;
        }
    };

    /*
        Allow aiming to begin while the ball is creeping, but continue to reject
        a shot when it is moving fast enough that lining up would feel unclear.
    */
    Player.handlePuttingStart = function () {
        if (!this.equippedClub) {
            return;
        }

        const playerToBallX = Ball.x - this.x;
        const playerToBallY = Ball.y - this.y;
        const distanceToBall = Math.hypot(
            playerToBallX,
            playerToBallY
        );

        const pointerToBallX = Pointer.x - Ball.x;
        const pointerToBallY = Pointer.y - Ball.y;
        const pointerDistanceToBall = Math.hypot(
            pointerToBallX,
            pointerToBallY
        );

        const playerIsCloseEnough =
            distanceToBall <= this.interactionDistance;
        const pointerIsOnBall =
            pointerDistanceToBall <= Ball.radius + 14;
        const ballSpeed = Math.hypot(
            Ball.velocityX,
            Ball.velocityY
        );
        const ballIsSlowEnough =
            ballSpeed <= MAXIMUM_PUTTABLE_ROLL_SPEED;

        if (
            Pointer.wasPressed &&
            playerIsCloseEnough &&
            pointerIsOnBall &&
            ballIsSlowEnough &&
            !Ball.isSunk
        ) {
            this.state = "aiming";
            this.aimingElapsed = 0;

            this.stanceAngle = Math.atan2(
                this.y - Ball.y,
                this.x - Ball.x
            );

            this.stanceRadius = Math.max(
                distanceToBall,
                1
            );

            this.updatePuttingAim();
        }
    };

    /*
        Gameplay juice detects bank shots with Math.sign and applies its regular
        shake. Suppress only that bank-shot detection during Ball.update, then
        replace it with a very small visual nudge. Other shake sources—combat,
        water, damage, deaths, and sunk putts—remain unchanged.
    */
    const originalBallUpdate = Ball.update.bind(Ball);

    Ball.update = function (...args) {
        const velocityBeforeX = this.velocityX;
        const velocityBeforeY = this.velocityY;
        const speedBefore = Math.hypot(
            velocityBeforeX,
            velocityBeforeY
        );

        const originalMathSign = Math.sign;

        Math.sign = function (value) {
            if (value === 0 || Number.isNaN(value)) {
                return 0;
            }

            return 1;
        };

        try {
            originalBallUpdate(...args);
        } finally {
            Math.sign = originalMathSign;
        }

        const speedAfter = Math.hypot(
            this.velocityX,
            this.velocityY
        );

        const directionChanged =
            originalMathSign(velocityBeforeX) !== originalMathSign(this.velocityX) ||
            originalMathSign(velocityBeforeY) !== originalMathSign(this.velocityY);

        const routineBankShot =
            speedBefore > 1 &&
            speedAfter > 0.6 &&
            directionChanged &&
            !this.isSunk;

        if (!routineBankShot || typeof canvas.animate !== "function") {
            return;
        }

        const nudge = Math.min(
            MAXIMUM_BANK_NUDGE,
            0.35 + speedBefore * 0.08
        );

        canvas.animate(
            [
                { transform: "translate(0, 0)" },
                { transform: `translate(${nudge}px, ${-nudge * 0.55}px)` },
                { transform: "translate(0, 0)" }
            ],
            {
                duration: BANK_NUDGE_DURATION,
                easing: "ease-out"
            }
        );
    };
})();