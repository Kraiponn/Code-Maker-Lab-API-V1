const crypto = require("crypto");
const asyncHandler = require("express-async-handler");

const errorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// @desc    Register new user
// @route   POST /api/v2/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: { user },
  });
});

// @desc    Login to access
// @route   POST /api/v2/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );
  // console.log("User: ", user);

  if (!user) {
    return next(
      new errorResponse(`There is no user with email: ${req.body.email}`, 404)
    );
  }

  const isMatchPwd = await user.matchPassword(req.body.password);

  // Make sure this email is correct
  if (!isMatchPwd) {
    return next(new errorResponse(`Password is incorrect`, 404));
  }

  let token = user.getSignJwtToken();

  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// @desc    Fetch user with _id
// @route   GET /api/v2/getprofile
// @access  Public
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(
      new errorResponse(`User not found with id of ${req.user._id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// @desc    Updated password
// @route   PUT /api/v2/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return next(
      new errorResponse(`User not found with id of ${req.user._id}`, 404)
    );
  }

  let isMatchPwd = await user.matchPassword(currentPassword);
  if (!isMatchPwd) {
    return next(
      new errorResponse(
        `Invalid current password. Please provide a valid current password`,
        404
      )
    );
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// @desc    Update Profile
// @route   PUT /api/v2/updatedprofile
// @access  Private
exports.updatedProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(
      new errorResponse(`User not found with id of ${req.user._id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// @desc    Remove user
// @route   DELETE /api/v2/auth/deletedprofile/:id
// @access  Private
exports.deletedProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndRemove(req.params.id);

  if (!user) {
    return next(
      new errorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Forgot password
// @route   POST /api/v2/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new errorResponse(
        `There is no user with that email: ${req.body.email}`,
        404
      )
    );
  }

  let resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: {
      resetToken,
    },
  });
});

// @desc    Reset password with reset token
// @route   POST /api/v2/auth/resetpassword/:resettoken
// @access  Private
exports.resetPassword = asyncHandler(async (req, res, next) => {
  let resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new errorResponse(`Token expire`, 403));
  }

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.password = req.body.password;
  await user.save({ new: true, runValidators: true });

  // Sign token
  let token = user.getSignJwtToken();

  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

/*************************************************************/
