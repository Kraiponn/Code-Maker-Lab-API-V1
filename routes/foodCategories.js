const express = require("express");
const { body } = require("express-validator");

const isValidInput = require("../middlewares/isValidInput");
const advancedResults = require("../middlewares/advancedResults");
const { isAuth, isRole } = require("../middlewares/protects");
const {
  createdFoodCategory,
  updatedFoodCategory,
  deletedFoodCategory,
  getFoodCategories,
  getFoodCategory,
} = require("../controllers/foodCategories");

// Include FoodCategory model
const FoodCategory = require("../models/FoodCategory");

// Incluede other resource router
const foodRouter = require("./foods");

// Created new router object
const router = express.Router({ mergeParams: true });

// Re-Route into other resouce router
router.use("/:foodCategoryId/foods", foodRouter);

// Added a protector and role to access routes
router.use(isAuth);
router.use(isRole("admin", "publisher"));

// Validation input
const bodyValidation = [
  body("title").notEmpty().withMessage("Please provide a title"),
  body("description").notEmpty().withMessage("Please provide a description"),
];

/********************************
 * Define food category routes
 */
router
  .route("/")
  .get(advancedResults(FoodCategory), getFoodCategories)
  .post(bodyValidation, isValidInput, createdFoodCategory);

router
  .route("/:id")
  .put(bodyValidation, isValidInput, updatedFoodCategory)
  .get(getFoodCategory)
  .delete(deletedFoodCategory);

module.exports = router;
