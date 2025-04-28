const express = require('express');
const router = express.Router();

const { recordView } = require('../controllers/videoController');

router.get('/', (req, res) => {
    res.send('Welcome to ASPAN Video Player Backend!');
});

router.post('/api/view', recordView);

module.exports = router;