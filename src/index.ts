// import "module-alias/register";
import "express-async-errors";
import "./db/connect";
import express from "express";
import authRouter from "./routes/auth.router";
import { errorHandler } from "./middlewares/error";
import cookieParser from "cookie-parser";
import { fileParser } from "./middlewares/file";
import authorRouter from "./routes/author.router";
import bookRouter from "./routes/book.router";
import path from "path";
import reviewRouter from "./routes/review.router";
import historyRouter from "./routes/history.router";
import { isAuth, isValidReadingRequest } from "./middlewares/isAuth";
import cartRouter from "./routes/cart.router";
import checkoutRouter from "./routes/checkout.route";
import webhookRouter from "./routes/webhook.router";
import orderRouter from "./routes/order.router";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import { sendErrorResponse } from "./utils/helper";
import searchRouter from "./routes/search.router";

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...", err);
  process.exit(1);
});

const checkDbConnection: express.RequestHandler = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return sendErrorResponse({
      status: 503,
      message: "Database connection failed",
      res,
    });
  }
  next();
};

// defining port
const port = process.env.PORT || 8000;

// creating app
const app = express();

const publicPath = path.join(__dirname, "./books");
// console.log(publicPath);

app.use(
  cors({
    origin: [
      "https://ebook-reactapp.vercel.app",
      "https://localhost:8000",
      "https://ebookreactapp.netlify.app",
      "https://ebookstore.samarpitnagpal.dev",
      "https://ebook.samarpitnagpal.dev",
      process.env.APP_URL!,
    ],
    credentials: true,
  })
);
//for payment
app.use("/webhook", webhookRouter);

//middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(checkDbConnection);

app.use("/books", isAuth, isValidReadingRequest, express.static(publicPath));
//routes
app.use("/auth", authRouter);
app.use("/author", authorRouter);
app.use("/book", bookRouter);
app.use("/review", reviewRouter);
app.use("/history", historyRouter);
app.use("/cart", cartRouter);
app.use("/checkout", checkoutRouter);
app.use("/order", orderRouter);
app.use("/search", searchRouter);

app.post("/test", fileParser, (req, res) => {
  // console.log(req.body);
  //  console.log(req.files);
  res.json({});
});

// middleware to handle errors
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

// Graceful shutdown
process.on("unhandledRejection", (err: Error) => {
  console.error(
    "UNHANDLED REJECTION! 💥 Shutting down...",
    err.name,
    err.message
  );
  server.close(() => {
    process.exit(1);
  });
});

// process.on("SIGTERM", () => {
//  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
//  server.close(() => {
//   console.log("💥 Process terminated!");
//   mongoose.connection.close();
//  });
// });
