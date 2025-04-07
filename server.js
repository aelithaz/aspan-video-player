const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

require("dotenv").config();
const MONGO_URI = process.env.MONGODB_URI;

// Define schema and model
const chunkSchema = new mongoose.Schema({
    userId: String,
    video: String,
    chunkViews: Object,
    timestamp: Date
});

const ChunkView = mongoose.model("ChunkView", chunkSchema);

// Route to receive chunk data
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