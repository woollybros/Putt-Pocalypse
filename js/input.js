const Keys = {};

const Pointer = {
    x: 0,
    y: 0,

    isDown: false,
    wasPressed: false,
    wasReleased: false,

    updatePosition(event) {
        const canvasBounds = canvas.getBoundingClientRect();

        this.x = event.clientX - canvasBounds.left;
        this.y = event.clientY - canvasBounds.top;
    },

    endFrame() {
        this.wasPressed = false;
        this.wasReleased = false;
    }
};

window.addEventListener("keydown", (event) => {
    Keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
    Keys[event.key.toLowerCase()] = false;
});

canvas.addEventListener("pointermove", (event) => {
    Pointer.updatePosition(event);
});

canvas.addEventListener("pointerdown", (event) => {
    Pointer.updatePosition(event);

    Pointer.isDown = true;
    Pointer.wasPressed = true;

    canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointerup", (event) => {
    Pointer.updatePosition(event);

    Pointer.isDown = false;
    Pointer.wasReleased = true;
});

canvas.addEventListener("pointercancel", () => {
    Pointer.isDown = false;
    Pointer.wasReleased = true;
});