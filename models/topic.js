import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
    subject:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
        recquired: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    image: {
        public_id: String,
        url: String
    },
    video: {
        public_id: String,
        url: String
    },

},{timestamps: true})

const topic = mongoose.model("Topic", topicSchema)
export default topic