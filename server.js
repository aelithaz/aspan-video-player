const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// Default route (for browser)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API endpoint
const chunkSchema = new mongoose.Schema({
    userId: String,
    video: String,
    chunkViews: Object,
    timestamp: Date
});
const ChunkView = mongoose.model("ChunkView", chunkSchema);

app.post("/api/save-chunks", async (req, res) => {
    try {
        const newEntry = new ChunkView(req.body);
        await newEntry.save();
        res.status(200).send("Chunk views saved.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving data.");
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});