import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
        index: true // Added for faster query performance
    },
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
        required: true, // Fixed typo: changed 'recquired' to 'required'
        index: true
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
    // REPLACED: Single string 'notes' with an array of structured blocks
    // This allows you to render Headings, Tips, Lists, and Paragraphs uniquely
    content: [{
        type: { 
            type: String, 
            enum: ['paragraph', 'heading', 'tip', 'definition', 'list'],
            required: true 
        },
        text: { type: String, required: true }
    }],
    image: {
        public_id: String,
        url: String
    },
    video: {
        public_id: String,
        url: String
    }
}, { timestamps: true });

// Ensure fast search for topics by title
topicSchema.index({ title: "text" });

const Topic = mongoose.model("Topic", topicSchema);
export default Topic;