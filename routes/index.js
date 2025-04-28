const express = require('express');
const router = express.Router();

const { recordView } = require('../controllers/videoController');

router.post('/api/view', recordView);

module.exports = router;