const express = require("express");
const { body } = require("express-validator");

const { uploads } = require("../utils/imagedOpaerations");
const { isAuth, isRole } = require("../middlewares/protects");
const isValidInput = require("../middlewares/isValidInput");

// Added a finding middleware
const advancedResults = require("../middlewares/advancedResults");

// Include controllers
const {
  createdFood,
  updatedFood,
  deletedFood,
  getFood,
  getFoods,
} = require("../controllers/foods");

// Include resource model
const Food = require("../models/Food");

// Created a new router object
const router = express.Router({ mergeParams: true });

// Added a protector and role to access router
router.use(isAuth);
router.use(isRole("publisher", "admin"));

const bodyValidte = [
  body("title").notEmpty().withMessage("Please provide a title"),
  body("description").notEmpty().withMessage("Please provide a description"),
  body("price").notEmpty().withMessage("Please provide a price"),
  body("instock").notEmpty().withMessage("Please provide an instock"),
];

// router.get('/')

router
  .route("/")
  .post(uploads.single("image"), bodyValidte, isValidInput, createdFood)
  .get(advancedResults(Food, "category", "user"), getFoods);

router
  .route("/:id")
  .get(getFood)
  .put(uploads.single("image"), bodyValidte, isValidInput, updatedFood)
  .delete(deletedFood);

module.exports = router;
