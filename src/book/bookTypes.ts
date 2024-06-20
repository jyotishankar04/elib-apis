import { User } from "../user/userTypes";

export interface Book {
  _id: string;
  title: string;
  author: string;
  uploadedBy: User;
  genre: string;
  coverImage: string;
  file: string;
  createdAt: Date;
  updatedAt: Date;
}
