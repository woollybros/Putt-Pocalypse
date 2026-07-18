const Clubs = {
    rustyPutter: {
        name: "Rusty Putter",

        maximumPower: 12,
        maximumDragDistance: 260,

        guideLength: 180,
        maxBankPreview: 1,

        aimStability: 0.45,

        swingDuration: 0.28,
        swingImpactPercent: 0.46,

        maximumDurability: 100,
        durability: 100
    },

    sportingGoodsPutter: {
        name: "Sporting Goods Putter",

        maximumPower: 14,
        maximumDragDistance: 290,

        guideLength: 260,
        maxBankPreview: 2,

        aimStability: 0.75,

        swingDuration: 0.25,
        swingImpactPercent: 0.46,

        maximumDurability: 140,
        durability: 140
    },

    tournamentPutter: {
        name: "Tournament Putter",

        maximumPower: 16,
        maximumDragDistance: 320,

        guideLength: 360,
        maxBankPreview: 3,

        aimStability: 0.97,

        swingDuration: 0.22,
        swingImpactPercent: 0.46,

        maximumDurability: 200,
        durability: 200
    }
};

const DeveloperClubs = [
    Clubs.rustyPutter,
    Clubs.sportingGoodsPutter,
    Clubs.tournamentPutter
];