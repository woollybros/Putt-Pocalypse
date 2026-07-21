/*
    Ticket economy, between-hole shop, and armed caddy companion.

    Players earn tickets from hole performance, then shop before advancing.
    Purchases persist for the current course run and reset on a new Start.
*/
(function () {
    const Economy = {
        tickets: 0,
        lastReward: 0,
        rewardedHoleIndex: -1,
        powerLevel: 0,
        stabilityLevel: 0,
        durabilityLevel: 0,
        healthLevel: 0,
        caddyLevel: 0,
        caddy: null,
        bullets: []
    };

    const PRICES = {
        beer: 6,
        repair: 5,
        power: 10,
        stability: 9,
        durability: 8,
        health: 14,
        caddy: 18,
        ammo: 6,
        caddyUpgrade: 12
    };

    function getTicketReward(strokes, par) {
        const difference = strokes - par;

        if (strokes === 1) {
            return 20;
        }

        if (difference <= -3) {
            return 16;
        }

        if (difference === -2) {
            return 13;
        }

        if (difference === -1) {
            return 10;
        }

        if (difference === 0) {
            return 7;
        }

        if (difference === 1) {
            return 5;
        }

        if (difference === 2) {
            return 3;
        }

        return 2;
    }

    function currentClub() {
        return Player.equippedClub ?? Player.droppedClub?.club ?? Clubs.rustyPutter;
    }

    function spendTickets(price) {
        if (Economy.tickets < price) {
            return false;
        }

        Economy.tickets -= price;
        return true;
    }

    function makeButton(label, description, price, purchase) {
        const button = document.createElement("button");
        button.className = "shopItemButton";

        const title = document.createElement("strong");
        title.textContent = `${label} — ${price} tickets`;

        const detail = document.createElement("span");
        detail.textContent = description;

        button.appendChild(title);
        button.appendChild(detail);

        button.addEventListener("click", () => {
            if (!spendTickets(price)) {
                statusText.textContent = "Not enough tickets.";
                refreshShop();
                return;
            }

            const result = purchase();

            if (result === false) {
                Economy.tickets += price;
                statusText.textContent = "That upgrade is already maxed out.";
            } else {
                statusText.textContent = `${label} purchased.`;
            }

            refreshShop();
        });

        return button;
    }

    const style = document.createElement("style");
    style.textContent = `
        #ticketHud {
            position: fixed;
            left: 20px;
            top: 82px;
            z-index: 12;
            padding: 9px 13px;
            border: 2px solid rgba(255, 221, 105, 0.85);
            border-radius: 9px;
            background: rgba(24, 18, 8, 0.82);
            color: #ffe17b;
            font: bold 15px Arial, sans-serif;
            pointer-events: none;
        }

        #shopOverlay {
            position: fixed;
            inset: 0;
            z-index: 30;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(10, 8, 5, 0.82);
        }

        #shopOverlay.hidden {
            display: none;
        }

        #shopCard {
            width: min(760px, 94vw);
            max-height: 88vh;
            overflow-y: auto;
            padding: 24px;
            border: 3px solid #d5a743;
            border-radius: 16px;
            background: linear-gradient(#322619, #18120d);
            color: white;
            box-shadow: 0 18px 55px rgba(0, 0, 0, 0.65);
        }

        #shopCard h2 {
            margin: 0 0 6px;
            color: #ffd46b;
            font-size: 30px;
        }

        #shopBalance {
            margin-bottom: 14px;
            color: #ffe9a9;
            font: bold 18px Arial, sans-serif;
        }

        #shopItems {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 10px;
        }

        .shopItemButton {
            display: flex;
            min-height: 82px;
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
            padding: 12px;
            border: 1px solid rgba(255, 225, 154, 0.55);
            border-radius: 10px;
            background: rgba(97, 67, 34, 0.72);
            color: white;
            text-align: left;
            cursor: pointer;
        }

        .shopItemButton:disabled {
            opacity: 0.42;
            cursor: not-allowed;
        }

        .shopItemButton strong {
            color: #ffd66d;
            font-size: 15px;
        }

        .shopItemButton span {
            font-size: 13px;
            line-height: 1.3;
        }

        #shopStatus {
            min-height: 22px;
            margin: 14px 0 8px;
            color: #bceaa5;
            font-weight: bold;
        }

        #leaveShopButton {
            width: 100%;
            margin-top: 8px;
            padding: 13px;
            border: 0;
            border-radius: 10px;
            background: #b23a31;
            color: white;
            font: bold 17px Arial, sans-serif;
            cursor: pointer;
        }

        #ticketRewardLine {
            margin-top: 8px;
            color: #ffd86e;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);

    const ticketHud = document.createElement("div");
    ticketHud.id = "ticketHud";
    document.body.appendChild(ticketHud);

    const shopOverlay = document.createElement("div");
    shopOverlay.id = "shopOverlay";
    shopOverlay.className = "hidden";
    shopOverlay.innerHTML = `
        <div id="shopCard">
            <h2>The Turn Shack</h2>
            <div id="shopBalance"></div>
            <div id="shopItems"></div>
            <div id="shopStatus"></div>
            <button id="leaveShopButton">Continue to Next Hole</button>
        </div>
    `;
    document.body.appendChild(shopOverlay);

    const shopBalance = document.getElementById("shopBalance");
    const shopItems = document.getElementById("shopItems");
    const statusText = document.getElementById("shopStatus");
    const leaveShopButton = document.getElementById("leaveShopButton");

    function ensureCaddy() {
        if (Economy.caddy) {
            return Economy.caddy;
        }

        Economy.caddy = {
            x: Player.x - 30,
            y: Player.y + 25,
            ammo: 24,
            maximumAmmo: 24,
            fireCooldown: 0,
            fireInterval: 0.82,
            range: 210,
            damage: 25
        };

        return Economy.caddy;
    }

    function refreshShop() {
        ticketHud.textContent = `Tickets: ${Economy.tickets}`;
        shopBalance.textContent = `Tickets available: ${Economy.tickets}`;
        shopItems.innerHTML = "";

        shopItems.appendChild(makeButton(
            "Beer",
            "Heal 35 health. Any extra healing is discarded.",
            PRICES.beer,
            () => {
                Player.health = Math.min(Player.maximumHealth, Player.health + 35);
            }
        ));

        shopItems.appendChild(makeButton(
            "Repair Putter",
            "Restore 40 durability to the equipped putter.",
            PRICES.repair,
            () => {
                const club = currentClub();
                club.durability = Math.min(
                    club.maximumDurability,
                    (club.durability ?? club.maximumDurability) + 40
                );
            }
        ));

        shopItems.appendChild(makeButton(
            "Power Grip",
            `Increase putter power by 1. Level ${Economy.powerLevel}/5.`,
            PRICES.power,
            () => {
                if (Economy.powerLevel >= 5) {
                    return false;
                }

                Economy.powerLevel++;
                currentClub().maximumPower += 1;
            }
        ));

        shopItems.appendChild(makeButton(
            "True-Line Sight",
            `Improve aim stability by 5%. Level ${Economy.stabilityLevel}/5.`,
            PRICES.stability,
            () => {
                if (Economy.stabilityLevel >= 5) {
                    return false;
                }

                Economy.stabilityLevel++;
                const club = currentClub();
                club.aimStability = Math.min(0.99, club.aimStability + 0.05);
            }
        ));

        shopItems.appendChild(makeButton(
            "Reinforced Shaft",
            `Add 25 maximum durability and repair 25. Level ${Economy.durabilityLevel}/4.`,
            PRICES.durability,
            () => {
                if (Economy.durabilityLevel >= 4) {
                    return false;
                }

                Economy.durabilityLevel++;
                const club = currentClub();
                club.maximumDurability += 25;
                club.durability = Math.min(
                    club.maximumDurability,
                    (club.durability ?? 0) + 25
                );
            }
        ));

        shopItems.appendChild(makeButton(
            "Extra Padding",
            `Add 20 maximum health and heal 20. Level ${Economy.healthLevel}/3.`,
            PRICES.health,
            () => {
                if (Economy.healthLevel >= 3) {
                    return false;
                }

                Economy.healthLevel++;
                Player.maximumHealth += 20;
                Player.health = Math.min(Player.maximumHealth, Player.health + 20);
            }
        ));

        if (!Economy.caddy) {
            shopItems.appendChild(makeButton(
                "Hire Armed Caddy",
                "A tiny gun-toting caddy follows you and shoots nearby zombies. Starts with 24 rounds.",
                PRICES.caddy,
                () => ensureCaddy()
            ));
        } else {
            shopItems.appendChild(makeButton(
                "Caddy Ammo",
                "Add 12 rounds, up to the caddy's current maximum.",
                PRICES.ammo,
                () => {
                    Economy.caddy.ammo = Math.min(
                        Economy.caddy.maximumAmmo,
                        Economy.caddy.ammo + 12
                    );
                }
            ));

            shopItems.appendChild(makeButton(
                "Caddy Training",
                `Faster fire, longer range, and +8 max ammo. Level ${Economy.caddyLevel}/3.`,
                PRICES.caddyUpgrade,
                () => {
                    if (Economy.caddyLevel >= 3) {
                        return false;
                    }

                    Economy.caddyLevel++;
                    const caddy = Economy.caddy;
                    caddy.fireInterval = Math.max(0.4, caddy.fireInterval - 0.12);
                    caddy.range += 25;
                    caddy.maximumAmmo += 8;
                    caddy.ammo += 8;
                }
            ));
        }

        for (const button of shopItems.querySelectorAll("button")) {
            const priceMatch = button.querySelector("strong")?.textContent.match(/— (\d+) tickets/);
            const price = priceMatch ? Number(priceMatch[1]) : 0;
            button.disabled = Economy.tickets < price;
        }
    }

    function openShop() {
        statusText.textContent = "";
        refreshShop();
        shopOverlay.classList.remove("hidden");
    }

    function closeShopAndAdvance() {
        shopOverlay.classList.add("hidden");
        advanceToNextHole();
    }

    leaveShopButton.addEventListener("click", closeShopAndAdvance);

    continueButton.addEventListener(
        "click",
        event => {
            if (
                continueButton.dataset.mode ||
                Hole.isLastHole ||
                !holeCompleteShown
            ) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();
            openShop();
        },
        true
    );

    const originalShowHoleCompletePanel = window.showHoleCompletePanel;

    window.showHoleCompletePanel = function () {
        originalShowHoleCompletePanel();

        if (Economy.rewardedHoleIndex !== Hole.currentIndex) {
            Economy.lastReward = getTicketReward(
                GameState.currentHoleStrokes,
                Hole.par
            );
            Economy.tickets += Economy.lastReward;
            Economy.rewardedHoleIndex = Hole.currentIndex;
        }

        let rewardLine = document.getElementById("ticketRewardLine");

        if (!rewardLine) {
            rewardLine = document.createElement("div");
            rewardLine.id = "ticketRewardLine";
            holeCompleteResult.insertAdjacentElement("afterend", rewardLine);
        }

        rewardLine.textContent =
            `Earned ${Economy.lastReward} tickets — Total: ${Economy.tickets}`;

        ticketHud.textContent = `Tickets: ${Economy.tickets}`;
    };

    function findCaddyTarget(caddy) {
        let nearest = null;
        let nearestDistance = caddy.range;

        for (const zombie of Zombies.items) {
            zombie.ensureCombatStats?.();

            if (typeof zombie.health === "number" && zombie.health <= 0) {
                continue;
            }

            const distance = Math.hypot(zombie.x - Player.x, zombie.y - Player.y);

            if (distance < nearestDistance) {
                nearest = zombie;
                nearestDistance = distance;
            }
        }

        return nearest;
    }

    function fireCaddyShot(caddy, target) {
        const offsetX = target.x - caddy.x;
        const offsetY = target.y - caddy.y;
        const distance = Math.hypot(offsetX, offsetY) || 1;

        Economy.bullets.push({
            x: caddy.x,
            y: caddy.y - 8,
            velocityX: offsetX / distance * 540,
            velocityY: offsetY / distance * 540,
            life: 0.65,
            damage: caddy.damage
        });

        caddy.ammo--;
        caddy.fireCooldown = caddy.fireInterval;
    }

    function updateCaddy(deltaTime) {
        const caddy = Economy.caddy;

        if (!caddy || Player.isDead) {
            return;
        }

        const targetX = Player.x - 34;
        const targetY = Player.y + 28;
        const followBlend = 1 - Math.exp(-5 * deltaTime);
        caddy.x += (targetX - caddy.x) * followBlend;
        caddy.y += (targetY - caddy.y) * followBlend;
        caddy.fireCooldown = Math.max(0, caddy.fireCooldown - deltaTime);

        if (caddy.ammo > 0 && caddy.fireCooldown <= 0) {
            const target = findCaddyTarget(caddy);

            if (target) {
                fireCaddyShot(caddy, target);
            }
        }

        for (let index = Economy.bullets.length - 1; index >= 0; index--) {
            const bullet = Economy.bullets[index];
            bullet.x += bullet.velocityX * deltaTime;
            bullet.y += bullet.velocityY * deltaTime;
            bullet.life -= deltaTime;

            let hit = false;

            for (const zombie of Zombies.items) {
                const distance = Math.hypot(bullet.x - zombie.x, bullet.y - zombie.y);

                if (distance > zombie.radius + 3) {
                    continue;
                }

                const directionLength = Math.hypot(
                    bullet.velocityX,
                    bullet.velocityY
                ) || 1;

                zombie.takeClubHit(
                    bullet.damage,
                    bullet.velocityX / directionLength,
                    bullet.velocityY / directionLength
                );
                hit = true;
                break;
            }

            if (hit || bullet.life <= 0) {
                Economy.bullets.splice(index, 1);
            }
        }
    }

    function drawCaddy() {
        const caddy = Economy.caddy;

        if (!caddy) {
            return;
        }

        ctx.save();

        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.ellipse(caddy.x + 2, caddy.y + 9, 11, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#375d35";
        ctx.beginPath();
        ctx.arc(caddy.x, caddy.y, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#f0c698";
        ctx.beginPath();
        ctx.arc(caddy.x, caddy.y - 10, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#c4322b";
        ctx.fillRect(caddy.x - 8, caddy.y - 19, 16, 4);
        ctx.fillRect(caddy.x - 5, caddy.y - 23, 10, 5);

        ctx.strokeStyle = "#262626";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(caddy.x + 7, caddy.y - 2);
        ctx.lineTo(caddy.x + 22, caddy.y - 8);
        ctx.stroke();

        ctx.fillStyle = "white";
        ctx.font = "bold 11px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${caddy.ammo}/${caddy.maximumAmmo}`, caddy.x, caddy.y + 25);

        for (const bullet of Economy.bullets) {
            ctx.fillStyle = "#ffe06b";
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    const originalUpdate = window.update;
    window.update = function (deltaTime) {
        originalUpdate(deltaTime);
        updateCaddy(deltaTime);
        ticketHud.style.display =
            window.MenuController?.state === "playing" ? "block" : "none";
    };

    const originalDraw = window.draw;
    window.draw = function () {
        originalDraw();
        drawCaddy();
    };

    function resetEconomyForNewRun() {
        Economy.tickets = 0;
        Economy.lastReward = 0;
        Economy.rewardedHoleIndex = -1;
        Economy.powerLevel = 0;
        Economy.stabilityLevel = 0;
        Economy.durabilityLevel = 0;
        Economy.healthLevel = 0;
        Economy.caddyLevel = 0;
        Economy.caddy = null;
        Economy.bullets.length = 0;
        Player.maximumHealth = 100;
        ticketHud.textContent = "Tickets: 0";
        shopOverlay.classList.add("hidden");
    }

    if (window.MenuController) {
        const originalBeginGame = MenuController.beginGame.bind(MenuController);

        MenuController.beginGame = function (developerMode) {
            resetEconomyForNewRun();
            originalBeginGame(developerMode);
        };

        const originalExitToMenu = MenuController.exitToMenu.bind(MenuController);

        MenuController.exitToMenu = function () {
            shopOverlay.classList.add("hidden");
            originalExitToMenu();
        };
    }

    window.TicketEconomy = Economy;
    ticketHud.textContent = "Tickets: 0";
})();