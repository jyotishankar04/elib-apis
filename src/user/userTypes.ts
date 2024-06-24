import { Book } from "../book/bookTypes";

export interface User {
  name: string;
  email: string;
  password: string;
  _id: string;
  profileImage: string;
  wishlist: Book[];
  bio?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  dob: string;
}
