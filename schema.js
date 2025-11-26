const Joi = require('joi');

const validCategories = [
  "Trending",
  "Mountains",
  "Beach",
  "Rooms",
  "Igloo",
  "Dome",
  "Amazing Pools",
  "House Boats",
  "Camping",
  "Farm",
  "Farms",
  "Arctic",
  "Castles",
  "Iconic Cities",
  "Play"
];

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().allow("", null),
    category: Joi.alternatives()
      .try(
        Joi.string().valid(...validCategories),
        Joi.array().items(Joi.string().valid(...validCategories)).min(1)
      )
      .required()
  }).required()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required()
  }).required()
});