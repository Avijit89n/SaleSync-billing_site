import { InvoiceCustomizer } from "../models/invoiceCustomizer.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import fs from "fs";
import { cloudinaryDelete, cloudinaryUpload } from "../utils/cloudinary.js";

const createOrUpdateInvoiceCustomizer = async (req, res) => {
    const {
        companyName,
        gstin,
        phone,
        email,
        address,
        layout,
        currentLogo,
        currentSignature, // Added signature string tracker
    } = req.body;

    // Grab both files from req.files (Requires upload.fields() in router)
    const companyLogo = req.files?.companyLogo?.[0];
    const companySignature = req.files?.companySignature?.[0];

    // Initial Validation & Local Cleanup
    if (!companyName || !gstin || !phone || !email || !address) {
        if (companyLogo?.path && fs.existsSync(companyLogo.path)) {
            fs.unlinkSync(companyLogo.path);
        }
        if (companySignature?.path && fs.existsSync(companySignature.path)) {
            fs.unlinkSync(companySignature.path);
        }
        throw new ApiError("Required fields are missing", 400);
    }

    const existingCustomizer = await InvoiceCustomizer.findOne();

    let logoUrl = null;
    let logoPublicId = null;
    let signatureUrl = null;
    let signaturePublicId = null;

    const oldLogoPublicId = existingCustomizer?.companyLogoPublicId;
    const oldSignaturePublicId = existingCustomizer?.companySignaturePublicId;

    try {
        // --- 1. Upload new Logo (if provided) ---
        if (companyLogo) {
            const uploadResult = await cloudinaryUpload(companyLogo.path);

            if (!uploadResult?.optimizeUrl || !uploadResult?.imageInfo) {
                if (companyLogo?.path && fs.existsSync(companyLogo.path)) fs.unlinkSync(companyLogo.path);
                if (companySignature?.path && fs.existsSync(companySignature.path)) fs.unlinkSync(companySignature.path);
                throw new ApiError("Logo upload failed", 500);
            }

            logoUrl = uploadResult.optimizeUrl;
            logoPublicId = uploadResult.imageInfo.public_id;
        }

        // --- 2. Upload new Signature (if provided) ---
        if (companySignature) {
            const uploadResult = await cloudinaryUpload(companySignature.path);

            if (!uploadResult?.optimizeUrl || !uploadResult?.imageInfo) {
                if (companyLogo?.path && fs.existsSync(companyLogo.path)) fs.unlinkSync(companyLogo.path);
                if (companySignature?.path && fs.existsSync(companySignature.path)) fs.unlinkSync(companySignature.path);
                
                // Rollback the newly uploaded logo if the signature fails mid-flight
                if (logoPublicId) await cloudinaryDelete(logoPublicId);
                
                throw new ApiError("Signature upload failed", 500);
            }

            signatureUrl = uploadResult.optimizeUrl;
            signaturePublicId = uploadResult.imageInfo.public_id;
        }

        // --- 3. Build Update Object ---
        const updateData = {
            companyName,
            companyGSTIN: gstin,
            companyPhone: phone,
            companyEmail: email,
            companyAddress: address,
            companyInvoiceLayoutId: layout,
        };

        // Handle Logo State
        if (companyLogo) {
            updateData.companyLogo = logoUrl;
            updateData.companyLogoPublicId = logoPublicId;
        } else if (currentLogo === "") {
            updateData.companyLogo = null;
            updateData.companyLogoPublicId = null;
        }

        // Handle Signature State
        if (companySignature) {
            updateData.companySignature = signatureUrl;
            updateData.companySignaturePublicId = signaturePublicId;
        } else if (currentSignature === "") {
            updateData.companySignature = null;
            updateData.companySignaturePublicId = null;
        }

        // --- 4. Save to Database ---
        let customizer;

        if (existingCustomizer) {
            customizer = await InvoiceCustomizer.findByIdAndUpdate(
                existingCustomizer._id,
                updateData,
                {
                    new: true,
                    runValidators: true,
                }
            );
        } else {
            customizer = await InvoiceCustomizer.create(updateData);
        }

        // --- 5. Cloudinary Cleanup (Delete replaced/removed images) ---
        
        // Logo Cleanup
        if (companyLogo && oldLogoPublicId && oldLogoPublicId !== logoPublicId) {
            await cloudinaryDelete(oldLogoPublicId);
        }
        if (!companyLogo && currentLogo === "" && oldLogoPublicId) {
            await cloudinaryDelete(oldLogoPublicId);
        }

        // Signature Cleanup
        if (companySignature && oldSignaturePublicId && oldSignaturePublicId !== signaturePublicId) {
            await cloudinaryDelete(oldSignaturePublicId);
        }
        if (!companySignature && currentSignature === "" && oldSignaturePublicId) {
            await cloudinaryDelete(oldSignaturePublicId);
        }

        const statusCode = existingCustomizer ? 200 : 201;

        return res.status(statusCode).json(
            new ApiResponse(
                existingCustomizer
                    ? "Customizer updated successfully"
                    : "Customizer created successfully",
                statusCode,
                customizer
            )
        );
    } catch (error) {
        // Rollback newly uploaded images if db save fails
        if (logoPublicId) {
            await cloudinaryDelete(logoPublicId);
        }
        if (signaturePublicId) {
            await cloudinaryDelete(signaturePublicId);
        }

        throw new ApiError(
            error.message || "Failed to save invoice customizer",
            error.statusCode || 500
        );
    }
};

const getInvoiceCustomizer = async (req, res) => {
    const customizer = await InvoiceCustomizer.findOne();

    return res.status(200).json(
        new ApiResponse(
            "Customizer fetched successfully",
            200,
            customizer
        )
    );
};

export {
    createOrUpdateInvoiceCustomizer,
    getInvoiceCustomizer,
};