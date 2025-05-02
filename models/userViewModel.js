const mongoose = require('mongoose');

const UserViewSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    views: [
        {
            videoId: String,
            chunksViewed: { type: Map, of: Number },
            chunksPaused: { type: [Number], default: [] },
            correctAnswers: { type: Number, default: 0 }
        }
    ]
});

module.exports = mongoose.model('UserView', UserViewSchema, 'dataViews');