const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer  = require('multer');
const{storage}=require("../cloudConfig.js")
const upload = multer({storage});

router
.route("/")
.get(wrapAsync (listingController.index))
.post(
    isLoggedIn,
    upload.array("listing[images]",4),
    validateListing,
    wrapAsync (listingController.createListing)
);


//new route
router.get("/new", 
  isLoggedIn,  // Just pass the function reference
  listingController.renderNewForm
);



router.get("/search",wrapAsync(listingController.searchListing));



// Filter by category
router.get("/category/:category",wrapAsync(listingController.filterByCategory));


router
.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(
    isLoggedIn,
    isOwner,
    upload.array("listing[images]"),
    validateListing,
    wrapAsync(listingController.updateListing))
.delete(
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing));


//Edit Route
router.get("/:id/edit",
  isLoggedIn,
  isOwner,
    wrapAsync(listingController.renderEditForm));

// booking route
router.get('/:id/book', isLoggedIn, wrapAsync(listingController.bookingStay));




module.exports=router;