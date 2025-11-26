const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js");
const bookingsController = require("../controllers/bookings");


router.get("/success", bookingsController.successPage);
router.get("/cancel", bookingsController.cancelPage);


router.get("/:id/book", 
  isLoggedIn,
  bookingsController.renderBookingPage
);


router.post("/:id/create-checkout-session", 
  isLoggedIn, 
  bookingsController.createCheckoutSession
);

module.exports = router;