const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is require"],
    },
    description: {
      type: String,
      required: [true, "Description is require"],
    },
    image: {
      type: String,
      default: "no-pic.png",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// categorySchema.virtual("books", {
//   ref: "Book",
//   localField: "_id",
//   foreignField: "category",
// });

module.exports = mongoose.model("Category", categorySchema);
