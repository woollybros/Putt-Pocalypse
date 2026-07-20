/*
    Recoverable out-of-bounds ball behavior.

    If the ball escapes the outer course walls, it enters an out-of-bounds state.
    While out of bounds it ignores course-wall collisions so the golfer can hit it
    back through the boundary. Normal wall collision resumes after the ball is
    safely back inside the playable enclosure.
*/
(function () {
    const BOUNDARY_TOLERANCE = 1.5;
    const RETURN_CLEARANCE = 3;
    const CANVAS_EDGE_RETENTION = 0.55;

    Ball.isOutOfBounds = false;

    function getCourseInteriorBounds() {
        const blockingWalls = Hole.walls.filter(wall => wall.blocksBall);

        if (blockingWalls.length === 0) {
            return {
                left: 0,
                right: canvas.width,
                top: 0,
                bottom: canvas.height
            };
        }

        const minimumX = Math.min(...blockingWalls.map(wall => wall.x));
        const maximumX = Math.max(...blockingWalls.map(wall => wall.x + wall.width));
        const minimumY = Math.min(...blockingWalls.map(wall => wall.y));
        const maximumY = Math.max(...blockingWalls.map(wall => wall.y + wall.height));

        const verticalWalls = blockingWalls.filter(wall => wall.height >= wall.width);
        const horizontalWalls = blockingWalls.filter(wall => wall.width >= wall.height);

        const leftWalls = verticalWalls.filter(wall =>
            Math.abs(wall.x - minimumX) <= BOUNDARY_TOLERANCE
        );

        const rightWalls = verticalWalls.filter(wall =>
            Math.abs(wall.x + wall.width - maximumX) <= BOUNDARY_TOLERANCE
        );

        const topWalls = horizontalWalls.filter(wall =>
            Math.abs(wall.y - minimumY) <= BOUNDARY_TOLERANCE
        );

        const bottomWalls = horizontalWalls.filter(wall =>
            Math.abs(wall.y + wall.height - maximumY) <= BOUNDARY_TOLERANCE
        );

        return {
            left: leftWalls.length > 0
                ? Math.max(...leftWalls.map(wall => wall.x + wall.width))
                : minimumX,
            right: rightWalls.length > 0
                ? Math.min(...rightWalls.map(wall => wall.x))
                : maximumX,
            top: topWalls.length > 0
                ? Math.max(...topWalls.map(wall => wall.y + wall.height))
                : minimumY,
            bottom: bottomWalls.length > 0
                ? Math.min(...bottomWalls.map(wall => wall.y))
                : maximumY
        };
    }

    function ballIsOutsideCourse(bounds) {
        return (
            Ball.x + Ball.radius < bounds.left ||
            Ball.x - Ball.radius > bounds.right ||
            Ball.y + Ball.radius < bounds.top ||
            Ball.y - Ball.radius > bounds.bottom
        );
    }

    function ballIsSafelyInsideCourse(bounds) {
        return (
            Ball.x - Ball.radius >= bounds.left + RETURN_CLEARANCE &&
            Ball.x + Ball.radius <= bounds.right - RETURN_CLEARANCE &&
            Ball.y - Ball.radius >= bounds.top + RETURN_CLEARANCE &&
            Ball.y + Ball.radius <= bounds.bottom - RETURN_CLEARANCE
        );
    }

    function keepBallReachableOnCanvas() {
        const minimumX = Ball.radius;
        const maximumX = canvas.width - Ball.radius;
        const minimumY = Ball.radius;
        const maximumY = canvas.height - Ball.radius;

        if (Ball.x < minimumX) {
            Ball.x = minimumX;
            Ball.velocityX = Math.abs(Ball.velocityX) * CANVAS_EDGE_RETENTION;
        } else if (Ball.x > maximumX) {
            Ball.x = maximumX;
            Ball.velocityX = -Math.abs(Ball.velocityX) * CANVAS_EDGE_RETENTION;
        }

        if (Ball.y < minimumY) {
            Ball.y = minimumY;
            Ball.velocityY = Math.abs(Ball.velocityY) * CANVAS_EDGE_RETENTION;
        } else if (Ball.y > maximumY) {
            Ball.y = maximumY;
            Ball.velocityY = -Math.abs(Ball.velocityY) * CANVAS_EDGE_RETENTION;
        }
    }

    const originalBallUpdate = Ball.update.bind(Ball);
    const originalWallCollisionHandler = Ball.handleWallCollisions.bind(Ball);

    Ball.update = function () {
        const bounds = getCourseInteriorBounds();

        if (!this.isOutOfBounds && ballIsOutsideCourse(bounds)) {
            this.isOutOfBounds = true;
        }

        if (this.isOutOfBounds) {
            this.handleWallCollisions = function () {};
            originalBallUpdate();
            this.handleWallCollisions = originalWallCollisionHandler;

            keepBallReachableOnCanvas();

            if (ballIsSafelyInsideCourse(bounds)) {
                this.isOutOfBounds = false;
            }

            return;
        }

        originalBallUpdate();

        if (ballIsOutsideCourse(bounds)) {
            this.isOutOfBounds = true;
        }
    };

    const originalBallDraw = Ball.draw.bind(Ball);

    Ball.draw = function () {
        originalBallDraw();

        if (!this.isOutOfBounds || this.isSunk) {
            return;
        }

        const pulse = 0.72 + Math.sin(performance.now() / 150) * 0.18;

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 196, 68, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
        ctx.fillRect(this.x - 68, this.y - 39, 136, 22);
        ctx.fillStyle = "#ffd46a";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("OUT OF BOUNDS — HIT IT BACK", this.x, this.y - 24);
        ctx.restore();
    };

    function teleportBallToGolfer() {
        Ball.x = Player.x;
        Ball.y = Player.y;
        Ball.velocityX = 0;
        Ball.velocityY = 0;
        Ball.isSunk = false;
        Ball.cupCollisionCooldown = 0;
        Ball.isOutOfBounds = false;

        Player.state = "idle";
        Player.pendingShot = null;
        Player.swingElapsed = 0;
        Player.swingHasHitBall = false;

        Pointer.isDown = false;
        Pointer.wasPressed = false;
        Pointer.wasReleased = false;
    }

    const teleportButton = document.getElementById("teleportBallButton");

    if (teleportButton) {
        teleportButton.addEventListener("click", teleportBallToGolfer);
    }

    document.addEventListener("keydown", event => {
        if (event.repeat || event.key.toLowerCase() !== "t") {
            return;
        }

        if (
            window.DeveloperModeActive !== true ||
            (window.MenuController && window.MenuController.state !== "playing")
        ) {
            return;
        }

        teleportBallToGolfer();
    });

    const originalResetHole = window.resetHole;

    if (typeof originalResetHole === "function") {
        window.resetHole = function (...args) {
            const result = originalResetHole.apply(this, args);
            Ball.isOutOfBounds = false;
            return result;
        };
    }
})();