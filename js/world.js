/*
    Course backdrop.

    The world is pre-rendered once into offscreen layers:
    - a graveyard "rough" backdrop with mowing stripes, tombstones, and
      dead trees in the margins around the course, and
    - a per-hole fairway, found by flood-filling from the tee inside the
      ball-blocking walls, then textured with mowing stripes.

    Both layers are cached, so drawing each frame costs two drawImage calls.
*/
const World = {
    backgroundLayer: null,
    fairwayLayer: null,
    fairwayKey: null,

    createLayer() {
        const layer = document.createElement("canvas");
        layer.width = canvas.width;
        layer.height = canvas.height;
        return layer;
    },

    seededRandom(seed) {
        let state = seed >>> 0 || 1;

        return () => {
            state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
            return state / 4294967296;
        };
    },

    drawTombstone(context, x, y, scale, random) {
        const width = 22 * scale;
        const height = 30 * scale;
        const tilt = (random() - 0.5) * 0.25;

        context.save();
        context.translate(x, y);

        context.fillStyle = "rgba(0, 0, 0, 0.32)";
        context.beginPath();
        context.ellipse(4, 2, width * 0.75, 6 * scale, 0, 0, Math.PI * 2);
        context.fill();

        // Freshly dug grave mound in front of the stone.
        context.fillStyle = "#4a3826";
        context.beginPath();
        context.ellipse(0, 14 * scale, width * 0.62, 11 * scale, 0, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = "rgba(255, 230, 190, 0.08)";
        context.beginPath();
        context.ellipse(-3 * scale, 10 * scale, width * 0.4, 5 * scale, 0, 0, Math.PI * 2);
        context.fill();

        context.rotate(tilt);

        const gradient = context.createLinearGradient(-width / 2, 0, width / 2, 0);
        gradient.addColorStop(0, "#a5aaa2");
        gradient.addColorStop(1, "#6c716a");

        context.beginPath();
        context.moveTo(-width / 2, 0);
        context.lineTo(-width / 2, -height + width / 2);
        context.arc(0, -height + width / 2, width / 2, Math.PI, 0);
        context.lineTo(width / 2, 0);
        context.closePath();
        context.fillStyle = gradient;
        context.fill();
        context.strokeStyle = "#3d413b";
        context.lineWidth = 2;
        context.stroke();

        context.fillStyle = "rgba(40, 44, 38, 0.75)";
        context.font = `bold ${Math.round(8 * scale)}px Arial`;
        context.textAlign = "center";
        context.fillText("RIP", 0, -height * 0.45);

        // Crack.
        context.strokeStyle = "rgba(40, 44, 38, 0.6)";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(width * 0.2, -height + 6 * scale);
        context.lineTo(width * 0.05, -height * 0.7);
        context.lineTo(width * 0.22, -height * 0.58);
        context.stroke();

        // Moss.
        context.fillStyle = "rgba(92, 128, 60, 0.55)";
        context.beginPath();
        context.ellipse(-width * 0.3, -2 * scale, 5 * scale, 3 * scale, 0, 0, Math.PI * 2);
        context.fill();

        context.restore();
    },

    drawBranch(context, x, y, angle, length, width, depth, random) {
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;

        context.lineWidth = width;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(endX, endY);
        context.stroke();

        if (depth <= 0) {
            return;
        }

        const branches = 2 + (random() < 0.4 ? 1 : 0);

        for (let index = 0; index < branches; index++) {
            this.drawBranch(
                context,
                endX,
                endY,
                angle + (random() - 0.5) * 1.3,
                length * (0.55 + random() * 0.2),
                Math.max(1, width * 0.62),
                depth - 1,
                random
            );
        }
    },

    drawDeadTree(context, x, y, scale, random) {
        context.save();

        context.fillStyle = "rgba(0, 0, 0, 0.28)";
        context.beginPath();
        context.ellipse(x + 10, y + 3, 26 * scale, 8 * scale, 0, 0, Math.PI * 2);
        context.fill();

        context.strokeStyle = "#2a2018";
        context.lineCap = "round";
        this.drawBranch(context, x, y, -Math.PI / 2, 38 * scale, 7 * scale, 3, random);

        context.restore();
    },

    buildBackground() {
        const layer = this.createLayer();
        const context = layer.getContext("2d");
        const width = layer.width;
        const height = layer.height;
        const random = this.seededRandom(1337);

        // Rough grass base.
        const base = context.createLinearGradient(0, 0, 0, height);
        base.addColorStop(0, "#2f4f2a");
        base.addColorStop(0.5, "#37602f");
        base.addColorStop(1, "#2b4826");
        context.fillStyle = base;
        context.fillRect(0, 0, width, height);

        // Wide mowing stripes.
        for (let x = 0; x < width; x += 64) {
            context.fillStyle = "rgba(255, 255, 255, 0.025)";
            context.fillRect(x, 0, 32, height);
        }

        // Grass speckle texture.
        for (let index = 0; index < 4200; index++) {
            const light = random() < 0.5;
            context.fillStyle = light
                ? `rgba(150, 200, 110, ${0.05 + random() * 0.08})`
                : `rgba(10, 25, 8, ${0.08 + random() * 0.12})`;
            context.fillRect(random() * width, random() * height, 2, 2 + random() * 3);
        }

        // Dark weedy patches in the margins.
        for (let index = 0; index < 14; index++) {
            const x = random() < 0.5 ? random() * 300 : width - random() * 300;
            const y = random() * height;
            const radius = 30 + random() * 50;
            const patch = context.createRadialGradient(x, y, 0, x, y, radius);
            patch.addColorStop(0, "rgba(20, 30, 15, 0.35)");
            patch.addColorStop(1, "rgba(20, 30, 15, 0)");
            context.fillStyle = patch;
            context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }

        // Graveyard decor in the left and right margins, well clear of the holes.
        const decorColumns = [70, 165, 260, 1020, 1115, 1210];
        const decorRows = [95, 205, 315, 425, 535];

        for (const column of decorColumns) {
            for (const row of decorRows) {
                const roll = random();
                const x = column + (random() - 0.5) * 40;
                const y = row + (random() - 0.5) * 34;

                if (roll < 0.5) {
                    this.drawTombstone(context, x, y, 0.85 + random() * 0.35, random);
                } else if (roll < 0.68) {
                    this.drawDeadTree(context, x, y, 0.9 + random() * 0.4, random);
                }
            }
        }

        // Low fog banks drifting in from the edges.
        const fogLeft = context.createLinearGradient(0, 0, 320, 0);
        fogLeft.addColorStop(0, "rgba(190, 215, 190, 0.12)");
        fogLeft.addColorStop(1, "rgba(190, 215, 190, 0)");
        context.fillStyle = fogLeft;
        context.fillRect(0, 0, 320, height);

        const fogRight = context.createLinearGradient(width, 0, width - 320, 0);
        fogRight.addColorStop(0, "rgba(190, 215, 190, 0.12)");
        fogRight.addColorStop(1, "rgba(190, 215, 190, 0)");
        context.fillStyle = fogRight;
        context.fillRect(width - 320, 0, 320, height);

        return layer;
    },

    buildFairway() {
        const walls = (Hole.walls || []).filter(wall => wall.blocksBall !== false);

        if (walls.length === 0) {
            return null;
        }

        const cellSize = 5;
        const columns = Math.ceil(canvas.width / cellSize);
        const rows = Math.ceil(canvas.height / cellSize);
        const blocked = new Uint8Array(columns * rows);

        for (const wall of walls) {
            const startColumn = Math.max(0, Math.floor((wall.x - 2) / cellSize));
            const endColumn = Math.min(columns - 1, Math.floor((wall.x + wall.width + 2) / cellSize));
            const startRow = Math.max(0, Math.floor((wall.y - 2) / cellSize));
            const endRow = Math.min(rows - 1, Math.floor((wall.y + wall.height + 2) / cellSize));

            for (let row = startRow; row <= endRow; row++) {
                for (let column = startColumn; column <= endColumn; column++) {
                    blocked[row * columns + column] = 1;
                }
            }
        }

        const startColumn = Math.floor(Hole.tee.x / cellSize);
        const startRow = Math.floor(Hole.tee.y / cellSize);
        const startIndex = startRow * columns + startColumn;

        if (
            startColumn < 0 || startColumn >= columns ||
            startRow < 0 || startRow >= rows ||
            blocked[startIndex]
        ) {
            return null;
        }

        // Breadth-first flood fill from the tee.
        const filled = new Uint8Array(columns * rows);
        const queue = new Int32Array(columns * rows);
        let head = 0;
        let tail = 0;

        filled[startIndex] = 1;
        queue[tail++] = startIndex;

        while (head < tail) {
            const index = queue[head++];
            const column = index % columns;
            const row = (index - column) / columns;
            const neighbours = [
                column > 0 ? index - 1 : -1,
                column < columns - 1 ? index + 1 : -1,
                row > 0 ? index - columns : -1,
                row < rows - 1 ? index + columns : -1
            ];

            for (const next of neighbours) {
                if (next >= 0 && !filled[next] && !blocked[next]) {
                    filled[next] = 1;
                    queue[tail++] = next;
                }
            }
        }

        // A leak means the walls are not closed; skip the fairway rather than paint the world.
        if (tail > columns * rows * 0.6) {
            return null;
        }

        const mask = this.createLayer();
        const maskContext = mask.getContext("2d");
        maskContext.fillStyle = "white";

        for (let index = 0; index < filled.length; index++) {
            const column = index % columns;
            const row = (index - column) / columns;
            const touchesFairway =
                filled[index] ||
                (
                    blocked[index] &&
                    (
                        (column > 0 && filled[index - 1]) ||
                        (column < columns - 1 && filled[index + 1]) ||
                        (row > 0 && filled[index - columns]) ||
                        (row < rows - 1 && filled[index + columns])
                    )
                );

            if (touchesFairway) {
                maskContext.fillRect(column * cellSize, row * cellSize, cellSize, cellSize);
            }
        }

        // Texture the fairway: bright turf with diagonal mowing stripes.
        maskContext.globalCompositeOperation = "source-in";
        maskContext.fillStyle = "#5aa651";
        maskContext.fillRect(0, 0, mask.width, mask.height);

        // Texture passes must only paint over existing fairway pixels.
        maskContext.globalCompositeOperation = "source-atop";

        maskContext.save();
        maskContext.translate(mask.width / 2, mask.height / 2);
        maskContext.rotate(-Math.PI / 4);
        maskContext.fillStyle = "rgba(255, 255, 255, 0.07)";

        for (let x = -mask.width; x < mask.width; x += 56) {
            maskContext.fillRect(x, -mask.width, 28, mask.width * 2);
        }

        maskContext.restore();

        const random = this.seededRandom(Hole.currentIndex * 97 + 11);

        for (let index = 0; index < 2400; index++) {
            maskContext.fillStyle = random() < 0.5
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 40, 0, 0.07)";
            maskContext.fillRect(random() * mask.width, random() * mask.height, 2, 2);
        }

        // Composite onto a final layer with a soft drop shadow so the green sits above the rough.
        const layer = this.createLayer();
        const context = layer.getContext("2d");
        context.shadowColor = "rgba(0, 0, 0, 0.5)";
        context.shadowBlur = 22;
        context.shadowOffsetY = 6;
        context.drawImage(mask, 0, 0);

        return layer;
    },

    draw() {
        if (!this.backgroundLayer) {
            this.backgroundLayer = this.buildBackground();
        }

        ctx.drawImage(this.backgroundLayer, 0, 0);

        const fairwayKey = `${Hole.currentIndex}:${Hole.name}:${(Hole.walls || []).length}`;

        if (this.fairwayKey !== fairwayKey) {
            this.fairwayKey = fairwayKey;
            this.fairwayLayer = this.buildFairway();
        }

        if (this.fairwayLayer) {
            ctx.drawImage(this.fairwayLayer, 0, 0);
        }
    }
};