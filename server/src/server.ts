import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Game } from './logic/game';
import { MongoClient, WithId } from 'mongodb';

const PORT = 3002;
const uri = `mongodb+srv://realtime:EhcTmV54vQFH0AXq@cluster0.qo3ekyu.mongodb.net/`;

const commandList:{[key:string]:string} = {
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
    "list-levels": "List all levels",
    "list-modules": "List all modules",
    "list-clans": "List all clans",
    "disconnect (socketID)": "Disconnect a user by socket ID"
}

const client = new MongoClient(uri);

client.connect().then(async () => {
    const db = client.db('lvlzero');
    console.log('DB connected');
    let users:IUser[] = await db.collection('users').find({}).toArray() as any;
    let units:IUnit[] = await db.collection('units').find({}).toArray() as any;
    let enemies:IEnemy[] = await db.collection('enemies').find({}).toArray() as any;
    let levels:ILevel[] = await db.collection('levels').find({}).toArray() as any;
    let modules:IModule[] = await db.collection('modules').find({}).toArray() as any;
    let clans:IClan[] = await db.collection('clans').find({}).toArray() as any;

    console.log('DB data loaded');
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
    let onlines:{[key:string]:string} = {};
    
    io.on('connection', (socket:Socket) => {
        socket.on('login', (user:IUser) => {
            console.log('a user connected');
            onlines[socket.id] = user.id;
            socket.emit('login');

            socket.on('getRooms', () => {
                socket.emit('getRooms', rooms.filter(room => room.status === 'waiting'));
            })
        
            socket.on('createRoom', (data:{name:string;maxUsers:number;private:boolean;user:IUser;password:string}) => {
                let room:IRoom = {
                    name: data.name,
                    users: [{username: data.user.username, id: data.user.id, socketId:socket.id, lvl: data.user.lvl, ready: false}],
                    maxUsers: data.maxUsers,
                    private: data.private,
                    password: data.password,
                    chats: [],
                    status: 'waiting',
                    ownerName: data.user.username,
                    ownerID: socket.id,
                    game: new Game()
                }
                rooms.push(room);
                socket.join(room.ownerID);
                socket.emit('roomCreated', room);
                socket.broadcast.emit('getRooms', rooms.filter(room => room.status === 'waiting'));
            })
        
            socket.on('joinRoom', (data:{ownerId:string;user:IUser}) => {
                let room = rooms.find(room => room.ownerID === data.ownerId);
                if(room){
                    if(room.users.length < room.maxUsers){
                        room.users.push({username: data.user.username, id: data.user.id, socketId:socket.id, lvl: data.user.lvl, ready: false});
                        socket.emit('roomJoined', room);
                        io.to(room.ownerID).emit('userJoined', room.users);
                        socket.join(room.ownerID);
                        socket.broadcast.emit('getRooms', rooms.filter(room => room.status === 'waiting'));
                    }
                }
            })

            socket.on('getLevel', () => {
                let room = rooms.find(room => room.users.find(user => user.socketId === socket.id));
                if(room){
                    socket.emit('getLevel', room.game.level);
                }
            })
        
            socket.on('leaveRoom', (data:{ownerId:string;user:IUser}) => {
                let room = rooms.find(room => room.ownerID === data.ownerId);
                if(room){
                    if(room.ownerID === socket.id){
                        rooms = rooms.filter(room => room.ownerID !== socket.id);
                        io.to(room.ownerID).emit('roomDeleted');
                        io.to(room.ownerID).socketsLeave(room.ownerID);
                        socket.broadcast.emit('getRooms', rooms.filter(room => room.status === 'waiting'));
                    } else {
                        room.users = room.users.filter(user => user.id !== data.user.id);
                        io.to(room.ownerID).emit('userLeft', room.users);
                        socket.leave(room.ownerID);
                        socket.broadcast.emit('getRooms', rooms.filter(room => room.status === 'waiting'));
                    }
                    socket.emit('roomLeft');
                }
            });
        
            socket.on('levelRoom', (ownerId:string, lvl:number) => {
                let room = rooms.find(room => room.ownerID === ownerId);
                if(room){
                    room.game.level = lvl;
                    io.to(room.ownerID).emit('roomLeveled', lvl);
                }
            })
        
            socket.on('startGame', (ownerId:string, lvl:number) => {
                let room = rooms.find(room => room.ownerID === ownerId);
                if(room){
                    room.game.init(levels, lvl);
                    room.status = 'playing';
                    io.to(room.ownerID).emit('gameStarted');
                }
                socket.broadcast.emit('getRooms', rooms.filter(room => room.status === 'waiting'));
            })

            socket.on('ready', (user:IUser) => {
                let room:IRoom = rooms.find(room => room.users.find(user => user.socketId === socket.id));
                if(room){
                    let user = room.users.find(user => user.socketId === socket.id);
                    if(user){
                        user.ready = true;
                        if(room.users.every(user => user.ready)){
                            io.to(room.ownerID)
                            let avg = room.users.reduce((a, b) => a + b.lvl, 0) / room.users.length;
                            room.game.on('gameInit', (data:IGameInitData) => { io.to(room.ownerID).emit('gameInit', data); })
                            room.game.on('gameOver', (level:number, wave:number) => {
                                rooms = rooms.filter(r => r.ownerID !== room.ownerID);
                                socket.emit('getRooms', rooms);
                                socket.broadcast.emit('getRooms', rooms);
                                io.to(room.ownerID).emit('gameOver', level, wave);
                            })
                            room.game.on('gameComplete', (level:number) => {
                                rooms = rooms.filter(r => r.ownerID !== room.ownerID);
                                socket.emit('getRooms', rooms);
                                socket.broadcast.emit('getRooms', rooms);
                                io.to(room.ownerID).emit('gameComplete', level);
                            })
                            room.game.on('userSelection', (data:IUserSelectionData[]) => { io.to(room.ownerID).emit('userSelection', data); })
                            room.game.on('usersUpdate', (data:InGameUser[]) => { io.to(room.ownerID).emit('usersUpdate', data); })
                            room.game.on('motion', (type:string, x:number, y:number, value?:string) => { io.to(room.ownerID).emit('motion', type, x, y, value); })
                            room.game.on('tick', (data:IGameTickData) => { io.to(room.ownerID).emit('gameUpdate', data); })
                            room.game.on('waveComplete', (wave:number) => { io.to(room.ownerID).emit('waveComplete', wave); })
                            room.game.on('waveStarted', (wave:number) => { io.to(room.ownerID).emit('waveStarted', wave); })
                            room.game.on('healthUpgraded', (lvl:number, max:number) => { io.to(room.ownerID).emit('healthUpgraded', lvl, max); })
                            room.game.on('healthRegenUpgraded', (lvl:number) => { io.to(room.ownerID).emit('healthRegenUpgraded', lvl); })

                            room.game.start(levels, enemies, room.users);
                        }
                    }
                }
            })

            socket.on('userSelect', (data:IUserSelectionData) => {
                let room:IRoom = rooms.find(room => room.users.find(user => user.socketId === socket.id));
                if(room) room.game.emit('userSelect', socket.id, data);
            })
        
            socket.on('placeUnit', (data:{x:number, y:number, type:string, modules:IModule[]}) => {
                let room:IRoom = rooms.find(room => room.users.find(user => user.socketId === socket.id));
                if(room) room.game.emit('placeUnit', socket.id, data, units);
            })
        
            socket.on('upgradeUnit', (data:{x:number, y:number}) => {
                let room:IRoom = rooms.find(room => room.users.find(user => user.socketId === socket.id));
                if(room) room.game.emit('upgradeUnit', socket.id, data, units);
            })

            socket.on('sellUnit', (data:{x:number, y:number}) => {
                let room:IRoom = rooms.find(room => room.users.find(user => user.socketId === socket.id));
                if(room) room.game.emit('sellUnit', socket.id, data, units);
            })

            socket.on('upgradeHealth', () => {
                let room:IRoom = rooms.find(room => room.users.find(user => user.socketId === socket.id));
                if(room) room.game.emit('upgradeHealth', socket.id);
            })

            socket.on('upgradeHealthRegen', () => {
                let room:IRoom = rooms.find(room => room.users.find(user => user.socketId === socket.id));
                if(room) room.game.emit('upgradeHealthRegen', socket.id);
            })

            socket.on('chat', (data:{name:string;message:string}) => {
                let room:IRoom = rooms.find(room => room.users.find(user => user.socketId === socket.id));
                if(room){
                    const chat:IChat = {socketId:socket.id, username: data.name, message: data.message}
                    room.chats.push(chat);
                    io.to(room.ownerID).emit('chat', chat);
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
                    room.game.command(units, levels, command);
                }
            })

            socket.on('leaveClan', (data:{id:string; uid:string}) => {
                socket.broadcast.emit('leaveClan', data);
            })

            socket.on('acceptMember', (data:{id:string; uid:string}) => {
                socket.broadcast.emit('acceptMember', data);
            })

            socket.on('rejectMember', (data:{id:string; uid:string}) => {
                socket.broadcast.emit('rejectMember', data);
            })

            socket.on('clanApply', (data:{id:string; uid:string}) => {
                socket.broadcast.emit('clanApply', data);
            })

            socket.on('kickMember', (data:{id:string; uid:string}) => {
                socket.broadcast.emit('kickMember', data);
            })

            socket.on('promoteMember', (data:{id:string; uid:string}) => {
                socket.broadcast.emit('promoteMember', data);
            })
            
            socket.on('demoteMember', (data:{id:string; uid:string}) => {
                socket.broadcast.emit('demoteMember', data);
            })
        })

        socket.on('disconnect', () => {
            console.log("a user disconnected");
            let room:IRoom = rooms.find(room => room.ownerID === socket.id);
            if(room){
                rooms = rooms.filter(room => room.ownerID !== socket.id);
                io.to(room.ownerID).emit('roomDeleted');
                socket.broadcast.emit('getRooms', rooms.filter(room => room.status === 'waiting'));
            }
            room = rooms.find(room => room.users.find(user => user.socketId === socket.id));
            if(room){
                room.users = room.users.filter(user => user.socketId !== socket.id);
                io.to(room.ownerID).emit('userLeft', room.users);
                socket.broadcast.emit('getRooms', rooms.filter(room => room.status === 'waiting'));
            }
        });
    
        socket.on('command', async (command:any) => {
            const params = command.split(' ');
            switch(params[0]){
                case 'help':{
                    socket.emit('command', Object.keys(commandList).map(key => `${key}: ${commandList[key]}`).join('/n;'));
                    break;
                }
                case 'echo' :{
                    console.log(params.slice(1).join(' '));
                    socket.emit('command', params.slice(1).join(' '));
                    break;
                }
                case 'lo':
                case 'list-onlines':{
                    socket.emit('command', Object.keys(onlines).map(key => `[${key}] ${onlines[key]}`).join('/n;'));
                    break;
                }
                case 'lr':
                case 'list-rooms':{
                    socket.emit('command', rooms.map(room => `[${room.ownerID}] ${room.name}`).join('/n;'));
                    break;
                }
                case 'dr':
                case 'delete-room':{
                    let room = rooms.find(room => room.ownerID === params[1]);
                    if(room){
                        rooms = rooms.filter(room => room.ownerID !== params[1]);
                        io.to(room.ownerID).emit('roomDeleted');
                        socket.broadcast.emit('getRooms', rooms.filter(room => room.status === 'waiting'));
                    } else {
                        socket.emit('command', 'Room not found');
                    }
                    break;
                }
                case 'ban':{
                    let socketId = Object.keys(onlines).find(key => onlines[key] === params[1]);
                    if(socketId) socket.to(socketId).emit('ban', params[2] || 'You are banned');
                    let res = db.collection('users').updateOne({id: params[1]}, {$set: {banned: true}});
                    if((await res).modifiedCount > 0) {
                        socket.emit('command', `User banned : ${params[1]}`);
                    } else {
                        socket.emit('command', 'User not found');
                    }
                    break;
                }
                case 'unban':{
                    let res = db.collection('users').updateOne({id: params[1]}, {$set: {banned: false}});
                    if((await res).modifiedCount > 0){
                        socket.emit('command', `User unbanned : ${params[1]}`);
                    } else {
                        socket.emit('command', 'User not found');
                    }
                    break;
                }
                case 'gu':
                case 'get-user':{
                    let user = users.find(user => user.username === params[1]);
                    if(user){
                        socket.emit('command', user.id);
                    }else{
                        socket.emit('command', 'User not found');
                    }
                    break;
                }
                case 'gr':
                case 'get-room':{
                    let room = rooms.find(room => room.name === params[1]);
                    if(room){
                        socket.emit('command', room.ownerID);
                    }else{
                        socket.emit('command', 'Room not found');
                    }
                    break;
                }
                case 'ec':
                case 'emit-command':{
                    let room = rooms.find(room => room.ownerID === params[1]);
                    if(room){
                        room.game.command(units, levels, params.slice(2).join(' '));
                        socket.emit('command', `Command emitted : ${params.slice(2).join(' ')}`);
                    } else {
                        socket.emit('command', 'Room not found');
                    }
                    break;
                }
                case 'ku':
                case 'kick-user':{
                    let room = rooms.find(room => room.ownerID === params[2]);
                    if(room){
                        room.users = room.users.filter(user => user.id !== params[1]);
                        io.to(room.ownerID).emit('userLeft', room.users);
                    } else {
                        socket.emit('command', 'Room not found');
                    }
                    break;
                }
                case 'ref':
                case 'refresh': {
                    users = await db.collection('users').find({}).toArray() as any;
                    units = await db.collection('units').find({}).toArray() as any;
                    enemies = await db.collection('enemies').find({}).toArray() as any;
                    levels = await db.collection('levels').find({}).toArray() as any;
                    modules = await db.collection('modules').find({}).toArray() as any;
                    clans = await db.collection('clans').find({}).toArray() as any;
                    socket.emit('command', 'DB data refreshed');
                    break;
                }
                case 'lus':
                case 'list-users':{
                    socket.emit('command', users.map(user => `[${user.id}] ${user.username}`).join('/n;'));
                    break;
                }
                case 'lun':
                case 'list-units':{
                    socket.emit('command', units.map(unit => `${unit.type} - ${unit.cost}`).join('/n;'));
                    break;
                }
                case 'le':
                case 'list-enemies':{
                    socket.emit('command', enemies.map(enemy => `${enemy.type} - ${enemy.health}`).join('/n;'));
                    break;
                }
                case 'll':
                case 'list-levels':{
                    socket.emit('command', levels.map(level => `[Lv.${level.level}] ${level.enemyRegexes.length} Waves`).join('/n;'));
                    break;
                }
                case 'lm':
                case 'list-modules':{
                    socket.emit('command', modules.map(mod => `[${mod.quality}] ${mod.type}`).join('/n;'));
                    break;
                }
                case 'lc':
                case 'list-clans':{
                    socket.emit('command', clans.map(clan => `[Lv.${clan.level}] ${clan.name}`).join('/n;'));
                    break;
                }
                case 'dsc':
                case 'disconnect':{
                    let socketId = Object.keys(onlines).find(key => key === params[1]);
                    if(socketId){
                        io.to(socketId).emit('disconnect');  
                        socket.emit('command', 'User disconnected');
                    } else {
                        socket.emit('command', 'User not found');
                    }
                    break;
                }
                default:{
                    socket.emit('command', 'Command not found');
                    break;
                }
            }
        })
    });

    httpServer.listen(PORT, () => {
        console.log(`Server listening on *:${PORT}`);
    });
})
