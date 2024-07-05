import { NextFunction, Request, Response } from "express";
import { loginValidate, signUpValidate } from "../utils/zod";
import createHttpError from "http-errors";
import User from "./userDataModel";
import bcrypt from "bcrypt";
import userDataModel from "./userDataModel";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { AuthRequest } from "../middleware/authenticate";
import bookDataModel from "../book/bookDataModel";
import { Book } from "../book/bookTypes";
import path from "node:path";
import cloudinary from "../config/cloudinary";
import fs from "node:fs";
import { date } from "zod";
const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  // Validation

  const validation = signUpValidate.safeParse({ name, email, password });
  if (!validation.success) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }
  //check if the user exists
  const isExists = await userDataModel.findOne({ email });
  if (isExists) {
    const error = createHttpError(400, "user already exist with this email");
    return next(error);
  }

  // Hashing the password
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userDataModel.create({
      name,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
        expiresIn: "7d",
      });
      return res
        .status(201)
        .json({ accessToken: token, message: "User created Successfully" });
    }
  } catch (error) {
    return next(createHttpError(500, "Error while creating user"));
  }

  // Responce
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  // console.log(email, password);

  const { success } = loginValidate.safeParse({ email, password });
  if (!success) {
    return next(createHttpError(400, "Validation error"));
  }
  let user;
  try {
    user = await userDataModel.findOne({ email });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
  } catch (error) {
    return next(createHttpError(500, "Internal server error"));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(createHttpError(400, "Username and password incorrect"));
  }

  // create a new access
  try {
    if (user) {
      const token = sign({ sub: user._id }, config.jwtSecret as string, {
        expiresIn: "7d",
      });
      return res
        .status(201)
        .json({ accessToken: token, message: "User login successfully" });
    }
  } catch (error) {
    return next(createHttpError(500, "Error while logging in"));
  }
  res.json({ message: "Done" });
};

const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const _req = req as AuthRequest;
  const userId = _req.userId;
  try {
    const userData = await userDataModel.findById(userId);

    if (!userData) {
      return next(createHttpError(404, "User not found"));
    }

    const publishedBooks = await bookDataModel
      .find(
        {
          uploadedBy: userId,
        },
        "title coverImage file description createdAt updatedAt genre "
      )
      .populate("uploadedBy", "_id name");
    const wishlistBooks = await bookDataModel
      .find(
        {
          _id: { $in: userData.wishlist },
        },
        "title author coverImage file description createdAt updatedAt genre"
      )
      .populate("uploadedBy", "_id name");

    let publishedBook: Book[];
    if (!publishedBooks) {
      publishedBook = [];
    } else {
      publishedBook = publishedBooks;
    }
    const user = {
      name: userData.name,
      email: userData.email,
      createdAt: userData.createdAt,
      profileImage: userData.profileImage,
      bio: userData.bio,
      instagramUrl: userData.instagramUrl,
      linkedinUrl: userData.linkedinUrl,
      twitterUrl: userData.twitterUrl,
      wishlist: wishlistBooks,
      wishlistArray: userData.wishlist,
      publishedBooks: publishedBook,
    };
    return res.status(200).json({
      user,
    });
  } catch (error) {
    return createHttpError(400, "Error in fetching user");
  }
};

const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.id;
  try {
    const userData = await userDataModel.findById(userId);
    if (!userData) {
      return next(createHttpError(404, "User not found"));
    }
    const publishedBooks = await bookDataModel
      .find(
        {
          uploadedBy: userId,
        },
        "title coverImage file description createdAt updatedAt genre "
      )
      .populate("uploadedBy", "_id name");

    // console.log(userData);

    let publishedBook: Book[];
    if (!publishedBooks) {
      publishedBook = [];
    } else {
      publishedBook = publishedBooks;
    }
    const user = {
      name: userData.name,
      email: userData.email,
      createdAt: userData.createdAt,
      profileImage: userData.profileImage,
      bio: userData.bio,
      instagramUrl: userData.instagramUrl,
      linkedinUrl: userData.linkedinUrl,
      twitterUrl: userData.twitterUrl,
      wishlist: userData.wishlist,
      publishedBooks: publishedBook,
    };
    return res.status(200).json({
      user,
    });
  } catch (error) {}
};

const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const _req = req as AuthRequest;
  const userId = _req.userId;
  const { oldPassword, newPassword } = req.body;

  try {
    const userData = await userDataModel.findById(userId);
    if (!userData) {
      return next(createHttpError(404, "User not found"));
    }
    const isMatch = await bcrypt.compare(oldPassword, userData.password);
    if (!isMatch) {
      return next(createHttpError(400, "Old password is incorrect"));
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userDataModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });
    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    return next(createHttpError(500, "Error while changing password"));
  }
};

const profilePicUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const file = req.files as { [filename: string]: Express.Multer.File[] };
  const _req = req as AuthRequest;
  const userId = _req.userId;
  if (!file) {
    return next(createHttpError(400, "No file uploaded"));
  }
  const isEsists = await userDataModel.findOne({ _id: userId });
  if (!isEsists) {
    return next(createHttpError(404, "User not found"));
  }
  const profileImageMynetype = file.profileImage[0].mimetype.split("/").at(-1);
  const fileName = file.profileImage[0].filename;
  const filePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    fileName
  );
  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "user-profile-images",
      format: profileImageMynetype,
    });
    const userUpdate = await userDataModel.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        profileImage: uploadResult.secure_url,
      }
    );
    if (!userUpdate) {
      return next(createHttpError(404, "Error while uploading Picture"));
    }
    if (isEsists.profileImage != "") {
      const imageSplits = isEsists.profileImage.split("/");
      const coverId = imageSplits?.slice(-2).join("/").split(".")[0];
      try {
        await cloudinary.uploader.destroy(coverId);
      } catch (error) {
        console.log(error);
      }
    }
    const user = await userDataModel.findOne(
      { _id: userId },
      "name email instagramUrl twitterUrl linkedinUrl bio profileImage wishlist"
    );
    return res
      .status(201)
      .json({ message: "Successfully uploaded picture", user: user });
  } catch (error) {
    return next(createHttpError(500, "Error while uploading"));
  } finally {
    try {
      // const pathh = path.resolve(__dirname, "../../public/data/uploads");

      await fs.promises.unlink(filePath);
    } catch (cleanupError) {
      return console.error("Error during cleanup", cleanupError);
    }
  }
};

const profileDataUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const _req = req as AuthRequest;
  const userId = _req.userId;

  const isEsists = await userDataModel.findOne({ _id: userId });
  if (!isEsists) {
    return next(createHttpError(404, "User not found"));
  }
  let { name, email, bio, instagramUrl, linkedinUrl, twitterUrl, date } =
    req.body;
  if (!name) {
    name = isEsists.name;
  }
  if (!email) {
    email = isEsists.email;
  }
  if (!bio) {
    bio = isEsists.bio;
  }
  if (!instagramUrl) {
    instagramUrl = isEsists.instagramUrl;
  }
  if (!linkedinUrl) {
    linkedinUrl = isEsists.linkedinUrl;
  }
  if (!twitterUrl) {
    twitterUrl = isEsists.twitterUrl;
  }

  if (!date) {
    date = isEsists.dob;
  }
  const result = await userDataModel.findOneAndUpdate(
    { _id: userId },
    { name, email, bio, linkedinUrl, twitterUrl, instagramUrl, dob: date }
  );
  if (!result) {
    return next(createHttpError(401, "Error in updating"));
  }
  const user = await userDataModel.findOne(
    { _id: userId },
    "name email instagramUrl twitterUrl linkedinUrl bio profileImage wishlist createdAt updatedAt "
  );
  return res.status(200).json({
    user: user,
  });
};

const isValidateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const _req = req as AuthRequest;
  const userId = _req.userId;
  const responce = await userDataModel.findOne({ _id: userId });
  if (!responce) {
    return next(createHttpError(404, "User not found"));
  }
  return res.json({
    message: "Validation Success",
  });
};
export {
  createUser,
  loginUser,
  getMyProfile,
  changePassword,
  profileDataUpdate,
  profilePicUpdate,
  isValidateUser,
  getUserProfile,
};
