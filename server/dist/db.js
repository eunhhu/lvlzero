"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enemies = exports.units = void 0;
exports.units = [
    {
        type: 'stone-catapult',
        damage: 20,
        rate: 1500,
        range: 5,
        cost: 100,
        buy: 900
    },
    {
        type: 'ice-catapult',
        damage: 15,
        rate: 1200,
        range: 5.5,
        cost: 120,
        buy: 900
    },
    {
        type: 'mini-cannon',
        damage: 50,
        rate: 2000,
        range: 3.5,
        cost: 130,
        buy: 900
    },
    {
        type: 'heavy-cannon',
        damage: 80,
        rate: 2000,
        range: 3,
        cost: 150,
        buy: 1900
    },
    {
        type: 'bomb-cannon',
        damage: 100,
        rate: 2500,
        range: 3,
        cost: 190,
        buy: 2600
    },
    {
        type: 'charge-cannon',
        damage: 200,
        rate: 4000,
        range: 4,
        cost: 230,
        buy: 4900
    },
    {
        type: 'auto-turret',
        damage: 15,
        rate: 800,
        range: 3,
        cost: 100,
        buy: 900
    },
    {
        type: 'machinegun-turret',
        damage: 10,
        rate: 400,
        range: 4,
        cost: 150,
        buy: 1200
    },
    {
        type: 'rocket-turret',
        damage: 35,
        rate: 2000,
        range: 6,
        cost: 180,
        buy: 2900
    },
    {
        type: 'laser-turret',
        damage: 20,
        rate: 500,
        range: 5,
        cost: 250,
        buy: 5400
    },
    {
        type: 'ballista',
        damage: 30,
        rate: 1800,
        range: 6,
        cost: 150,
        buy: 900
    },
    {
        type: 'fire-ballista',
        damage: 35,
        rate: 1600,
        range: 6,
        cost: 170,
        buy: 1400
    },
    {
        type: 'poison-ballista',
        damage: 30,
        rate: 1400,
        range: 5.5,
        cost: 200,
        buy: 3300
    }
];
exports.enemies = [
    {
        type: 'goblin',
        health: 100,
        speed: 0.1,
        coin: 10
    },
    {
        type: 'orc',
        health: 200,
        speed: 0.05,
        coin: 20
    },
    {
        type: 'ogre',
        health: 300,
        speed: 0.05,
        coin: 30
    },
    {
        type: 'troll',
        health: 400,
        speed: 0.1,
        coin: 40
    },
    {
        type: 'giant',
        health: 500,
        speed: 0.05,
        coin: 50
    },
    {
        type: 'dragon',
        health: 1000,
        speed: 0.04,
        coin: 100
    },
    {
        type: 'demon',
        health: 2000,
        speed: 0.02,
        coin: 200
    },
    {
        type: 'god',
        health: 5000,
        speed: 0.01,
        coin: 500
    }
];
//# sourceMappingURL=db.js.map