const express = require("express");
const { body } = require("express-validator");

const { uploads } = require("../utils/imagedOpaerations");
const { isAuth, isRole } = require("../middlewares/protects");
const isValidInput = require("../middlewares/isValidInput");

// Added a finding middleware
const advancedResults = require("../middlewares/advancedResults");

// Include controllers
const {
  createdBook,
  updatedBook,
  deletedBook,
  getBook,
  getBooks,
} = require("../controllers/books");

// Include resource model
const Book = require("../models/Book");

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

router
  .route("/")
  .post(uploads.single("image"), bodyValidte, isValidInput, createdBook)
  .get(advancedResults(Book, "category", "user"), getBooks);

router
  .route("/:id")
  .get(getBook)
  .put(uploads.single("image"), bodyValidte, isValidInput, updatedBook)
  .delete(deletedBook);

module.exports = router;
