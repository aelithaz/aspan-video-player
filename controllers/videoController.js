const UserView = require('../models/userViewModel');
const SubmissionLog = require('../models/submissionLogModel');  // ✅ new line
const mongoose = require('mongoose');

const recordView = async (req, res) => {
  try {
    console.log("📥 Received view data:", req.body);

    const { userId: uid, video, chunkViews, quizCorrect: correctAnswers, timestamp } = req.body;

    if (!uid || !video || typeof chunkViews !== 'object' || !timestamp) {
      console.warn("⚠️ Invalid payload:", { uid, video, chunkViews, timestamp });
      return res.status(400).send("Invalid request body");
    }

    const submissionId = `${uid}_${video}_${timestamp}`;
    try {
      await SubmissionLog.create({ submissionId });
    } catch (err) {
      if (err.code === 11000) {
        console.warn("⚠️ Duplicate caught on insert:", submissionId);
        return res.status(200).send("Duplicate submission (insert race)");
      }
      throw err;
    }

    const chunks = Object.entries(chunkViews || {})
      .filter(([_, count]) => count > 0)
      .reduce((acc, [chunk, count]) => {
        acc[chunk] = count;
        return acc;
      }, {});

    if (Object.keys(chunks).length === 0 && typeof correctAnswers !== 'number') {
      console.log("⚠️ No chunks or quiz data — skipping DB update");
      return res.status(204).send("No meaningful data to record");
    }

    let user = await UserView.findOne({ uid });

    if (!user) {
      try {
        await UserView.create({
          uid,
          views: [{
            videoId: video,
            chunksViewed: new Map(Object.entries(chunks)),
            correctAnswers: typeof correctAnswers === 'number' ? correctAnswers : 0
          }]
        });

        user = await UserView.findOne({ uid });

      } catch (err) {
        if (err.code === 11000) {
          user = await UserView.findOne({ uid });
        } else {
          throw err;
        }
      }
    }

    if (user) {
      const existingView = user.views.find(v => v.videoId === video);

      if (existingView) {
        if (!(existingView.chunksViewed instanceof Map)) {
          existingView.chunksViewed = new Map(Object.entries(existingView.chunksViewed));
        }

        for (const [chunk, count] of Object.entries(chunks)) {
          const prevCount = existingView.chunksViewed.get(chunk) || 0;
          existingView.chunksViewed.set(chunk, prevCount + count);
        }

        if (typeof correctAnswers === 'number') {
          existingView.correctAnswers = correctAnswers;
        }
      } else {
        user.views.push({
          videoId: video,
          chunksViewed: new Map(Object.entries(chunks)),
          correctAnswers: typeof correctAnswers === 'number' ? correctAnswers : 0
        });
      }

      user.markModified('views');
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
