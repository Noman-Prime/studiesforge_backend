import dotenv from "dotenv"
dotenv.config()
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_KEY
})

const allowedType = {
    image: "MoonAcademy/Images",
    video: "MoonAcademy/Videos",
    documents: "MoonAcademy/Documents"
};

export const uploadMedia = (buffer, type) => {
    if (!buffer) {
        throw new Error("File buffer is missing");
    }

    const folder = allowedType[type];

    if (!folder) {
        throw new Error(`Invalid upload type: ${type}`);
    }

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                folder
            },
            (error, result) => {
                if (error || !result) {
                    return reject(error || new Error("Upload failed"));
                }
                resolve({
                    url: result.secure_url,
                    public_id: result.public_id,
                    resource_type: result.resource_type,
                    format: result.format
                });
            }
        ).end(buffer);
    });
};

export const deleteMedia = async (public_id) => {
    try {
        if (!public_id) {
            throw new Error("public_id is required")
        }
        await cloudinary.uploader.destroy(public_id)
        return true
    } catch (error) {
        console.log("Media is not deleted");
        return false
    }
}