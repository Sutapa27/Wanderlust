const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js");
const wishlistController = require("../controllers/wishlist.js");

router.get("/", isLoggedIn, wishlistController.index);

// For API routes - use custom handler instead of middleware
router.post("/add/:id", wishlistController.addToWishlistAPI);

router.delete("/remove/:id", wishlistController.removeFromWishlist);

router.get("/api/ids", wishlistController.getWishlistIds);

module.exports = router;