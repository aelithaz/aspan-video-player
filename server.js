const express = require('express');
const mongoose = require('mongoose');
const path = require('path');  // <--- Add this!
const app = express();
const routes = require('./routes');

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aspan_video', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ➡️ Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// ➡️ API routes
app.use('/', routes);

// ➡️ Always send React's index.html for any other request
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});