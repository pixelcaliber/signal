const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

io.on("connection", (socket) => {
    console.log("A user connected");

    // Relay messages between peers
    socket.on("message", (message) => {
        socket.broadcast.emit("message", message);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});
server.listen(3000, '0.0.0.0', () => {
    console.log("Server is running on http://localhost:3000");
});
