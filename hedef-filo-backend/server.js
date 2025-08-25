require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const lookups = require('./routes/lookups');
const cases = require('./routes/cases');
const notifications = require('./routes/notifications');
const surveys = require('./routes/surveys');
const app = express();
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kullanici:1234@cluster0.fgrbsuz.mongodb.net/hedef-filo?retryWrites=true&w=majority&appName=Cluster0';
console.log('MongoDB bağlantısı deneniyor:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('MongoDB Atlas bağlantısı başarılı!');
})
.catch(err => {
  console.error('MongoDB bağlantı hatası:', err.message);
  process.exit(1);
});
app.get('/', (_req, res) => res.json({ ok: true }));
app.use('/api/lookups', lookups);
app.use('/api/cases', cases);
app.use('/api/notifications', notifications);
app.use('/api/surveys', surveys);
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.locals.io = io;
io.on('connection', (socket) => {
  socket.on('disconnect', () => {
  });
});
const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend çalışıyor: http://localhost:${PORT}`);
  console.log(`Socket.IO çalışıyor: ws://localhost:${PORT}`);
});
