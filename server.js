const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/survey_video', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Schema for tracking video chunks viewed by users
const ChunkViewSchema = new mongoose.Schema({
    userId: String,
    videoId: String,
    chunkNumber: Number,
    viewCount: { type: Number, default: 0 }
});

// Model
const ChunkView = mongoose.model('ChunkView', ChunkViewSchema);

// Endpoint to record chunk views
app.post('/record-view', async (req, res) => {
    const { userId, videoId, chunkNumber } = req.body;

    if (!userId || !videoId || chunkNumber === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Find existing record or create new one
        const chunk = await ChunkView.findOneAndUpdate(
            { userId, videoId, chunkNumber },
            { $inc: { viewCount: 1 } },
            { upsert: true, new: true }
        );
        res.json({ success: true, data: chunk });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get total chunk views across all users for a video
app.get('/analytics/:videoId', async (req, res) => {
    const { videoId } = req.params;

    try {
        const chunkViews = await ChunkView.aggregate([
            { $match: { videoId } },
            {
                $group: {
                    _id: "$chunkNumber",
                    totalViews: { $sum: "$viewCount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({ videoId, chunkViews });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
