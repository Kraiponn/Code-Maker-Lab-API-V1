const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Protect route
exports.isAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    // console.log(`Token: ${token}`);
  }

  // Make sure token exists
  if (!token) {
    return next(
      new ErrorResponse(
        `Not authorized to access this route. Or token expire`,
        403
      )
    );
  }

  try {
    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    return next(
      new ErrorResponse(
        `Not authorized to access this route. Or token is expire`,
        403
      )
    );
  }
});

//
exports.isRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};
