import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      //   console.log("Connected to DB successfully ");
    });
    mongoose.connection.on("error", () => {
      //   console.log("Error in connecting to");
    });
    await mongoose.connect(config.databaseUrl as string);
  } catch (error) {
    // console.log(error);
    process.exit(1);
  }
};

export default connectDB;
