import express from "express";
import { createBook } from "./bookController";

const bookRouter = express.Router();

bookRouter.post("/upload", createBook);
// useRouter.post("/login", loginUser);

export default bookRouter;
