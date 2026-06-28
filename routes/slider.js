import express from "express"
import multer from "multer"
import { allSiders, createSlider, deleteSlider, getSlider, SSE_Stream, updateSlider } from "../controller/slider.js"

const sliderRouter = express.Router()
const upload = multer({ storage: multer.memoryStorage() })
sliderRouter.post("/create", upload.single("image"), createSlider)
sliderRouter.put("/update/:id", upload.single("image"), updateSlider)
sliderRouter.delete("/delete/:id", deleteSlider)
sliderRouter.get("/get/all", allSiders)
sliderRouter.get("/get/:id", getSlider)
sliderRouter.get("/stream", SSE_Stream)


export default sliderRouter

{/*
    http://localhost:5000/api/v1/slider/create
    http://localhost:5000/api/v1/slider/update/:id
    http://localhost:5000/api/v1/slider/delete/:id
    http://localhost:5000/api/v1/slider/get/:id
    http://localhost:5000/api/v1/slider/get/all
    http://localhost:5000/api/v1/slider/stream     ----> SSE-Live-Stream




    http://localhost:5000/api/v1/slidercreate
    */}