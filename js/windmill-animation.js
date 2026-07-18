/*
    Windmill animation support.

    This file overrides Hole.drawWindmill() after hole.js loads.
    Phase 1 is visual only: the blades rotate, but they do not
    collide with the ball yet.
*/

Hole.windmillAnimation = {
    angle: Math.PI / 4,

    /*
        Radians per second.

        A value of 0.9 gives the blades a steady pace without
        making the obstacle look frantic.
    */
    rotationSpeed: 0.9,

    previousTime: performance.now()
};

Hole.drawWindmill = function () {
    if (!this.windmill) {
        return;
    }

    const windmill = this.windmill;
    const animation = this.windmillAnimation;

    const currentTime = performance.now();

    const deltaTime = Math.min(
        (currentTime - animation.previousTime) / 1000,
        0.05
    );

    animation.previousTime = currentTime;

    animation.angle +=
        animation.rotationSpeed * deltaTime;

    if (animation.angle >= Math.PI * 2) {
        animation.angle -= Math.PI * 2;
    }

    /*
        Keep the current blade angle available for the next phase,
        when ball collision will use the same geometry as the drawing.
    */
    windmill.bladeAngle = animation.angle;

    ctx.save();

    /*
        Main windmill body.
    */
    ctx.fillStyle = "#c9b18a";

    ctx.fillRect(
        windmill.x,
        windmill.y,
        windmill.width,
        windmill.height
    );

    ctx.strokeStyle = "#66523b";
    ctx.lineWidth = 3;

    ctx.strokeRect(
        windmill.x,
        windmill.y,
        windmill.width,
        windmill.height
    );

    /*
        Roof.
    */
    ctx.beginPath();

    ctx.moveTo(
        windmill.x - 12,
        windmill.y
    );

    ctx.lineTo(
        windmill.x +
        windmill.width / 2,
        windmill.y - 45
    );

    ctx.lineTo(
        windmill.x +
        windmill.width +
        12,
        windmill.y
    );

    ctx.closePath();

    ctx.fillStyle = "#7b3f2c";
    ctx.fill();

    ctx.strokeStyle = "#4b291e";
    ctx.lineWidth = 3;
    ctx.stroke();

    /*
        Tunnel opening.
    */
    ctx.fillStyle = "#202020";

    ctx.fillRect(
        windmill.x,
        windmill.tunnelTop,
        windmill.width,
        windmill.tunnelBottom -
        windmill.tunnelTop
    );

    /*
        Tunnel interior highlight.
    */
    ctx.fillStyle =
        "rgba(255, 255, 255, 0.08)";

    ctx.fillRect(
        windmill.x,
        windmill.tunnelTop + 5,
        windmill.width,
        5
    );

    /*
        Rotating blades.
    */
    ctx.translate(
        windmill.hubX,
        windmill.hubY
    );

    for (
        let bladeIndex = 0;
        bladeIndex < 4;
        bladeIndex++
    ) {
        ctx.save();

        ctx.rotate(
            animation.angle +
            bladeIndex * Math.PI / 2
        );

        ctx.fillStyle = "#ded2b4";
        ctx.strokeStyle = "#5d513c";
        ctx.lineWidth = 2;

        ctx.fillRect(
            8,
            -windmill.bladeWidth / 2,
            windmill.bladeLength,
            windmill.bladeWidth
        );

        ctx.strokeRect(
            8,
            -windmill.bladeWidth / 2,
            windmill.bladeLength,
            windmill.bladeWidth
        );

        ctx.restore();
    }

    /*
        Blade hub.
    */
    ctx.beginPath();

    ctx.arc(
        0,
        0,
        10,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#594c36";
    ctx.fill();

    ctx.strokeStyle = "#2f281d";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
};
