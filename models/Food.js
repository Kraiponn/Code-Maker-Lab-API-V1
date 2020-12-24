const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a food title"],
    },
    description: {
      type: String,
      required: [true, "Please add a food description"],
    },
    price: {
      type: Number,
      required: [true, "Please add an unit price"],
    },
    instock: {
      type: Number,
      required: [true, "Please add an unit instock"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodCategory",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please add a rececord owner"],
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

foodSchema.virtual("vatPrice").get(function () {
  let vatPrice = this.price * 0.7 + this.price;
  return vatPrice.toFixed(2);
});

module.exports = mongoose.model("Food", foodSchema);
