const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const routes = require('./routes');  // your API routes

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aspan_video').then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// 🔵 Serve static files from public/ folder
app.use(express.static(path.join(__dirname, 'public')));

// 🔵 API routes
app.use('/api', routes);

// 🔵 Default route: send aspan-video-player.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'aspan-video-player.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
