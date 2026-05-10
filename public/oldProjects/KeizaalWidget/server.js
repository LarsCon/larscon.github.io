const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const distPath = path.join(__dirname, 'client/dist');
const hasDist = fs.existsSync(distPath);
const isProd = process.env.NODE_ENV === 'production' || hasDist;

// Serve static files from client/dist if built, or in production.
if (isProd) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // For development, serve the client from Vite
  app.get('/', (req, res) => {
    res.send('Keizaal Widget Server Running. Client should be run separately with npm run client');
  });
}

let circles = [];
let mousePositions = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send current state to new user
  socket.emit('init', { circles, mousePositions });

  // Handle mouse movement
  socket.on('mouseMove', (data) => {
    mousePositions[socket.id] = { ...data, id: socket.id };
    socket.broadcast.emit('mouseUpdate', mousePositions[socket.id]);
  });

  // Handle circle placement
  socket.on('placeCircle', (circle) => {
    circle.id = Date.now() + Math.random(); // unique id
    circle.userId = socket.id;
    circles.push(circle);
    io.emit('circlePlaced', circle);
  });

  // Handle circle update
  socket.on('updateCircle', (updatedCircle) => {
    const index = circles.findIndex(c => c.id === updatedCircle.id);
    if (index !== -1) {
      circles[index] = { ...circles[index], ...updatedCircle };
      io.emit('circleUpdated', circles[index]);
    }
  });

  // Handle circle delete
  socket.on('deleteCircle', (circleId) => {
    const index = circles.findIndex(c => c.id === circleId && c.userId === socket.id);
    if (index !== -1) {
      circles.splice(index, 1);
      io.emit('circleDeleted', circleId);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete mousePositions[socket.id];
    io.emit('userDisconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});