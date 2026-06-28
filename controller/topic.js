import subject from "../models/subjects.js";
import topic from "../models/topic.js"
import { deleteMedia, uploadMedia } from "../utils/cloudinary.js"

export const createTopic = async (req, res) => {
    try {
        let imageData = null;
        let videoData = null;

        if (req.files?.image?.length > 0) {
            const imageFile = req.files.image[0];

            const result = await uploadMedia(imageFile.buffer, "image");

            imageData = {
                public_id: result.public_id,
                url: result.url
            };
        }

        if (req.files?.video?.length > 0) {
            const videoFile = req.files.video[0];

            const result = await uploadMedia(videoFile.buffer, "video");

            videoData = {
                public_id: result.public_id,
                url: result.url
            };
        }

        const Topic = await topic.create({
            ...req.body,
            image: imageData,
            video: videoData
        });
        await Topic.populate("subject")

        return res.status(201).json({
            success: true,
            topic: Topic
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            issue: error.message
        });
    }
};

export const updateTopic = async (req, res) => {
    try {
        const { id } = req.params;

        const currentTopic = await topic.findById(id);

        if (!currentTopic) {
            return res.status(404).json({
                success: false,
                message: "Topic not found"
            });
        }

        let imageData = null;
        let videoData = null;

        const currentImage = currentTopic?.image?.public_id;
        const currentVideo = currentTopic?.video?.public_id;
        if (req.files?.image?.[0]) {
            const imageFile = req.files.image[0];

            const result = await uploadMedia(imageFile.buffer, "image");

            imageData = {
                public_id: result.public_id,
                url: result.url
            };

            if (currentImage) {
                await deleteMedia(currentImage);
            }
        }
        if (req.files?.video?.[0]) {
            const videoFile = req.files.video[0];

            const result = await uploadMedia(videoFile.buffer, "video");

            videoData = {
                public_id: result.public_id,
                url: result.url
            };

            if (currentVideo) {
                await deleteMedia(currentVideo);
            }
        }

        const newTopic = await topic.findByIdAndUpdate(
            id,
            {
                ...req.body,
                ...(image && { imageData }),
                ...(video && { videoData })
            },
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            topic: newTopic
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            issue: error.message
        });
    }
};

export const deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;

        const currentTopic = await topic.findById(id);

        if (!currentTopic) {
            return res.status(404).json({
                success: false,
                message: "No Topic is found"
            });
        }

        const currentImage = currentTopic?.image?.public_id;
        const currentVideo = currentTopic?.video?.public_id;

        if (currentImage) {
            await deleteMedia(currentImage);
        }

        if (currentVideo) {
            await deleteMedia(currentVideo);
        }

        await topic.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Topic is deleted"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "something went wrong",
            issue: error.message
        });
    }
};

export const getAllTopics = async (req, res) => {
    try {
        const topics = await topic.find().populate("subject");

        return res.status(200).json({
            success: true,
            topics,
            length: topics.length
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            issue: error.message
        });
    }
};

export const getTopic = async (req, res) => {
    try {
        const { id } = req.params
        const Topic = await topic.findById(id).populate("subject")
        if (!Topic) {
            return res.status(404).json({
                success: false,
                message: "Topic is not found"
            })
        }
        return res.status(200).json({
            success: true,
            topic: Topic
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            issue: error
        })
    }
}

export const subjectTopic = async (req, res) => {
    try {
        const { subjectId } = req.params
        const Topics = await topic.find({ subject: subjectId })
        if (!Topics || Topics.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Topic is found"
            })
        }
        return res.status(200).json({
            success: true,
            topic: Topics
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
}

export const allTopicsBySubjectWise = async (req, res) => {
    try {
        const subjects = await subject.find();

        if (!subjects || subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No subject found"
            });
        }

        const data = await Promise.all(
            subjects.map(async (sub) => {
                const topics = await topic.find({ subject: sub._id });

                return {
                    subject: sub,
                    topics: topics || []
                };
            })
        );

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

export const SSE_Stream = async (req, res) => {
    try {
        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")
        res.status(200)

        const stream = topic.watch()
        res.write(`data: ${JSON.stringify({ SSE_Stream: "Connected" })}\n\n`)
        stream.on("change", async (change) => {
            try {
                const Topics = await topic.find()
                res.write(`data: ${JSON.stringify({ topics: Topics })}\n\n`)
            } catch (error) {
                console.log(error);
                res.end()
            }
        })
        req.on("close", () => {
            stream.close();
            res.end()
        })
        return
    } catch (error) {
        console.log(`Stream is not working: ${error}`);
        res.end()
    }
}