const HoleLayouts = [
    {
        name: "Dead Simple",
        par: 2,

        tee: {
            x: 520,
            y: 300
        },

        cup: {
            x: 760,
            y: 300,
            radius: 11
        },

        walls: [
            {
                x: 450,
                y: 250,
                width: 360,
                height: 20,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },
            {
                x: 450,
                y: 350,
                width: 360,
                height: 20,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },
            {
                x: 450,
                y: 250,
                width: 20,
                height: 120,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },
            {
                x: 790,
                y: 250,
                width: 20,
                height: 120,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            }
        ]
    },

    {
        name: "Around the Bend",
        par: 3,

        tee: {
            x: 500,
            y: 220
        },

        cup: {
            x: 750,
            y: 390,
            radius: 11
        },

        walls: [
            // Top boundary
            {
                x: 430,
                y: 170,
                width: 260,
                height: 20,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Upper-right boundary
            {
                x: 670,
                y: 170,
                width: 20,
                height: 130,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Far-right boundary
            {
                x: 670,
                y: 280,
                width: 160,
                height: 20,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },
            {
                x: 810,
                y: 280,
                width: 20,
                height: 160,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Bottom boundary
            {
                x: 570,
                y: 420,
                width: 260,
                height: 20,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Lower-left boundary
            {
                x: 570,
                y: 310,
                width: 20,
                height: 130,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Left boundary
            {
                x: 430,
                y: 170,
                width: 20,
                height: 160,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },
            {
                x: 430,
                y: 310,
                width: 160,
                height: 20,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            }
        ]
    },

    {
        name: "Thread the Needle",
        par: 3,

        tee: {
            x: 480,
            y: 300
        },

        cup: {
            x: 790,
            y: 300,
            radius: 11
        },

        walls: [
            // Outer top
            {
                x: 420,
                y: 210,
                width: 430,
                height: 20,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Outer bottom
            {
                x: 420,
                y: 370,
                width: 430,
                height: 20,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Outer left
            {
                x: 420,
                y: 210,
                width: 20,
                height: 180,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Outer right
            {
                x: 830,
                y: 210,
                width: 20,
                height: 180,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Upper obstacle
            {
                x: 610,
                y: 230,
                width: 30,
                height: 55,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Lower obstacle
            {
                x: 610,
                y: 315,
                width: 30,
                height: 55,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            }
        ]
    },

    {
        name: "Double Dogleg",
        par: 4,

        tee: {
            x: 455,
            y: 215
        },

        cup: {
            x: 825,
            y: 385,
            radius: 11
        },

        walls: [
            /*
                Outer boundary
            */

            // Top
            {
                x: 400,
                y: 150,
                width: 480,
                height: 20,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Bottom
            {
                x: 400,
                y: 430,
                width: 480,
                height: 20,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Left
            {
                x: 400,
                y: 150,
                width: 20,
                height: 300,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Right
            {
                x: 860,
                y: 150,
                width: 20,
                height: 300,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            /*
                First barrier extends down from the top.

                The ball must travel underneath it.
            */
            {
                x: 535,
                y: 170,
                width: 24,
                height: 175,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            /*
                Second barrier extends up from the bottom.

                After going below the first barrier,
                the ball must travel above this one.
            */
            {
                x: 680,
                y: 255,
                width: 24,
                height: 175,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            /*
                Small bumper near the cup prevents
                a completely straight final approach.
            */
            {
                x: 790,
                y: 300,
                width: 35,
                height: 25,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            }
        ]
    },

    {
        name: "The Gauntlet",
        par: 5,

        tee: {
            x: 455,
            y: 215
        },

        cup: {
            x: 830,
            y: 375,
            radius: 11
        },

        walls: [
            /*
                Outer boundary
            */

            // Top
            {
                x: 390,
                y: 140,
                width: 500,
                height: 20,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Bottom
            {
                x: 390,
                y: 440,
                width: 500,
                height: 20,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Left
            {
                x: 390,
                y: 140,
                width: 20,
                height: 320,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Right
            {
                x: 870,
                y: 140,
                width: 20,
                height: 320,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            /*
                Barrier 1

                Travel underneath this barrier.
            */
            {
                x: 510,
                y: 160,
                width: 26,
                height: 190,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            /*
                Barrier 2

                Travel back above this barrier.
            */
            {
                x: 625,
                y: 250,
                width: 26,
                height: 190,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            /*
                Barrier 3

                Travel underneath again.
            */
            {
                x: 740,
                y: 160,
                width: 26,
                height: 190,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            /*
                Narrow the first lower passage.
            */
            {
                x: 470,
                y: 385,
                width: 40,
                height: 25,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            /*
                Narrow the middle upper passage.
            */
            {
                x: 650,
                y: 190,
                width: 45,
                height: 25,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            /*
                Final bumper requires a controlled
                approach to the cup.
            */
            {
                x: 800,
                y: 330,
                width: 35,
                height: 22,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            }
        ]
    },

    {
        name: "Tilting at Windmills",
        par: 4,

        tee: {
            x: 430,
            y: 300
        },

        cup: {
            x: 855,
            y: 300,
            radius: 11
        },

        /*
            Visual information used by Hole.drawWindmill().

            The windmill is centered over the direct
            path between the tee and cup.
        */
        windmill: {
            x: 590,
            y: 210,
            width: 120,
            height: 180,

            tunnelTop: 278,
            tunnelBottom: 322,

            hubX: 650,
            hubY: 245,

            bladeLength: 58,
            bladeWidth: 12
        },

        walls: [
            /*
                Outer course boundary
            */

            // Top
            {
                x: 380,
                y: 130,
                width: 520,
                height: 20,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Bottom
            {
                x: 380,
                y: 450,
                width: 520,
                height: 20,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Left
            {
                x: 380,
                y: 130,
                width: 20,
                height: 340,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Right
            {
                x: 880,
                y: 130,
                width: 20,
                height: 340,
                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            /*
                Windmill upper structure.

                The ball cannot pass through this section.
            */
            {
                x: 590,
                y: 210,
                width: 120,
                height: 68,
                blocksBall: true,
                blocksPlayer: true,
                blocksZombie: true,

                visible: false
            },

            /*
                Windmill lower structure.

                The gap between this wall and the upper
                wall is the ball tunnel.
            */
            {
                x: 590,
                y: 322,
                width: 120,
                height: 68,
                blocksBall: true,
                blocksPlayer: true,
                blocksZombie: true,

                visible: false
            },

            /*
                Full windmill footprint.

                This invisible wall prevents the player
                and zombies from entering the tunnel.

                It does not block the ball.
            */
            {
                x: 590,
                y: 210,
                width: 120,
                height: 180,

                blocksBall: false,
                blocksPlayer: true,
                blocksZombie: true,

                visible: false
            },

            /*
                Left tunnel guide wall.
            */
            {
                x: 535,
                y: 265,
                width: 55,
                height: 13,

                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            {
                x: 535,
                y: 322,
                width: 55,
                height: 13,

                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            /*
                Right tunnel guide wall.
            */
            {
                x: 710,
                y: 265,
                width: 55,
                height: 13,

                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            {
                x: 710,
                y: 322,
                width: 55,
                height: 13,

                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            /*
                Small bumpers make the roundabout paths
                more deliberate without closing them.
            */

            // Upper-left bumper
            {
                x: 500,
                y: 175,
                width: 28,
                height: 55,

                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Upper-right bumper
            {
                x: 770,
                y: 175,
                width: 28,
                height: 55,

                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Lower-left bumper
            {
                x: 500,
                y: 370,
                width: 28,
                height: 55,

                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            },

            // Lower-right bumper
            {
                x: 770,
                y: 370,
                width: 28,
                height: 55,

                blocksBall: true,
                blocksPlayer: false,
                blocksZombie: false
            }
        ]
    }
];


const Hole = {
    currentIndex: 0,

    name: "",
    par: 0,

    tee: {
        x: 0,
        y: 0
    },

    cup: {
        x: 0,
        y: 0,
        radius: 11
    },

    walls: [],

    windmill: null,

    get count() {
        return HoleLayouts.length;
    },

    get number() {
        return this.currentIndex + 1;
    },

    get isLastHole() {
        return (
            this.currentIndex ===
            HoleLayouts.length - 1
        );
    },

    load(index) {
        if (
            index < 0 ||
            index >= HoleLayouts.length
        ) {
            console.error(
                `Cannot load hole index ${index}.`
            );

            return false;
        }

        const layout =
            HoleLayouts[index];

        this.currentIndex = index;

        this.name = layout.name;
        this.par = layout.par;

        /*
            Copy the data instead of directly using
            the layout objects. This prevents gameplay
            code from accidentally changing the
            original hole definitions.
        */
        this.tee = {
            ...layout.tee
        };

        this.cup = {
            ...layout.cup
        };

        this.walls =
            layout.walls.map(
                wall => ({
                    ...wall
                })
            );
        this.windmill =
        layout.windmill
            ? {
                ...layout.windmill
            }
            : null;

        return true;
    },

    next() {
        if (this.isLastHole) {
            return false;
        }

        return this.load(
            this.currentIndex + 1
        );
    },

    restart() {
        return this.load(
            this.currentIndex
        );
    },

    drawWindmill() {
        if (!this.windmill) {
            return;
        }

        const windmill =
            this.windmill;

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

            This keeps the tunnel from looking like a
            completely flat black rectangle.
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
            Temporary stationary blades.

            These are visual placeholders only.
            They will rotate and collide later.
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
                bladeIndex *
                Math.PI / 2 +
                Math.PI / 4
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
    },

    drawTeePad() {
        const tee = this.tee;

        ctx.save();

        ctx.beginPath();
        ctx.roundRect(tee.x - 18, tee.y - 18, 36, 36, 6);
        ctx.fillStyle = "rgba(30, 70, 28, 0.45)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Two red tee markers.
        for (const offsetY of [-24, 24]) {
            ctx.beginPath();
            ctx.arc(tee.x - 6, tee.y + offsetY, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#c63a32";
            ctx.fill();
            ctx.strokeStyle = "#5e1612";
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        ctx.restore();
    },

    drawCup() {
        const cup = this.cup;

        ctx.save();

        // Worn ring of putting-green around the cup.
        const ring = ctx.createRadialGradient(
            cup.x, cup.y, cup.radius,
            cup.x, cup.y, cup.radius * 3.4
        );
        ring.addColorStop(0, "rgba(140, 220, 120, 0.35)");
        ring.addColorStop(1, "rgba(140, 220, 120, 0)");
        ctx.fillStyle = ring;
        ctx.beginPath();
        ctx.arc(cup.x, cup.y, cup.radius * 3.4, 0, Math.PI * 2);
        ctx.fill();

        // White rim.
        ctx.beginPath();
        ctx.arc(cup.x, cup.y, cup.radius + 2, 0, Math.PI * 2);
        ctx.fillStyle = "#e9e6d6";
        ctx.fill();

        // Hole interior with depth.
        const interior = ctx.createRadialGradient(
            cup.x - 2, cup.y - 3, 1,
            cup.x, cup.y, cup.radius
        );
        interior.addColorStop(0, "#050505");
        interior.addColorStop(0.7, "#141414");
        interior.addColorStop(1, "#2e2e2e");
        ctx.beginPath();
        ctx.arc(cup.x, cup.y, cup.radius, 0, Math.PI * 2);
        ctx.fillStyle = interior;
        ctx.fill();

        ctx.restore();
    },

    drawFlag() {
        const cup = this.cup;
        const time = performance.now() / 1000;
        const poleTop = cup.y - 58;

        // Fade the flag when the ball is close so it never hides a putt.
        const ballDistance = Math.hypot(Ball.x - cup.x, Ball.y - cup.y);
        const alpha = ballDistance < 70 ? 0.45 : 1;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Pole shadow on the turf.
        ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cup.x, cup.y);
        ctx.lineTo(cup.x + 26, cup.y - 18);
        ctx.stroke();

        // Pole.
        ctx.strokeStyle = "#f2f0e6";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cup.x, cup.y);
        ctx.lineTo(cup.x, poleTop);
        ctx.stroke();

        // Waving pennant.
        const flagLength = 30;
        const flagHeight = 18;
        const segments = 8;

        ctx.beginPath();
        ctx.moveTo(cup.x, poleTop);

        for (let index = 1; index <= segments; index++) {
            const t = index / segments;
            const wave = Math.sin(time * 6 - t * 4) * 4 * t;
            ctx.lineTo(
                cup.x + t * flagLength,
                poleTop + t * flagHeight / 2 + wave
            );
        }

        for (let index = segments; index >= 0; index--) {
            const t = index / segments;
            const wave = Math.sin(time * 6 - t * 4) * 4 * t;
            ctx.lineTo(
                cup.x + t * flagLength,
                poleTop + flagHeight - t * flagHeight / 2 + wave
            );
        }

        ctx.closePath();
        ctx.fillStyle = "#d23a2f";
        ctx.fill();
        ctx.strokeStyle = "#6e1712";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Hole number on the pennant.
        ctx.fillStyle = "white";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
            String(this.number),
            cup.x + 11,
            poleTop + flagHeight / 2 + Math.sin(time * 6 - 1.5) * 1.5
        );

        // Pole cap.
        ctx.beginPath();
        ctx.arc(cup.x, poleTop, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ffd65a";
        ctx.fill();

        ctx.restore();
    },

    drawWalls() {
        const visibleWalls =
            this.walls.filter(wall => wall.visible !== false);

        // Shadows first so they never cover a neighbouring wall.
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.32)";

        for (const wall of visibleWalls) {
            ctx.fillRect(wall.x + 4, wall.y + 5, wall.width, wall.height);
        }

        ctx.restore();

        for (const wall of visibleWalls) {
            ctx.save();

            const gradient = ctx.createLinearGradient(
                wall.x,
                wall.y,
                wall.x,
                wall.y + wall.height
            );
            gradient.addColorStop(0, "#e6dcbf");
            gradient.addColorStop(1, "#b9aa86");
            ctx.fillStyle = gradient;
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);

            // Top bevel highlight and bottom edge.
            ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
            ctx.fillRect(wall.x, wall.y, wall.width, 3);
            ctx.fillStyle = "rgba(70, 55, 30, 0.35)";
            ctx.fillRect(wall.x, wall.y + wall.height - 3, wall.width, 3);

            ctx.strokeStyle = "#6c6048";
            ctx.lineWidth = 2;
            ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);

            ctx.restore();
        }
    },

    draw() {
        this.drawTeePad();

        this.drawCup();

        /*
            Draw special hole features before the regular
            walls, ball, zombies, and player.
        */
        this.drawWindmill();

        this.drawWalls();

        this.drawFlag();
    }
};


/*
    Load the first hole when the game starts.
*/
Hole.load(0);