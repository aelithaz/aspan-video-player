const UserView = require('../models/userViewModel');

const recordView = async (req, res) => {
  try {
    console.log("📥 Received view data:", req.body);

    const { userId: uid, video, chunkViews } = req.body;

    // Format chunkViews into the expected structure
    const chunks = Object.entries(chunkViews)
      .filter(([_, count]) => count > 0)
      .map(([chunk]) => parseInt(chunk));

    const update = {
      $push: {
        views: {
          videoId: video,
          chunksViewed: chunks
        }
      }
    };

    const result = await UserView.findOneAndUpdate(
      { uid },
      update,
      { upsert: true, new: true }
    );

    console.log("✅ Mongo updated:", result);
    res.status(200).send("Recorded");
  } catch (err) {
    console.error("❌ Error recording view:", err);
    res.status(500).send("Server error");
  }
};

module.exports = { recordView };
