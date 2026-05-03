const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));
app.use(express.json());

let ambulances = [];

app.get('/api/ambulances', (req, res) => {
    res.json(ambulances);
});

app.post('/api/emergency', (req, res) => {

    const newAmb = {
        id: 'AMB' + Date.now(),
        status: 'enroute',
        eta: '10 min',
        destination: 'Nearest Hospital',
        route: 'AI Optimized'
    };

    ambulances.push(newAmb);

    io.emit('newEmergency', newAmb);

    res.json({ success: true });
});

io.on('connection', (socket) => {
    console.log("Client connected");
});

server.listen(3000, () => {
    console.log("🚀 http://localhost:3000");
});