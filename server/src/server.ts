import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Game } from './logic/game';
import { units } from './db';

const PORT = 3002;

const app = express();

const httpServer = createServer(app); // Note: Non-null assertion (!) is used here for simplicity.

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Access-Control-Allow-Origin'],
    }
});

app.get('/', (request, res) => {
  res.sendFile('index.html', { root: __dirname.replace('dist', 'src') });
});

let rooms:IRoom[] = [];

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('getRooms', () => {
        socket.emit('getRooms', rooms);
    })

    socket.on('createRoom', (data:{name:string;maxUsers:number;private:boolean;user:IUser}) => {
        let room:IRoom = {
            name: data.name,
            users: [{username: data.user.username, id: data.user.id, socketId:socket.id, coin: 0, lvl: data.user.lvl, ready: false, selection:{x:-1, y:-1, type:''}}],
            maxUsers: data.maxUsers,
            private: data.private,
            status: 'waiting',
            ownerName: data.user.username,
            ownerID: socket.id,
            game: new Game()
        }
        rooms.push(room);
        socket.join(room.ownerID);
        socket.emit('roomCreated', room);
        socket.broadcast.emit('getRooms', rooms);
    })

    socket.on('joinRoom', (data:{ownerId:string;user:IUser}) => {
        let room = rooms.find(room => room.ownerID === data.ownerId);
        if(room){
            if(room.users.length < room.maxUsers){
                room.users.push({username: data.user.username, id: data.user.id, socketId:socket.id, coin: 0, lvl: data.user.lvl, ready: false, selection:{x:-1, y:-1, type:''}});
                socket.emit('roomJoined', room);
                io.to(room.ownerID).emit('userJoined', room.users);
                socket.join(room.ownerID);
                socket.broadcast.emit('getRooms', rooms);
            }
        }
    })

    socket.on('leaveRoom', (data:{ownerId:string;user:IUser}) => {
        let room = rooms.find(room => room.ownerID === data.ownerId);
        if(room){
            if(room.ownerID === socket.id){
                rooms = rooms.filter(room => room.ownerID !== socket.id);
                io.to(room.ownerID).emit('roomDeleted');
                io.to(room.ownerID).socketsLeave(room.ownerID);
                socket.broadcast.emit('getRooms', rooms);
            } else {
                room.users = room.users.filter(user => user.id !== data.user.id);
                io.to(room.ownerID).emit('userLeft', room.users);
                socket.leave(room.ownerID);
                socket.broadcast.emit('getRooms', rooms);
            }
            socket.emit('roomLeft');
        }
    });

    socket.on('startGame', (ownerId:string, lvl:number) => {
        let room = rooms.find(room => room.ownerID === ownerId);
        if(room){
            room.game.init(lvl);
            room.status = 'playing';
            io.to(room.ownerID).emit('gameStarted');
        }
        socket.broadcast.emit('getRooms', rooms);
    })

    socket.on('ready', (user:IUser) => {
        let room:IRoom = rooms.find(room => room.users.find(user => user.socketId === socket.id));
        if(room){
            let user = room.users.find(user => user.socketId === socket.id);
            if(user){
                user.ready = true;
                if(room.users.every(user => user.ready)){
                    io.to(room.ownerID).emit('gameInit', room.game.getInitData());
                    let avg = room.users.reduce((a, b) => a + b.lvl, 0) / room.users.length;
                    room.users.forEach(user => user.coin += 500);
                    io.to(room.ownerID).emit('usersUpdate', room.users);
                    room.game.start();
                    room.game.on('tick', (tickData:IGameTickData) => {
                        io.to(room.ownerID).emit('gameUpdate', tickData);
                    })
                    room.game.on('waveComplete', (wave:number) => {
                        room.users.forEach(user => user.coin += 100);
                        io.to(room.ownerID).emit('usersUpdate', room.users);
                        io.to(room.ownerID).emit('waveComplete', wave);
                    })
                    room.game.on('waveStarted', (wave:number) => {
                        io.to(room.ownerID).emit('waveStarted', wave);
                    })
                    room.game.on('gameOver', (level:number, wave:number) => {
                        io.to(room.ownerID).emit('gameOver', level, wave);
                        rooms = rooms.filter(r => r.ownerID !== room.ownerID);
                        socket.emit('getRooms', rooms);
                        socket.broadcast.emit('getRooms', rooms);
                    })
                    room.game.on('gameComplete', (level:number) => {
                        io.to(room.ownerID).emit('gameComplete', level);
                        rooms = rooms.filter(r => r.ownerID !== room.ownerID);
                        socket.emit('getRooms', rooms);
                        socket.broadcast.emit('getRooms', rooms);
                    })
                    room.game.on('enemyDead', (coin:number) => {
                        room.users.forEach(user => user.coin += coin);
                        io.to(room.ownerID).emit('usersUpdate', room.users);
                    })
                }
            }
        }
    })

    socket.on('userSelect', (data:IUserSelectionData) => {
        let room:IRoom = rooms.find(room => room.users.find(user => user.socketId === socket.id));
        if(!room) return;
        let user:IInRoomUser = room.users.find(user => user.socketId === socket.id);
        if(!user) return;
        user.selection = data;
        let selectors:IUserSelectionData[] = room.users.map(v => v.selection)
        let mySelectors:IUserSelectionData[] = room.users.filter(v => v.socketId != socket.id).map(v => v.selection)
        io.to(room.ownerID).emit('userSelection', selectors)
        socket.emit('userSelection', mySelectors)
    })

    socket.on('placeUnit', (data:{x:number, y:number, type:string}) => {
        let room:IRoom = rooms.find(room => room.users.find(user => user.socketId === socket.id));
        if(room){
            let user = room.users.find(user => user.socketId === socket.id);
            if(user){
                if(user.coin >= units.find(unit => unit.type === data.type).cost){
                    user.coin -= units.find(unit => unit.type === data.type).cost;
                    socket.emit('coinUpdate', user.coin);
                    let unit = room.game.placeUnit(data.x, data.y, data.type);
                    if(unit){
                        io.to(room.ownerID).emit('unitPlaced', unit);
                    }
                }
            }
        }
    })

    socket.on('upgradeUnit', (data:{x:number, y:number}) => {
        let room:IRoom = rooms.find(room => room.users.find(user => user.socketId === socket.id));
        if(room){
            let user = room.users.find(user => user.socketId === socket.id);
            if(user){
                const unit:IUnitData = room.game.findUnit(data.x, data.y)
                if(!unit) return;
                const unitData:IUnit = units.find(v => v.type == unit.type)
                if(unit){
                    const cost = unitData.upgradeCost[unit.lvl - 1];
                    if(user.coin < cost) return;
                    room.game.upgradeUnit(data.x, data.y)
                    user.coin -= cost;
                    socket.emit('coinUpdate', user.coin);
                    io.to(room.ownerID).emit('unitUpgraded', unit);
                }
            }
        }
    })

    socket.on('sellUnit', (data:{x:number, y:number}) => {
        let room:IRoom = rooms.find(room => room.users.find(user => user.socketId === socket.id));
        if(room){
            let user = room.users.find(user => user.socketId === socket.id);
            if(user){
                const unit:IUnitData = room.game.findUnit(data.x, data.y)
                if(!unit) return;
                const unitData:IUnit = units.find(v => v.type == unit.type)
                if(unit){
                    const allUpgCosts = unit.lvl == 1 ? 0 : unit.lvl == 2 ? unitData.upgradeCost[0] : unitData.upgradeCost.slice(0, unit.lvl-1).reduce((a, b) => a + b)
                    const sellCost = Math.round((unitData.cost + allUpgCosts)/2);
                    room.game.sellUnit(data.x, data.y)
                    user.coin += sellCost;
                    socket.emit('coinUpdate', user.coin);
                    io.to(room.ownerID).emit('unitSold', unit);
                }
            }
        }
    })

    socket.on('skipWave', () => {
        let room:IRoom = rooms.find(room => room.users.find(user => user.socketId === socket.id));
        if(room){
            room.game.skipWave();
        }
    })

    socket.on('gameCommand', (command:string) => {
        let room:IRoom = rooms.find(room => room.ownerID === socket.id);
        if(room){
            room.game.command(command);
        }
    })

    socket.on('disconnect', () => {
        console.log("a user disconnected");
        let room:IRoom = rooms.find(room => room.ownerID === socket.id);
        if(room){
            rooms = rooms.filter(room => room.ownerID !== socket.id);
            io.to(room.ownerID).emit('roomDeleted');
            socket.broadcast.emit('getRooms', rooms);
        }
        room = rooms.find(room => room.users.find(user => user.socketId === socket.id));
        if(room){
            room.users = room.users.filter(user => user.socketId !== socket.id);
            io.to(room.ownerID).emit('userLeft', room.users);
            socket.broadcast.emit('getRooms', rooms);
        }
    });

    socket.on('command', (command:any) => {
        let response = eval(command);
        socket.emit('command', JSON.stringify(response));
    })
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on *:${PORT}`);
});