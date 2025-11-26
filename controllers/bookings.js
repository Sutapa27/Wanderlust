const Razorpay = require("razorpay");
const Listing = require("../models/listing");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// SHOW booking page
module.exports.renderBookingPage = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (req.user._id.equals(listing.owner._id)) {
    req.flash("error", "You cannot book your own listing!");
    return res.redirect(`/listings/${id}`);
  }

  res.render("listings/book", {
    listing,
    razorpayKey: process.env.RAZORPAY_KEY_ID,
  });
};

// CREATE Razorpay Order
module.exports.createCheckoutSession = async (req, res) => {
  const { id } = req.params;
  const { totalPrice } = req.body; // Get total price from form
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  try {
    // Calculate final price with GST (18%)
    const basePrice = listing.price;
    const gstAmount = basePrice * 0.18;
    const finalPrice = basePrice + gstAmount;

    // Create order with final price
    const order = await razorpay.orders.create({
      amount: Math.round(finalPrice * 100), // Convert to paise and round
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    });

    res.render("listings/razorpay_checkout", {
      order,
      listing,
      finalPrice: finalPrice, // Pass final price to template
      basePrice: basePrice,
      gstAmount: gstAmount,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      success: req.flash("success"),
      error: req.flash("error"),
      currentUser: req.user,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    req.flash("error", "Failed to create payment session!");
    return res.redirect(`/listings/${id}`);
  }
};

// SUCCESS page
module.exports.successPage = (req, res) => {
  req.flash("success", "Payment successful!");
  return res.redirect("/listings");
};

// CANCEL page
module.exports.cancelPage = (req, res) => {
  req.flash("error", "Payment failed / cancelled!");
  return res.redirect("/listings");
};
