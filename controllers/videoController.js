const UserView = require('../models/userViewModel');

const recordView = async (req, res) => {
  console.log("✅ Received POST /api/view");
  console.log("📦 Payload:", req.body);
  
  try {
    const { userId, video, chunkViews, timestamp } = req.body;

    if (!userId || !video || !chunkViews) {
      console.error('⚠️ Invalid payload:', req.body);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const chunksViewed = Object.keys(chunkViews)
      .filter(chunk => chunkViews[chunk] > 0)
      .map(Number);

    const update = {
      $addToSet: {
        views: {
          videoId: video,
          chunksViewed: { $each: chunksViewed }
        }
      }
    };

    await UserView.findOneAndUpdate(
      { uid: userId },
      update,
      { upsert: true, new: true }
    );

    console.log(`✅ View data recorded for user: ${userId}, video: ${video}`);
    res.status(200).json({ message: 'View recorded successfully' });

  } catch (error) {
    console.error('❌ Error recording view:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { recordView };
