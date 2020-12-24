const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");

const errorResponse = require("../utils/errorResponse");
const {
  removeAvatar,
  readFileFromOldPath,
} = require("../utils/imagedOpaerations");
const User = require("../models/User");

// @desc    Fetch all users
// @route   GET /api/v2/users?select=name,email,password,role&page=1&limit=20&createdAt[gt]=99&sort=name
// @access  Public
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Fetch single user
// @route   GET /api/v2/users/:id
// @access  Public
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new errorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// @desc    Added new member
// @route   POST /api/v2/users
// @access  Private
exports.createdUser = asyncHandler(async (req, res, next) => {
  if (req.file) {
    req.body.avatar = `${req.file.filename}`;
  }

  if (!req.body.name || !req.body.email || !req.body.password) {
    removeAvatar(`./public/uploads/${req.file.filename}`);

    return next(
      new errorResponse(`Please provide: name, email or password`, 400)
    );
  }

  const isDuplicateEmail = await User.findOne({ email: req.body.email });

  if (isDuplicateEmail) {
    removeAvatar(`./public/uploads/${req.file.filename}`);

    return next(
      new errorResponse(`This an email: ${req.body.email} exitst already`, 400)
    );
  }

  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: { user },
  });
});

// @desc    Remove user with id
// @route   DELETE /api/v2/users/:id
// @access  Private
exports.deletedUser = asyncHandler(async (req, res, next) => {
  // Make sure user is admin
  if (req.user.role !== "admin") {
    return next(
      new errorResponse(
        `User role ${req.user.role} is not delete this profile`,
        403
      )
    );
  }

  const user = await User.findByIdAndDelete(req.params.id);

  // Remove image from server
  removeAvatar(`./public/uploads/${user.avatar}`);

  if (!user) {
    return next(
      new errorResponse(
        `User id: ${req.params.id} can not remove this profile`,
        403
      )
    );
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Updated profile user without password
// @route   PUT /api/v2/users/:id
// @access  Private
exports.updatedProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("+password");
  if (!user) {
    return next(
      new errorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  let oldAvatar;
  let newAvatar = req.body.avatar;

  // Check for updated image from new upload file
  if (req.file) {
    oldAvatar = `./public/uploads/${user.avatar}`;
    const isOldFile = readFileFromOldPath(oldAvatar);

    if (isOldFile) {
      removeAvatar(oldAvatar);
    }

    newAvatar = `${req.file.filename}`;
  }

  req.body.avatar = newAvatar ? newAvatar : user.avatar;

  // Updating
  const updatedResult = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: { user: updatedResult },
  });
});

// @desc    Updated password of user
// @route   PUT /api/v2/users/password/:id
// @access  Private
exports.updatedPassword = asyncHandler(async (req, res, next) => {
  // Make sure user is admin
  if (req.user.role !== "admin") {
    return next(
      new errorResponse(
        `User role ${req.user.role} is not edit this profile`,
        403
      )
    );
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new errorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  user.password = req.body.password;
  await user.save();

  res.status(200).json({
    success: true,
    data: { user },
  });
});
