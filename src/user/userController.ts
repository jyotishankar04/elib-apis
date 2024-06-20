import { NextFunction, Request, Response } from "express";
import { signUpValidate } from "../utils/zod";
import createHttpError from "http-errors";
import User from "./userDataModel";
import bcrypt from "bcrypt";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  // Validation
  const validation = signUpValidate.safeParse({ name, email, password });
  if (!validation.success) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }
  //check if the user exists
  const isExists = await User.findOne({ email });
  if (isExists) {
    const error = createHttpError(400, "user already exist with this email");
    return next(error);
  }
  // Hashing the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Responce

  res.json({ message: "User created" });
};

export { createUser };
