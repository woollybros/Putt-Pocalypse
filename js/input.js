const Keys = {};

const Pointer = {
    x: 0,
    y: 0,

    isDown: false,
    wasPressed: false,
    wasReleased: false,

    updatePosition(event) {
        const canvasBounds = canvas.getBoundingClientRect();

        /*
            The canvas is CSS-scaled to fit the window, so convert from
            screen pixels back into fixed world coordinates.
        */
        const scaleX = canvas.width / (canvasBounds.width || canvas.width);
        const scaleY = canvas.height / (canvasBounds.height || canvas.height);

        this.x = (event.clientX - canvasBounds.left) * scaleX;
        this.y = (event.clientY - canvasBounds.top) * scaleY;
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