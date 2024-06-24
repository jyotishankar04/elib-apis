import mongoose, { model } from "mongoose";
import { User } from "./userTypes";

const userSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default:
        "https://i.ibb.co/ZdcQQzK/blue-circle-with-white-user-78370-4707.jpg",
    },
    bio: { type: String, optional: true },
    instagramUrl: { type: String, optional: true },
    linkedinUrl: { type: String, optional: true },
    twitterUrl: { type: String, optional: true },
    wishlist: { type: [String], optional: true },
    dob: { type: String, optional: true },
  },
  { timestamps: true }
);

export default mongoose.model<User>("User", userSchema);
