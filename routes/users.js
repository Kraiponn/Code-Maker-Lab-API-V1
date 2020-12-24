const express = require("express");
const { body } = require("express-validator");

const { isAuth, isRole } = require("../middlewares/protects");
const { uploads } = require("../utils/imagedOpaerations");
const isValidInput = require("../middlewares/isValidInput");
const User = require("../models/User");
const advancedResults = require("../middlewares/advancedResults");
const {
  getUser,
  getUsers,
  createdUser,
  updatedPassword,
  deletedUser,
  updatedProfile,
} = require("../controllers/users");

const router = express.Router();

router.use(isAuth);
router.use(isRole("admin"));

// Upload password
router
  .route("/password/:id")
  .put(
    [
      body("password")
        .notEmpty()
        .withMessage("Please provided new password to update")
        .isLength({ min: 6, max: 16 })
        .withMessage("Password must long between 6-16 characters"),
    ],
    isValidInput,
    updatedPassword
  );

router
  .route("/")
  .get(advancedResults(User), getUsers)
  .post(uploads.single("avatar"), createdUser);

router
  .route("/:id")
  .get(getUser)
  .put(uploads.single("avatar"), updatedProfile)
  .delete(deletedUser);

module.exports = router;
