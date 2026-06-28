import express from "express"
import multer from "multer"
import { createSubject, deleteSubject, getAllSubjects, getSubject, SSE_Stream, updateSubject } from "../controller/subject.js"
const subjectRouter = express.Router()

const upload = multer({ storage: multer.memoryStorage() })
subjectRouter.post("/create", upload.single("image"), createSubject)
subjectRouter.put("/update/:id", upload.single("image"), updateSubject)
subjectRouter.delete("/delete/:id", deleteSubject)
subjectRouter.get("/all", getAllSubjects)
subjectRouter.get("/get/:id", getSubject)
subjectRouter.get("/stream", SSE_Stream)

export default subjectRouter

{/*
    http://localhost:5000/api/v1/subject/create
    http://localhost:5000/api/v1/subject/update/:id
    http://localhost:5000/api/v1/subject/delete/:id
    http://localhost:5000/api/v1/subject/all
    http://localhost:5000/api/v1/subject/get/:id 
    http://localhost:5000/api/v1/subject/stream    -->SSE-live-stream
*/}