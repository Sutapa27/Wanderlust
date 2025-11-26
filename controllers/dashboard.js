const User = require("../models/user");
const Listing = require("../models/listing");

// Show user dashboard
module.exports.showDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");

    if (!user) {
      req.flash("error", "User not found!");
      return res.redirect("/listings");
    }

    // Count user's listings
    const listingsCount = await Listing.countDocuments({ owner: req.user._id });

    // Wishlist count from user's wishlist array
    const wishlistCount = user.wishlist ? user.wishlist.length : 0;

    // Bookings count
    const bookingsCount = 0;

    res.render("dashboard/index", {
      user,
      listingsCount,
      wishlistCount,
      bookingsCount,
      success: req.flash("success"), // ✅ Pass flash messages
      error: req.flash("error"), // ✅ Pass flash messages
    });
  } catch (err) {
    console.error("Dashboard error:", err);

    // ✅ Handle specific MongoDB timeout errors
    if (
      err.name === "MongoServerSelectionError" ||
      err.name === "MongoNetworkTimeoutError"
    ) {
      return res.status(500).render("error", {
        message:
          "Database connection timeout. Please check your internet connection and try again.",
        error: err,
        success: [],
        error: [],
      });
    }

    req.flash("error", "Failed to load dashboard");
    res.redirect("/listings");
  }
};

// Show user's listings
module.exports.showUserListings = async (req, res) => {
  try {
    const userListings = await Listing.find({ owner: req.user._id }).populate(
      "reviews"
    );

    const listingsWithRatings = userListings.map((listing) => {
      let avgRating = 0;
      if (listing.reviews.length > 0) {
        const total = listing.reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        avgRating = (total / listing.reviews.length).toFixed(1);
      }
      return { ...listing.toObject(), avgRating };
    });

    res.render("dashboard/my-listings", {
      userListings: listingsWithRatings,
      success: req.flash("success"), // ✅ Pass flash messages
      error: req.flash("error"), // ✅ Pass flash messages
    });
  } catch (err) {
    console.error("Error fetching user listings:", err);

    // ✅ Handle MongoDB timeout
    if (
      err.name === "MongoServerSelectionError" ||
      err.name === "MongoNetworkTimeoutError"
    ) {
      return res.status(500).render("error", {
        message:
          "Database connection timeout. Please check your internet connection and try again.",
        error: err,
        success: [],
        error: [],
      });
    }

    req.flash("error", "Failed to load your listings");
    res.redirect("/dashboard");
  }
};
