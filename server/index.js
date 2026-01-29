const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for prototype
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Large limit for images

const DATA_DIR = path.join(__dirname, 'data');

// Socket.io for future collaboration
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Save Whiteboard
app.post('/api/whiteboard', (req, res) => {
  const { name, strokes, images } = req.body;
  if (!strokes && !images) {
    return res.status(400).send('No data');
  }

  const filename = `${name || Date.now()}.json`;
  const filePath = path.join(DATA_DIR, filename);

  fs.writeFile(filePath, JSON.stringify({ strokes, images }), (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error saving file');
    }
    console.log('Saved whiteboard:', filename);
    res.json({ success: true, filename });
  });
});

// Load Whiteboard (List)
app.get('/api/whiteboard', (req, res) => {
  fs.readdir(DATA_DIR, (err, files) => {
    if (err) return res.status(500).send('Error reading directory');
    res.json(files.filter(f => f.endsWith('.json')));
  });
});

// Load Whiteboard (Detail)
app.get('/api/whiteboard/:filename', (req, res) => {
    const filePath = path.join(DATA_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).send('Not found');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading file');
        res.json(JSON.parse(data));
    });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
