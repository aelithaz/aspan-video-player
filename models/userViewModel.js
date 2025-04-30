const mongoose = require('mongoose');

const UserViewSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    views: [{
        videoId: String,
        chunksViewed: [Number]
    }]
});

module.exports = mongoose.model('UserView', UserViewSchema, 'dataViews');