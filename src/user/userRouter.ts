import express from "express";
import { createUser, loginUser } from "./userController";

const useRouter = express.Router();

useRouter.post("/register", createUser);
useRouter.post("/login", loginUser);

export default useRouter;
