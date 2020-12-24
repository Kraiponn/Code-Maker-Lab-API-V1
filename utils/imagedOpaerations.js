const fs = require("fs");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

exports.uploads = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1500000,
  },
});

/*****************************************
 * Remove image from api
 */
exports.removeAvatar = (imgFilePath) => {
  fs.unlink(imgFilePath, (err) => {
    if (err) {
      console.log("Remove image fail:", err);
      return null;
    }

    return "Image removed successfully";
  });
};

/****************************
 * Read file from path
 */
exports.readFileFromOldPath = (filePath) => {
  const result = path.basename(filePath);
  // console.log("Read file result:", result);

  return result;
};

// module.exports = { removeAvatar, readFileFromOldPath, uploads };
