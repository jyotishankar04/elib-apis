import express from "express";
import {
  changePassword,
  createUser,
  getMyProfile,
  isValidateUser,
  loginUser,
  profileDataUpdate,
  profilePicUpdate,
} from "./userController";
import authenticate from "../middleware/authenticate";
import multer from "multer";
import path from "node:path";
const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  limits: { fileSize: 10485760 },
});
const useRouter = express.Router();

useRouter.post("/register", createUser);
useRouter.post("/login", loginUser);
// useRouter.get("/user/:userId", getUserProfile);
useRouter.get("/user/profile", authenticate, getMyProfile);
useRouter.patch("/update-password", authenticate, changePassword);
useRouter.put(
  "/profile/update-image",
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  authenticate,
  profilePicUpdate
);
useRouter.put("/profile/update-data", authenticate, profileDataUpdate);

useRouter.get("/validation-check", authenticate, isValidateUser);
export default useRouter;
