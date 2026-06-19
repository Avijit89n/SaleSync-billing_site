import { Item } from "../models/item.models.js";
import ApiError from "../utils/apiError.js";
import fs from "fs";
import { cloudinaryDelete, cloudinaryUpload } from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";

const additem = async (req, res) => {
    const { name, description, MRP, sellingPrice, stock, status, unit } = req.body;
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


export { additem, getAllItem, itemSearch };
