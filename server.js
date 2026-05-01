const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data
let ambulances = [{
    id: 'AMB001',
    lat: 40.7128,
    lng: -74.0060,
    status: 'enroute',
    eta: '12 min',
    destination: 'Mount Sinai Hospital',
    route: 'AI Optimized Route'
}];

let trafficSignals = [
    { id: 'TS001', status: 'red', location: 'Broadway & 42nd' },
    { id: 'TS002', status: 'green', location: '5th Ave & 34th' },
    { id: 'TS003', status: 'yellow', location: 'Park Ave & 28th' }
];

// Socket.IO
io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);
    
    // Send initial data
    socket.emit('initData', { ambulances: [ambulances[0]], trafficSignals });
    
    // Simulate real-time updates
    setInterval(() => {
        if (ambulances[0]) {
            ambulances[0].lat += (Math.random() - 0.5) * 0.0005;
            ambulances[0].lng += (Math.random() - 0.5) * 0.0005;
            socket.emit('ambulanceUpdate', ambulances[0]);
        }
    }, 2000);
});

// API Routes
app.get('/api/ambulances', (req, res) => res.json(ambulances));
app.get('/api/traffic', (req, res) => res.json(trafficSignals));

app.post('/api/emergency', (req, res) => {
    console.log('🚨 New emergency triggered!');
    const newAmbulance = {
        id: 'AMB' + Date.now().toString().slice(-4),
        lat: 40.75 + Math.random() * 0.02,
        lng: -74.0 + Math.random() * 0.02,
        status: 'enroute',
        eta: (Math.floor(Math.random() * 15) + 8) + ' min',
        destination: ['Mount Sinai', 'NYU Langone', 'Bellevue'][Math.floor(Math.random()*3)],
        route: 'AI Route Optimized'
    };
    ambulances.push(newAmbulance);
    io.emit('newEmergency', newAmbulance);
    res.json({ success: true, ambulance: newAmbulance });
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 LifeLine AI running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${path.join(__dirname, 'public')}`);
});