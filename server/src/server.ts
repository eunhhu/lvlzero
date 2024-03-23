import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Game } from './logic';

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
  res.send("Hello, world!");
});

let rooms:Room[] = [];

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('getRooms', () => {
        socket.emit('getRooms', rooms);
    })

    socket.on('createRoom', (data:{name:string;maxUsers:number;private:boolean;user:User}) => {
        let room:Room = {
            name: data.name,
            users: [{username: data.user.username, id: data.user.id, socketId:socket.id, coin: 0, lvl: data.user.lvl, ready: false}],
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

    socket.on('joinRoom', (data:{ownerId:string;user:User}) => {
        let room = rooms.find(room => room.ownerID === data.ownerId);
        if(room){
            if(room.users.length < room.maxUsers){
                room.users.push({username: data.user.username, id: data.user.id, socketId:socket.id, coin: 0, lvl: data.user.lvl, ready: false});
                socket.emit('roomJoined', room);
                io.to(room.ownerID).emit('userJoined', room.users);
                socket.join(room.ownerID);
                socket.broadcast.emit('getRooms', rooms);
            }
        }
    })

    socket.on('leaveRoom', (data:{ownerId:string;user:User}) => {
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

    socket.on('startGame', (ownerId:string) => {
        let room = rooms.find(room => room.ownerID === ownerId);
        if(room){
            room.status = 'playing';
            io.to(room.ownerID).emit('gameStarted');
        }
        socket.broadcast.emit('getRooms', rooms);
    })

    socket.on('ready', (user:User) => {
        let room:Room = rooms.find(room => room.users.find(user => user.socketId === socket.id));
        if(room){
            let user = room.users.find(user => user.socketId === socket.id);
            console.log(user, socket.id, room.users);
            if(user){
                user.ready = true;
                if(room.users.every(user => user.ready)){
                    io.to(room.ownerID).emit('gameInit', room.game.getInitData());
                    room.game.run();
                    room.game.on('tick', (tickData:GameTickData) => {
                        io.to(room.ownerID).emit('gameUpdate', tickData);
                    })
                    room.game.on('gameOver', () => {
                        io.to(room.ownerID).emit('gameOver');
                    })
                }
            }
        }
    })

    socket.on('disconnect', () => {
        console.log("a user disconnected");
        let room:Room = rooms.find(room => room.ownerID === socket.id);
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
});

httpServer.listen(80, () => {
    console.log(`Server listening on *:80`);
});