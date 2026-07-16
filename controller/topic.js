import topic from "../models/topic.js";
import mcqs from "../models/mcqs.js";

export const createTopic = async (req, res) => {
    try {
        const {
            subject,
            chapter,
            title,
            isPublished
        } = req.body;

        if (!subject || !chapter || !title) {
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

        let content = [];

        if (req.body.content) {
            content =
                typeof req.body.content === "string"
                    ? JSON.parse(req.body.content)
                    : req.body.content;
        }

        const createdTopic = await topic.create({
            subject,
            chapter,
            title,
            image,
            video,
            content,
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

        if (req.body.content) {
            updateData.content =
                typeof req.body.content === "string"
                    ? JSON.parse(req.body.content)
                    : req.body.content;
        }

        if (req.body.isPublished !== undefined) {
            updateData.isPublished =
                req.body.isPublished === "true" ||
                req.body.isPublished === true;
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

        const updatedTopic = await topic.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate([
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
                message: "Delete all MCQs under this topic before deleting it."
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

export const getTopic = async (req, res) => {
    try {

        const { id } = req.params;

        const foundTopic = await topic
            .findByIdAndUpdate(
                id,
                {
                    $inc: {
                        views: 1
                    }
                },
                {
                    new: true
                }
            )
            .populate("subject")
            .populate("chapter");

        if (!foundTopic) {
            return res.status(404).json({
                success: false,
                message: "Topic not found."
            });
        }

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

export const chapterTopics = async (req, res) => {
    try {
        const { id } = req.params;

        const topics = await topic
            .find({ chapter: id })
            .sort({ title: 1 });

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
                        topics,
                        length: topics.length
                    })}\n\n`
                );

            } catch (error) {

                res.write(
                    `data: ${JSON.stringify({
                        success: false,
                        message: "Failed to fetch topics."
                    })}\n\n`
                );

            }
        });

        req.on("close", async () => {
            await changeStream.close();
            res.end();
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
            issue: error.message
        });

    }
};