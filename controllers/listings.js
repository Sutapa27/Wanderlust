const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const { cloudinary } = require("../cloudConfig");

module.exports.index = async (req, res) => {
  try {
    const allListings = await Listing.find({}).populate("reviews");

    const listingsWithRatings = allListings.map((listing) => {
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

    res.render("listings/index.ejs", {
      allListings: listingsWithRatings,
      currentUser: req.user,
    });
  } catch (err) {
    console.error("Error fetching listings:", err);
    req.flash("error", "Failed to load listings");
    return res.redirect("/");
  }
};

module.exports.renderNewForm = (req, res) => {
  console.log(req.user);
  res.render("listings/new.ejs", { from: req.query.from });
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for doesn't exist.");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing, mapToken });
};

module.exports.createListing = async (req, res, next) => {
  try {
    // 1. First geocode the location
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    const geoData = response.body.features[0];

    if (!geoData) {
      req.flash("error", "Invalid location. Please try again.");
      return req.session.save((err) => {
        if (err) console.error("Session save error:", err);
        res.redirect("/listings/new");
      });
    }

    // 2. THEN create the listing
    const newListing = new Listing({
      ...req.body.listing,
      category: Array.isArray(req.body.listing.category)
        ? req.body.listing.category
        : [req.body.listing.category],
    });
    newListing.owner = req.user._id;
    newListing.geometry = geoData.geometry;

    // 3. Add images
    newListing.images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));

    console.log("FORM VALUE RECEIVED:", req.body.listing.category);
    console.log("NEW LISTING VALUE:", newListing.category);

    // 4. Save
    await newListing.save();
    console.log("New listing saved:", newListing);

    // Flash and redirect
    req.flash("success", "New listing created!");
    const redirectTo =
      req.query.from === "dashboard" ? "/dashboard" : "/listings";

    req.session.save((err) => {
      if (err) console.error("Session save error:", err);
      res.redirect(redirectTo);
    });
  } catch (err) {
    console.error("Error creating listing:", err);
    req.flash("error", "Failed to create listing");

    req.session.save((err) => {
      if (err) console.error("Session save error:", err);
      res.redirect("/listings");
    });
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you trying to edit doesn't exist.");
    return res.redirect("/listings");
  }
  let originalImageUrl = null;
  if (listing.images && listing.images.length > 0) {
    originalImageUrl = listing.images[0].url.replace(
      "/upload",
      "/upload/h_300,w_250"
    );
  }
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body.listing;

    if (data.category) {
      if (!Array.isArray(data.category)) {
        data.category = [data.category];
      }
    }

    console.log("Category being updated:", data.category);

    const listing = await Listing.findByIdAndUpdate(id, data, { new: true });

    if (req.files && req.files.length > 0) {
      for (let img of listing.images) {
        await cloudinary.uploader.destroy(img.filename);
      }

      const newImages = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
      }));
      listing.images = newImages;
    }

    if (req.body.listing.location) {
      const response = await geocodingClient
        .forwardGeocode({
          query: req.body.listing.location,
          limit: 1,
        })
        .send();

      listing.geometry = response.body.features[0].geometry;
    }

    await listing.save();

    console.log("Updated listing in DB:", listing.category);

    req.flash("success", "Listing updated!");

    req.session.save((err) => {
      if (err) console.error("Session save error:", err);
      res.redirect(`/listings/${id}`);
    });
  } catch (err) {
    console.error("Error updating listing:", err);
    req.flash("error", "Failed to update listing");

    req.session.save((err) => {
      if (err) console.error("Session save error:", err);
      res.redirect("/listings");
    });
  }
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");

  req.session.save((err) => {
    if (err) console.error("Session save error:", err);
    res.redirect("/listings");
  });
};

module.exports.searchListing = async (req, res) => {
  try {
    const { location } = req.query;

    if (!location || location.trim() === "") {
      req.flash("error", "Please enter a location to search!");
      return res.redirect("/listings");
    }

    // Search in BOTH location AND country fields (case-insensitive)
    let listings = await Listing.find({
      $or: [
        { location: { $regex: location, $options: "i" } },
        { country: { $regex: location, $options: "i" } },
      ],
    }).populate("reviews");

    if (listings.length === 0) {
      req.flash("error", `No listings found for "${location}"`);
      return res.redirect("/listings");
    }

    // Calculate average ratings
    listings = listings.map((listing) => {
      let avgRating = 0;
      if (listing.reviews.length > 0) {
        const total = listing.reviews.reduce((sum, r) => sum + r.rating, 0);
        avgRating = (total / listing.reviews.length).toFixed(1);
      }
      return { ...listing.toObject(), avgRating };
    });

    res.render("listings/index.ejs", {
      allListings: listings,
      searchLocation: location,
      currentUser: req.user, // Don't forget this!
    });
  } catch (err) {
    console.error("Error during search:", err);
    req.flash("error", "Something went wrong while searching!");
    return res.redirect("/listings");
  }
};

module.exports.filterByCategory = async (req, res) => {
  try {
    let { category } = req.params;
    category = category.replace(/-/g, " ");

    // ✅ Handle empty or invalid category
    if (!category) {
      req.flash("error", "Invalid category!");
      return res.redirect("/listings");
    }

    let listings = await Listing.find({
      category: { $regex: new RegExp(`^${category}$`, "i") },
    }).populate("reviews");

    if (listings.length === 0) {
      req.flash("error", `No listings found in "${category}" category`);
      return res.redirect("/listings");
    }
    listings = listings.map((listing) => {
      let avgRating = 0;
      if (listing.reviews.length > 0) {
        const total = listing.reviews.reduce((sum, r) => sum + r.rating, 0);
        avgRating = (total / listing.reviews.length).toFixed(1);
      }
      return { ...listing.toObject(), avgRating };
    });

    res.render("listings/index.ejs", {
      allListings: listings,
      selectedCategory: category,
    });
  } catch (err) {
    console.error("Error filtering by category:", err);
    req.flash("error", "Something went wrong while filtering listings!");
    return res.redirect("/listings");
  }
};
