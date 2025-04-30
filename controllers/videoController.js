const UserView = require('../models/userViewModel');

const recordView = async (req, res) => {
  try {
    console.log("📥 Received view data:", req.body);

    const { userId: uid, video, chunkViews } = req.body;

    // Sanity check
    if (!uid || !video || typeof chunkViews !== 'object') {
      console.warn("⚠️ Invalid payload:", { uid, video, chunkViews });
      return res.status(400).send("Invalid request body");
    }

    // Convert chunkViews into an array of viewed chunk indices
    const chunks = Object.entries(chunkViews)
      .filter(([_, count]) => count > 0)
      .map(([chunk]) => parseInt(chunk));

    console.log("🧠 Extracted viewed chunks:", chunks);

    if (chunks.length === 0) {
      console.log("⚠️ No chunks viewed — skipping DB update");
      return res.status(204).send("No meaningful data to record");
    }

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
    console.log("📁 Mongoose DB:", mongoose.connection.name);
    console.log("📂 Writing to collection:", UserView.collection.name);
    res.status(200).send("Recorded");
  } catch (err) {
    console.error("❌ Error recording view:", err);
    res.status(500).send("Server error");
  }
};

module.exports = { recordView };
