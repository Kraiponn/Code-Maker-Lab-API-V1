const asyncHandler = require("express-async-handler");

const errorResponse = require("../utils/errorResponse");
const BookCategory = require("../models/BookCategory");
const Category = require("../models/Category");

// @desc    Created a book category from categories
// @route   POST /api/v2/categories/:categoryId/bookcategories
// @access  Private
exports.createdBookCategory = asyncHandler(async (req, res, next) => {
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

  const bookCategory = await BookCategory.create(req.body);

  res.status(201).json({
    success: true,
    data: { bookCategory },
  });
});

// @desc    Updated book category
// @route   PUT /api/v2/bookcategories/:id
// @access  Private
exports.updatedBookCategory = asyncHandler(async (req, res, next) => {
  const bookCategory = await BookCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!bookCategory) {
    return next(
      new errorResponse(
        `There is no book category with that id: ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    data: { bookCategory },
  });
});

// @desc    Remove book category with id
// @route   DELETE /api/v2/bookcategories/:id
// @access  Private
exports.deletedBookCategory = asyncHandler(async (req, res, next) => {
  const bookCategory = await BookCategory.findByIdAndDelete(req.params.id);

  if (!bookCategory) {
    return next(
      new errorResponse(
        `Book category not found with id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get a sigle book category
// @route   GET /api/v2/bookcategories/:id
// @access  Private
exports.getBookCategory = asyncHandler(async (req, res, next) => {
  const bookCategory = await BookCategory.findOne({ _id: req.params.id });

  if (!bookCategory) {
    return next(
      new errorResponse(
        `Book category not found with id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    data: { bookCategory },
  });
});

// @desc    Get all book category
// @route   GET /api/v2/categories/categoryId/bookcategories
// @route   GET /api/v2/bookcategories
// @access  Private
exports.getBookCategories = asyncHandler(async (req, res, next) => {
  if (req.params.categoryId) {
    const bookCategories = await BookCategory.find({
      category: req.params.categoryId,
    });

    if (!bookCategories || bookCategories.length === 0) {
      return next(
        new errorResponse(
          `Book category not found with categoryId of ${req.params.categoryId}`,
          404
        )
      );
    }
    res.status(200).json({
      success: true,
      data: {
        count: bookCategories.length,
        bookCategories,
      },
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});
