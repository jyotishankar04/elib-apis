import express from "express";
import {
  addToWishlist,
  createBook,
  deleteBook,
  getOneBook,
  // getWishlist,
  listBooks,
  removeFromWishlist,
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
// bookRouter.post("/book/add-wishlist", authenticate, deleteBook);
bookRouter.post("/wishlist/add", authenticate, addToWishlist);

// bookRouter.get("/wishlist", authenticate, getWishlist);

bookRouter.delete("/wishlist/remove/:bookId", authenticate, removeFromWishlist);

export default bookRouter;
