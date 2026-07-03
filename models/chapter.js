import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema({
    subject:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "subject",
        recquired: true
    },
    number: {
        type: String,
        recquired: true
    },
    title: {
        type: String,
        recquired: true
    }
},{timestamps: true})

const chapter = mongoose.model("Chapter", chapterSchema)
export default chapter