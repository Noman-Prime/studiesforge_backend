import subject from "../models/subjects.js";
import topic from "../models/topic.js";
import mcqs from "../models/mcqs.js";
import { deleteMedia, uploadMedia } from "../utils/cloudinary.js";

const parseJSON = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value === "object") return value;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

export const createTopic = async (req, res) => {
    try {
        const {
            subject: subjectId,
            chapter,
            title,
            shortDescription,
            summary,
            isPublished
        } = req.body;

        if (!subjectId || !chapter || !title || !shortDescription) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        let image = {
            public_id: "",
            url: ""
        };

        let video = {
            public_id: "",
            url: ""
        };

        if (req.files?.image?.length) {
            const uploadedImage = await uploadMedia(req.files.image[0].buffer, "image");

            image = {
                public_id: uploadedImage.public_id,
                url: uploadedImage.url
            };
        }

        if (req.files?.video?.length) {
            const uploadedVideo = await uploadMedia(req.files.video[0].buffer, "video");

            video = {
                public_id: uploadedVideo.public_id,
                url: uploadedVideo.url
            };
        }

        const sections = parseJSON(req.body.sections, []);
        const keyPoints = parseJSON(req.body.keyPoints, []);

        const createdTopic = await topic.create({
            subject: subjectId,
            chapter,
            title,
            shortDescription,
            sections,
            summary,
            keyPoints,
            image,
            video,
            isPublished:
                isPublished === undefined
                    ? true
                    : isPublished === "true" || isPublished === true
        });

        await createdTopic.populate([
            {
                path: "subject"
            },
            {
                path: "chapter"
            }
        ]);

        return res.status(201).json({
            success: true,
            message: "Topic created successfully.",
            topic: createdTopic
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
            issue: error.message
        });
    }
};

export const updateTopic = async (req, res) => {
    try {
        const { id } = req.params;

        const existingTopic = await topic.findById(id);

        if (!existingTopic) {
            return res.status(404).json({
                success: false,
                message: "Topic not found."
            });
        }

        const updateData = {};

        if (req.body.subject) updateData.subject = req.body.subject;
        if (req.body.chapter) updateData.chapter = req.body.chapter;
        if (req.body.title) updateData.title = req.body.title;
        if (req.body.shortDescription)
            updateData.shortDescription = req.body.shortDescription;

        if (req.body.summary !== undefined)
            updateData.summary = req.body.summary;

        if (req.body.isPublished !== undefined) {
            updateData.isPublished =
                req.body.isPublished === "true" ||
                req.body.isPublished === true;
        }

        if (req.body.sections) {
            updateData.sections = parseJSON(req.body.sections, []);
        }

        if (req.body.keyPoints) {
            updateData.keyPoints = parseJSON(req.body.keyPoints, []);
        }

        if (req.files?.image?.length) {
            if (existingTopic.image?.public_id) {
                await deleteMedia(existingTopic.image.public_id);
            }

            const uploadedImage = await uploadMedia(
                req.files.image[0].buffer,
                "image"
            );

            updateData.image = {
                public_id: uploadedImage.public_id,
                url: uploadedImage.url
            };
        }

        if (req.files?.video?.length) {
            if (existingTopic.video?.public_id) {
                await deleteMedia(existingTopic.video.public_id);
            }

            const uploadedVideo = await uploadMedia(
                req.files.video[0].buffer,
                "video"
            );

            updateData.video = {
                public_id: uploadedVideo.public_id,
                url: uploadedVideo.url
            };
        }

        const updatedTopic = await topic
            .findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true
            })
            .populate([
                {
                    path: "subject"
                },
                {
                    path: "chapter"
                }
            ]);

        return res.status(200).json({
            success: true,
            message: "Topic updated successfully.",
            topic: updatedTopic
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
            issue: error.message
        });
    }
};
export const deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;

        const existingTopic = await topic.findById(id);

        if (!existingTopic) {
            return res.status(404).json({
                success: false,
                message: "Topic not found."
            });
        }

        const totalMcqs = await mcqs.countDocuments({
            topic: id
        });

        if (totalMcqs > 0) {
            return res.status(400).json({
                success: false,
                message: `This topic contains ${totalMcqs} MCQ(s). Please delete those MCQs before deleting the topic.`
            });
        }

        if (existingTopic.image?.public_id) {
            await deleteMedia(existingTopic.image.public_id);
        }

        if (existingTopic.video?.public_id) {
            await deleteMedia(existingTopic.video.public_id);
        }

        await topic.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Topic deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
            issue: error.message
        });
    }
};

export const getAllTopics = async (req, res) => {
    try {

        const topics = await topic
            .find()
            .populate("subject")
            .populate("chapter")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            length: topics.length,
            topics
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
            issue: error.message
        });

    }
};

export const getTopic = async (req, res) => {
    try {

        const { id } = req.params;

        const foundTopic = await topic
            .findById(id)
            .populate("subject")
            .populate("chapter");

        if (!foundTopic) {
            return res.status(404).json({
                success: false,
                message: "Topic not found."
            });
        }

        await topic.findByIdAndUpdate(id, {
            $inc: {
                views: 1
            }
        });

        return res.status(200).json({
            success: true,
            topic: foundTopic
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
            issue: error.message
        });

    }
};
export const subjectTopic = async (req, res) => {
    try {
        const { id } = req.params;

        const topics = await topic
            .find({
                subject: id,
                isPublished: true
            })
            .populate("subject")
            .populate("chapter")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            length: topics.length,
            topics
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
            issue: error.message
        });
    }
};

export const chapterWiseTopics = async (req, res) => {
    try {
        const { id } = req.params;

        const topics = await topic
            .find({
                chapter: id,
                isPublished: true
            })
            .populate("subject")
            .populate("chapter")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            length: topics.length,
            topics
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
            issue: error.message
        });
    }
};

export const allTopicsBySubjectWise = async (req, res) => {
    try {
        const subjects = await subject.find().sort({ title: 1 });

        if (!subjects.length) {
            return res.status(404).json({
                success: false,
                message: "No subjects found."
            });
        }

        const data = await Promise.all(
            subjects.map(async (sub) => {
                const topics = await topic
                    .find({
                        subject: sub._id,
                        isPublished: true
                    })
                    .populate("chapter")
                    .sort({ createdAt: 1 });

                return {
                    subject: sub,
                    totalTopics: topics.length,
                    topics
                };
            })
        );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
            issue: error.message
        });
    }
};

export const SSE_Stream = async (req, res) => {
    try {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        res.write(
            `data: ${JSON.stringify({
                success: true,
                message: "SSE Connected"
            })}\n\n`
        );

        const changeStream = topic.watch();

        changeStream.on("change", async () => {
            try {
                const topics = await topic
                    .find()
                    .populate("subject")
                    .populate("chapter")
                    .sort({ createdAt: -1 });

                res.write(
                    `data: ${JSON.stringify({
                        success: true,
                        topics
                    })}\n\n`
                );
            } catch (error) {
                res.write(
                    `data: ${JSON.stringify({
                        success: false,
                        message: error.message
                    })}\n\n`
                );
            }
        });

        req.on("close", async () => {
            await changeStream.close();
            res.end();
        });
    } catch (error) {
        res.status(500).end();
    }
};