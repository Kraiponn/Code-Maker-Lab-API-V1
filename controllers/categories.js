const asyncHandler = require("express-async-handler");

const errorResponse = require("../utils/errorResponse");
const {
  removeAvatar,
  readFileFromOldPath,
} = require("../utils/imagedOpaerations");
const Category = require("../models/Category");

// @desc    Created a category
// @route   POST /api/v2/categories
// @access  Private
exports.createdCategory = async (req, res, next) => {
  console.log(req.body);
  let imgPath;

  if (!req.body.title || !req.body.description) {
    if (req.file) {
      removeAvatar(`./public/products/${req.file.filename}`);
    }

    return next(
      new errorResponse(`Please provided a valid title and description`, 400)
    );
  }

  if (req.file) {
    req.body.image = req.file.filename;
    imgPath = `./public/uploads/${req.file.filename}`;
  }

  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    if (readFileFromOldPath(imgPath)) {
      removeAvatar(imgPath);
    }

    return next(error);
  }
};

// @desc    Updated category
// @route   PUT /api/v2/categories/:id
// @access  Private
exports.updatedCategory = asyncHandler(async (req, res, next) => {
  let oldImagePath;
  let currentImagePath;
  let newImagePath = req.body.image;

  if (req.file) {
    currentImagePath = `./public/uploads/${req.file.filename}`;
    newImagePath = req.file.filename;
  }

  // Finding category with id
  const category = await Category.findById(req.params.id);

  if (!category) {
    removeAvatar(currentImagePath);

    return next(
      new errorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  oldImagePath = `./public/uploads/${category.image}`;
  if (readFileFromOldPath(oldImagePath)) {
    removeAvatar(oldImagePath);
  }

  req.body.image = newImagePath;

  const newCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: { category: newCategory },
  });
});

// @desc    Remove category
// @route   DELETE /api/v2/categories/:id
// @access  Private
exports.deletedCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(
      new errorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  let imgPath = `./public/uploads/${category.image}`;
  removeAvatar(imgPath);

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Fetch single category
// @route   POST /api/v2/categories/:id
// @access  Private
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new errorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: { category },
  });
});

// @desc    Fetch all categories
// @route   POST /api/v2/categories
// @access  Private
exports.getCategories = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});
