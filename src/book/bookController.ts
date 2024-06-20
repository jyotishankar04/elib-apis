import { NextFunction, Request, Response } from "express";

const createBook = (req: Request, res: Response, next: NextFunction) => {
  res.json({ messge: "book created" });
};

export { createBook };
