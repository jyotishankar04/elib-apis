import express from "express";
import { createUser } from "./userController";

const useRouter = express.Router();

useRouter.post("/register", createUser);

export default useRouter;
