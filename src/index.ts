import "express-async-errors";
import "./db/connect";
import express from "express";
import authRouter from "./routes/auth.router";
import { errorHandler } from "./middlewares/error";
import cookieParser from "cookie-parser";
import { fileParser } from "./middlewares/file";
import authorRouter from "./routes/author.router";
import bookRouter from "./routes/book.route";
import path from "path";
import reviewRouter from "./routes/review.router";
import historyRouter from "./routes/history.router";

// defining port
const port = process.env.PORT || 8000;

// creating app
const app = express();

const publicPath = path.join(__dirname, "./books");
// console.log(publicPath);

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/books", express.static(publicPath));

//routes
app.use("/auth", authRouter);
app.use("/author", authorRouter);
app.use("/book", bookRouter);
app.use("/review", reviewRouter);
app.use("/router", historyRouter);

app.post("/test", fileParser, (req, res) => {
  // console.log(req.body);
  console.log(req.files);
  res.json({});
});

// middleware to handle errors
app.use(errorHandler);
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
