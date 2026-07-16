import topic from "../models/topic.js";
import mcqs from "../models/mcqs.js";

export const createTopic = async (req, res) => {
    try {
        let image = {
            public_id: "",
            url: ""
        };

        let video = {
            public_id: "",
            url: ""
        };

        if (req.files?.image?.length) {
            const imageData = await uploadMedia(req.files.image[0].buffer, "image");

            image = {
                public_id: imageData.public_id,
                url: imageData.url
            };
        }

        if (req.files?.video?.length) {
            const videoData = await uploadMedia(req.files.video[0].buffer, "video");

            video = {
                public_id: videoData.public_id,
                url: videoData.url
            };
        }

        const Topic = await topic.create({
            ...req.body,
            image,
            video,
            content: req.body.content
                ? JSON.parse(req.body.content)
                : []
        });

        if (!Topic) {
            return res.status(404).json({
                success: false,
                message: "Topic is not created"
            });
        }

        return res.status(201).json({
            success: true,
            topic: Topic
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            issue: error
        });
    }
};

export const updateTopic = async (req, res) => {
    try {
        const Topic = await topic.findById(req.params.id);

        if (!Topic) {
            return res.status(404).json({
                success: false,
                message: "Topic not found"
            });
        }

        const updateData = {
            ...req.body
        };

        if (req.body.content) {
            updateData.content = JSON.parse(req.body.content);
        }

        if (req.files?.image?.length) {
            if (Topic.image.public_id) {
                await deleteMedia(Topic.image.public_id);
            }

            const imageData = await uploadMedia(req.files.image[0].buffer, "image");

            updateData.image = {
                public_id: imageData.public_id,
                url: imageData.url
            };
        }

        if (req.files?.video?.length) {
            if (Topic.video.public_id) {
                await deleteMedia(Topic.video.public_id);
            }

            const videoData = await uploadMedia(req.files.video[0].buffer, "video");

            updateData.video = {
                public_id: videoData.public_id,
                url: videoData.url
            };
        }

        const updatedTopic = await topic.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            topic: updatedTopic
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            issue: error
        });
    }
};

export const deleteTopic = async (req, res) => {
    try {
        const Topic = await topic.findById(req.params.id);

        if (!Topic) {
            return res.status(404).json({
                success: false,
                message: "Topic not found"
            });
        }

        const totalMcqs = await mcqs.countDocuments({
            topic: req.params.id
        });

        if (totalMcqs > 0) {
            return res.status(400).json({
                success: false,
                message: "Delete all MCQs under this topic first"
            });
        }

        if (Topic.image.public_id) {
            await deleteMedia(Topic.image.public_id);
        }

        if (Topic.video.public_id) {
            await deleteMedia(Topic.video.public_id);
        }

        await topic.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Topic deleted successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            issue: error
        });
    }
};

export const getTopic = async (req, res) => {
    try {
        const Topic = await topic.findByIdAndUpdate(
            req.params.id,
            {
                $inc: {
                    views: 1
                }
            },
            {
                new: true
            }
        );

        if (!Topic) {
            return res.status(404).json({
                success: false,
                message: "Topic not found"
            });
        }

        return res.status(200).json({
            success: true,
            topic: Topic
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            issue: error
        });
    }
};

export const chapterTopics = async (req, res) => {
    try {
        const Topics = await topic.find({
            chapter: req.params.id
        }).sort({
            title: 1
        });

        return res.status(200).json({
            success: true,
            topics: Topics
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            issue: error
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