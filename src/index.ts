import "express-async-errors";
import "./db/connect";
import express from "express";
import authRouter from "./routes/auth.router";
import { errorHandler } from "./middlewares/error";
import cookieParser from "cookie-parser";

// defining port
const port = process.env.PORT || 8000;

// creating app
const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())

//routes
app.use("/auth", authRouter);

// middleware to handle errors
app.use(errorHandler);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
