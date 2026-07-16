import express from "express";
import multer from "multer";
import {createTopic,updateTopic,deleteTopic,getTopic,SSE_Stream,chapterTopics} from "../controller/topic.js";
import { isAuthenticated } from "../utils/auth.js";

const topicRouter = express.Router();
const upload = multer({storage: multer.memoryStorage()});
topicRouter.post("/create",isAuthenticated,upload.fields([{ name: "image", maxCount: 1 },{ name: "video", maxCount: 1 }]),createTopic);
topicRouter.put("/update/:id",isAuthenticated, upload.fields([{ name: "image", maxCount: 1 },{ name: "video", maxCount: 1 }]),updateTopic);
topicRouter.delete("/delete/:id", isAuthenticated, deleteTopic);
topicRouter.get("/get/:id", getTopic);
topicRouter.get("/chapter/:id", isAuthenticated, chapterTopics);
topicRouter.get("/stream", SSE_Stream);

export default topicRouter;

{/*
    http://localhost:5000/api/v1/topic/create
    http://localhost:5000/api/v1/topic/update/:id
    http://localhost:5000/api/v1/topic/delete/:id
    http://localhost:5000/api/v1/topic/get/:id
    http://localhost:5000/api/v1/topic/stream 
    http://localhost:5000/api/v1/topic/chapter/:id
     
*/}