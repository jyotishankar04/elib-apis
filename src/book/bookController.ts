import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import fs from "node:fs";
import bookDataModel from "./bookDataModel";
import { AuthRequest } from "../middleware/authenticate";
import { config } from "../config/config";
import { table } from "node:console";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const files = req.files as { [filename: string]: Express.Multer.File[] };
  const { title, genre, author, description } = req.body;

  const coverImageMineType = files.coverImage[0].mimetype.split("/").at(-1);
  const fileName = files.coverImage[0].filename;
  const filepath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    fileName
  );
  const bookFileName = files.file[0].filename;
  const bookPath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    bookFileName
  );

  try {
    const uploadResult = await cloudinary.uploader.upload(filepath, {
      filename_override: __filename,
      folder: "book-covers",
      format: coverImageMineType,
    });

    const bookFileUploadResult = await cloudinary.uploader.upload(bookPath, {
      resource_type: "raw",
      filename_override: bookFileName,
      folder: "bookFolder",
      format: "pdf",
    });
    const _req = req as AuthRequest;
    const userId = _req.userId;
    const newBook = await bookDataModel.create({
      title,
      author,
      genre,
      description,
      uploadedBy: userId,
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });

    if (!newBook) {
      return next(createHttpError("Error while creating book"));
    }

    res.status(201).json({ id: newBook._id });
  } catch (error) {
    return next(createHttpError(500, "Error while uploading files"));
  } finally {
    try {
      //   const pathh = path.resolve(__dirname, "../../public/data/uploads");

      await fs.promises.unlink(bookPath);
      await fs.promises.unlink(filepath);
    } catch (cleanupError) {
      console.error("Error during cleanup", cleanupError);
    }
  }
};

const updateBookMetaData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { title, genre, author, description } = req.body;
  const { id } = req.params;
  const _req = req as AuthRequest;
  const userId = _req.userId;
  const isEsists = await bookDataModel.findOne({ _id: id });
  if (!isEsists) {
    return next(createHttpError(404, "Book not found"));
  }
  if (userId != isEsists?.uploadedBy._id) {
    return next(createHttpError(401, "You cannot update others book"));
  }

  if (!title) {
    title = isEsists.title;
  }

  if (!genre) {
    genre = isEsists.genre;
  }

  if (!author) {
    author = isEsists.author;
  }

  if (!description) {
    description = isEsists.description;
  }
  try {
    const newBook = await bookDataModel.findOneAndUpdate(
      { _id: id },
      {
        title,
        author,
        genre,
        description,
        updatedAt: Date,
      }
    );

    if (!newBook) {
      return next(createHttpError("Error while creating book"));
    }

    res.status(201).json({ message: "Book updated successfully" });
  } catch (error) {
    // console.log(error);
    return next(createHttpError(500, "Error while uploading files"));
  }
};

const updateBookContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const files = req.files as { [filename: string]: Express.Multer.File[] };
  const { id } = req.params;
  const _req = req as AuthRequest;
  const userId = _req.userId;
  const isEsists = await bookDataModel.findOne({ _id: id });
  if (!isEsists) {
    return next(createHttpError(404, "Book not found"));
  }
  if (userId != isEsists?.uploadedBy._id) {
    return next(createHttpError(401, "You cannot update others book"));
  }

  const coverImageMineType = files.coverImage[0].mimetype.split("/").at(-1);
  const fileName = files.coverImage[0].filename;
  const filepath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    fileName
  );
  const bookFileName = files.file[0].filename;
  const bookPath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    bookFileName
  );

  try {
    const uploadResult = await cloudinary.uploader.upload(filepath, {
      filename_override: fileName,
      folder: "book-covers",
      format: coverImageMineType,
    });

    const bookFileUploadResult = await cloudinary.uploader.upload(bookPath, {
      resource_type: "raw",
      filename_override: bookFileName,
      folder: "bookFolder",
      format: "pdf",
    });
    const _req = req as AuthRequest;
    const userId = _req.userId;
    const newBook = await bookDataModel.updateOne(
      { _id: id },
      {
        coverImage: uploadResult.secure_url,
        file: bookFileUploadResult.secure_url,
        updatedAt: Date,
      }
    );

    if (!newBook) {
      return next(createHttpError("Error while creating book"));
    }

    const coverSplits = isEsists.coverImage.split("/");
    const fileSplits = isEsists.file.split("/");
    const coverId = coverSplits?.slice(-2).join("/").split(".")[0];
    const fileId = fileSplits?.slice(-2).join("/");

    try {
      await cloudinary.uploader.destroy(coverId);
      await cloudinary.uploader.destroy(fileId);
    } catch (error) {
      console.log(error);
    }

    res.status(201).json({ message: "Book updated successfully" });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Error while uploading files"));
  } finally {
    try {
      await fs.promises.unlink(bookPath);
      await fs.promises.unlink(filepath);
    } catch (cleanupError) {
      console.error("Error during cleanup", cleanupError);
    }
  }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  const _req = req as AuthRequest;
  const userId = _req.userId;

  const id = req.params.id;
  const isEsists = await bookDataModel.findOne({ _id: id });

  if (!isEsists) {
    return next(createHttpError(404, "Book not found"));
  }
  if (userId != isEsists?.uploadedBy._id) {
    return next(createHttpError(401, "You cannot delete others book"));
  }

  const coverSplits = isEsists.coverImage.split("/");
  const fileSplits = isEsists.file.split("/");
  const coverId = coverSplits?.slice(-2).join("/").split(".")[0];
  const fileId = fileSplits?.slice(-2).join("/");

  try {
    await cloudinary.uploader.destroy(coverId);
    await cloudinary.uploader.destroy(fileId);
  } catch (error) {
    return next(createHttpError(500, "Error while deleting files"));
  }

  try {
    await bookDataModel.findOneAndDelete({ _id: id });
  } catch (error) {
    return next(createHttpError(501, "Error while deleting book"));
  }

  res.status(200).json({
    message: "Book successfully deleted",
  });
};

//  todo update content

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const responce = await bookDataModel
      .find({})
      .populate("uploadedBy", "_id name"); // Adjust fields to populate

    if (!responce) {
      return next(createHttpError("404", "Error in fetching data"));
    }
    res.status(200).json({
      data: responce,
    });
  } catch (error) {
    return next(createHttpError("404", "Error in fetching data"));
  }
};

const getOneBook = async (req: Request, res: Response, next: NextFunction) => {
  const { bookId } = req.params;
  const _req = req as AuthRequest;
  // console.log(_req.userId);

  try {
    const responce = await bookDataModel
      .find({ _id: bookId })
      .populate("uploadedBy", "_id name"); // Adjust fields to populate

    if (!responce) {
      return next(createHttpError("404", "Error in fetching data"));
    }
    res.status(200).json({
      data: responce,
    });
  } catch (error) {
    return next(createHttpError("404", "Error in fetching data"));
  }
};

export {
  createBook,
  updateBookMetaData,
  updateBookContent,
  deleteBook,
  listBooks,
  getOneBook,
};
