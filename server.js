const path = require('path'); // <-- add this if missing
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const routes = require('./routes');

app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aspan_video').then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Serve static frontend
app.use(express.static(path.join(__dirname, 'build')));

// API routes
app.use('/api', routes);

// For any other routes, send back React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
