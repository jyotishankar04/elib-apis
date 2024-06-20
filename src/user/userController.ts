import { NextFunction, Request, Response } from "express";
import { signUpValidate } from "../utils/zod";
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
      res.json({ accessToken: token, message: "User created Successfully" });
    }
  } catch (error) {
    return next(createHttpError(500, "Error while creating user"));
  }

  // Responce
};

export { createUser };
