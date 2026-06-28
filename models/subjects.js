import mongoose from "mongoose";

const subjectSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image :{
        public_id: String,
        url: String
    }
},{timestamps: true})

const subject = mongoose.model("Subject", subjectSchema)
export default subject