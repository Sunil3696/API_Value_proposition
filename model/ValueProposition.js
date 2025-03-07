// models/ValueProposition.js
const mongoose = require("mongoose");

const valuePropositionSchema = new mongoose.Schema({
  targetMarket: String,
  keyProblem: String,
  solution: String,
  outcome: String,
  openaiResponse: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  email: {
    type: String,
    default: "ai.studio.projects@gmail.com",
  },
});

const ValueProposition = mongoose.model("ValueProposition", valuePropositionSchema);

module.exports = ValueProposition;
