import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./db.js";
import sliderRouter from "./routes/slider.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import subjectRouter from "./routes/subject.js";
import topicRouter from "./routes/topic.js";
import mcqsRouter from "./routes/mcqs.js";
import chapterRouter from "./routes/chapter.js";
import userRouter from "./routes/user.js";

const app = express();

// 1. MANDATORY for Vercel/Production to handle secure cookies
app.set('trust proxy', 1);

// 2. Updated CORS for production
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://studiesforge.com",
    "https://www.studiesforge.com",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// 3. Removed duplicate cookieParser (only call it once)
app.use(cookieParser());

// Routes
app.use("/api/v1/slider", sliderRouter);
app.use("/api/v1/subject", subjectRouter);
app.use("/api/v1/topic", topicRouter);
app.use("/api/v1/mcqs", mcqsRouter);
app.use("/mdcat/chapter", chapterRouter);
app.use("/api/v1/user", userRouter);

const port = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
});