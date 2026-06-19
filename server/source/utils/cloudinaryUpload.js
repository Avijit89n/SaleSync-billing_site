import { cloudinary } from "./cloudinary.js";
import apiError from "./apiError.js";
import fs from "fs";


const cloudinaryUpload = async (filepath) => {
    try {
        const result = await cloudinary.uploader.upload(filepath, { resource_type: 'auto' })
        const optimizeUrl = cloudinary.url(result.public_id, {
            fetch_format: 'auto',
            quality: 'auto',
            crop: 'fill', 
            gravity: 'auto',
            width: 400,
        });
        fs.unlinkSync(filepath);
        return { optimizeUrl, result };
    } catch (error) {
        fs.unlinkSync(filepath);
        throw new apiError("Failed to upload the image", 500, error, "IMAGE_UPLOAD_ERROR")
    }
}

export { cloudinaryUpload }