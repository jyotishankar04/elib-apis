import { NextFunction, Request, Response } from "express";
import { signUpValidate } from "../utils/zod";
import createHttpError from "http-errors";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  // Validation
  const validation = signUpValidate.safeParse({ name, email, password });
  if (!validation.success) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }
  // Process

  // Responce
  res.json({ message: "User created" });
};

export { createUser };
