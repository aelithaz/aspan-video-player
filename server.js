const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const app = express();
const routes = require('./routes');

// 🔵 MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aspan_video')
  .then(() => {
    console.log('✅ MongoDB connected');
    console.log('🧠 Using database:', mongoose.connection.name);  // ← add this!
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 🔵 Enable CORS (important if frontend served from a different origin)
app.use(cors({
  origin: '*', // Replace with specific domain if needed
  methods: ['POST'],
}));

// 🔵 Allow raw JSON for sendBeacon (comes in as text/plain)
app.use(express.text({ type: 'application/json' }));

// 🧪 Middleware to parse JSON from raw text (if needed)
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'application/json' && typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (err) {
      console.error('❌ Failed to parse JSON body:', err);
      return res.status(400).send('Invalid JSON');
    }
  }
  next();
});

// ✅ Still accept standard JSON (for fetch or other requests)
app.use(express.json());

// 🔵 Static files
app.use(express.static(path.join(__dirname, 'public')));

// 🔵 Debug
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.originalUrl}`);
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    next();
  });

// 🔵 Routes
app.use('/api', routes);

// 🧪 Default route fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'aspan-video-player.html'));
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

