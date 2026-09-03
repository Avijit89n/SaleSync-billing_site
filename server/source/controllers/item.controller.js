import { Item } from "../models/item.models.js";
import ApiError from "../utils/apiError.js";
import fs from "fs";
import { cloudinaryDelete, cloudinaryUpload } from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";

const additem = async (req, res) => {
    const { name, description, MRP, sellingPrice, stock, status, unit } = req.body;
    console.log("Received item data:", req.body);
    if (!name || !MRP || !sellingPrice || !unit) {
        if (req.file) fs.unlinkSync(req.file.path)
        throw new ApiError("Required fields are missing", 400);
    }
    if (Number(sellingPrice) > Number(MRP)) {
        if (req.file) fs.unlinkSync(req.file.path)
        throw new ApiError("Selling price cannot exceed MRP", 400);
    }
    let imageUrl = null;
    let imagePublicId = null;
    if (req.file) {
        const uploadResult = await cloudinaryUpload(req.file.path);
        if (!uploadResult?.optimizeUrl || !uploadResult?.imageInfo) {
            throw new ApiError("Image upload failed", 500);
        }
        imageUrl = uploadResult.optimizeUrl;
        imagePublicId = uploadResult.imageInfo.public_id;
    }

    try {
        const item = await Item.create({
            name,
            description,
            MRP,
            sellingPrice,
            stock,
            status,
            unit,
            image: imageUrl,
            imagePublicId
        });
        return res.status(201).json(
            new apiResponse("Item added successfully", 201, item)
        );
    } catch (error) {
        if (imagePublicId) await cloudinaryDelete(imagePublicId);
        throw new ApiError("Item creation failed", 500, error);
    }
};

const getAllItem = async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const lastCreatedAt = req.query.lastCreatedAt;

    let query = {};

    if (lastCreatedAt) {
        query.createdAt = { $lt: new Date(lastCreatedAt) };
    }

    try {
        const items = await Item.find(query)
            .sort({ createdAt: -1 })
            .limit(limit + 1);

        let isEnd = true;
        let nextCursor = null;

        if (items.length > limit) {
            isEnd = false;
            items.pop();
            nextCursor = items[items.length - 1].createdAt;
        }

        return res.status(200).json(
            new apiResponse("Items fetched successfully", 200, {
                items,
                isEnd,
                nextCursor
            })
        );
    } catch (error) {
        throw new ApiError("Failed to fetch items", 500, error);
    }
};

const itemSearch = async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim();
    const cursor = req.query.cursor;

    if (!search) {
        throw new ApiError("Search query is required", 400);
    }

    try {
        const searchStage = {
            index: "items_auto",
            autocomplete: {
                query: search,
                path: "name",
                fuzzy: {
                    maxEdits: 1
                }
            }
        };

        if (cursor) {
            searchStage.searchAfter = cursor;
        }

        const pipeline = [
            {
                $search: searchStage
            },
            {
                $project: {
                    name: 1,
                    image: 1,
                    status: 1,
                    sellingPrice: 1,
                    MRP: 1,
                    unit: 1,
                    stock: 1,
                    createdAt: 1,

                    score: {
                        $meta: "searchScore"
                    },

                    paginationToken: {
                        $meta: "searchSequenceToken"
                    }
                }
            },
            {
                $limit: limit + 1
            }
        ];

        const items = await Item.aggregate(pipeline);

        let isEnd = true;
        let nextCursor = null;

        if (items.length > limit) {
            isEnd = false;
            nextCursor = items[limit - 1].paginationToken;
            items.pop();
        }

        return res.status(200).json(
            new apiResponse(
                "Items fetched successfully",
                200,
                {
                    items,
                    nextCursor,
                    isEnd
                }
            )
        );

    } catch (error) {
        console.error(error);
        throw new ApiError(
            error.message || "Failed to fetch items",
            500
        );
    }
};

const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ApiError("Item ID is required", 400);
        }

        const item = await Item.findById(id);

        if (!item) {
            throw new ApiError("Item not found", 404);
        }

        // Delete image from Cloudinary if the item has one
        if (item.imagePublicId) {
            try {
                await cloudinaryDelete(item.imagePublicId);
            } catch (cloudinaryError) {
                console.error(
                    "Failed to delete item image from Cloudinary:",
                    cloudinaryError
                );

                throw new ApiError(
                    "Failed to delete item image from Cloudinary",
                    500,
                    cloudinaryError
                );
            }
        }

        // Delete item from MongoDB
        await Item.findByIdAndDelete(id);

        return res.status(200).json(
            new apiResponse(
                "Item deleted successfully",
                200,
                item
            )
        );
    } catch (error) {
        console.error("Delete item error:", error);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            "Failed to delete the item", 
            500,
            error
        );
    }
};

const getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            throw new ApiError("Item ID is required", 400);
        }
        const item = await Item.findById(id);
        if (!item) {
            throw new ApiError("Item not found", 404);
        }
        return res.status(200).json(
            new apiResponse("Item fetched successfully", 200, item)
        );
    } catch (error) {
        throw new ApiError("Failed to fetch item", 500, error);
    }
};

const updateItem = async (req, res) => {
    const { id } = req.params;
    const {
        name,
        description,
        MRP,
        sellingPrice,
        stock,
        unit,
        status,
        image
    } = req.body;

    const itemImage = req.file; // From multer upload.single('image')

    try {
        const existingItem = await Item.findById(id);

        if (!existingItem) {
            if (itemImage?.path && fs.existsSync(itemImage.path)) {
                fs.unlinkSync(itemImage.path);
            }
            throw new ApiError("Item not found", 404);
        }

        let imageUrl = existingItem.image;
        let imagePublicId = existingItem.imagePublicId;

        // Scenario A: User uploaded a NEW image
        if (itemImage) {
            const uploadResult = await cloudinaryUpload(itemImage.path);

            if (!uploadResult?.optimizeUrl || !uploadResult?.imageInfo) {
                if (itemImage?.path && fs.existsSync(itemImage.path)) fs.unlinkSync(itemImage.path);
                throw new ApiError("Image upload failed", 500);
            }

            if (itemImage?.path && fs.existsSync(itemImage.path)) fs.unlinkSync(itemImage.path);

            imageUrl = uploadResult.optimizeUrl;
            imagePublicId = uploadResult.imageInfo.public_id;

            if (existingItem.imagePublicId) {
                try {
                    await cloudinaryDelete(existingItem.imagePublicId);
                } catch (cleanupError) {
                    console.error("Failed to delete old item image from Cloudinary:", cleanupError);
                }
            }
        }

        else if (!image) {
            if (existingItem.imagePublicId) {
                try {
                    await cloudinaryDelete(existingItem.imagePublicId);
                } catch (cleanupError) {
                    console.error("Failed to delete item image from Cloudinary:", cleanupError);
                }
            }
            imageUrl = null;
            imagePublicId = null;
        }

        const updateData = {
            name: name || existingItem.name,
            description: description || existingItem.description,
            MRP: MRP !== undefined ? MRP : existingItem.MRP,
            sellingPrice: sellingPrice !== undefined ? sellingPrice : existingItem.sellingPrice,
            stock: stock !== undefined ? stock : existingItem.stock,
            unit: unit || existingItem.unit,
            status: status || existingItem.status,
            image: imageUrl,
            imagePublicId: imagePublicId
        };

        const updatedItem = await Item.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        return res.status(200).json(
            new apiResponse("Item updated successfully", 200, updatedItem)
        );

    } catch (error) {
        if (itemImage && imagePublicId && imagePublicId !== existingItem?.imagePublicId) {
            try {
                await cloudinaryDelete(imagePublicId);
            } catch (rollbackError) {
                console.error("Failed to rollback Cloudinary upload:", rollbackError);
            }
        }

        throw new ApiError(error.message || "Failed to update item", error.statusCode || 500);
    }
};

export { additem, getAllItem, itemSearch, deleteItem, getItemById, updateItem };
