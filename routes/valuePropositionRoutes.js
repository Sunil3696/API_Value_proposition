// routes/valuePropositionRoutes.js
const express = require("express");
const { generateValueProposition } = require("../controller/valuePropositionController");

const router = express.Router();

// POST route for handling form data
router.post("/", generateValueProposition);

module.exports = router;
