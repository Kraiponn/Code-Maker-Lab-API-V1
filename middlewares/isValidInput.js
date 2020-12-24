const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const errorResponse = require("../utils/errorResponse");
const {
  readFileFromOldPath,
  removeAvatar,
} = require("../utils/imagedOpaerations");

// Convert errors object to string
const getValidationResult = (errors) => {
  return errors.map((err) => err.msg).join(", ");
};

const isValidInput = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log("Input error: ", errors.array());

    const invalidResult = getValidationResult(errors.array());

    // Make sure client attached image
    if (req.file) {
      const imgPath = `${process.env.UPLOAD_PATH}/${req.file.filename}`;
      // console.log(`Invalid validate image: ${imgPath}`);

      if (readFileFromOldPath(imgPath)) {
        removeAvatar(imgPath);
      }
    }

    return next(new errorResponse(invalidResult, 404));
  }

  next();
});

module.exports = isValidInput;
