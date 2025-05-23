const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");

// ===== New Advanced Search Route =====
router.get(
  "/search",
  wrapAsync(async (req, res) => {
    const {
      location,
      rating,
      lat,
      lng,
      radius,
      category, 
    } = req.query;

    let filter = {};

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }


    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

      if (category) {
      filter.category = category;  
    }

    // if (lat && lng && radius) {
    //   filter.geometry = {
    //     $near: {
    //       $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
    //       $maxDistance: parseInt(radius),
    //     },
    //   };
    // }

    const listings = await Listing.find(filter);
    res.render("listings/searchResults", { listings, filters: req.query });
  })
);

// Existing routes
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditFrom)
);

module.exports = router;
