const UserView = require('../models/userViewModel');

exports.recordView = async (req, res) => {
    console.log("✅ Received POST /api/view");
    console.log("📦 Payload:", req.body);

    try {
        const { uid = "dummy-uid-12345", videoId, chunkIndex } = req.body;

        if (!videoId || chunkIndex === undefined) {
            return res.status(400).json({ message: 'Missing videoId or chunkIndex' });
        }

        let user = await UserView.findOne({ uid });

        if (!user) {
            user = new UserView({
                uid,
                views: []
            });
        }

        let videoView = user.views.find(v => v.videoId === videoId);

        if (!videoView) {
            videoView = {
                videoId,
                chunksViewed: []
            };
            user.views.push(videoView);
        }

        if (!videoView.chunksViewed.includes(chunkIndex)) {
            videoView.chunksViewed.push(chunkIndex);
        }

        await user.save();
        res.status(200).json({ message: 'View recorded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
