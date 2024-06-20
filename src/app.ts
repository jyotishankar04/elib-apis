import express, { NextFunction, Request, Response } from "express";
import createHttpError, { HttpError } from "http-errors";
import { config } from "./config/config";
import globalErrorHandler from "../globalErrorHandler";
import useRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  throw new Error("Something wents wrong");
  const error = createHttpError(500);
  res.json({
    message: "Welcome to elib",
  });
});

app.use("/api/v1/users", useRouter);
app.use("/api/v1/books", bookRouter);

app.use(globalErrorHandler);
// Global error handler
export default app;
