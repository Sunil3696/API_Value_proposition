// routes/valuePropositionRoutes.js
const express = require("express");
const { generateValueProposition, getUserData } = require("../controller/valuePropositionController");

const router = express.Router();

// POST route for handling form data
router.post("/", generateValueProposition);
router.get('/user/:email', getUserData);

module.exports = router;
