import mongoose from "mongoose";

const mcqSchema = new mongoose.Schema(
    {
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true
        },

        topic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Topic",
            required: true
        },
        statement: {
            type: String,
            required: true,
            trim: true
        },
        options: [
            {
                id: {
                    type: String,
                    required: true
                },
                text: {
                    type: String,
                    required: true,
                    trim: true
                }
            }
        ],
        correctOption: {
            type: String,
            required: true,
            trim: true
        },
        reason: {
            type: String,
            required: true,
            trim: true
        },

    }, { timestamps: true });

const mcqs = mongoose.model("MCQ", mcqSchema);
export default mcqs