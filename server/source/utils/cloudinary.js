
import { v2 as cloudinary } from "cloudinary";
import ApiError from "./apiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUpload = async (fileBuffer) => {
  try {
    if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
      throw new Error("A valid image buffer is required");
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "salesync",
        },
        (error, uploadedImage) => {
          if (error) return reject(error);

          if (!uploadedImage) {
            return reject(
              new Error("Cloudinary returned no image data")
            );
          }

          resolve(uploadedImage);
        }
      );

      stream.end(fileBuffer);
    });

    const optimizeUrl = cloudinary.url(result.public_id, {
      secure: true,
      fetch_format: "auto",
      quality: "auto",
      crop: "fill",
      gravity: "auto",
      width: 400,
    });

    return {
      optimizeUrl,
      imageInfo: result,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);

    throw new ApiError(
      "Failed to upload the image",
      500,
      error,
      "IMAGE_UPLOAD_ERROR"
    );
  }
};

const cloudinaryDelete = async (publicId) => {
  try {
    if (!publicId) {
      return false;
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(
        `Cloudinary deletion failed: ${result.result}`
      );
    }

    return true;
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);

    throw new ApiError(
      "Failed to delete the image",
      500,
      error,
      "IMAGE_DELETE_ERROR"
    );
  }
};

export { cloudinaryUpload, cloudinaryDelete };
