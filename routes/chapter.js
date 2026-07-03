import express from "express"
import { createChapter, deleteChapter, findChapter, subjectByChapter, updateChapter } from "../controller/chapter.js"
const chapterRouter = express.Router()

chapterRouter.post("/create", createChapter)
chapterRouter.put("/update/:id", updateChapter)
chapterRouter.get("/get/:id", findChapter)
chapterRouter.delete("/delete/:id", deleteChapter)
chapterRouter.get("/subject/:id", subjectByChapter)

export default chapterRouter

// http://localhost:5000/mdcat/chapter/create
// http://localhost:5000/mdcat/chapter/update/:id
// http://localhost:5000/mdcat/chapter/get/:id
// http://localhost:5000/mdcat/chapter/delete/:id
// http://localhost:5000/mdcat/chapter/subject/:id