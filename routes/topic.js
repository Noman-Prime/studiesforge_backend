import express from "express"
import multer from "multer"
import { allTopicsBySubjectWise, createTopic, deleteTopic, getAllTopics, getTopic, SSE_Stream, subjectTopic, updateTopic } from "../controller/topic.js"
const topicRouter = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

topicRouter.post("/create", upload.fields([{ name: "image" }, { name: "video" }]), createTopic)
topicRouter.put("/update/:id", upload.single("image"), upload.single("video"), updateTopic)
topicRouter.delete("/delete/:id", deleteTopic)
topicRouter.get("/all", getAllTopics)
topicRouter.get("/subject/:subjectId", subjectTopic)
topicRouter.get("/by_subject", allTopicsBySubjectWise)
topicRouter.get("/get/:id", getTopic)
topicRouter.get("/stream", SSE_Stream)

export default topicRouter

{/*
    http://localhost:5000/api/v1/topic/create
    http://localhost:5000/api/v1/topic/update/:id
    http://localhost:5000/api/v1/topic/delete/:id
    http://localhost:5000/api/v1/topic/all
    http://localhost:5000/api/v1/topic/by_subject
    http://localhost:5000/api/v1/topic/subject/:subjectId
    http://localhost:5000/api/v1/topic/get/:id
    http://localhost:5000/api/v1/topic/stream  -->SSE-live-Stream
     
*/}