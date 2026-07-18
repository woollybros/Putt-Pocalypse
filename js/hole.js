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

    draw() {
        // Cup shadow / opening
        ctx.beginPath();

        ctx.arc(
            this.cup.x,
            this.cup.y,
            this.cup.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#1b1b1b";
        ctx.fill();

        // Small inner highlight for depth
        ctx.beginPath();

        ctx.arc(
            this.cup.x - 2,
            this.cup.y - 2,
            this.cup.radius * 0.45,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#333333";
        ctx.fill();

        /*
            Draw special hole features before the regular
            walls, ball, zombies, and player.
        */
        this.drawWindmill();

        // Walls
        for (const wall of this.walls) {
            if (wall.visible === false) {
                continue;
            }

            ctx.fillStyle = "#d9d1b8";

            ctx.fillRect(
                wall.x,
                wall.y,
                wall.width,
                wall.height
            );

            ctx.strokeStyle = "#756d5a";
            ctx.lineWidth = 2;

            ctx.strokeRect(
                wall.x,
                wall.y,
                wall.width,
                wall.height
            );
        }

        // Temporary hole information
        ctx.save();

        ctx.font = "bold 18px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        ctx.fillStyle =
            "rgba(255, 255, 255, 0.9)";

        ctx.fillText(
            `Hole ${this.number}: ${this.name}`,
            20,
            20
        );

        ctx.font = "15px Arial";

        ctx.fillText(
            `Par ${this.par}`,
            20,
            44
        );

        ctx.restore();
    }
};


/*
    Load the first hole when the game starts.
*/
Hole.load(0);