const express = require('express');
const mongoose = require('mongoose');
const app = express();
const routes = require('./routes');

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aspan_video')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});