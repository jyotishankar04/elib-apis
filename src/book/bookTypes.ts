import { Date } from "mongoose";
import { User } from "../user/userTypes";

export interface Book {
  _id: string;
  title: string;
  author: string;
  uploadedBy: User;
  genre: string;
  coverImage: string;
  file: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
