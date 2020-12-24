const asyncHandler = require("express-async-handler");

const errorResponse = require("../utils/errorResponse");
const {
  readFileFromOldPath,
  removeAvatar,
} = require("../utils/imagedOpaerations");
const FoodCategory = require("../models/FoodCategory");
const Food = require("../models/Food");

// @desc    Created food product
// @route   POST /api/v2/foodcategories/:foodCategoryId/foods
// @access  Private
exports.createdFood = asyncHandler(async (req, res, next) => {
  let imagPath; // For operation image
  let imgRecord; // For record to image field

  imgRecord = req.body.image;

  // Make sure client uploaded file
  if (req.file) {
    imgRecord = req.file.filename;
    imagPath = `${process.env.UPLOAD_PATH}/${imgRecord}`;
  }

  // Finding food category Id
  const foodCategory = await FoodCategory.findOne({
    _id: req.params.foodCategoryId,
  });

  if (!foodCategory) {
    // Make sure this image exist already?
    if (readFileFromOldPath(imagPath)) {
      removeAvatar(imagPath);
    }

    return next(
      new errorResponse(
        `Food category not found with id of ${req.params.foodCategoryId}`,
        404
      )
    );
  }

  // Make sure the user role is an admin or publisher
  if (
    req.user.role !== process.env.ADMIN_USER &&
    req.user.role !== process.env.PUBLISHER_USER
  ) {
    // Make sure this image exist already?
    if (readFileFromOldPath(imagPath)) {
      removeAvatar(imagPath);
    }

    return next(
      new errorResponse(
        `User role: ${req.user.role} can not add product to db`,
        403
      )
    );
  }

  req.body.category = req.params.foodCategoryId;
  req.body.user = req.user._id;
  req.body.image = imgRecord;

  const food = await Food.create(req.body);

  res.status(201).json({
    success: true,
    data: { food },
  });
});

// @desc    Updated food product
// @route   PUT /api/v2/foods/:id
// @access  Private
exports.updatedFood = asyncHandler(async (req, res, next) => {
  let imagPath; // For operation image
  let imgRecord; // For record to image field

  imgRecord = req.body.image;

  // Make sure client uploaded file
  if (req.file) {
    imgRecord = req.file.filename;
    imagPath = `${process.env.UPLOAD_PATH}/${imgRecord}`;
  }

  const food = await Food.findById(req.params.id);

  if (!food) {
    // Make sure this image exist already?
    if (readFileFromOldPath(imagPath)) {
      removeAvatar(imagPath);
    }

    return next(new errorResponse(`No food with id of ${req.params.id}`, 404));
  }

  // Make sure the user role is an admin or publisher owner
  if (
    req.user.role !== process.env.ADMIN_USER &&
    req.user._id.toString() !== food.user.toString()
  ) {
    // Make sure this image exist already?
    if (readFileFromOldPath(imagPath)) {
      removeAvatar(imagPath);
    }

    return next(
      new errorResponse(
        `User id: ${req.user._id} can not update this food product`,
        403
      )
    );
  }

  // Remove old image from path for update
  const oldImagePath = `${process.env.UPLOAD_PATH}/${food.image}`;
  if (readFileFromOldPath(oldImagePath)) {
    removeAvatar(oldImagePath);
  }

  food.title = req.body.title ? req.body.title : food.title;
  food.description = req.body.description
    ? req.body.description
    : food.description;
  food.instock = req.body.instock ? req.body.instock : food.instock;
  food.price = req.body.price ? req.body.price : food.price;
  food.category = req.body.category ? req.body.category : food.category;
  food.user = req.body.user ? req.body.user : req.user._id;
  food.image = imgRecord ? imgRecord : "no-pic.png";

  // Updating new food product
  await food.save();

  res.status(200).json({
    success: true,
    data: { food },
  });
});

// @desc    Deleted food product
// @route   DELETE /api/v2/foods/:id
// @access  Private
exports.deletedFood = asyncHandler(async (req, res, next) => {
  // Finding this product with id
  const productOwner = await Food.findById(req.params.id);
  // Make sure product exist already
  if (!productOwner) {
    return next(
      new errorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure the user role is an admin or publisher owner
  if (
    req.user.role !== process.env.ADMIN_USER &&
    req.user._id.toString() !== productOwner.user.toString()
  ) {
    return next(
      new errorResponse(
        `User id: ${req.user._id} can not delete this food product`,
        403
      )
    );
  }

  await Food.deleteOne({ _id: req.params.id });

  // Remove image for this food id
  const imagPath = `${process.env.UPLOAD_PATH}/${productOwner.image}`;
  if (readFileFromOldPath(imagPath)) {
    removeAvatar(imagPath);
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get single product
// @route   GET /api/v2/foods/:id
// @access  Private
exports.getFood = asyncHandler(async (req, res, next) => {
  const food = await Food.findById(req.params.id)
    .populate({ path: "category", select: "title description" })
    .populate("user", "name email role avatar");

  if (!food) {
    return next(
      new errorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: { food },
  });
});

// @desc    Get products with query string
// @route   GET /api/v2/foods?query-string
//              /api/v2/foods/?select=title,description,price,instock,image,user,category -
//              &page=1&limit=9&sort=title&price[gte]=99
// @access  Private
exports.getFoods = asyncHandler(async (req, res, next) => {
  if (!req.params.foodCategoryId) {
    res.status(200).json(res.advancedResults);
  }
});
