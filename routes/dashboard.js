const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js");
const dashboardController = require("../controllers/dashboard");

// Dashboard home - shows user details
router.get("/", isLoggedIn, dashboardController.showDashboard);

// User's listings
router.get("/my-listings", isLoggedIn, dashboardController.showUserListings);

module.exports = router;