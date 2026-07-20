/*
    Gameplay juice and presentation feedback.

    Adds particles, screen shake, flashes, floating text, ball trails, procedural
    impact sounds, combo feedback, water splashes, and hole-completion confetti
    without changing the core scoring or collision rules.
*/
(function () {
    const particles = [];
    const floatingTexts = [];

    let shakeTime = 0;
    let shakeStrength = 0;
    let flashTime = 0;
    let flashColor = "255,255,255";
    let comboCount = 0;
    let comboTime = 0;
    let lastBallTrailTime = 0;
    let audioContext = null;

    function randomBetween(minimum, maximum) {
        return minimum + Math.random() * (maximum - minimum);
    }

    function addShake(strength, duration) {
        shakeStrength = Math.max(shakeStrength, strength);
        shakeTime = Math.max(shakeTime, duration);
    }

    function addFlash(color, duration) {
        flashColor = color;
        flashTime = Math.max(flashTime, duration);
    }

    function addText(text, x, y, options = {}) {
        floatingTexts.push({
            text,
            x,
            y,
            velocityY: options.velocityY ?? -34,
            life: options.life ?? 0.8,
            maximumLife: options.life ?? 0.8,
            size: options.size ?? 20,
            color: options.color ?? "white",
            weight: options.weight ?? "bold"
        });
    }

    function addParticle(x, y, options = {}) {
        const life = options.life ?? randomBetween(0.25, 0.55);

        particles.push({
            x,
            y,
            velocityX: options.velocityX ?? randomBetween(-90, 90),
            velocityY: options.velocityY ?? randomBetween(-90, 90),
            gravity: options.gravity ?? 0,
            drag: options.drag ?? 0.96,
            life,
            maximumLife: life,
            radius: options.radius ?? randomBetween(2, 5),
            color: options.color ?? "255,255,255",
            shape: options.shape ?? "circle",
            rotation: options.rotation ?? randomBetween(0, Math.PI * 2),
            rotationSpeed: options.rotationSpeed ?? randomBetween(-8, 8)
        });
    }

    function burst(x, y, count, options = {}) {
        for (let index = 0; index < count; index++) {
            const angle = randomBetween(0, Math.PI * 2);
            const speed = randomBetween(
                options.minimumSpeed ?? 35,
                options.maximumSpeed ?? 150
            );

            addParticle(x, y, {
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                gravity: options.gravity ?? 0,
                drag: options.drag ?? 0.95,
                life: randomBetween(
                    options.minimumLife ?? 0.25,
                    options.maximumLife ?? 0.65
                ),
                radius: randomBetween(
                    options.minimumRadius ?? 2,
                    options.maximumRadius ?? 5
                ),
                color: options.color ?? "255,255,255",
                shape: options.shape ?? "circle"
            });
        }
    }

    function getAudioContext() {
        if (!AudioManager.enabled) {
            return null;
        }

        if (!audioContext) {
            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) {
                return null;
            }

            audioContext = new AudioContextClass();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume().catch(() => {});
        }

        return audioContext;
    }

    function playTone(options = {}) {
        const context = getAudioContext();

        if (!context) {
            return;
        }

        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const startTime = context.currentTime;
        const duration = options.duration ?? 0.1;

        oscillator.type = options.type ?? "square";
        oscillator.frequency.setValueAtTime(
            options.frequency ?? 180,
            startTime
        );
        oscillator.frequency.exponentialRampToValueAtTime(
            Math.max(20, options.endFrequency ?? options.frequency ?? 180),
            startTime + duration
        );

        gain.gain.setValueAtTime(options.volume ?? 0.035, startTime);
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            startTime + duration
        );

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }

    function playNoise(duration = 0.08, volume = 0.025) {
        const context = getAudioContext();

        if (!context) {
            return;
        }

        const sampleCount = Math.max(1, context.sampleRate * duration);
        const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let index = 0; index < sampleCount; index++) {
            data[index] = Math.random() * 2 - 1;
        }

        const source = context.createBufferSource();
        const gain = context.createGain();
        const startTime = context.currentTime;

        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        source.buffer = buffer;
        source.connect(gain);
        gain.connect(context.destination);
        source.start(startTime);
    }

    function updateEffects(deltaTime) {
        shakeTime = Math.max(0, shakeTime - deltaTime);
        flashTime = Math.max(0, flashTime - deltaTime);
        comboTime = Math.max(0, comboTime - deltaTime);

        if (comboTime <= 0) {
            comboCount = 0;
        }

        for (const particle of particles) {
            particle.velocityX *= Math.pow(particle.drag, deltaTime * 60);
            particle.velocityY *= Math.pow(particle.drag, deltaTime * 60);
            particle.velocityY += particle.gravity * deltaTime;
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            particle.rotation += particle.rotationSpeed * deltaTime;
            particle.life -= deltaTime;
        }

        for (const text of floatingTexts) {
            text.y += text.velocityY * deltaTime;
            text.velocityY *= Math.pow(0.96, deltaTime * 60);
            text.life -= deltaTime;
        }

        for (let index = particles.length - 1; index >= 0; index--) {
            if (particles[index].life <= 0) {
                particles.splice(index, 1);
            }
        }

        for (let index = floatingTexts.length - 1; index >= 0; index--) {
            if (floatingTexts[index].life <= 0) {
                floatingTexts.splice(index, 1);
            }
        }
    }

    function drawParticles() {
        ctx.save();

        for (const particle of particles) {
            const alpha = Math.max(0, particle.life / particle.maximumLife);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = `rgb(${particle.color})`;
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);

            if (particle.shape === "square") {
                ctx.fillRect(
                    -particle.radius,
                    -particle.radius,
                    particle.radius * 2,
                    particle.radius * 2
                );
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, particle.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.rotate(-particle.rotation);
            ctx.translate(-particle.x, -particle.y);
        }

        ctx.restore();
    }

    function drawFloatingTexts() {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (const text of floatingTexts) {
            const alpha = Math.max(0, text.life / text.maximumLife);
            const scale = 1 + (1 - alpha) * 0.2;

            ctx.globalAlpha = alpha;
            ctx.font = `${text.weight} ${text.size * scale}px Arial`;
            ctx.lineWidth = 4;
            ctx.strokeStyle = "rgba(0,0,0,0.7)";
            ctx.strokeText(text.text, text.x, text.y);
            ctx.fillStyle = text.color;
            ctx.fillText(text.text, text.x, text.y);
        }

        ctx.restore();
    }

    function drawCombo() {
        if (comboCount < 2 || comboTime <= 0) {
            return;
        }

        const pulse = 1 + Math.sin(performance.now() / 70) * 0.05;

        ctx.save();
        ctx.translate(canvas.width / 2, 82);
        ctx.scale(pulse, pulse);
        ctx.textAlign = "center";
        ctx.font = "bold 28px Arial";
        ctx.lineWidth = 6;
        ctx.strokeStyle = "rgba(0,0,0,0.75)";
        ctx.strokeText(`${comboCount} HIT COMBO`, 0, 0);
        ctx.fillStyle = "#ffd45e";
        ctx.fillText(`${comboCount} HIT COMBO`, 0, 0);
        ctx.restore();
    }

    function drawVignetteAndFlash() {
        ctx.save();

        const gradient = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            canvas.height * 0.25,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width * 0.7
        );

        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, "rgba(0,0,0,0.24)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (flashTime > 0) {
            ctx.fillStyle = `rgba(${flashColor},${Math.min(0.28, flashTime * 2)})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.restore();
    }

    const originalTakeClubHit = Zombie.prototype.takeClubHit;

    Zombie.prototype.takeClubHit = function (damage, directionX, directionY) {
        this.ensureCombatStats();
        const healthBefore = this.health;

        originalTakeClubHit.call(this, damage, directionX, directionY);

        comboCount++;
        comboTime = 1.15;

        burst(this.x, this.y, 12, {
            color: "113,35,31",
            minimumSpeed: 45,
            maximumSpeed: 175,
            gravity: 170,
            minimumRadius: 2,
            maximumRadius: 5
        });

        burst(this.x, this.y, 7, {
            color: "255,210,84",
            minimumSpeed: 70,
            maximumSpeed: 220,
            minimumLife: 0.12,
            maximumLife: 0.28,
            minimumRadius: 1,
            maximumRadius: 3
        });

        addText(`-${Math.min(damage, healthBefore)}`, this.x, this.y - 24, {
            color: "#ffdf75",
            size: 19
        });

        addShake(this.health <= 0 ? 10 : 5, this.health <= 0 ? 0.28 : 0.12);
        addFlash("255,235,190", this.health <= 0 ? 0.12 : 0.05);
        playNoise(this.health <= 0 ? 0.14 : 0.07, this.health <= 0 ? 0.045 : 0.025);
        playTone({
            frequency: this.health <= 0 ? 120 : 220,
            endFrequency: this.health <= 0 ? 45 : 90,
            duration: this.health <= 0 ? 0.2 : 0.08,
            volume: this.health <= 0 ? 0.055 : 0.03,
            type: "sawtooth"
        });

        if (this.health <= 0) {
            burst(this.x, this.y, 28, {
                color: "93,24,30",
                minimumSpeed: 60,
                maximumSpeed: 260,
                gravity: 220,
                minimumLife: 0.35,
                maximumLife: 0.9,
                minimumRadius: 2,
                maximumRadius: 7
            });

            addText("SPLAT!", this.x, this.y - 42, {
                color: "#ff746b",
                size: 28,
                life: 1.05,
                velocityY: -44
            });
        }
    };

    const originalBeginClubAttack = Player.beginClubAttack.bind(Player);

    Player.beginClubAttack = function () {
        const started = originalBeginClubAttack();

        if (started) {
            playTone({
                frequency: 520,
                endFrequency: 150,
                duration: 0.16,
                volume: 0.022,
                type: "sine"
            });
        }

        return started;
    };

    const originalPlayerTakeDamage = Player.takeDamage.bind(Player);

    Player.takeDamage = function (...args) {
        const succeeded = originalPlayerTakeDamage(...args);

        if (succeeded) {
            addShake(9, 0.3);
            addFlash("210,30,30", 0.2);
            burst(this.x, this.y, 14, {
                color: "220,45,45",
                minimumSpeed: 35,
                maximumSpeed: 145,
                gravity: 100
            });
            addText("OUCH!", this.x, this.y - 40, {
                color: "#ff6868",
                size: 24
            });
            playNoise(0.13, 0.04);
        }

        return succeeded;
    };

    const originalBallUpdate = Ball.update.bind(Ball);

    Ball.update = function (...args) {
        const wasSunk = this.isSunk;
        const speedBefore = Math.hypot(this.velocityX, this.velocityY);
        const beforeVelocityX = this.velocityX;
        const beforeVelocityY = this.velocityY;
        const beforeX = this.x;
        const beforeY = this.y;

        let wasInWater = false;

        if (Hole.waterHazard && Hole.bridge) {
            const water = Hole.waterHazard;
            const bridge = Hole.bridge;
            const insideWater =
                this.x + this.radius > water.x &&
                this.x - this.radius < water.x + water.width &&
                this.y + this.radius > water.y &&
                this.y - this.radius < water.y + water.height;
            const safelyOnBridge =
                this.x >= bridge.x &&
                this.x <= bridge.x + bridge.width &&
                this.y >= bridge.y &&
                this.y <= bridge.y + bridge.height;

            wasInWater = insideWater && !safelyOnBridge;
        }

        originalBallUpdate(...args);

        const now = performance.now();
        const speedAfter = Math.hypot(this.velocityX, this.velocityY);

        if (speedAfter > 1.4 && now - lastBallTrailTime > 28) {
            lastBallTrailTime = now;
            addParticle(this.x, this.y, {
                velocityX: -this.velocityX * 8 + randomBetween(-8, 8),
                velocityY: -this.velocityY * 8 + randomBetween(-8, 8),
                life: 0.22,
                radius: randomBetween(1.5, 3.2),
                color: "245,245,220",
                drag: 0.9
            });
        }

        const bounced =
            speedBefore > 1 &&
            (
                Math.sign(beforeVelocityX) !== Math.sign(this.velocityX) ||
                Math.sign(beforeVelocityY) !== Math.sign(this.velocityY)
            ) &&
            speedAfter > 0.6;

        if (bounced) {
            burst(this.x, this.y, 7, {
                color: "225,215,175",
                minimumSpeed: 25,
                maximumSpeed: 100,
                minimumLife: 0.12,
                maximumLife: 0.32,
                minimumRadius: 1,
                maximumRadius: 3
            });
            addShake(Math.min(4, speedBefore * 0.45), 0.08);
        }

        if (wasInWater && this.x === Hole.tee.x && this.y === Hole.tee.y) {
            burst(beforeX, beforeY, 30, {
                color: "100,205,240",
                minimumSpeed: 45,
                maximumSpeed: 210,
                gravity: 240,
                minimumLife: 0.35,
                maximumLife: 0.85,
                minimumRadius: 2,
                maximumRadius: 6
            });
            addShake(7, 0.25);
            addFlash("95,190,230", 0.16);
            playNoise(0.22, 0.035);
            playTone({
                frequency: 170,
                endFrequency: 70,
                duration: 0.24,
                volume: 0.03,
                type: "sine"
            });
        }

        if (!wasSunk && this.isSunk) {
            burst(Hole.cup.x, Hole.cup.y, 32, {
                color: "255,220,75",
                minimumSpeed: 70,
                maximumSpeed: 245,
                gravity: 180,
                minimumLife: 0.45,
                maximumLife: 1.1,
                minimumRadius: 2,
                maximumRadius: 6,
                shape: "square"
            });
            addShake(8, 0.35);
            addFlash("255,245,185", 0.22);
            addText("SUNK!", Hole.cup.x, Hole.cup.y - 40, {
                color: "#ffe36a",
                size: 34,
                life: 1.2,
                velocityY: -50
            });
        }
    };

    const originalShowHoleCompletePanel = window.showHoleCompletePanel;

    if (typeof originalShowHoleCompletePanel === "function") {
        window.showHoleCompletePanel = function () {
            originalShowHoleCompletePanel();

            for (let index = 0; index < 80; index++) {
                const palette = [
                    "255,210,64",
                    "255,100,85",
                    "100,210,255",
                    "135,235,120",
                    "230,130,255"
                ];

                addParticle(
                    canvas.width / 2 + randomBetween(-140, 140),
                    -10,
                    {
                        velocityX: randomBetween(-70, 70),
                        velocityY: randomBetween(80, 260),
                        gravity: 120,
                        drag: 0.995,
                        life: randomBetween(1.1, 2.2),
                        radius: randomBetween(3, 7),
                        color: palette[index % palette.length],
                        shape: "square"
                    }
                );
            }
        };
    }

    const originalUpdate = update;
    update = function (deltaTime) {
        originalUpdate(deltaTime);
        updateEffects(deltaTime);
    };

    const originalDraw = draw;
    draw = function () {
        const shakeActive = shakeTime > 0;
        const offsetX = shakeActive
            ? randomBetween(-shakeStrength, shakeStrength)
            : 0;
        const offsetY = shakeActive
            ? randomBetween(-shakeStrength, shakeStrength)
            : 0;

        ctx.save();
        ctx.translate(offsetX, offsetY);
        originalDraw();
        drawParticles();
        drawFloatingTexts();
        ctx.restore();

        drawCombo();
        drawVignetteAndFlash();

        if (shakeTime <= 0) {
            shakeStrength = 0;
        } else {
            shakeStrength *= 0.92;
        }
    };
})();
