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

const contentSchema = new mongoose.Schema({
    subHeading: {
        type: String,
        required: true,
        trim: true
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
    content: {
        type: [contentSchema],
        default: []
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

topicSchema.index({ title: "text" });

const Topic = mongoose.model("Topic", topicSchema);

export default Topic;