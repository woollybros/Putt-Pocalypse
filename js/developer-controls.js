const previousHoleButton =
    document.getElementById(
        "previousHoleButton"
    );

const nextHoleButton =
    document.getElementById(
        "nextHoleButton"
    );

function updateDeveloperHoleButtons() {
    previousHoleButton.disabled =
        Hole.currentIndex <= 0;

    nextHoleButton.disabled =
        Hole.currentIndex >=
        Hole.count - 1;

    previousHoleButton.textContent =
        `Previous Hole (${Hole.number})`;

    nextHoleButton.textContent =
        `Next Hole (${Hole.number})`;
}

function loadDeveloperHole(index) {
    const loadedHole = Hole.load(index);

    if (!loadedHole) {
        return;
    }

    /*
        Developer navigation is for testing, so begin
        the selected hole with a clean score and full health.
    */
    GameState.courseScores.length = 0;

    resetHole(true, true);
    updateDeveloperHoleButtons();
}

function loadPreviousDeveloperHole() {
    loadDeveloperHole(
        Hole.currentIndex - 1
    );
}

function loadNextDeveloperHole() {
    loadDeveloperHole(
        Hole.currentIndex + 1
    );
}

previousHoleButton.addEventListener(
    "click",
    loadPreviousDeveloperHole
);

nextHoleButton.addEventListener(
    "click",
    loadNextDeveloperHole
);

/*
    Keyboard shortcuts:

    [ = previous hole
    ] = next hole
*/
document.addEventListener(
    "keydown",
    event => {
        if (event.repeat) {
            return;
        }

        if (event.key === "[") {
            loadPreviousDeveloperHole();
        }

        if (event.key === "]") {
            loadNextDeveloperHole();
        }
    }
);

updateDeveloperHoleButtons();
