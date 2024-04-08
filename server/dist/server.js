"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const game_1 = require("./logic/game");
const mongodb_1 = require("mongodb");
const PORT = 3002;
const uri = `mongodb+srv://realtime:EhcTmV54vQFH0AXq@cluster0.qo3ekyu.mongodb.net/`;
const commandList = {
    "help": "List all available commands",
    "echo (message)": "Echo string to server console",
    "list-onlines": "List all online users' socket IDs",
    "list-rooms": "List all rooms",
    "delete-room (roomID)": "Delete a room by ID",
    "ban (userID) (message?)": "Ban a user by user ID",
    "unban (userID)": "Unban a user by user ID",
    "get-user (userName)": "Get user ID by username",
    "get-room (roomName)": "Get room ID by room name",
    "emit-command (roomID) (command)": "Emit a command to a room",
    "kick-user (userID) (roomID)": "Kick a user from a room",
    "refresh": "Refresh DB data",
    "list-users": "List all users",
    "list-units": "List all units",
    "list-enemies": "List all enemies",
    "list-levels": "List all levels"
};
const client = new mongodb_1.MongoClient(uri);
client.connect().then(async () => {
    const db = client.db('lvlzero');
    console.log('DB connected');
    let users = await db.collection('users').find({}).toArray();
    let units = await db.collection('units').find({}).toArray();
    let enemies = await db.collection('enemies').find({}).toArray();
    let levels = await db.collection('levels').find({}).toArray();
    console.log('DB data loaded');
    const app = (0, express_1.default)();
    const httpServer = (0, http_1.createServer)(app); // Note: Non-null assertion (!) is used here for simplicity.
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            allowedHeaders: ['Access-Control-Allow-Origin'],
        }
    });
    app.get('/', (request, res) => {
        res.sendFile('index.html', { root: __dirname.replace('dist', 'src') });
    });
    let rooms = [];
    let onlines = {};
    io.on('connection', (socket) => {
        socket.on('login', (user) => {
            console.log('a user connected');
            onlines[socket.id] = user.id;
            socket.emit('login');
            socket.on('getRooms', () => {
                socket.emit('getRooms', rooms.filter(room => room.status === 'waiting' && room.private === false));
            });
            socket.on('createRoom', (data) => {
                let room = {
                    name: data.name,
                    users: [{ username: data.user.username, id: data.user.id, socketId: socket.id, coin: 0, lvl: data.user.lvl, ready: false, selection: { x: -1, y: -1, type: '', socketId: socket.id } }],
                    maxUsers: data.maxUsers,
                    private: data.private,
                    status: 'waiting',
                    ownerName: data.user.username,
                    ownerID: socket.id,
                    game: new game_1.Game()
                };
                rooms.push(room);
                socket.join(room.ownerID);
                socket.emit('roomCreated', room);
                socket.broadcast.emit('getRooms', rooms.filter(room => room.status === 'waiting' && room.private === false));
            });
            socket.on('joinRoom', (data) => {
                let room = rooms.find(room => room.ownerID === data.ownerId);
                if (room) {
                    if (room.users.length < room.maxUsers) {
                        room.users.push({ username: data.user.username, id: data.user.id, socketId: socket.id, coin: 0, lvl: data.user.lvl, ready: false, selection: { x: -1, y: -1, type: '', socketId: socket.id } });
                        socket.emit('roomJoined', room);
                        io.to(room.ownerID).emit('userJoined', room.users);
                        socket.join(room.ownerID);
                        socket.broadcast.emit('getRooms', rooms.filter(room => room.status === 'waiting' && room.private === false));
                    }
                }
            });
            socket.on('leaveRoom', (data) => {
                let room = rooms.find(room => room.ownerID === data.ownerId);
                if (room) {
                    if (room.ownerID === socket.id) {
                        rooms = rooms.filter(room => room.ownerID !== socket.id);
                        io.to(room.ownerID).emit('roomDeleted');
                        io.to(room.ownerID).socketsLeave(room.ownerID);
                        socket.broadcast.emit('getRooms', rooms.filter(room => room.status === 'waiting' && room.private === false));
                    }
                    else {
                        room.users = room.users.filter(user => user.id !== data.user.id);
                        io.to(room.ownerID).emit('userLeft', room.users);
                        socket.leave(room.ownerID);
                        socket.broadcast.emit('getRooms', rooms.filter(room => room.status === 'waiting' && room.private === false));
                    }
                    socket.emit('roomLeft');
                }
            });
            socket.on('levelRoom', (ownerId, lvl) => {
                let room = rooms.find(room => room.ownerID === ownerId);
                if (room) {
                    io.to(room.ownerID).emit('roomLeveled', lvl);
                }
            });
            socket.on('startGame', (ownerId, lvl) => {
                let room = rooms.find(room => room.ownerID === ownerId);
                if (room) {
                    room.game.init(levels, lvl);
                    room.status = 'playing';
                    io.to(room.ownerID).emit('gameStarted');
                }
                socket.broadcast.emit('getRooms', rooms.filter(room => room.status === 'waiting' && room.private === false));
                console.log(rooms);
            });
            socket.on('ready', (user) => {
                let room = rooms.find(room => room.users.find(user => user.socketId === socket.id));
                if (room) {
                    let user = room.users.find(user => user.socketId === socket.id);
                    if (user) {
                        user.ready = true;
                        if (room.users.every(user => user.ready)) {
                            io.to(room.ownerID).emit('gameInit', room.game.getInitData());
                            let avg = room.users.reduce((a, b) => a + b.lvl, 0) / room.users.length;
                            console.log('started');
                            room.users.forEach(user => user.coin += 500);
                            io.to(room.ownerID).emit('usersUpdate', room.users);
                            room.game.start(levels, enemies);
                            room.game.on('tick', (tickData) => {
                                io.to(room.ownerID).emit('gameUpdate', tickData);
                            });
                            room.game.on('waveComplete', (wave) => {
                                room.users.forEach(user => user.coin += 100);
                                io.to(room.ownerID).emit('usersUpdate', room.users);
                                io.to(room.ownerID).emit('waveComplete', wave);
                            });
                            room.game.on('waveStarted', (wave) => {
                                io.to(room.ownerID).emit('waveStarted', wave);
                            });
                            room.game.on('gameOver', (level, wave) => {
                                io.to(room.ownerID).emit('gameOver', level, wave);
                                rooms = rooms.filter(r => r.ownerID !== room.ownerID);
                                socket.emit('getRooms', rooms);
                                socket.broadcast.emit('getRooms', rooms);
                            });
                            room.game.on('gameComplete', (level) => {
                                io.to(room.ownerID).emit('gameComplete', level);
                                rooms = rooms.filter(r => r.ownerID !== room.ownerID);
                                socket.emit('getRooms', rooms);
                                socket.broadcast.emit('getRooms', rooms);
                            });
                            room.game.on('enemyDead', (coin) => {
                                room.users.forEach(user => user.coin += coin);
                                io.to(room.ownerID).emit('usersUpdate', room.users);
                            });
                            room.game.on('motion', (type, x, y, value) => {
                                io.to(room.ownerID).emit('motion', type, x, y, value);
                            });
                            room.game.on('coin', (coin) => {
                                room.users.forEach(user => user.coin += coin);
                                io.to(room.ownerID).emit('usersUpdate', room.users);
                            });
                        }
                    }
                }
            });
            socket.on('userSelect', (data) => {
                let room = rooms.find(room => room.users.find(user => user.socketId === socket.id));
                if (!room)
                    return;
                let user = room.users.find(user => user.socketId === socket.id);
                if (!user)
                    return;
                user.selection = data;
                let selectors = room.users.map(v => v.selection);
                let mySelectors = room.users.filter(v => v.socketId != socket.id).map(v => v.selection);
                io.to(room.ownerID).emit('userSelection', selectors);
                socket.emit('userSelection', mySelectors);
            });
            socket.on('placeUnit', (data) => {
                let room = rooms.find(room => room.users.find(user => user.socketId === socket.id));
                if (room) {
                    let user = room.users.find(user => user.socketId === socket.id);
                    if (user) {
                        if (user.coin >= units.find(unit => unit.type === data.type).cost) {
                            user.coin -= units.find(unit => unit.type === data.type).cost;
                            socket.emit('coinUpdate', user.coin);
                            let unit = room.game.placeUnit(units, data.x, data.y, data.type);
                            if (unit) {
                                io.to(room.ownerID).emit('unitPlaced', unit);
                            }
                        }
                    }
                }
            });
            socket.on('upgradeUnit', (data) => {
                let room = rooms.find(room => room.users.find(user => user.socketId === socket.id));
                if (room) {
                    let user = room.users.find(user => user.socketId === socket.id);
                    if (user) {
                        const unit = room.game.findUnit(data.x, data.y);
                        if (!unit)
                            return;
                        const unitData = units.find(v => v.type == unit.type);
                        if (unit) {
                            const cost = unitData.upgradeCost[unit.lvl - 1];
                            if (user.coin < cost)
                                return;
                            room.game.upgradeUnit(data.x, data.y);
                            user.coin -= cost;
                            socket.emit('coinUpdate', user.coin);
                            io.to(room.ownerID).emit('unitUpgraded', unit);
                        }
                    }
                }
            });
            socket.on('sellUnit', (data) => {
                let room = rooms.find(room => room.users.find(user => user.socketId === socket.id));
                if (room) {
                    let user = room.users.find(user => user.socketId === socket.id);
                    if (user) {
                        const unit = room.game.findUnit(data.x, data.y);
                        if (!unit)
                            return;
                        const unitData = units.find(v => v.type == unit.type);
                        if (unit) {
                            const allUpgCosts = unit.lvl == 1 ? 0 : unit.lvl == 2 ? unitData.upgradeCost[0] : unitData.upgradeCost.slice(0, unit.lvl - 1).reduce((a, b) => a + b);
                            const sellCost = Math.round((unitData.cost + allUpgCosts) / 2);
                            room.game.sellUnit(data.x, data.y);
                            user.coin += sellCost;
                            socket.emit('coinUpdate', user.coin);
                            io.to(room.ownerID).emit('unitSold', unit);
                        }
                    }
                }
            });
            socket.on('skipWave', () => {
                let room = rooms.find(room => room.users.find(user => user.socketId === socket.id));
                if (room) {
                    room.game.skipWave();
                }
            });
            socket.on('gameCommand', (command) => {
                let room = rooms.find(room => room.ownerID === socket.id);
                if (room) {
                    room.game.command(units, levels, command);
                }
            });
        });
        socket.on('disconnect', () => {
            console.log("a user disconnected");
            let room = rooms.find(room => room.ownerID === socket.id);
            if (room) {
                rooms = rooms.filter(room => room.ownerID !== socket.id);
                io.to(room.ownerID).emit('roomDeleted');
                socket.broadcast.emit('getRooms', rooms.filter(room => room.status === 'waiting' && room.private === false));
            }
            room = rooms.find(room => room.users.find(user => user.socketId === socket.id));
            if (room) {
                room.users = room.users.filter(user => user.socketId !== socket.id);
                io.to(room.ownerID).emit('userLeft', room.users);
                socket.broadcast.emit('getRooms', rooms.filter(room => room.status === 'waiting' && room.private === false));
            }
        });
        socket.on('command', async (command) => {
            const params = command.split(' ');
            switch (params[0]) {
                case 'help': {
                    socket.emit('command', Object.keys(commandList).map(key => `${key}: ${commandList[key]}`).join('/n;'));
                    break;
                }
                case 'echo': {
                    console.log(params.slice(1).join(' '));
                    socket.emit('command', params.slice(1).join(' '));
                    break;
                }
                case 'list-onlines': {
                    socket.emit('command', Object.keys(onlines).map(key => `[${key}] ${onlines[key]}`).join('/n;'));
                    break;
                }
                case 'list-rooms': {
                    socket.emit('command', rooms.map(room => `[${room.ownerID}] ${room.name}`).join('/n;'));
                    break;
                }
                case 'delete-room': {
                    let room = rooms.find(room => room.ownerID === params[1]);
                    if (room) {
                        rooms = rooms.filter(room => room.ownerID !== params[1]);
                        io.to(room.ownerID).emit('roomDeleted');
                        socket.broadcast.emit('getRooms', rooms.filter(room => room.status === 'waiting' && room.private === false));
                    }
                    else {
                        socket.emit('command', 'Room not found');
                    }
                    break;
                }
                case 'ban': {
                    let socketId = Object.keys(onlines).find(key => onlines[key] === params[1]);
                    if (socketId)
                        socket.to(socketId).emit('ban', params[2] || 'You are banned');
                    let res = db.collection('users').updateOne({ id: params[1] }, { $set: { banned: true } });
                    if ((await res).modifiedCount > 0) {
                        socket.emit('command', `User banned : ${params[1]}`);
                    }
                    else {
                        socket.emit('command', 'User not found');
                    }
                    break;
                }
                case 'unban': {
                    let res = db.collection('users').updateOne({ id: params[1] }, { $set: { banned: false } });
                    if ((await res).modifiedCount > 0) {
                        socket.emit('command', `User unbanned : ${params[1]}`);
                    }
                    else {
                        socket.emit('command', 'User not found');
                    }
                    break;
                }
                case 'get-user': {
                    let user = users.find(user => user.username === params[1]);
                    if (user) {
                        socket.emit('command', user.id);
                    }
                    else {
                        socket.emit('command', 'User not found');
                    }
                    break;
                }
                case 'get-room': {
                    let room = rooms.find(room => room.name === params[1]);
                    if (room) {
                        socket.emit('command', room.ownerID);
                    }
                    else {
                        socket.emit('command', 'Room not found');
                    }
                    break;
                }
                case 'emit-command': {
                    let room = rooms.find(room => room.ownerID === params[1]);
                    if (room) {
                        room.game.command(units, levels, params.slice(2).join(' '));
                        socket.emit('command', `Command emitted : ${params.slice(2).join(' ')}`);
                    }
                    else {
                        socket.emit('command', 'Room not found');
                    }
                    break;
                }
                case 'kick-user': {
                    let room = rooms.find(room => room.ownerID === params[2]);
                    if (room) {
                        room.users = room.users.filter(user => user.id !== params[1]);
                        io.to(room.ownerID).emit('userLeft', room.users);
                    }
                    else {
                        socket.emit('command', 'Room not found');
                    }
                    break;
                }
                case 'refresh': {
                    users = await db.collection('users').find({}).toArray();
                    units = await db.collection('units').find({}).toArray();
                    enemies = await db.collection('enemies').find({}).toArray();
                    levels = await db.collection('levels').find({}).toArray();
                    socket.emit('command', 'DB data refreshed');
                    break;
                }
                case 'list-users': {
                    socket.emit('command', users.map(user => `[${user.id}] ${user.username}`).join('/n;'));
                    break;
                }
                case 'list-units': {
                    socket.emit('command', units.map(unit => `${unit.type} - ${unit.cost}`).join('/n;'));
                    break;
                }
                case 'list-enemies': {
                    socket.emit('command', enemies.map(enemy => `${enemy.type} - ${enemy.health}`).join('/n;'));
                    break;
                }
                case 'list-levels': {
                    socket.emit('command', levels.map(level => `[Lv.${level.level}] ${level.enemyRegexes.length} Waves`).join('/n;'));
                    break;
                }
                default: {
                    socket.emit('command', 'Command not found');
                    break;
                }
            }
        });
    });
    httpServer.listen(PORT, () => {
        console.log(`Server listening on *:${PORT}`);
    });
});
//# sourceMappingURL=server.js.map