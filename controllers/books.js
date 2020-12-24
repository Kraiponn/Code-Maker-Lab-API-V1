const asyncHandler = require("express-async-handler");

const errorResponse = require("../utils/errorResponse");
const {
  readFileFromOldPath,
  removeAvatar,
} = require("../utils/imagedOpaerations");
const BookCategory = require("../models/BookCategory");
const Book = require("../models/Book");

// @desc    Created book product
// @route   POST /api/v2/bookcategories/:bookCategoryId/books
// @access  Private
exports.createdBook = asyncHandler(async (req, res, next) => {
  let imagPath; // For operation image
  let imgRecord; // For record to image field

  imgRecord = req.body.image;

  // Make sure client uploaded file
  if (req.file) {
    imgRecord = req.file.filename;
    imagPath = `${process.env.UPLOAD_PATH}/${imgRecord}`;
  }

  // Finding book category Id
  const bookCategory = await BookCategory.findOne({
    _id: req.params.bookCategoryId,
  });

  if (!bookCategory) {
    // Make sure this image exist already?
    if (readFileFromOldPath(imagPath)) {
      removeAvatar(imagPath);
    }

    return next(
      new errorResponse(
        `Book category not found with id of ${req.params.bookCategoryId}`,
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

  req.body.category = req.params.bookCategoryId;
  req.body.user = req.user._id;
  req.body.image = imgRecord;

  const book = await Book.create(req.body);

  res.status(201).json({
    success: true,
    data: { book },
  });
});

// @desc    Updated book product
// @route   PUT /api/v2/books/:id
// @access  Private
exports.updatedBook = asyncHandler(async (req, res, next) => {
  let imagPath; // For operation image
  let imgRecord; // For record to image field

  imgRecord = req.body.image;

  // Make sure client uploaded file
  if (req.file) {
    imgRecord = req.file.filename;
    imagPath = `${process.env.UPLOAD_PATH}/${imgRecord}`;
  }

  const book = await Book.findById(req.params.id);

  if (!book) {
    // Make sure this image exist already?
    if (readFileFromOldPath(imagPath)) {
      removeAvatar(imagPath);
    }

    return next(new errorResponse(`No book with id of ${req.params.id}`, 404));
  }

  // Make sure the user role is an admin or publisher owner
  if (
    req.user.role !== process.env.ADMIN_USER &&
    req.user._id.toString() !== book.user.toString()
  ) {
    // Make sure this image exist already?
    if (readFileFromOldPath(imagPath)) {
      removeAvatar(imagPath);
    }

    return next(
      new errorResponse(
        `User id: ${req.user._id} can not update this book product`,
        403
      )
    );
  }

  // Remove old image from path for update
  const oldImagePath = `${process.env.UPLOAD_PATH}/${book.image}`;
  if (readFileFromOldPath(oldImagePath)) {
    removeAvatar(oldImagePath);
  }

  book.title = req.body.title ? req.body.title : book.title;
  book.description = req.body.description
    ? req.body.description
    : book.description;
  book.instock = req.body.instock ? req.body.instock : book.instock;
  book.price = req.body.price ? req.body.price : book.price;
  book.category = req.body.category ? req.body.category : book.category;
  book.user = req.body.user ? req.body.user : req.user._id;
  book.image = imgRecord ? imgRecord : "no-pic.png";

  // Updating new book product
  await book.save();

  res.status(200).json({
    success: true,
    data: { book },
  });
});

// @desc    Deleted book product
// @route   DELETE /api/v2/books/:id
// @access  Private
exports.deletedBook = asyncHandler(async (req, res, next) => {
  // Finding this product with id
  const productOwner = await Book.findById(req.params.id);
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
        `User id: ${req.user._id} can not delete this book product`,
        403
      )
    );
  }

  await Book.deleteOne({ _id: req.params.id });

  // Remove image for this book id
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
// @route   GET /api/v2/books/:id
// @access  Private
exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id)
    .populate({ path: "category", select: "title description" })
    .populate("user", "name email role avatar");

  if (!book) {
    return next(
      new errorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: { book },
  });
});

// @desc    Get products with query string
// @route   GET /api/v2/books?query-string
//              /api/v2/books/?select=title,description,price,instock,image,user,category -
//              &page=1&limit=9&sort=title&price[gte]=99
// @access  Private
exports.getBooks = asyncHandler(async (req, res, next) => {
  if (!req.params.bookCategoryId) {
    res.status(200).json(res.advancedResults);
  }
});
