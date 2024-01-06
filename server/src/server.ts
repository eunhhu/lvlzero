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
        allowedHeaders: ['my-custom-header']
    }
});

app.get('/', (request, res) => {
  res.send("Hello, world!");
});

let rooms:Room[] = [];

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('createRoom', (data:{name:string;maxUsers:number;private:boolean;user:User}) => {
        let room:Room = {
            name: data.name,
            users: [{username: data.user.username, id: data.user.id, socketId:socket.id, coin: 0}],
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
                room.users.push({username: data.user.username, id: data.user.id, socketId:socket.id, coin: 0});
                socket.join(room.ownerID);
                io.to(room.ownerID).emit('userJoined', room.users);
                socket.broadcast.emit('getRooms', rooms);
            }
        }
    })

    socket.on('leaveRoom', (data:{ownerId:string;user:User}) => {
        let room = rooms.find(room => room.ownerID === data.ownerId);
        if(room){
            room.users = room.users.filter(user => user.id !== data.user.id);
            io.to(room.ownerID).emit('userLeft', room.users);
            socket.leave(room.ownerID);
            socket.broadcast.emit('getRooms', rooms);
        }
    });

    socket.on('disconnect', () => {
        console.log("a user disconnected");
        let room = rooms.find(room => room.ownerID === socket.id);
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