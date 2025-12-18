import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 60,
    },
    role: {
      type: String,
      required: [true, "Role / designation is required"],
      trim: true,
      maxlength: 80,
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      maxlength: 500,
    },
    image: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
  },
  { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);
