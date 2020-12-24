const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        "Please add a valid type of email",
      ],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    avatar: {
      type: String,
      default: "nopic.png",
    },
    role: {
      type: String,
      enum: ["user", "publisher", "admin"],
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hashed password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Check entered password with db
userSchema.methods.matchPassword = async function (encteredPwd) {
  return await bcrypt.compare(encteredPwd, this.password);
};

// Sign JWT
userSchema.methods.getSignJwtToken = function () {
  const secretKey = process.env.JWT_SECRET;

  return jwt.sign({ id: this._id }, secretKey, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and save to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expired to resetPasswordExpire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minute

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
