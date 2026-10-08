/*
    Overhaul HUD, hole intros, star ratings, scorecard, and saved records.

    - One polished top bar replaces the scattered canvas/DOM readouts
      (hole, par, strokes, running score, health, tickets, club, caddy).
    - A banner introduces each hole with its par and your personal best.
    - Results show a 0-3 star rating, and the final screen shows a full
      scorecard. Bests and lifetime stats persist in localStorage.
    - Sound toggle (persisted), auto-pause when the tab is hidden, and
      Enter to continue from results screens.

    Loaded last so it can wrap the final versions of the global hooks.
*/
(function () {
    const RECORDS_KEY = "puttPocalypse.records.v1";
    const SETTINGS_KEY = "puttPocalypse.settings.v1";

    function loadJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            const parsed = raw ? JSON.parse(raw) : null;
            return parsed && typeof parsed === "object"
                ? { ...fallback, ...parsed }
                : { ...fallback };
        } catch (error) {
            return { ...fallback };
        }
    }

    function saveJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            /* Storage can be unavailable (private mode, file:// policies). */
        }
    }

    const records = loadJson(RECORDS_KEY, {
        holeBests: {},
        bestCourse: null,
        roundsCompleted: 0,
        holesInOne: 0,
        zombiesSplatted: 0
    });

    if (!records.holeBests || typeof records.holeBests !== "object") {
        records.holeBests = {};
    }

    const settings = loadJson(SETTINGS_KEY, { sound: true });
    AudioManager.enabled = settings.sound !== false;

    const run = {
        id: 0,
        kills: 0
    };

    function recordsEnabled() {
        return window.MenuController?.developerMode !== true;
    }

    function starsFor(strokes, par) {
        if (strokes === 1 || strokes < par) {
            return 3;
        }

        if (strokes === par) {
            return 2;
        }

        if (strokes === par + 1) {
            return 1;
        }

        return 0;
    }

    function starMarkup(count, total = 3) {
        let markup = "";

        for (let index = 0; index < total; index++) {
            const earned = index < count;
            markup +=
                `<span class="star ${earned ? "earned" : ""}" ` +
                `style="animation-delay:${0.15 + index * 0.18}s">★</span>`;
        }

        return markup;
    }

    function formatRelative(difference) {
        if (difference === 0) {
            return "E";
        }

        return difference > 0 ? `+${difference}` : `${difference}`;
    }

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    /* ---------- Top HUD ---------- */

    const hud = document.createElement("div");
    hud.id = "topHud";
    hud.className = "hidden";
    hud.innerHTML = `
        <div class="hudBlock hudHole">
            <div class="hudHoleNumber">Hole <b id="hudHoleNumber">1</b><span id="hudHoleCount">/7</span></div>
            <div class="hudHoleName" id="hudHoleName"></div>
        </div>
        <div class="hudBlock hudStat">
            <span class="hudLabel">Par</span>
            <b id="hudPar">0</b>
        </div>
        <div class="hudBlock hudStat">
            <span class="hudLabel">Strokes</span>
            <b id="hudStrokes">0</b>
        </div>
        <div class="hudBlock hudStat">
            <span class="hudLabel">Round</span>
            <b id="hudRound">E</b>
        </div>
        <div class="hudBlock hudHealth" id="hudHealthBlock">
            <span class="hudLabel">Health</span>
            <div class="hudBar"><div class="hudBarFill" id="hudHealthFill"></div><em id="hudHealthText"></em></div>
        </div>
        <div class="hudBlock hudStat hudTickets">
            <span class="hudLabel">Tickets</span>
            <b id="hudTickets">0</b>
        </div>
        <div class="hudBlock hudClub">
            <span class="hudLabel" id="hudClubName">Club</span>
            <div class="hudBar slim"><div class="hudBarFill" id="hudClubFill"></div><em id="hudClubText"></em></div>
        </div>
        <div class="hudBlock hudStat hidden" id="hudCaddyBlock">
            <span class="hudLabel">Caddy</span>
            <b id="hudCaddy">0</b>
        </div>
        <div class="hudButtons" id="hudButtons">
            <button id="hudSoundButton" class="hudIconButton" title="Toggle sound (M)"></button>
        </div>
    `;
    document.body.appendChild(hud);

    const hudElements = {};

    for (const id of [
        "hudHoleNumber",
        "hudHoleCount",
        "hudHoleName",
        "hudPar",
        "hudStrokes",
        "hudRound",
        "hudHealthBlock",
        "hudHealthFill",
        "hudHealthText",
        "hudTickets",
        "hudClubName",
        "hudClubFill",
        "hudClubText",
        "hudCaddyBlock",
        "hudCaddy",
        "hudButtons",
        "hudSoundButton"
    ]) {
        hudElements[id] = document.getElementById(id);
    }

    // Move the pause button into the HUD so it no longer overlaps "Swing Club".
    const pauseButton = document.getElementById("pauseGameButton");

    if (pauseButton) {
        pauseButton.textContent = "❚❚ Pause";
        hudElements.hudButtons.appendChild(pauseButton);
    }

    const lastValues = {};

    function setText(id, value) {
        if (lastValues[id] === value) {
            return false;
        }

        lastValues[id] = value;
        hudElements[id].textContent = value;
        return true;
    }

    function bump(element) {
        element.classList.remove("bump");
        void element.offsetWidth;
        element.classList.add("bump");
    }

    function roundRelativeToPar() {
        return GameState.courseScores.reduce(
            (total, score) => total + score.strokes - score.par,
            0
        );
    }

    function updateHud() {
        const state = window.MenuController?.state ?? "playing";
        hud.classList.toggle("hidden", state === "menu");

        if (state === "menu") {
            return;
        }

        setText("hudHoleNumber", String(Hole.number));
        setText("hudHoleCount", `/${Hole.count}`);
        setText("hudHoleName", Hole.name);
        setText("hudPar", String(Hole.par));

        if (setText("hudStrokes", String(GameState.currentHoleStrokes))) {
            bump(hudElements.hudStrokes);
        }

        setText("hudRound", formatRelative(roundRelativeToPar()));

        const maximumHealth = Player.maximumHealth || 100;
        const health = Math.max(0, Math.ceil(Player.health));
        const healthRatio = Math.max(0, Math.min(1, health / maximumHealth));

        hudElements.hudHealthFill.style.width = `${healthRatio * 100}%`;
        hudElements.hudHealthBlock.classList.toggle("danger", healthRatio <= 0.3);
        setText("hudHealthText", `${health} / ${maximumHealth}`);

        const tickets = window.TicketEconomy?.tickets ?? 0;

        if (setText("hudTickets", String(tickets))) {
            bump(hudElements.hudTickets);
        }

        const club = Player.equippedClub;

        if (club) {
            const maximumDurability = club.maximumDurability || 0;
            const durability = typeof club.durability === "number"
                ? club.durability
                : maximumDurability;
            const ratio = maximumDurability > 0
                ? Math.max(0, Math.min(1, durability / maximumDurability))
                : 1;

            setText("hudClubName", club.name || "Club");
            setText(
                "hudClubText",
                maximumDurability > 0
                    ? `${Math.ceil(durability)} / ${maximumDurability}`
                    : ""
            );
            hudElements.hudClubFill.style.width = `${ratio * 100}%`;
            hudElements.hudClubFill.dataset.level =
                ratio > 0.5 ? "good" : ratio > 0.2 ? "worn" : "broken";
        } else {
            setText("hudClubName", "Club dropped!");
            setText("hudClubText", "Go grab it");
            hudElements.hudClubFill.style.width = "0%";
        }

        const caddy = window.TicketEconomy?.caddy;
        hudElements.hudCaddyBlock.classList.toggle("hidden", !caddy);

        if (caddy) {
            setText("hudCaddy", `${caddy.ammo}/${caddy.maximumAmmo}`);
        }
    }

    /* ---------- Sound toggle ---------- */

    const titleSoundButton = document.getElementById("titleSoundButton");

    function refreshSoundButtons() {
        const label = AudioManager.enabled ? "🔊" : "🔇";
        hudElements.hudSoundButton.textContent = label;

        if (titleSoundButton) {
            titleSoundButton.textContent =
                AudioManager.enabled ? "🔊 Sound On" : "🔇 Sound Off";
        }
    }

    function toggleSound() {
        AudioManager.enabled = !AudioManager.enabled;
        settings.sound = AudioManager.enabled;
        saveJson(SETTINGS_KEY, settings);
        refreshSoundButtons();
    }

    hudElements.hudSoundButton.addEventListener("click", toggleSound);

    if (titleSoundButton) {
        titleSoundButton.addEventListener("click", toggleSound);
    }

    refreshSoundButtons();

    /* ---------- Hole intro banner ---------- */

    const banner = document.createElement("div");
    banner.id = "holeIntroBanner";
    banner.className = "hidden";
    document.body.appendChild(banner);

    let lastIntroKey = null;
    let bannerTimer = null;

    function showHoleIntro() {
        const best = records.holeBests[Hole.name];
        const bestText = typeof best === "number"
            ? `Your best: ${best}`
            : "No record yet";

        banner.innerHTML = `
            <div class="introEyebrow">Hole ${Hole.number} of ${Hole.count}</div>
            <div class="introName">${escapeHtml(Hole.name)}</div>
            <div class="introMeta"><span>Par ${Hole.par}</span><span>${bestText}</span></div>
        `;

        banner.classList.remove("hidden", "play");
        void banner.offsetWidth;
        banner.classList.add("play");

        clearTimeout(bannerTimer);
        bannerTimer = setTimeout(() => banner.classList.add("hidden"), 2800);
    }

    function updateHoleIntro() {
        if (window.MenuController?.state !== "playing") {
            return;
        }

        const key = `${run.id}:${Hole.currentIndex}`;

        if (key !== lastIntroKey) {
            lastIntroKey = key;
            showHoleIntro();
        }
    }

    /* ---------- Results screens ---------- */

    const resultsCard = document.querySelector("#holeCompletePanel .resultsCard");
    const holeNameLine = document.getElementById("holeCompleteName");

    const extras = document.createElement("div");
    extras.id = "resultsExtras";
    holeNameLine.insertAdjacentElement("afterend", extras);

    const scorecard = document.createElement("div");
    scorecard.id = "scorecard";
    holeCompleteResult.insertAdjacentElement("afterend", scorecard);

    function setRewardLineVisible(visible) {
        const rewardLine = document.getElementById("ticketRewardLine");

        if (rewardLine) {
            rewardLine.style.display = visible ? "" : "none";
        }
    }

    function resetResultsCard() {
        resultsCard.classList.remove(
            "tier-0",
            "tier-1",
            "tier-2",
            "tier-3",
            "tier-ace",
            "courseCard",
            "gameOverCard"
        );
        extras.innerHTML = "";
        scorecard.innerHTML = "";
        document.querySelectorAll("#holeCompletePanel .scoreRow")
            .forEach(row => row.classList.remove("hidden"));
    }

    const previousShowHoleComplete = window.showHoleCompletePanel;

    window.showHoleCompletePanel = function () {
        previousShowHoleComplete();
        resetResultsCard();
        setRewardLineVisible(true);

        const strokes = GameState.currentHoleStrokes;
        const par = Hole.par;
        const stars = starsFor(strokes, par);
        const previousBest = records.holeBests[Hole.name];
        let bestLine = "";

        if (recordsEnabled()) {
            const isNewBest =
                typeof previousBest !== "number" || strokes < previousBest;

            if (isNewBest) {
                records.holeBests[Hole.name] = strokes;
            }

            if (strokes === 1) {
                records.holesInOne++;
            }

            saveJson(RECORDS_KEY, records);

            bestLine = isNewBest
                ? `<div class="newBest">New personal best!</div>`
                : `<div class="bestLine">Personal best: ${previousBest}</div>`;
        } else {
            bestLine = `<div class="bestLine">Dev mode: records not saved</div>`;
        }

        resultsCard.classList.add(strokes === 1 ? "tier-ace" : `tier-${stars}`);

        extras.innerHTML = `
            <div class="starRow">${starMarkup(stars)}</div>
            ${bestLine}
        `;
    };

    const previousShowGameOver = window.showGameOver;

    window.showGameOver = function () {
        const wasShown = gameOverShown;
        previousShowGameOver();

        if (wasShown) {
            return;
        }

        resetResultsCard();
        setRewardLineVisible(false);
        resultsCard.classList.add("gameOverCard");
        extras.innerHTML =
            `<div class="bestLine">Zombies splatted this round: ${run.kills}</div>`;
    };

    const previousShowCourseComplete = window.showCourseComplete;

    window.showCourseComplete = function () {
        previousShowCourseComplete();
        resetResultsCard();
        setRewardLineVisible(false);
        resultsCard.classList.add("courseCard");

        const scores = GameState.courseScores;
        const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
        const totalStrokes = scores.reduce((sum, score) => sum + score.strokes, 0);
        const difference = totalStrokes - totalPar;
        const totalStars = scores.reduce(
            (sum, score) => sum + starsFor(score.strokes, score.par),
            0
        );
        const fullRound = scores.length === Hole.count;
        let bestLine = "";

        if (recordsEnabled() && fullRound) {
            const previousBest = records.bestCourse;
            const isNewBest =
                !previousBest ||
                difference < previousBest.relative ||
                (
                    difference === previousBest.relative &&
                    totalStrokes < previousBest.strokes
                );

            records.roundsCompleted++;

            if (isNewBest) {
                records.bestCourse = {
                    relative: difference,
                    strokes: totalStrokes,
                    stars: totalStars,
                    date: new Date().toISOString().slice(0, 10)
                };
            }

            saveJson(RECORDS_KEY, records);

            bestLine = isNewBest
                ? `<div class="newBest">New course record!</div>`
                : `<div class="bestLine">Course record: ${formatRelative(previousBest.relative)} (${previousBest.strokes} strokes)</div>`;
        } else if (!recordsEnabled()) {
            bestLine = `<div class="bestLine">Dev mode: records not saved</div>`;
        }

        const rows = scores.map(score => {
            const stars = starsFor(score.strokes, score.par);
            const relative = score.strokes - score.par;
            const relativeClass =
                relative < 0 ? "under" : relative > 0 ? "over" : "even";

            return `
                <tr>
                    <td>${score.holeNumber}</td>
                    <td class="cardName">${escapeHtml(score.name)}</td>
                    <td>${score.par}</td>
                    <td class="${relativeClass}">${score.strokes}</td>
                    <td class="cardStars">${"★".repeat(stars)}<span>${"★".repeat(3 - stars)}</span></td>
                </tr>
            `;
        }).join("");

        extras.innerHTML = `
            <div class="starRow small">${starMarkup(Math.round(totalStars / Math.max(1, scores.length)))}</div>
            ${bestLine}
        `;

        scorecard.innerHTML = `
            <table>
                <thead>
                    <tr><th>#</th><th>Hole</th><th>Par</th><th>Score</th><th>Stars</th></tr>
                </thead>
                <tbody>${rows}</tbody>
                <tfoot>
                    <tr>
                        <td></td>
                        <td class="cardName">Total</td>
                        <td>${totalPar}</td>
                        <td>${totalStrokes}</td>
                        <td>${totalStars}/${scores.length * 3}</td>
                    </tr>
                </tfoot>
            </table>
            <div class="roundStats">Zombies splatted: <b>${run.kills}</b></div>
        `;

        document.querySelectorAll("#holeCompletePanel .scoreRow")
            .forEach(row => row.classList.add("hidden"));

        renderTitleRecords();
    };

    /* ---------- Zombie kill tracking ---------- */

    const previousTakeClubHit = Zombie.prototype.takeClubHit;

    Zombie.prototype.takeClubHit = function (...args) {
        this.ensureCombatStats?.();
        const healthBefore = this.health;
        const result = previousTakeClubHit.apply(this, args);

        if (
            typeof healthBefore === "number" &&
            healthBefore > 0 &&
            this.health <= 0
        ) {
            run.kills++;

            if (recordsEnabled()) {
                records.zombiesSplatted++;
            }
        }

        return result;
    };

    /* ---------- Title screen records ---------- */

    const titleRecords = document.getElementById("titleRecords");

    function renderTitleRecords() {
        if (!titleRecords) {
            return;
        }

        const best = records.bestCourse;

        if (!best && records.roundsCompleted === 0 && records.zombiesSplatted === 0) {
            titleRecords.innerHTML =
                `<div class="recordEmpty">No rounds on record. Go make history.</div>`;
            return;
        }

        titleRecords.innerHTML = `
            <div class="recordItem"><span>Best Round</span><b>${best ? `${formatRelative(best.relative)} <small>(${best.strokes})</small>` : "—"}</b></div>
            <div class="recordItem"><span>Rounds</span><b>${records.roundsCompleted}</b></div>
            <div class="recordItem"><span>Aces</span><b>${records.holesInOne}</b></div>
            <div class="recordItem"><span>Splatted</span><b>${records.zombiesSplatted}</b></div>
        `;
    }

    renderTitleRecords();

    /* ---------- Menu hooks ---------- */

    if (window.MenuController) {
        const previousBeginGame = MenuController.beginGame.bind(MenuController);

        MenuController.beginGame = function (developerMode) {
            run.id++;
            run.kills = 0;
            lastIntroKey = null;
            previousBeginGame(developerMode);
        };

        const previousExitToMenu = MenuController.exitToMenu.bind(MenuController);

        MenuController.exitToMenu = function () {
            saveJson(RECORDS_KEY, records);
            previousExitToMenu();
            banner.classList.add("hidden");
            renderTitleRecords();
        };
    }

    // "Play Again" restarts the course without going through the menu.
    continueButton.addEventListener(
        "click",
        () => {
            if (continueButton.dataset.mode === "restartCourse") {
                run.id++;
                run.kills = 0;
            }
        },
        true
    );

    /* ---------- Quality of life ---------- */

    document.addEventListener("visibilitychange", () => {
        if (document.hidden && window.MenuController?.state === "playing") {
            MenuController.pause();
        }
    });

    window.addEventListener("beforeunload", () => saveJson(RECORDS_KEY, records));

    document.addEventListener("keydown", event => {
        if (event.repeat) {
            return;
        }

        const key = event.key.toLowerCase();

        if (key === "m") {
            toggleSound();
            return;
        }

        if (key !== "enter") {
            return;
        }

        const focused = document.activeElement;

        if (focused && focused.tagName === "BUTTON" && focused.getClientRects().length > 0) {
            return;
        }

        const shopOverlay = document.getElementById("shopOverlay");
        const shopOpen = shopOverlay && !shopOverlay.classList.contains("hidden");

        if (shopOpen) {
            document.getElementById("leaveShopButton")?.click();
            return;
        }

        if (
            window.MenuController?.state === "playing" &&
            !holeCompletePanel.classList.contains("hidden")
        ) {
            continueButton.click();
        } else if (window.MenuController?.state === "menu") {
            document.getElementById("startGameButton")?.click();
        }
    });

    function tick() {
        try {
            updateHud();
            updateHoleIntro();
        } catch (error) {
            console.error("HUD update failed", error);
        }

        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
})();
