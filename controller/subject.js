import chapter from "../models/chapter.js";
import subject from "../models/subjects.js";
import topic from "../models/topic.js";
import { deleteMedia, uploadMedia } from "../utils/cloudinary.js";

export const createSubject = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image is required"
            });
        }

        const imageData = await uploadMedia(req.file.buffer, "image");

        const Subject = await subject.create({
            ...req.body,
            image: {
                public_id: imageData.public_id,
                url: imageData.url
            }
        });

        if (!Subject) {
            return res.status(404).json({
                success: false,
                message: "Subject is not created"
            });
        }

        return res.status(201).json({
            success: true,
            subject: Subject
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

export const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;

        const oldSubject = await subject.findById(id);

        if (!oldSubject) {
            return res.status(404).json({
                success: false,
                message: "No Subject is found"
            });
        }

        let imageData = null;

        if (req.file) {
            const oldImage = oldSubject?.image?.public_id;

            if (oldImage) {
                await deleteMedia(oldImage);
            }

            imageData = await uploadMedia(req.file.buffer, "image");
        }

        const updatedData = {
            ...req.body
        };

        if (imageData) {
            updatedData.image = {
                public_id: imageData.public_id,
                url: imageData.url
            };
        }

        const newSubject = await subject.findByIdAndUpdate(
            id,
            updatedData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!newSubject) {
            return res.status(400).json({
                success: false,
                message: "Subject is not updated"
            });
        }

        return res.status(200).json({
            success: true,
            subject: newSubject
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

export const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;

        const Subject = await subject.findById(id);

        if (!Subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        const chapterExists = await chapter.exists({ subject: id });

        if (chapterExists) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete this subject because one or more chapters are attached to it."
            });
        }

        if (Subject.image?.public_id) {
            await deleteMedia(Subject.image.public_id);
        }

        await subject.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Subject deleted successfully."
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

export const getSubject = async (req, res) => {
    try {
        const { id } = req.params;

        const Subject = await subject.findById(id);

        if (!Subject) {
            return res.status(404).json({
                success: false,
                message: "Subject is not found"
            });
        }

        return res.status(200).json({
            success: true,
            subject: Subject
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

export const getAllSubjects = async (req, res) => {
    try {
        const Subjects = await subject.find();

        if (!Subjects || Subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No subject is found"
            });
        }

        return res.status(200).json({
            success: true,
            subject: Subjects,
            length: Subjects.length
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
        res.status(200);

        const stream = subject.watch();

        res.write(`data: ${JSON.stringify({ SSE_Stream: "Connected" })}\n\n`);

        stream.on("change", async () => {
            try {
                const Subjects = await subject.find();
                res.write(`data: ${JSON.stringify({ subject: Subjects })}\n\n`);
            } catch (error) {
                console.log(error);
                res.end();
            }
        });

        req.on("close", () => {
            stream.close();
            res.end();
        });

    } catch (error) {
        console.log(`stream is not working: ${error}`);
        res.end();
    }
};