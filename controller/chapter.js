import chapter from "../models/chapter.js";
import topic from "../models/topic.js"

export const createChapter = async (req, res) => {
    try {
        const Chapter = await chapter.create(req.body);
        return res.status(201).json({
            success: true,
            chapter: Chapter,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const findChapter = async (req, res) => {
    try {
        const { id } = req.params;
        const Chapter = await chapter.findById(id)
        if (!Chapter) {
            return res.status(404).json({
                success: false,
                message: "Chapter not found",
            });
        }
        return res.status(200).json({
            success: true,
            chapter: Chapter,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const updateChapter = async (req, res) => {
    try {
        const { id } = req.params;
        const Chapter = await chapter.findByIdAndUpdate(id, req.body,{ new: true, runValidators: true,} )
        if (!Chapter) {
            return res.status(404).json({
                success: false,
                message: "Chapter not found",
            });
        }
        return res.status(200).json({
            success: true,
            chapter: Chapter,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const deleteChapter = async (req, res) => {
    try {
        const { id } = req.params;

        const Chapter = await chapter.findById(id);

        if (!Chapter) {
            return res.status(404).json({
                success: false,
                message: "Chapter not found"
            });
        }

        const topicExists = await topic.exists({ chapter: id });

        if (topicExists) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete this chapter because one or more topics are attached to it."
            });
        }

        await chapter.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Chapter deleted successfully"
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

export const subjectByChapter = async (req, res) => {
    try {
        const { id } = req.params;
        const Chapters = await chapter.find({ subject: id })
        if (Chapters.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No chapters found",
            });
        }
        return res.status(200).json({
            success: true,
            chapter: Chapters,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};