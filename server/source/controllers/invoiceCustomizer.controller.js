
import { InvoiceCustomizer } from "../models/invoiceCustomizer.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  cloudinaryDelete,
  cloudinaryUpload,
} from "../utils/cloudinary.js";

const createOrUpdateInvoiceCustomizer = async (req, res) => {
  const {
    companyName,
    gstin,
    phone,
    email,
    address,
    a4Layout,
    thermalLayout,
    currentLogo,
    currentSignature,
  } = req.body;

  const companyLogo = req.files?.companyLogo?.[0];
  const companySignature = req.files?.companySignature?.[0];

  if (!companyName || !gstin || !phone || !email || !address) {
    throw new ApiError("Required fields are missing", 400);
  }

  const existingCustomizer = await InvoiceCustomizer.findOne();

  let logoUrl = null;
  let logoPublicId = null;
  let signatureUrl = null;
  let signaturePublicId = null;

  let newLogoUploaded = false;
  let newSignatureUploaded = false;

  const oldLogoPublicId = existingCustomizer?.companyLogoPublicId;
  const oldSignaturePublicId =
    existingCustomizer?.companySignaturePublicId;

  try {
    if (companyLogo) {
      const uploadResult = await cloudinaryUpload(companyLogo.buffer);

      logoUrl = uploadResult.optimizeUrl;
      logoPublicId = uploadResult.imageInfo.public_id;
      newLogoUploaded = true;
    }

    if (companySignature) {
      const uploadResult = await cloudinaryUpload(
        companySignature.buffer
      );

      signatureUrl = uploadResult.optimizeUrl;
      signaturePublicId = uploadResult.imageInfo.public_id;
      newSignatureUploaded = true;
    }

    const updateData = {
      companyName,
      companyGSTIN: gstin,
      companyPhone: phone,
      companyEmail: email,
      companyAddress: address,
      companyA4LayoutId: a4Layout,
      companyThermalLayoutId: thermalLayout,
    };

    if (companyLogo) {
      updateData.companyLogo = logoUrl;
      updateData.companyLogoPublicId = logoPublicId;
    } else if (currentLogo === "") {
      updateData.companyLogo = null;
      updateData.companyLogoPublicId = null;
    }

    if (companySignature) {
      updateData.companySignature = signatureUrl;
      updateData.companySignaturePublicId = signaturePublicId;
    } else if (currentSignature === "") {
      updateData.companySignature = null;
      updateData.companySignaturePublicId = null;
    }

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

    // Delete previous images only after the database save succeeds.
    if (
      companyLogo &&
      oldLogoPublicId &&
      oldLogoPublicId !== logoPublicId
    ) {
      try {
        await cloudinaryDelete(oldLogoPublicId);
      } catch (error) {
        console.error("Old logo cleanup failed:", error.message);
      }
    }

    if (
      !companyLogo &&
      currentLogo === "" &&
      oldLogoPublicId
    ) {
      try {
        await cloudinaryDelete(oldLogoPublicId);
      } catch (error) {
        console.error("Logo deletion failed:", error.message);
      }
    }

    if (
      companySignature &&
      oldSignaturePublicId &&
      oldSignaturePublicId !== signaturePublicId
    ) {
      try {
        await cloudinaryDelete(oldSignaturePublicId);
      } catch (error) {
        console.error("Old signature cleanup failed:", error.message);
      }
    }

    if (
      !companySignature &&
      currentSignature === "" &&
      oldSignaturePublicId
    ) {
      try {
        await cloudinaryDelete(oldSignaturePublicId);
      } catch (error) {
        console.error("Signature deletion failed:", error.message);
      }
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
    // Remove only newly uploaded images if saving fails.
    if (newLogoUploaded && logoPublicId) {
      try {
        await cloudinaryDelete(logoPublicId);
      } catch (cleanupError) {
        console.error(
          "New logo rollback failed:",
          cleanupError.message
        );
      }
    }

    if (newSignatureUploaded && signaturePublicId) {
      try {
        await cloudinaryDelete(signaturePublicId);
      } catch (cleanupError) {
        console.error(
          "New signature rollback failed:",
          cleanupError.message
        );
      }
    }

    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Invoice customizer error:", error);

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
