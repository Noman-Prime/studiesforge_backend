import express from "express"
import { createMCQS, deletetMCQS, getAllMCQS, getMCQS, getMCQSBySubject, getMCQSByTopic, SSE_Stream, updateMCQS } from "../controller/mcqs.js"
const mcqsRouter = express.Router()

mcqsRouter.post("/create", createMCQS)
mcqsRouter.put("/update/:id", updateMCQS)
mcqsRouter.delete("/delete/:id", deletetMCQS)
mcqsRouter.get("/get/all", getAllMCQS)
mcqsRouter.get("/get/:id", getMCQS)
mcqsRouter.get("/topic/:id", getMCQSByTopic)
mcqsRouter.get("/subject/:subjectId", getMCQSBySubject)
mcqsRouter.get("/stream", SSE_Stream)

export default mcqsRouter


// http://localhost:5000/api/v1/mcqs/stream   --> SSE-live--Stream
// http://localhost:5000/api/v1/mcqs/topic/:id  ---> topic wise mcqs
// http://localhost:5000/api/v1/mcqs/subject/:id  ---> topic wise mcqs
// http://localhost:5000/api/v1/mcqs/create
// http://localhost:5000/api/v1/mcqs/delete/:id
// http://localhost:5000/api/v1/mcqs/get/:id