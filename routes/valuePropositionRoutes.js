// routes/valuePropositionRoutes.js
const express = require("express");
const { generateValueProposition, getUserData, deleteUserData } = require("../controller/valuePropositionController");

const router = express.Router();

// POST route for handling form data
router.post("/", generateValueProposition);
router.get('/user/:email', getUserData);
router.delete("/user/:email", deleteUserData);

module.exports = router;
