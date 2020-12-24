const express = require("express");

const { uploads } = require("../utils/imagedOpaerations");
const { isAuth, isRole } = require("../middlewares/protects");
const {
  createdCategory,
  updatedCategory,
  getCategory,
  getCategories,
  deletedCategory,
} = require("../controllers/categories");

// Include Category model
const Categories = require("../models/Category");

// Include other resource routers
const bookCategoryRouter = require("./bookCategories");
const foodCategoryRouter = require("./foodCategories");

const advancedResults = require("../middlewares/advancedResults");

const router = express.Router();

// Re-route into other resource routers
router.use("/:categoryId/bookcategories", bookCategoryRouter);
router.use("/:categoryId/foodcategories", foodCategoryRouter);

router.use(isAuth);
router.use(isRole("admin"));

router
  .route("/")
  .post(uploads.single("image"), createdCategory)
  .get(advancedResults(Categories), getCategories);

router
  .route("/:id")
  .put(uploads.single("image"), updatedCategory)
  .get(getCategory)
  .delete(deletedCategory);

module.exports = router;
