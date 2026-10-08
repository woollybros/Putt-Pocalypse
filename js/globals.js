const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/*
    The course is simulated in a fixed-size world so every screen sees the
    same layout, boundaries, and physics. CSS scales the canvas to fit the
    window and input.js maps the pointer back into world coordinates.
*/
const WORLD_WIDTH = 1280;
const WORLD_HEIGHT = 600;

canvas.width = WORLD_WIDTH;
canvas.height = WORLD_HEIGHT;

function fitCanvasToWindow() {
    const scale = Math.min(
        window.innerWidth / WORLD_WIDTH,
        window.innerHeight / WORLD_HEIGHT
    );

    const displayWidth = Math.floor(WORLD_WIDTH * scale);
    const displayHeight = Math.floor(WORLD_HEIGHT * scale);

    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    canvas.style.left = `${Math.floor((window.innerWidth - displayWidth) / 2)}px`;
    canvas.style.top = `${Math.floor((window.innerHeight - displayHeight) / 2)}px`;
}

window.addEventListener("resize", fitCanvasToWindow);
fitCanvasToWindow();