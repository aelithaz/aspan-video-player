const mongoose = require('mongoose');

const SubmissionLogSchema = new mongoose.Schema({
  submissionId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SubmissionLog', SubmissionLogSchema);