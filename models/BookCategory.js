const mongoose = require("mongoose");

const bookCatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is require"],
    },
    description: {
      type: String,
      required: [true, "Description is require"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Cascade delete books when a book category is deleted
bookCatSchema.pre("remove", async function (next) {
  console.log("Remove book category...");

  // await this.model("Book").deleteMany({ bookCategory: this._id });
  next();
});

// Reverse populate with virtuals
bookCatSchema.virtual("books", {
  ref: "Book", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "bookCategory", // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false,
});

module.exports = mongoose.model("BookCategory", bookCatSchema);
