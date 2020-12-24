const express = require("express");
const { body } = require("express-validator");

const isValidInput = require("../middlewares/isValidInput");
const advancedResults = require("../middlewares/advancedResults");
const { isAuth, isRole } = require("../middlewares/protects");
const {
  createdBookCategory,
  updatedBookCategory,
  deletedBookCategory,
  getBookCategory,
  getBookCategories,
} = require("../controllers/bookCategories");

// Include other resource router
const bookRouter = require("./books");

// Include BookCategory model
const BookCategory = require("../models/BookCategory");

const router = express.Router({ mergeParams: true });

// Re-Route into other resource router
router.use("/:bookCategoryId/books", bookRouter);

router.use(isAuth);
router.use(isRole("admin", "publisher"));

const bodyValidation = [
  body("title").notEmpty().withMessage("Please provide a title"),
  body("description").notEmpty().withMessage("Please provide a description"),
];

router
  .route("/")
  .get(advancedResults(BookCategory), getBookCategories)
  .post(bodyValidation, isValidInput, createdBookCategory);

router
  .route("/:id")
  .put(bodyValidation, isValidInput, updatedBookCategory)
  .get(getBookCategory)
  .delete(deletedBookCategory);

module.exports = router;
