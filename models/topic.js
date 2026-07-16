import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
    headers: {
        type: [String],
        default: []
    },
    rows: {
        type: [[String]],
        default: []
    }
}, { _id: false });

const sectionSchema = new mongoose.Schema({
    heading: {
        type: String,
        required: true,
        trim: true
    },
    subHeading: {
        type: String,
        trim: true,
        default: ""
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    list: {
        type: [String],
        default: []
    },
    table: {
        type: tableSchema,
        default: () => ({})
    },
    tip: {
        type: String,
        trim: true,
        default: ""
    },
    important: {
        type: String,
        trim: true,
        default: ""
    },
    note: {
        type: String,
        trim: true,
        default: ""
    },
    image: {
        public_id: {
            type: String,
            default: ""
        },
        url: {
            type: String,
            default: ""
        },
        caption: {
            type: String,
            default: ""
        }
    }
}, { _id: false });

const topicSchema = new mongoose.Schema({
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
        index: true
    },
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    shortDescription: {
        type: String,
        required: true,
        trim: true
    },
    sections: {
        type: [sectionSchema],
        required: true,
        default: []
    },
    summary: {
        type: String,
        trim: true,
        default: ""
    },
    keyPoints: {
        type: [String],
        default: []
    },
    image: {
        public_id: {
            type: String,
            default: ""
        },
        url: {
            type: String,
            default: ""
        }
    },
    video: {
        public_id: {
            type: String,
            default: ""
        },
        url: {
            type: String,
            default: ""
        }
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

topicSchema.index({ title: "text", shortDescription: "text" });

const Topic = mongoose.model("Topic", topicSchema);

export default Topic;