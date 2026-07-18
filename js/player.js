const Player = {
    x: 400,
    y: 300,

    radius: 18,

    speed: 240,

    interactionDistance: 55,

    equippedClub: Clubs.rustyPutter,

    state: "idle",

    maximumHealth: 100,
    health: 100,

    isDead: false,

    damageCooldown: 0,
    damageCooldownDuration: 0.7,

    droppedClub: null,
    clubPickupDistance: 32,

    stanceDistance: 34,
    stanceRotationSpeed: 5.5,
    stanceRadiusSpeed: 10,

    stanceAngle: 0,
    stanceRadius: 34,

    aimDirectionX: 1,
    aimDirectionY: 0,

    aimingElapsed: 0,
    swingElapsed: 0,
    swingHasHitBall: false,

    pendingShot: null,



    update(deltaTime) {
        if (this.damageCooldown > 0) {
            this.damageCooldown -= deltaTime;

            if (this.damageCooldown < 0) {
                this.damageCooldown = 0;
            }
        }

        if (this.isDead) {
            return;
        }

        this.handleDroppedClubPickup();

        if (this.state === "idle") {
            this.updateMovement(deltaTime);
            this.handlePuttingStart();
        }

        if (this.state === "aiming") {
            this.aimingElapsed += deltaTime;

            this.updatePuttingAim();
            this.updatePuttingStance(deltaTime);
            this.handlePuttingRelease();
        }

        if (this.state === "swinging") {
            this.updateSwing(deltaTime);
        }
    },

    updateMovement(deltaTime) {
        let movementX = 0;
        let movementY = 0;

        if (Keys["w"]) {
            movementY -=
                this.speed *
                deltaTime;
        }

        if (Keys["s"]) {
            movementY +=
                this.speed *
                deltaTime;
        }

        if (Keys["a"]) {
            movementX -=
                this.speed *
                deltaTime;
        }

        if (Keys["d"]) {
            movementX +=
                this.speed *
                deltaTime;
        }

        /*
            Move one axis at a time so the player
            can slide along blocking walls.
        */
        this.x += movementX;

        if (this.isTouchingPlayerWall()) {
            this.x -= movementX;
        }

        this.y += movementY;

        if (this.isTouchingPlayerWall()) {
            this.y -= movementY;
        }
    },

    isTouchingPlayerWall() {
        for (const wall of Hole.walls) {
            if (!wall.blocksPlayer) {
                continue;
            }

            const closestX = Math.max(
                wall.x,
                Math.min(
                    this.x,
                    wall.x + wall.width
                )
            );

            const closestY = Math.max(
                wall.y,
                Math.min(
                    this.y,
                    wall.y + wall.height
                )
            );

            const distanceX =
                this.x - closestX;

            const distanceY =
                this.y - closestY;

            const distanceSquared =
                distanceX * distanceX +
                distanceY * distanceY;

            if (
                distanceSquared <
                this.radius *
                this.radius
            ) {
                return true;
            }
        }

        return false;
    },

    takeDamage(
        damageAmount,
        attackerX,
        attackerY,
        clubDropChance = 0
    ) {
        if (
            this.isDead ||
            this.damageCooldown > 0
        ) {
            return false;
        }

        this.health = Math.max(
            0,
            this.health - damageAmount
        );

        this.damageCooldown =
            this.damageCooldownDuration;

        /*
            Cancel any shot the player was preparing.
        */
        this.state = "idle";
        this.pendingShot = null;
        this.swingElapsed = 0;
        this.swingHasHitBall = false;

        Pointer.isDown = false;
        Pointer.wasPressed = false;
        Pointer.wasReleased = false;

        /*
            Knock the player away from the attacker.
        */
        const awayX =
            this.x - attackerX;

        const awayY =
            this.y - attackerY;

        const distanceFromAttacker =
            Math.hypot(
                awayX,
                awayY
            );

        if (distanceFromAttacker > 0) {
            const knockbackDistance = 35;

            this.x +=
                awayX /
                distanceFromAttacker *
                knockbackDistance;

            this.y +=
                awayY /
                distanceFromAttacker *
                knockbackDistance;
        }

        /*
            A successful attack may knock away
            the currently equipped club.
        */
        if (
            this.equippedClub &&
            Math.random() < clubDropChance
        ) {
            this.dropEquippedClub(
                attackerX,
                attackerY
            );
        }

        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
            this.state = "dead";
        }

        return true;
    },

    dropEquippedClub(
        attackerX,
        attackerY
    ) {
        if (
            !this.equippedClub ||
            this.droppedClub
        ) {
            return;
        }

        /*
            Start with a direction moving away
            from the attacking zombie.
        */
        const awayX =
            this.x - attackerX;

        const awayY =
            this.y - attackerY;

        let baseAngle = Math.atan2(
            awayY,
            awayX
        );

        /*
            Add up to 35 degrees of randomness
            in either direction.
        */
        const randomAngleOffset =
            (
                Math.random() * 70 -
                35
            ) *
            Math.PI /
            180;

        baseAngle += randomAngleOffset;

        const dropDistance =
            65 +
            Math.random() * 55;

        this.droppedClub = {
            club: this.equippedClub,

            x:
                this.x +
                Math.cos(baseAngle) *
                dropDistance,

            y:
                this.y +
                Math.sin(baseAngle) *
                dropDistance,

            radius: 10
        };

        this.equippedClub = null;

        updateDeveloperButtons();
    },

    handleDroppedClubPickup() {
        if (!this.droppedClub) {
            return;
        }

        const distanceToClub =
            Math.hypot(
                this.x -
                    this.droppedClub.x,

                this.y -
                    this.droppedClub.y
            );

        if (
            distanceToClub >
            this.clubPickupDistance
        ) {
            return;
        }

        this.equippedClub =
            this.droppedClub.club;

        this.droppedClub = null;

        updateDeveloperButtons();
    },

    handlePuttingStart() {
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

        if (
            Pointer.wasPressed &&
            playerIsCloseEnough &&
            pointerIsOnBall &&
            !Ball.isMoving() &&
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
    },

    updatePuttingAim() {
        if (!this.equippedClub) {
            this.state = "idle";
            return;
        }
        
        const pullX = Ball.x - Pointer.x;
        const pullY = Ball.y - Pointer.y;

        const pullDistance = Math.hypot(
            pullX,
            pullY
        );

        if (pullDistance <= 0) {
            return;
        }

        const baseDirectionX =
            pullX / pullDistance;

        const baseDirectionY =
            pullY / pullDistance;

        const baseAngle = Math.atan2(
            baseDirectionY,
            baseDirectionX
        );

        /*
            Stability ranges from 0 through 1.

            Lower stability produces more visible
            movement in the aiming direction.
        */
        const instability =
            1 -
            this.equippedClub.aimStability;

        const maximumWobble =
            instability * 0.09;

        /*
            Combining two oscillations prevents the
            guide from moving in one perfectly
            predictable rhythm.
        */
        const wobble =
            Math.sin(
                this.aimingElapsed * 3.1
            ) *
            maximumWobble +
            Math.sin(
                this.aimingElapsed * 7.3
            ) *
            maximumWobble *
            0.35;

        const adjustedAngle =
            baseAngle + wobble;

        this.aimDirectionX =
            Math.cos(adjustedAngle);

        this.aimDirectionY =
            Math.sin(adjustedAngle);
    },

    updatePuttingStance(deltaTime) {
        /*
            Rotate the shot direction by 270 degrees
            for a right-handed golfer's stance.
        */
        const stanceDirectionX =
            this.aimDirectionY;

        const stanceDirectionY =
            -this.aimDirectionX;

        const targetAngle = Math.atan2(
            stanceDirectionY,
            stanceDirectionX
        );

        let angleDifference =
            targetAngle - this.stanceAngle;

        // Normalize to the range -PI through PI.
        angleDifference = Math.atan2(
            Math.sin(angleDifference),
            Math.cos(angleDifference)
        );

        const maximumAngleChange =
            this.stanceRotationSpeed *
            deltaTime;

        const angleChange = Math.max(
            -maximumAngleChange,
            Math.min(
                maximumAngleChange,
                angleDifference
            )
        );

        this.stanceAngle += angleChange;

        /*
            Smoothly move onto the proper stance radius.
            This keeps the initial address movement from
            snapping into place.
        */
        const radiusBlend =
            1 -
            Math.exp(
                -this.stanceRadiusSpeed *
                deltaTime
            );

        this.stanceRadius +=
            (
                this.stanceDistance -
                this.stanceRadius
            ) *
            radiusBlend;

        this.x =
            Ball.x +
            Math.cos(this.stanceAngle) *
            this.stanceRadius;

        this.y =
            Ball.y +
            Math.sin(this.stanceAngle) *
            this.stanceRadius;
    },

    handlePuttingRelease() {
        if (!this.equippedClub) {
            this.state = "idle";
            return;
        }
        
        if (!Pointer.wasReleased) {
            return;
        }

        const pullX = Ball.x - Pointer.x;
        const pullY = Ball.y - Pointer.y;

        const pullDistance = Math.hypot(
            pullX,
            pullY
        );

        if (pullDistance < 8) {
            this.state = "idle";
            return;
        }

        const directionX =
            this.aimDirectionX;

        const directionY =
            this.aimDirectionY;

        const limitedPullDistance = Math.min(
            pullDistance,
            this.equippedClub.maximumDragDistance
        );

        const powerPercent =
            limitedPullDistance /
            this.equippedClub.maximumDragDistance;
        
        const adjustedPowerPercent =
            Math.pow(
                powerPercent,
                1.25
            );

        const shotPower =
            adjustedPowerPercent *
            this.equippedClub.maximumPower;

        /*
            Store the shot instead of launching
            the ball immediately.
        */
        this.pendingShot = {
            directionX,
            directionY,
            power: shotPower
        };

        this.state = "swinging";
        this.swingElapsed = 0;
        this.swingHasHitBall = false;
    },

    updateSwing(deltaTime) {
        if (
            !this.equippedClub ||
            !this.pendingShot
        ) {
            this.state = "idle";
            this.pendingShot = null;
            return;
        }

        this.swingElapsed += deltaTime;
        
        const impactTime =
            this.equippedClub.swingDuration *
            this.equippedClub.swingImpactPercent;

        if (
            !this.swingHasHitBall &&
            this.swingElapsed >= impactTime
        ) {

            GameState.currentHoleStrokes++;

            const powerRatio = Math.min(
                    this.pendingShot.power /
                    this.equippedClub.maximumPower,
                    1
                );

                AudioManager.play(
                    "putt",
                    {
                        volume:
                            0.35 +
                            powerRatio * 0.45,

                        playbackRate:
                            0.9 +
                            powerRatio * 0.15
                    }
                );

            Ball.shoot(
                this.pendingShot.directionX,
                this.pendingShot.directionY,
                this.pendingShot.power
            );

            this.swingHasHitBall = true;
        }

        if (
            this.swingElapsed >=
            this.equippedClub.swingDuration
        ) {
            this.state = "idle";
            this.pendingShot = null;
            this.swingElapsed = 0;
        }
    },

    findGuideWallCollision(
        startX,
        startY,
        directionX,
        directionY,
        maximumDistance
    ) {
        let nearestCollision = null;

        for (const wall of Hole.walls) {
            if (!wall.blocksBall) {
                continue;
            }

            /*
                Expand the wall by the ball radius.

                This lets us trace the center of the ball
                while still predicting where the outside
                edge of the ball will contact the wall.
            */
            const left =
                wall.x - Ball.radius;

            const right =
                wall.x +
                wall.width +
                Ball.radius;

            const top =
                wall.y - Ball.radius;

            const bottom =
                wall.y +
                wall.height +
                Ball.radius;

            let nearX = -Infinity;
            let farX = Infinity;

            let nearY = -Infinity;
            let farY = Infinity;

            if (Math.abs(directionX) > 0.000001) {
                const firstX =
                    (left - startX) /
                    directionX;

                const secondX =
                    (right - startX) /
                    directionX;

                nearX = Math.min(
                    firstX,
                    secondX
                );

                farX = Math.max(
                    firstX,
                    secondX
                );
            } else if (
                startX < left ||
                startX > right
            ) {
                continue;
            }

            if (Math.abs(directionY) > 0.000001) {
                const firstY =
                    (top - startY) /
                    directionY;

                const secondY =
                    (bottom - startY) /
                    directionY;

                nearY = Math.min(
                    firstY,
                    secondY
                );

                farY = Math.max(
                    firstY,
                    secondY
                );
            } else if (
                startY < top ||
                startY > bottom
            ) {
                continue;
            }

            const entryDistance = Math.max(
                nearX,
                nearY
            );

            const exitDistance = Math.min(
                farX,
                farY
            );

            if (
                entryDistance < 0 ||
                entryDistance > exitDistance ||
                entryDistance > maximumDistance
            ) {
                continue;
            }

            let normalX = 0;
            let normalY = 0;

            /*
                Whichever axis has the later entry time
                identifies the wall face that was hit.
            */
            if (nearX > nearY) {
                normalX =
                    directionX > 0
                        ? -1
                        : 1;
            } else {
                normalY =
                    directionY > 0
                        ? -1
                        : 1;
            }

            if (
                !nearestCollision ||
                entryDistance <
                    nearestCollision.distance
            ) {
                nearestCollision = {
                    distance: entryDistance,

                    x:
                        startX +
                        directionX *
                        entryDistance,

                    y:
                        startY +
                        directionY *
                        entryDistance,

                    normalX,
                    normalY
                };
            }
        }

        return nearestCollision;
    },

    buildShotGuide(
        startX,
        startY,
        directionX,
        directionY,
        totalLength,
        maximumBanks
    ) {
        const segments = [];

        let currentX = startX;
        let currentY = startY;

        let currentDirectionX =
            directionX;

        let currentDirectionY =
            directionY;

        let remainingLength =
            totalLength;

        let banksUsed = 0;

        /*
            This prevents an accidental endless loop
            if the guide lands precisely on a corner.
        */
        const maximumSegments =
            maximumBanks + 1;

        while (
            remainingLength > 0 &&
            segments.length < maximumSegments
        ) {
            const collision =
                this.findGuideWallCollision(
                    currentX,
                    currentY,
                    currentDirectionX,
                    currentDirectionY,
                    remainingLength
                );

            if (!collision) {
                segments.push({
                    startX: currentX,
                    startY: currentY,

                    endX:
                        currentX +
                        currentDirectionX *
                        remainingLength,

                    endY:
                        currentY +
                        currentDirectionY *
                        remainingLength
                });

                break;
            }

            segments.push({
                startX: currentX,
                startY: currentY,

                endX: collision.x,
                endY: collision.y
            });

            remainingLength -=
                collision.distance;

            if (
                banksUsed >= maximumBanks ||
                remainingLength <= 0
            ) {
                break;
            }

            /*
                Reflect the direction across the
                collision surface normal.
            */
            const directionDotNormal =
                currentDirectionX *
                    collision.normalX +
                currentDirectionY *
                    collision.normalY;

            currentDirectionX -=
                2 *
                directionDotNormal *
                collision.normalX;

            currentDirectionY -=
                2 *
                directionDotNormal *
                collision.normalY;

            banksUsed++;

            /*
                Move a tiny distance away from the wall
                so the next ray does not immediately hit
                the same surface again.
            */
            const guidePadding = 0.1;

            currentX =
                collision.x +
                currentDirectionX *
                guidePadding;

            currentY =
                collision.y +
                currentDirectionY *
                guidePadding;

            remainingLength -=
                guidePadding;
        }

        return segments;
    },

    drawClub() {
        if (
            !this.equippedClub ||
            (
                this.state !== "aiming" &&
                this.state !== "swinging"
            )
        ) {
            return;
        }

        const playerToBallAngle = Math.atan2(
            Ball.y - this.y,
            Ball.x - this.x
        );

        let swingOffset = 0;

        if (this.state === "swinging") {
            const swingProgress = Math.min(
                this.swingElapsed /
                this.equippedClub.swingDuration,
                1
            );

            if (swingProgress < 0.45) {
                // Backswing
                swingOffset =
                    -0.75 *
                    (swingProgress / 0.45);
            } else {
                // Downswing and follow-through
                swingOffset =
                    -0.75 +
                    1.35 *
                    (
                        (swingProgress - 0.45) /
                        0.55
                    );
            }
        }

        const clubAngle =
            playerToBallAngle +
            swingOffset;

        const clubLength = 30;

        const clubStartX =
            this.x +
            Math.cos(clubAngle) * 6;

        const clubStartY =
            this.y +
            Math.sin(clubAngle) * 6;

        const clubEndX =
            this.x +
            Math.cos(clubAngle) *
            clubLength;

        const clubEndY =
            this.y +
            Math.sin(clubAngle) *
            clubLength;

        ctx.beginPath();

        ctx.moveTo(
            clubStartX,
            clubStartY
        );

        ctx.lineTo(
            clubEndX,
            clubEndY
        );

        ctx.strokeStyle = "#444444";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.lineCap = "butt";
    },

    draw(){
        /*
            Draw the dropped club before drawing
            the player so it appears on the ground.
        */
        if (this.droppedClub) {
            this.drawDroppedClub();
        }
        
        ctx.save();

        /*
            Shadow
        */
        ctx.beginPath();

        ctx.ellipse(
            this.x + 2,
            this.y + this.radius * 0.7,
            this.radius,
            this.radius * 0.55,
            0,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "rgba(0,0,0,0.25)";

        ctx.fill();

        /*
            Face
        */
        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#f2c79b";
        ctx.fill();

        ctx.strokeStyle = "#a46f45";
        ctx.lineWidth = 2;
        ctx.stroke();

        /*
            Golf cap

            The cap extends slightly below the forehead
            so there is no skin-colored gap above the visor.
        */
        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y - 1,
            this.radius - 1,
            Math.PI,
            0
        );

        ctx.lineTo(
            this.x + this.radius - 1,
            this.y
        );

        ctx.quadraticCurveTo(
            this.x,
            this.y + 2,
            this.x - this.radius + 1,
            this.y
        );

        ctx.closePath();

        ctx.fillStyle = "#3d73c7";
        ctx.fill();

        /*
            Cap visor

            This overlaps the bottom of the cap and
            projects slightly forward.
        */
        ctx.beginPath();

        ctx.moveTo(
            this.x - 10,
            this.y - 1
        );

        ctx.quadraticCurveTo(
            this.x,
            this.y + 2,
            this.x + 10,
            this.y - 1
        );

        ctx.quadraticCurveTo(
            this.x,
            this.y + 1,
            this.x - 10,
            this.y - 1
        );

        ctx.closePath();

        ctx.fillStyle = "#2d5ca8";
        ctx.fill();

        /*
            Eyes

            Small dark eyes read better at this scale
            than large white circles.
        */
        ctx.fillStyle = "#202020";

        ctx.beginPath();

        ctx.arc(
            this.x - 5,
            this.y + 3,
            1.4,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.beginPath();

        ctx.arc(
            this.x + 5,
            this.y + 3,
            1.4,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /*
            Small nose
        */
        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y + 5,
            1.1,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#b78357";
        ctx.fill();

        ctx.restore();

        if (this.state === "aiming") {
            const pullX = Ball.x - Pointer.x;
            const pullY = Ball.y - Pointer.y;

            const pullDistance = Math.hypot(
                pullX,
                pullY
            );

            if (pullDistance > 0) {
                const directionX = this.aimDirectionX;
                const directionY = this.aimDirectionY;

                const powerPercent = Math.min(
                    pullDistance /
                    this.equippedClub.maximumDragDistance,
                    1
                );

                /*
                    The guide grows quickly at low power,
                    then gradually approaches the club's
                    maximum guide length.

                    At 25% shot power:
                    guide is about 50% length.

                    At 50% shot power:
                    guide is about 71% length.

                    At 100% shot power:
                    guide is full length.
                */
                const guidePowerPercent = Math.min(
                    powerPercent / 0.7,
                    1
                );

                const guideScale =
                    Math.pow(
                        guidePowerPercent,
                        1.35
                    );

                const guideDistance =
                    this.equippedClub.guideLength *
                    guideScale;

                const guideSegments =
                    this.buildShotGuide(
                        Ball.x,
                        Ball.y,

                        directionX,
                        directionY,

                        guideDistance,

                        this.equippedClub.maxBankPreview
                    );
                
                const instability =
                    1 -
                    this.equippedClub.aimStability;

                const fuzzAngle =
                    instability * 0.055;

                const centerAngle = Math.atan2(
                    directionY,
                    directionX
                );

                const leftFuzzDirectionX =
                    Math.cos(centerAngle - fuzzAngle);

                const leftFuzzDirectionY =
                    Math.sin(centerAngle - fuzzAngle);

                const rightFuzzDirectionX =
                    Math.cos(centerAngle + fuzzAngle);

                const rightFuzzDirectionY =
                    Math.sin(centerAngle + fuzzAngle);

                const leftFuzzSegments =
                    this.buildShotGuide(
                        Ball.x,
                        Ball.y,

                        leftFuzzDirectionX,
                        leftFuzzDirectionY,

                        guideDistance,

                        this.equippedClub.maxBankPreview
                    );

                const rightFuzzSegments =
                    this.buildShotGuide(
                        Ball.x,
                        Ball.y,

                        rightFuzzDirectionX,
                        rightFuzzDirectionY,

                        guideDistance,

                        this.equippedClub.maxBankPreview
                    );

                // Pull-back line
                ctx.beginPath();
                ctx.moveTo(Ball.x, Ball.y);
                ctx.lineTo(Pointer.x, Pointer.y);

                ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
                ctx.lineWidth = 2;
                ctx.stroke();

                // Shot preview line
                /*
                    Faint outer lines show the club's
                    stability or uncertainty envelope.
                */
                if (fuzzAngle > 0.001) {
                    ctx.beginPath();

                    for (const segment of leftFuzzSegments) {
                        ctx.moveTo(
                            segment.startX,
                            segment.startY
                        );

                        ctx.lineTo(
                            segment.endX,
                            segment.endY
                        );
                    }

                    for (const segment of rightFuzzSegments) {
                        ctx.moveTo(
                            segment.startX,
                            segment.startY
                        );

                        ctx.lineTo(
                            segment.endX,
                            segment.endY
                        );
                    }

                    ctx.strokeStyle =
                        "rgba(255, 255, 255, 0.20)";

                    ctx.lineWidth = 2;

                    ctx.setLineDash([5, 8]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }

                /*
                    The bright center line is the direction
                    the ball will actually travel.
                */
                ctx.beginPath();

                for (const segment of guideSegments) {
                    ctx.moveTo(
                        segment.startX,
                        segment.startY
                    );

                    ctx.lineTo(
                        segment.endX,
                        segment.endY
                    );
                }

                ctx.strokeStyle =
                    "rgba(255, 255, 255, 0.9)";

                ctx.lineWidth = 3;

                ctx.setLineDash([8, 6]);
                ctx.stroke();
                ctx.setLineDash([]);

                // Power indicator
                const barWidth = 100;
                const barHeight = 10;
                const barX = Ball.x - barWidth / 2;
                const barY = Ball.y + 35;

                ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
                ctx.fillRect(
                    barX,
                    barY,
                    barWidth,
                    barHeight
                );

                ctx.fillStyle = "white";
                ctx.fillRect(
                    barX,
                    barY,
                    barWidth * powerPercent,
                    barHeight
                );
            }
        }

        this.drawClub();
    },

    drawDroppedClub() {
        if (!this.droppedClub) {
            return;
        }

        const clubX =
            this.droppedClub.x;

        const clubY =
            this.droppedClub.y;

        ctx.save();

        /*
            Pickup indicator.
        */
        ctx.beginPath();

        ctx.arc(
            clubX,
            clubY,
            18,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "rgba(255, 255, 255, 0.65)";

        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        /*
            Club shaft.
        */
        ctx.beginPath();

        ctx.moveTo(
            clubX - 14,
            clubY - 8
        );

        ctx.lineTo(
            clubX + 14,
            clubY + 8
        );

        ctx.strokeStyle = "#d6d6d6";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();

        /*
            Putter head.
        */
        ctx.beginPath();

        ctx.moveTo(
            clubX + 11,
            clubY + 5
        );

        ctx.lineTo(
            clubX + 17,
            clubY + 11
        );

        ctx.strokeStyle = "#555555";
        ctx.lineWidth = 7;
        ctx.stroke();

        ctx.lineCap = "butt";

        ctx.restore();
    }

};
