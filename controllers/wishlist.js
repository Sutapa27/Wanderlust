const User = require("../models/user.js");
const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      populate: { path: "reviews" },
    });

    const referrer = req.get("Referrer") || "";
    const backUrl = referrer.includes("/dashboard")
      ? "/dashboard"
      : "/listings";

    const wishlistWithRatings = user.wishlist.map((listing) => {
      let avgRating = 0;
      if (listing.reviews && listing.reviews.length > 0) {
        const total = listing.reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        avgRating = (total / listing.reviews.length).toFixed(1);
      }
      return { ...listing.toObject(), avgRating };
    });

    res.render("listings/wishlist.ejs", {
      wishlist: wishlistWithRatings || [],
      backUrl: backUrl,
    });
  } catch (err) {
    console.error("Error loading wishlist:", err);
    req.flash("error", "Failed to load wishlist");
    res.redirect("/listings");
  }
};

module.exports.addToWishlistAPI = async (req, res) => {
  try {
    const listingId = req.params.id;
    // Authentication check
    if (!req.isAuthenticated()) {
      req.session.redirectUrl = req.get("Referer") || "/listings";
      req.flash("error", "You must be logged in to add to wishlist!");
      return res.json({ success: false, requiresLogin: true });
    }
    const userId = req.user._id;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.json({ success: false, error: "Listing not found!" });
    }

    if (listing.owner.equals(userId)) {
      return res.json({
        success: false,
        error: "You cannot add your own listing to wishlist!",
      });
    }

    let user = await User.findById(userId);

    if (user.wishlist.includes(listingId)) {
      return res.json({ success: false, error: "Already in your wishlist!" });
    }

    user.wishlist.push(listingId);
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    res.json({ success: false, error: "Failed to add to wishlist" });
  }
};

module.exports.removeFromWishlist = async (req, res) => {
  try {
    const listingId = req.params.id;
    // Authentication check
    if (!req.isAuthenticated()) {
      return res.json({ success: false, requiresLogin: true });
    }
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { wishlist: listingId },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error removing from wishlist:", err);
    res.json({ success: false, error: "Failed to remove from wishlist" });
  }
};

module.exports.getWishlistIds = async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ wishlist: [] });
    }

    const user = await User.findById(req.user._id);
    const wishlistIds = user.wishlist.map((id) => id.toString());
    res.json({ wishlist: wishlistIds });
  } catch (err) {
    console.error("Error getting wishlist IDs:", err);
    res.json({ wishlist: [] });
  }
};
