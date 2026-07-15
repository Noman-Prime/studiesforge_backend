import subject from "../models/subjects.js";
import topic from "../models/topic.js";
import { deleteMedia, uploadMedia } from "../utils/cloudinary.js";

export const createTopic = async (req, res) => {
    try {
        let imageData = null;
        let videoData = null;

        if (req.files?.image?.length > 0) {
            const result = await uploadMedia(req.files.image[0].buffer, "image");
            imageData = { public_id: result.public_id, url: result.url };
        }

        if (req.files?.video?.length > 0) {
            const result = await uploadMedia(req.files.video[0].buffer, "video");
            videoData = { public_id: result.public_id, url: result.url };
        }

        const content = typeof req.body.content === 'string' ? JSON.parse(req.body.content) : req.body.content;

        const newTopic = await topic.create({
            ...req.body,
            content,
            image: imageData,
            video: videoData
        });

        await newTopic.populate("subject");

        return res.status(201).json({ success: true, topic: newTopic });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Something went wrong", issue: error.message });
    }
};

export const updateTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const currentTopic = await topic.findById(id);

        if (!currentTopic) return res.status(404).json({ success: false, message: "Topic not found" });

        let updateData = { ...req.body };

        if (req.body.content) {
            updateData.content = typeof req.body.content === 'string' ? JSON.parse(req.body.content) : req.body.content;
        }

        if (req.files?.image?.length > 0) {
            if (currentTopic.image?.public_id) await deleteMedia(currentTopic.image.public_id);
            const result = await uploadMedia(req.files.image[0].buffer, "image");
            updateData.image = { public_id: result.public_id, url: result.url };
        }

        if (req.files?.video?.length > 0) {
            if (currentTopic.video?.public_id) await deleteMedia(currentTopic.video.public_id);
            const result = await uploadMedia(req.files.video[0].buffer, "video");
            updateData.video = { public_id: result.public_id, url: result.url };
        }

        const updatedTopic = await topic.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate("subject");

        return res.status(200).json({ success: true, topic: updatedTopic });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Something went wrong", issue: error.message });
    }
};

export const deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const currentTopic = await topic.findById(id);

        if (!currentTopic) return res.status(404).json({ success: false, message: "No Topic is found" });

        if (currentTopic.image?.public_id) await deleteMedia(currentTopic.image.public_id);
        if (currentTopic.video?.public_id) await deleteMedia(currentTopic.video.public_id);

        await topic.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: "Topic is deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Something went wrong", issue: error.message });
    }
};

export const getAllTopics = async (req, res) => {
    try {
        const topics = await topic.find().populate("subject");
        return res.status(200).json({ success: true, topics, length: topics.length });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Something went wrong", issue: error.message });
    }
};

export const getTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const foundTopic = await topic.findById(id).populate("subject");
        if (!foundTopic) return res.status(404).json({ success: false, message: "Topic is not found" });
        return res.status(200).json({ success: true, topic: foundTopic });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Something went wrong", issue: error.message });
    }
};

export const subjectTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const topics = await topic.find({ subject: id });
        if (!topics || topics.length === 0) return res.status(404).json({ success: false, message: "No Topic is found" });
        return res.status(200).json({ success: true, topic: topics });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

export const chapterWiseTopics = async (req, res) => {
    try {
        const { id } = req.params;
        const topics = await topic.find({ chapter: id });
        if (!topics || topics.length === 0) return res.status(404).json({ success: false, message: "No Topic is found" });
        return res.status(200).json({ success: true, topic: topics });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

export const allTopicsBySubjectWise = async (req, res) => {
    try {
        const subjects = await subject.find();
        if (!subjects || subjects.length === 0) return res.status(404).json({ success: false, message: "No subject found" });

        const data = await Promise.all(
            subjects.map(async (sub) => {
                const topics = await topic.find({ subject: sub._id });
                return { subject: sub, topics: topics || [] };
            })
        );

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

export const SSE_Stream = async (req, res) => {
    try {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.status(200);

        const stream = topic.watch();
        res.write(`data: ${JSON.stringify({ SSE_Stream: "Connected" })}\n\n`);

        stream.on("change", async () => {
            try {
                const topics = await topic.find();
                res.write(`data: ${JSON.stringify({ topics })}\n\n`);
            } catch (error) {
                res.end();
            }
        });

        req.on("close", () => {
            stream.close();
            res.end();
        });
    } catch (error) {
        res.end();
    }
};