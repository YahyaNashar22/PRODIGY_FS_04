import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

// manually create a server
const server = http.createServer(app);

// create a socket server
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"],
    },
});

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
}

const userSocketMap = {}; // { userId: socketId }

// listen for connections
io.on("connection", socket => {
    console.log("a user connected", socket.id);

    const userId = socket.handshake.query.userId;

    // store users in memory ( by using an object in this case )
    if (userId) userSocketMap[userId] = socket.id;

    // sends events to all the connected clients
    // ( name of the event, payload to be sent)
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // listen to the disconnect event and run the callback fct
    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, io, server };