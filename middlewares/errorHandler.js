const errorHandler = async (err, req, res, next) => {
  const error = { ...err };
  // Console error
  // console.log(err.name);
  // console.log(err.message);
  console.error(err);

  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Mongo duplicate resource
  if (err.code === 11000) {
    error.message = "Duplicate entered field value";
    error.statusCode = 400;
  }

  // Mongo bad request ID
  if (err.name === "CastError") {
    error.message = "Resource not found";
    error.statusCode = 404;
  }

  // File Long size
  if (err.code === "LIMIT_FILE_SIZE") {
    error.message = "File size over 1.5Mb";
    error.statusCode = 400;
  }

  res.status(error.statusCode).json({
    success: false,
    data: {
      message: error.message || "Server error",
    },
  });
};

module.exports = errorHandler;
