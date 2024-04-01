"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.levels = exports.enemies = exports.units = void 0;
exports.units = [
    {
        type: 'stone-catapult',
        damage: [20, 25, 35, 55, 95],
        rate: [1500, 1400, 1300, 1200, 1100],
        range: [5, 5.5, 6, 6.5, 7],
        bulletSpeed: [0.3, 0.35, 0.4, 0.45, 0.5],
        cost: 100,
        upgradeCost: [50, 100, 200, 400],
        buy: 900,
        tags: ['catapult']
    },
    {
        type: 'ice-catapult',
        damage: [15, 20, 30, 50, 90],
        rate: [1200, 1150, 1100, 1050, 1000],
        range: [5.5, 6, 6.5, 7, 7.5],
        bulletSpeed: [0.2, 0.25, 0.3, 0.35, 0.4],
        cost: 120,
        upgradeCost: [60, 120, 240, 480],
        buy: 900,
        tags: ['catapult', 'ice-3']
    },
    {
        type: 'mini-cannon',
        damage: [50, 75, 100, 150, 250],
        rate: [2000, 1950, 1900, 1850, 1800],
        range: [3.5, 4, 4.5, 5, 5.5],
        bulletSpeed: [0.4, 0.45, 0.5, 0.55, 0.6],
        cost: 130,
        upgradeCost: [65, 130, 260, 520],
        buy: 900,
        tags: ['cannon']
    },
    {
        type: 'heavy-cannon',
        damage: [80, 100, 150, 200, 300],
        rate: [2000, 1950, 1900, 1850, 1800],
        range: [3, 3.5, 4, 4.5, 5],
        bulletSpeed: [0.5, 0.55, 0.6, 0.65, 0.7],
        cost: 150,
        upgradeCost: [75, 150, 300, 600],
        buy: 1900,
        tags: ['cannon']
    },
    {
        type: 'bomb-cannon',
        damage: [100, 150, 200, 300, 500],
        rate: [2500, 2400, 2300, 2200, 2100],
        range: [3, 3.5, 4, 4.5, 5],
        bulletSpeed: [0.4, 0.45, 0.5, 0.55, 0.6],
        cost: 190,
        upgradeCost: [95, 190, 380, 760],
        buy: 2600,
        tags: ['cannon', 'splash-2']
    },
    {
        type: 'charge-cannon',
        damage: [200, 300, 400, 600, 1000],
        rate: [4000, 3800, 3600, 3400, 3200],
        range: [4, 4.5, 5, 5.5, 6],
        bulletSpeed: [0.6, 0.65, 0.7, 0.75, 0.8],
        cost: 230,
        upgradeCost: [115, 230, 460, 920],
        buy: 4900,
        tags: ['cannon']
    },
    {
        type: 'auto-turret',
        damage: [15, 20, 30, 50, 90],
        rate: [800, 700, 600, 500, 400],
        range: [3, 3.5, 4, 4.5, 5],
        bulletSpeed: [0.8, 0.85, 0.9, 0.95, 1],
        cost: 100,
        upgradeCost: [50, 100, 200, 400],
        buy: 900,
        tags: ['turret']
    },
    {
        type: 'machinegun-turret',
        damage: [10, 15, 25, 45, 80],
        rate: [400, 350, 300, 250, 200],
        range: [4, 4.5, 5, 5.5, 6],
        bulletSpeed: [0.9, 0.95, 1, 1, 1],
        cost: 150,
        upgradeCost: [75, 150, 300, 600],
        buy: 1200,
        tags: ['turret']
    },
    {
        type: 'rocket-turret',
        damage: [40, 60, 100, 180, 300],
        rate: [2000, 1800, 1600, 1400, 1200],
        range: [6, 6.5, 7, 7.5, 8],
        bulletSpeed: [0.7, 0.75, 0.8, 0.85, 0.9],
        cost: 180,
        upgradeCost: [90, 180, 360, 720],
        buy: 2900,
        tags: ['turret', 'splash-1']
    },
    {
        type: 'laser-turret',
        damage: [20, 30, 50, 80, 150],
        rate: [500, 450, 400, 350, 300],
        range: [5, 5.5, 6, 6.5, 7],
        bulletSpeed: [1, 1, 1, 1, 1],
        cost: 250,
        upgradeCost: [125, 250, 500, 1000],
        buy: 5400,
        tags: ['turret']
    },
    {
        type: 'ballista',
        damage: [30, 40, 60, 100, 180],
        rate: [1800, 1700, 1600, 1500, 1400],
        range: [6, 6.5, 7, 7.5, 8],
        bulletSpeed: [0.6, 0.65, 0.7, 0.75, 0.8],
        cost: 150,
        upgradeCost: [75, 150, 300, 600],
        buy: 900,
        tags: ['ballista']
    },
    {
        type: 'fire-ballista',
        damage: [35, 50, 75, 125, 200],
        rate: [1600, 1500, 1400, 1300, 1200],
        range: [6, 6.5, 7, 7.5, 8],
        bulletSpeed: [0.5, 0.55, 0.6, 0.65, 0.7],
        cost: 170,
        upgradeCost: [85, 170, 340, 680],
        buy: 1400,
        tags: ['ballista', 'fire-2']
    },
    {
        type: 'poison-ballista',
        damage: [30, 40, 60, 100, 180],
        rate: [1400, 1300, 1200, 1100, 1000],
        range: [5.5, 6, 6.5, 7, 7.5],
        bulletSpeed: [0.5, 0.55, 0.6, 0.65, 0.7],
        cost: 200,
        upgradeCost: [100, 200, 400, 800],
        buy: 3300,
        tags: ['ballista', 'poison-5']
    }
];
exports.enemies = [
    {
        type: 'goblin',
        health: 50,
        speed: 0.1,
        coin: 10,
        tags: []
    },
    {
        type: 'orc',
        health: 100,
        speed: 0.08,
        coin: 20,
        tags: []
    },
    {
        type: 'ogre',
        health: 200,
        speed: 0.07,
        coin: 30,
        tags: []
    },
    {
        type: 'troll',
        health: 400,
        speed: 0.08,
        coin: 40,
        tags: []
    },
    {
        type: 'giant',
        health: 800,
        speed: 0.05,
        coin: 50,
        tags: []
    },
    {
        type: 'dragon',
        health: 1000,
        speed: 0.04,
        coin: 100,
        tags: []
    },
    {
        type: 'demon',
        health: 2000,
        speed: 0.02,
        coin: 200,
        tags: []
    },
    {
        type: 'god',
        health: 5000,
        speed: 0.01,
        coin: 500,
        tags: []
    }
];
exports.levels = [
    {
        enemies: [
            ['goblin', 'goblin', 'goblin', 'goblin'],
            ['goblin', 'goblin', 'orc', 'orc'],
            ['goblin', 'goblin', 'goblin', 'goblin', 'orc', 'orc'],
            ['orc', 'orc', 'orc', 'orc'],
            ['orc', 'orc', 'orc', 'orc', 'ogre'],
            ['goblin', 'goblin', 'goblin', 'goblin', 'orc', 'orc', 'orc', 'orc'],
            ['orc', 'orc', 'orc', 'orc', 'orc', 'orc', 'ogre', 'ogre'],
            ['orc', 'orc', 'orc', 'orc', 'ogre', 'ogre', 'ogre'],
            ['ogre', 'ogre', 'ogre', 'ogre', 'ogre', 'ogre'],
            ['orc', 'orc', 'orc', 'orc', 'ogre', 'ogre', 'ogre', 'ogre', 'troll'],
        ]
    },
    {
        enemies: [
            ['goblin', 'goblin', 'goblin', 'goblin', 'orc', 'orc'],
            ['orc', 'orc', 'orc', 'orc', 'orc', 'orc'],
            ['orc', 'orc', 'orc', 'orc', 'orc', 'orc', 'ogre'],
            ['goblin', 'goblin', 'goblin', 'goblin', 'orc', 'orc', 'orc', 'orc'],
            ['orc', 'orc', 'orc', 'orc', 'orc', 'orc', 'ogre', 'ogre'],
            ['orc', 'orc', 'orc', 'orc', 'ogre', 'ogre', 'ogre'],
            ['ogre', 'ogre', 'ogre', 'ogre', 'ogre', 'ogre'],
            ['orc', 'orc', 'orc', 'orc', 'ogre', 'ogre', 'ogre', 'ogre', 'troll'],
            ['ogre', 'ogre', 'ogre', 'ogre', 'ogre', 'ogre', 'troll'],
            ['ogre', 'ogre', 'ogre', 'ogre', 'ogre', 'ogre', 'troll', 'troll'],
        ]
    },
    {
        enemies: [
            ['orc', 'orc', 'orc', 'orc', 'orc', 'orc', 'ogre'],
            ['goblin', 'goblin', 'goblin', 'goblin', 'orc', 'orc', 'orc', 'orc'],
            ['orc', 'orc', 'orc', 'orc', 'orc', 'orc', 'ogre', 'ogre'],
            ['orc', 'orc', 'orc', 'orc', 'ogre', 'ogre', 'ogre'],
            ['ogre', 'ogre', 'ogre', 'ogre', 'ogre', 'ogre'],
            ['orc', 'orc', 'orc', 'orc', 'ogre', 'ogre', 'ogre', 'ogre', 'troll'],
            ['ogre', 'ogre', 'ogre', 'ogre', 'ogre', 'ogre', 'troll'],
            ['ogre', 'ogre', 'ogre', 'ogre', 'ogre', 'ogre', 'troll', 'troll'],
            ['ogre', 'ogre', 'ogre', 'ogre', 'ogre', 'ogre', 'troll', 'troll', 'giant'],
            ['ogre', 'ogre', 'ogre', 'ogre', 'ogre', 'ogre', 'troll', 'troll', 'giant', 'giant'],
        ]
    }
];
//# sourceMappingURL=db.js.map