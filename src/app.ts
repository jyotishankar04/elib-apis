import express, { NextFunction, Request, Response } from "express";
import createHttpError, { HttpError } from "http-errors";
import { config } from "./config/config";
import globalErrorHandler from "../globalErrorHandler";
import useRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";
import cors, { CorsOptions } from "cors";
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to elib",
  });
});
const corsOptions: CorsOptions = {
  origin: config.frontendDomain,
};
app.use(cors(corsOptions));

app.use("/api/v1/users", useRouter);
app.use("/api/v1/books", bookRouter);

app.use(globalErrorHandler);
// Global error handler
export default app;
