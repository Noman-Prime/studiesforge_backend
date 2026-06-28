import { disconnect } from "mongoose";
import slider from "../models/slider.js";
import { deleteMedia, uploadMedia } from "../utils/cloudinary.js";


export const createSlider = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Media is required to create Slider"
            })
        }
        const imageData = await uploadMedia(req.file.buffer, "image");
        const Slider = await slider.create({
            ...req.body,
            image: {
                public_id: imageData.public_id,
                url: imageData.url
            }
        });

        if (Slider) {
            return res.status(201).json({
                success: true,
                message: "Slider is created",
                slider: Slider
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
}

export const updateSlider = async (req, res) => {

    try {
        const { id } = req.params;

        const currentSlider = await slider.findById(id);

        if (!currentSlider) {
            return res.status(404).json({
                success: false,
                message: "Slider not found"
            });
        }

        let updatedImage = currentSlider.image;
        if (req.file) {
            const oldPublicId = currentSlider.image?.public_id;
            if (oldPublicId) {
                await deleteMedia(oldPublicId);
            }
            const imageData = await uploadMedia(
                req.file.buffer,
                "image"
            );

            updatedImage = {
                public_id: imageData.public_id,
                url: imageData.url
            };
        }

        const updatedSlider = await slider.findByIdAndUpdate(
            id,
            {
                ...req.body,
                image: updatedImage
            },
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Slider updated successfully",
            slider: updatedSlider
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message || "Something went wrong"
        });
    }
};

export const deleteSlider = async (req, res) => {

    try {
        const { id } = req.params
        const currentSlider = await slider.findById(id)
        if (!currentSlider) {
            return res.status(404).json({
                success: false,
                message: "Slider is not found"
            })
        }
        const image = currentSlider.image?.public_id
        if (image) {
            await deleteMedia(image)
        }
        await slider.findByIdAndDelete(id)
        return res.status(200).json({
            success: true,
            message: "Slider is deleted"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
}

export const allSiders = async (req, res) => {
    try {
        const length = null
        const Sliders = await slider.find()
        if (!Sliders || Sliders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Slider is found"
            })
        }
        return res.status(200).json({
            success: true,
            slider: Sliders,
            length: Sliders.length
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

export const getSlider = async (req, res) => {

    try {
        const { id } = req.params
        const Slider = await slider.findById(id)
        if (!Slider) {
            return res.status(404).json({
                success: false,
                message: "No Slider is found"
            })
        }
        return res.status(200).json({
            success: true,
            slider: Slider
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
}

export const SSE_Stream = async (req, res) => {
    try {
        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")
        res.status(200)

        const stream = slider.watch()
        res.write(`data: ${JSON.stringify({ SSE_Stream: "connected" })}\n\n`)
        stream.on("change", async (change) => {
            try {
                const update = await slider.find()
                res.write(`data: ${JSON.stringify({ slider: update })}\n\n`)
            } catch (error) {
                console.log(error)
            }
        })
        req.on("close", () => {
            stream.close()
            res.end()
        })
        return
    } catch (error) {
        console.log(error);
        res.end()
    }
}