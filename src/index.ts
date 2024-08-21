import "./db/connect";
import express from "express";
import authRouter from "./routes/auth";

// defining port
const port = process.env.PORT || 8000;

// creating app
const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
app.use("/auth", authRouter);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
