const asyncHandler = require("express-async-handler");

const errorResponse = require("../utils/errorResponse");
const FoodCategory = require("../models/FoodCategory");
const Category = require("../models/Category");

// @desc    Created a food category from categories
// @route   POST /api/v2/categories/:categoryId/foodcategories
// @access  Private
exports.createdFoodCategory = asyncHandler(async (req, res, next) => {
  req.body.category = req.params.categoryId;

  const category = await Category.findById(req.params.categoryId);

  if (!category) {
    return next(
      new errorResponse(
        `Category not found with id of ${req.params.categoryId}`,
        404
      )
    );
  }

  const foodCategory = await FoodCategory.create(req.body);

  res.status(201).json({
    success: true,
    data: { foodCategory },
  });
});

// @desc    Updated food category
// @route   PUT /api/v2/foodcategories/:id
// @access  Private
exports.updatedFoodCategory = asyncHandler(async (req, res, next) => {
  const foodCategory = await FoodCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!foodCategory) {
    return next(
      new errorResponse(
        `There is no food category with that id: ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    data: { foodCategory },
  });
});

// @desc    Remove food category with id
// @route   DELETE /api/v2/foodcategories/:id
// @access  Private
exports.deletedFoodCategory = asyncHandler(async (req, res, next) => {
  const foodCategory = await FoodCategory.findByIdAndDelete(req.params.id);

  if (!foodCategory) {
    return next(
      new errorResponse(
        `Food category not found with id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get a sigle food category
// @route   GET /api/v2/foodcategories/:id
// @access  Private
exports.getFoodCategory = asyncHandler(async (req, res, next) => {
  const foodCategory = await FoodCategory.findOne({ _id: req.params.id });

  if (!foodCategory) {
    return next(
      new errorResponse(
        `Food category not found with id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    data: { foodCategory },
  });
});

// @desc    Get all food category
// @route   GET /api/v2/categories/categoryId/foodcategories
// @route   GET /api/v2/foodcategories
// @access  Private
exports.getFoodCategories = asyncHandler(async (req, res, next) => {
  if (req.params.categoryId) {
    const foodCategories = await FoodCategory.find({
      category: req.params.categoryId,
    });

    if (!foodCategories || foodCategories.length === 0) {
      return next(
        new errorResponse(
          `Food category not found with categoryId of ${req.params.categoryId}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: {
        count: foodCategories.length,
        foodCategories,
      },
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});
