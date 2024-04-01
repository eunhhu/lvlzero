"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enemies = exports.units = void 0;
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
        tags: ['catapult', 'ice']
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
        rate: [2000],
        range: [3],
        bulletSpeed: [0.5],
        cost: 150,
        upgradeCost: [0],
        buy: 1900,
        tags: ['cannon']
    },
    {
        type: 'bomb-cannon',
        damage: [100],
        rate: [2500],
        range: [3],
        bulletSpeed: [0.4],
        cost: 190,
        upgradeCost: [0],
        buy: 2600,
        tags: ['cannon']
    },
    {
        type: 'charge-cannon',
        damage: [200],
        rate: [4000],
        range: [4],
        bulletSpeed: [0.6],
        cost: 230,
        upgradeCost: [0],
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
        damage: [10],
        rate: [400],
        range: [4],
        bulletSpeed: [0.9],
        cost: 150,
        upgradeCost: [0],
        buy: 1200,
        tags: ['turret']
    },
    {
        type: 'rocket-turret',
        damage: [35],
        rate: [2000],
        range: [6],
        bulletSpeed: [0.7],
        cost: 180,
        upgradeCost: [0],
        buy: 2900,
        tags: ['turret']
    },
    {
        type: 'laser-turret',
        damage: [20],
        rate: [500],
        range: [5],
        bulletSpeed: [1],
        cost: 250,
        upgradeCost: [0],
        buy: 5400,
        tags: ['turret']
    },
    {
        type: 'ballista',
        damage: [30],
        rate: [1800],
        range: [6],
        bulletSpeed: [0.6],
        cost: 150,
        upgradeCost: [0],
        buy: 900,
        tags: ['ballista']
    },
    {
        type: 'fire-ballista',
        damage: [35],
        rate: [1600],
        range: [6],
        bulletSpeed: [0.5],
        cost: 170,
        upgradeCost: [0],
        buy: 1400,
        tags: ['ballista', 'fire']
    },
    {
        type: 'poison-ballista',
        damage: [30],
        rate: [1400],
        range: [5.5],
        bulletSpeed: [0.5],
        cost: 200,
        upgradeCost: [0],
        buy: 3300,
        tags: ['ballista', 'poison']
    }
];
exports.enemies = [
    {
        type: 'goblin',
        health: 100,
        speed: 0.1,
        coin: 10,
        tags: []
    },
    {
        type: 'orc',
        health: 200,
        speed: 0.05,
        coin: 20,
        tags: []
    },
    {
        type: 'ogre',
        health: 300,
        speed: 0.05,
        coin: 30,
        tags: []
    },
    {
        type: 'troll',
        health: 400,
        speed: 0.1,
        coin: 40,
        tags: []
    },
    {
        type: 'giant',
        health: 500,
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
//# sourceMappingURL=db.js.map