const UserView = require('../models/userViewModel');

const recordView = async (req, res) => {
  try {
    console.log("📥 Received view data:", req.body);

    const { userId: uid, video, chunkViews } = req.body;

    if (!uid || !video || typeof chunkViews !== 'object') {
      console.warn("⚠️ Invalid payload:", { uid, video, chunkViews });
      return res.status(400).send("Invalid request body");
    }

    const chunks = Object.entries(chunkViews)
      .filter(([_, count]) => count > 0)
      .map(([chunk]) => parseInt(chunk));

    if (chunks.length === 0) {
      console.log("⚠️ No chunks viewed — skipping DB update");
      return res.status(204).send("No meaningful data to record");
    }

    // Try to find an existing user view record
    let user = await UserView.findOne({ uid });

    if (!user) {
      // New user, create a new entry
      user = await UserView.create({
        uid,
        views: [{ videoId: video, chunksViewed: chunks }]
      });
    } else {
      // User exists, check if they already watched this video
      const existingView = user.views.find(v => v.videoId === video);

      if (existingView) {
        // Merge and deduplicate chunk indices
        const mergedChunks = Array.from(new Set([...existingView.chunksViewed, ...chunks])).sort((a, b) => a - b);
        existingView.chunksViewed = mergedChunks;
      } else {
        // Append new view entry for this video
        user.views.push({ videoId: video, chunksViewed: chunks });
      }

      await user.save();
    }

    console.log("✅ Mongo updated:", JSON.stringify(user, null, 2));
    console.log("📁 Mongoose DB:", mongoose.connection.name);
    console.log("📂 Writing to collection:", UserView.collection.name);
    res.status(200).send("Recorded");
  } catch (err) {
    console.error("❌ Error recording view:", err);
    res.status(500).send("Server error");
  }
};

module.exports = { recordView };
