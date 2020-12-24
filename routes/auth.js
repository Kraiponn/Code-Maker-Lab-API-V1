const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  getProfile,
  updatePassword,
  updatedProfile,
  deletedProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");

const isValidInput = require("../middlewares/isValidInput");
const { isAuth } = require("../middlewares/protects");
const ErrorResponse = require("../utils/errorResponse");

const router = express.Router();

// Register new member
router.post(
  "/register",
  [
    body("name").not().isEmpty().withMessage("Name is required"),
    body("email")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid type of email"),
    body("password")
      .not()
      .isEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6, max: 16 })
      .withMessage("Password must be between 6-16 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new ErrorResponse(
          "Password confirmation does not match password"
        );
      }

      return true;
    }),
  ],
  isValidInput,
  register
);

// Login to access
router.post(
  "/login",
  [
    body("email")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid type of email"),
    body("password")
      .not()
      .isEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6, max: 16 })
      .withMessage("Password must be between 6-16 characters"),
  ],
  isValidInput,
  login
);

// Get profile
router.get("/getprofile", isAuth, getProfile);

// Updated password
router.put(
  "/updatepassword",
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Please provide a current password"),
    body("newPassword")
      .notEmpty()
      .withMessage("Please provide a new password")
      .isLength({ min: 6, max: 16 })
      .withMessage("New password must be at least between 6 to 16 characters"),
  ],
  isValidInput,
  isAuth,
  updatePassword
);

// Updated profile
router.put(
  "/updatedprofile",
  [
    body("name").notEmpty().withMessage("Please provide a name field"),
    body("email")
      .notEmpty()
      .withMessage("Please provide an email field")
      .isEmail()
      .withMessage("Invalid type of email field"),
  ],
  isValidInput,
  isAuth,
  updatedProfile
);

// Remove profile
router.delete("/deletedprofile/:id", isAuth, deletedProfile);

// Forgot password
router.post(
  "/forgotpassword",
  [
    body("email")
      .notEmpty()
      .withMessage("Please provide an email")
      .isEmail()
      .withMessage("Invalid type of email"),
  ],
  isValidInput,
  forgotPassword
);

// Reset password with reset token
router.post(
  "/resetpassword/:resettoken",
  [
    body("password")
      .notEmpty()
      .withMessage("Please provide a password")
      .isLength({ min: 3, max: 16 })
      .withMessage("Password must be at least 6 to 16 characters"),
  ],
  isValidInput,
  resetPassword
);

module.exports = router;
