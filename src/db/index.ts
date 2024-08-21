import mongoose from "mongoose";
import "dotenv/config";

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("Database uri is missing");
}

export const dbConnect = () => {
  mongoose
    .connect(uri)
    .then(() => {
      console.log("DB connected!");
    })
    .catch((error) => {
      console.log("DB connection failed", error.message);
    });
};
