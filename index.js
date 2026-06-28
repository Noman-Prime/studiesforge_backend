import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./db.js";
import sliderRouter from "./routes/slider.js";
import cors from "cors"
import subjectRouter from "./routes/subject.js";
import topicRouter from "./routes/topic.js";
import mcqsRouter from "./routes/mcqs.js";

const app = express();
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3001", "http://localhost:3000"] ,
  credentials: true,
}))
app.use("/api/v1/slider", sliderRouter);
app.use("/api/v1/subject", subjectRouter)
app.use("/api/v1/topic", topicRouter)
app.use("/api/v1/mcqs", mcqsRouter)
const port = process.env.PORT;
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
})


