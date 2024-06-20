import { NextFunction, request, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import createHttpError from "http-errors";

export interface AuthRequest extends Request {
  userId: string;
  imageUrl?: string;
  bookUrl?: string;
}
const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsedToken = req.headers.authorization;
  if (!parsedToken) {
    return next(createHttpError(401, "Please sign up"));
  }
  const token = parsedToken.split(" ")[1];
  try {
    const decodeed = await jwt.verify(token, config.jwtSecret as string);
    const _req = req as AuthRequest;
    _req.userId = decodeed.sub as string;
    next();
  } catch (error) {
    return next(createHttpError(401, "Token expired!"));
  }
};
export default authenticate;
