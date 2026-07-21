/* Small integration safeguards for the ticket shop and caddy system. */
(function () {
    const clubBaselines = new Map();

    for (const club of Object.values(Clubs)) {
        if (!club || typeof club !== "object") {
            continue;
        }

        clubBaselines.set(club, {
            maximumPower: club.maximumPower,
            aimStability: club.aimStability,
            maximumDurability: club.maximumDurability
        });
    }

    function restoreBaseClubStats() {
        for (const [club, baseline] of clubBaselines.entries()) {
            club.maximumPower = baseline.maximumPower;
            club.aimStability = baseline.aimStability;
            club.maximumDurability = baseline.maximumDurability;
            club.durability = baseline.maximumDurability;
        }
    }

    if (window.MenuController) {
        const previousBeginGame = MenuController.beginGame.bind(MenuController);

        MenuController.beginGame = function (developerMode) {
            restoreBaseClubStats();
            previousBeginGame(developerMode);
        };
    }

    const previousUpdate = window.update;

    window.update = function (deltaTime) {
        const economy = window.TicketEconomy;
        const shopOpen = !document.getElementById("shopOverlay")?.classList.contains("hidden");
        const gameplayFrozen =
            shopOpen ||
            window.holeCompleteShown === true ||
            window.gameOverShown === true ||
            window.MenuController?.state !== "playing";

        let savedAmmo = null;

        if (gameplayFrozen && economy?.caddy) {
            savedAmmo = economy.caddy.ammo;
            economy.caddy.ammo = 0;
            economy.bullets.length = 0;
        }

        previousUpdate(deltaTime);

        if (savedAmmo !== null && economy?.caddy) {
            economy.caddy.ammo = savedAmmo;
        }
    };
})();