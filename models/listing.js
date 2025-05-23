const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { string, required } = require("joi");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: {
    type: Number,
    required: true,
  },
  location: String,
  country: String,

  // New fields for advanced filtering:
  propertyType: {
    type: String,
    enum: ["Entire Place", "Private Room", "Shared Room"],
  },
  amenities: [String], // e.g., ['WiFi', 'Kitchen', 'TV']

  // Average rating of the listing
  rating: {
    type: Number,
    default: 0,
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String, // 'Point'
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  category: {
    type: String,
    enum: [
      "Mountains",
      "Trending",
      "Iconic Cities",
      "Castles",
      "Arctic",
      "Amazing Views",
      "LakeFront",
      "Camping",
      "Farms",
      "Domes",
      "Boats",
    ],
  },
});

listingSchema.index({ geometry: "2dsphere" }); // Index for geo queries

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
