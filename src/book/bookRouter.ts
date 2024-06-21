import express from "express";
import {
  createBook,
  deleteBook,
  getOneBook,
  listBooks,
  updateBookContent,
  updateBookMetaData,
} from "./bookController";
import multer from "multer";
import path from "node:path";
import authenticate from "../middleware/authenticate";

const bookRouter = express.Router();
const maxSize = 10485760;
const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  limits: { fileSize: maxSize },
});

bookRouter.post(
  "/upload",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  authenticate,
  createBook
);
bookRouter.patch("/update/meta/:id", authenticate, updateBookMetaData);

bookRouter.patch(
  "/update/content/:id",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  authenticate,
  updateBookContent
);

bookRouter.get("/list", listBooks);

bookRouter.get("/book/:bookId", authenticate, getOneBook);
bookRouter.delete("/delete/:id", authenticate, deleteBook);

export default bookRouter;
