const AudioManager = {
    sounds: {
        putt: new Audio(
            "assets/sounds/putt.wav"
        ),

        wallBounce: new Audio(
            "assets/sounds/wall-bounce.wav"
        ),

        cup: new Audio(
            "assets/sounds/cup.wav"
        ),

        holeComplete: new Audio(
            "assets/sounds/hole-complete.wav"
        )
    },

    enabled: true,

    volume: 0.7,

    initialized: false,

    initialize() {
        if (this.initialized) {
            return;
        }

        for (
            const sound
            of Object.values(this.sounds)
        ) {
            sound.preload = "auto";
            sound.volume = this.volume;
        }

        this.initialized = true;
    },

    play(soundName, options = {}) {
        if (!this.enabled) {
            return;
        }

        const originalSound =
            this.sounds[soundName];

        if (!originalSound) {
            console.warn(
                `Sound not found: ${soundName}`
            );

            return;
        }

        /*
            Clone the audio so rapid sounds can
            overlap, such as multiple wall bounces.
        */
        const sound =
            originalSound.cloneNode();

        sound.volume =
            options.volume ??
            this.volume;

        sound.playbackRate =
            options.playbackRate ??
            1;

        sound.play().catch(() => {
            /*
                Browsers may block audio until the
                player first taps or clicks.
            */
        });
    },

    toggle() {
        this.enabled =
            !this.enabled;

        return this.enabled;
    }
};