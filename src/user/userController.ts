import { NextFunction, Request, Response } from "express";
import { loginValidate, signUpValidate } from "../utils/zod";
import createHttpError from "http-errors";
import User from "./userDataModel";
import bcrypt from "bcrypt";
import userDataModel from "./userDataModel";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

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
      res
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
      res
        .status(201)
        .json({ accessToken: token, message: "User login successfully" });
    }
  } catch (error) {
    return next(createHttpError(500, "Error while logging in"));
  }
  res.json({ message: "Done" });
};

export { createUser, loginUser };
