import { v2 as cloudinary } from 'cloudinary';
import apiError from "./apiError.js"
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
        return { optimizeUrl, imageInfo: result};
    } catch (error) {
        fs.unlinkSync(filepath);
        throw new apiError("Failed to upload the image", 500, error, "IMAGE_UPLOAD_ERROR")
    }
}

const cloudinaryDelete = async(publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId, { invalidate: true });
        console.log('Image deleted successfully');
        return true;
    } catch (error) {
        throw new apiError("Failed to delete the image", 500, error, "IMAGE_DELETE_ERROR")
    }
}

export { cloudinaryUpload, cloudinaryDelete }