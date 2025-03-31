// routes/valuePropositionRoutes.js
const express = require("express");
const { generateValueProposition, getUserData, deleteUserData } = require("../controller/valuePropositionController");
const authenticateUser = require("../middleware/middleware")
const router = express.Router();

// POST route for handling form data
router.post("/", authenticateUser, generateValueProposition);
router.get('/user/:email', authenticateUser, getUserData);
router.delete("/user/:email", authenticateUser ,deleteUserData);

module.exports = router;
