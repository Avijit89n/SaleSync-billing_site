import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, useBlocker } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, Upload, ZoomIn, ClipboardPen } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Loader from "../../components/loaders/loader2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/axios/interceptor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { updateItemReq } from "../../redux/features/itemSlice";
const initialData = {
  name: "",
  description: "",
  image: null,
  MRP: "",
  sellingPrice: "",
  discount: "",
  discountType: "Rs.",
  stock: 0,
  unit: "",
  status: "Active",
};
const labelCls =
  "block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2";
const inputCls =
  "w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed";
function EditItem() {
  const [preview, setPreview] = useState(null);
  const [editItemData, setEditItemData] = useState(initialData);
  const [originalItemData, setOriginalItemData] = useState(null);
  const savedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { itemLoading } = useSelector((state) => state.item);
  const { t } = useTranslation();
  const fetchItemFromBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/item/item-id/${id}`);
      if (response.status === 200) {
        const itemData = response.data.data;
        const loadedItemData = {
          name: itemData.name || "",
          description: itemData.description || "",
          image: itemData.image || null,
          MRP: itemData.MRP ?? "",
          sellingPrice: itemData.sellingPrice ?? "",
          discount: "",
          discountType: "Rs.",
          stock: itemData.stock ?? 0,
          unit: itemData.unit || "",
          status: itemData.status || "Active",
        };
        setEditItemData(loadedItemData);
        setOriginalItemData(JSON.parse(JSON.stringify(loadedItemData)));
        savedRef.current = false;
        setPreview(itemData.imageUrl || itemData.image || null);
      } else {
        toast.error(t("AddEditItem.EditToast.FetchFailed"));
      }
    } catch (error) {
      console.error("Error fetching item data:", error);
      toast.error(t("AddEditItem.EditToast.FetchError"));
    } finally {
      setIsLoading(false);
    }
  }, [id, t]);
  useEffect(() => {
    fetchItemFromBackend();
  }, [fetchItemFromBackend]);

  const hasUnsavedChanges =
    originalItemData !== null &&
    JSON.stringify(editItemData) !== JSON.stringify(originalItemData);

  const confirmLeave = () => {
    if (!hasUnsavedChanges || savedRef.current) return true;
    return window.confirm(
      t("AddEditItem.UnsavedChanges.Message", {
        defaultValue: "You have unsaved item changes. Are you sure you want to leave this page? Your changes will be lost.",
      })
    );
  };

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges &&
      !savedRef.current &&
      !isLoading &&
      !itemLoading &&
      currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (confirmLeave()) blocker.proceed();
    else blocker.reset();
  }, [blocker, t]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedChanges || savedRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleCancel = () => {
    if (!confirmLeave()) return;
    savedRef.current = true;
    navigate("/user/all-items");
  };
  const mrpAmount = Number(editItemData.MRP) || 0;
  const enteredDiscount = Number(editItemData.discount) || 0;
  const discountAmount =
    editItemData.discountType === "%"
      ? mrpAmount * (enteredDiscount / 100)
      : Math.max(0, mrpAmount - (Number(editItemData.sellingPrice) || 0));
  const finalSellingPrice =
    editItemData.discountType === "%"
      ? Math.max(0, mrpAmount - discountAmount)
      : Math.max(0, Number(editItemData.sellingPrice) || 0);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mrpAmount < 0 || finalSellingPrice < 0) {
      toast.error(t("AddEditItem.EditToast.NegativePrice"));
      return;
    }
    if (
      editItemData.discountType === "%" &&
      (editItemData.discount.trim() === "" || enteredDiscount < 0 || enteredDiscount > 100)
    ) {
      toast.error(t("AddEditItem.EditToast.InvalidDiscount"));
      return;
    }
    if (
      editItemData.discountType === "Rs." &&
      (editItemData.sellingPrice === "" || finalSellingPrice > mrpAmount)
    ) {
      toast.error(t("AddEditItem.EditToast.InvalidSellingPrice"));
      return;
    }
    const formData = new FormData();
    for (const key in editItemData) {
      if (["discount", "discountType", "sellingPrice"].includes(key)) continue;
      // Keep the existing image behavior expected by the current backend.
      formData.append(key, editItemData[key] ?? "");
    }
    formData.append("sellingPrice", finalSellingPrice.toFixed(2));
    try {
      await toast.promise(
        dispatch(updateItemReq({ id, data: formData })).unwrap(),
        { 
          loading: t("AddEditItem.EditToast.Updating"),
          success: (res) => {
            savedRef.current = true;
            navigate("/user/all-items");
            console.log("Item updated successfully:", res);
            return res?.message || t("AddEditItem.EditToast.UpdateSuccess");
          },
          error: (err) => err?.message || t("AddEditItem.EditToast.UpdateFailed"),
        }
      );
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error(
        error?.response?.data?.message || t("AddEditItem.EditToast.UpdateError")
      );
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditItemData((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };
  const handleRemoveImage = (e) => {
    e.preventDefault();
    setPreview(null);
    setEditItemData((prev) => ({ ...prev, image: "" }));
  };
  if (isLoading) {
    return (
      <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
        <Loader />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white px-4 py-5 font-sans text-slate-900 antialiased transition-all duration-500 animate-fade-in-scale sm:px-6 md:px-12 md:py-6">
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-10">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <ClipboardPen className="text-orange-500" size={28} />
              {t("AddEditItem.EditPageTitle")}
            </h1>
            <p className="text-sm text-gray-500">
              {t("AddEditItem.EditPageSubtitle")}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 items-start gap-8 bg-white lg:grid-cols-3 lg:gap-12">
          <div className="space-y-4">
            <h2 className="border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              {t("AddEditItem.MediaAsset")}
            </h2>
            <FieldGroup>
              <Field className="relative">
                <FieldLabel htmlFor="item-image" className="block cursor-pointer">
                  {preview ? (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-white">
                      <div className="relative flex h-56 w-56 flex-col items-center justify-between rounded-xl border border-slate-300 bg-white p-3 pb-2 shadow-sm">
                        <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-50/50">
                          <img
                            src={preview}
                            alt={t("AddEditItem.ImagePreviewAlt")}
                            className="h-full max-w-full rounded-lg object-contain"
                          />
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              aria-label={t("AddEditItem.ZoomImage")}
                              className="absolute left-3 top-3 flex h-40 w-[calc(100%-24px)] items-center justify-center rounded-lg bg-slate-900/0 transition-colors hover:bg-slate-900/70"
                            >
                              <ZoomIn className="h-10 w-10 text-transparent transition-colors hover:text-white" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="border border-slate-200 bg-white">
                            <DialogHeader>
                              <DialogTitle className="font-bold text-slate-900">
                                {t("AddEditItem.ImagePreviewTitle")}
                              </DialogTitle>
                              <DialogDescription className="text-xs text-slate-400">
                                {t("AddEditItem.ImagePreviewDescription")}
                              </DialogDescription>
                              <div className="flex w-full items-center justify-center pt-4">
                                <img
                                  src={preview}
                                  alt={t("AddEditItem.ImagePreviewAlt")}
                                  className="max-h-[380px] w-full rounded-xl bg-white object-contain"
                                />
                              </div>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                        <div className="flex w-full items-center justify-between pt-1">
                          <FieldLabel
                            htmlFor="item-image2"
                            className={`ml-1 cursor-pointer text-xs font-bold uppercase tracking-wider ${isLoading || itemLoading ? "text-slate-400" : "text-orange-500 hover:text-orange-600"}`}
                          >
                            {t("AddEditItem.ChangeImage")}
                            <Input
                              disabled={isLoading || itemLoading}
                              id="item-image2"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </FieldLabel>
                          <Button
                            disabled={isLoading || itemLoading}
                            variant="ghost"
                            className="h-8 w-8 cursor-pointer rounded-lg p-0 text-rose-500 hover:bg-rose-50"
                            type="button"
                            onClick={handleRemoveImage}
                            aria-label={t("AddEditItem.RemoveImage")}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2.5} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white">
                      <div className="flex h-56 w-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center shadow-sm transition-colors hover:border-orange-500">
                        <Input
                          disabled={isLoading || itemLoading}
                          id="item-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <Upload className="mb-2 h-7 w-7 stroke-[2.5] text-slate-400" />
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                          {t("AddEditItem.UploadImage")}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {t("AddEditItem.ImageUploadHint")}
                        </p>
                      </div>
                    </div>
                  )}
                </FieldLabel>
              </Field>
            </FieldGroup>
          </div>
          <div className="space-y-6 lg:col-span-2">
            <h2 className="border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              {t("AddEditItem.ItemParameters")}
            </h2>
            <FieldGroup className="space-y-4">
              <Field className="space-y-1">
                <FieldLabel htmlFor="item-name" className={labelCls}>
                  {t("AddEditItem.ItemName")} <span className="text-orange-500">*</span>
                </FieldLabel>
                <Input
                  disabled={itemLoading}
                  id="item-name"
                  placeholder={t("AddEditItem.ItemNamePlaceholder")}
                  value={editItemData.name}
                  onChange={(e) => setEditItemData((prev) => ({ ...prev, name: e.target.value }))}
                  className={inputCls}
                  required
                />
              </Field>
              <Field className="space-y-1">
                <FieldLabel htmlFor="item-description" className={labelCls}>
                  {t("AddEditItem.ItemDescription")}
                </FieldLabel>
                <Textarea
                  disabled={itemLoading}
                  value={editItemData.description}
                  onChange={(e) => setEditItemData((prev) => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px] w-full resize-none rounded-lg border border-slate-300 bg-white p-3 text-sm font-medium placeholder-slate-400 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  id="item-description"
                  placeholder={t("AddEditItem.ItemDescriptionPlaceholder")}
                />
              </Field>
            </FieldGroup>
          </div>
        </div>
        <div className="space-y-6 border-t border-slate-200 bg-white pt-5">
          <h2 className="border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            {t("AddEditItem.MetricsValuation")}
          </h2>
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field className="space-y-1">
              <FieldLabel htmlFor="item-unit" className={labelCls}>
                {t("AddEditItem.ItemUnit")} <span className="text-orange-500">*</span>
              </FieldLabel>
              <Select
                disabled={itemLoading}
                value={editItemData.unit}
                onValueChange={(value) => setEditItemData((prev) => ({ ...prev, unit: value }))}
              >
                <SelectTrigger id="item-unit" className="h-11 w-full rounded-lg border border-slate-300 bg-white text-sm font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20">
                  <SelectValue placeholder={t("AddEditItem.unitPlaceholder")} />
                </SelectTrigger>
                <SelectContent className="max-h-64 border border-slate-200 bg-white">
                  <SelectItem value="kg">{t("AddEditItem.unitTypes.kg")} (kg)</SelectItem>
                  <SelectItem value="DoZ">{t("AddEditItem.unitTypes.DoZ")} (DoZ)</SelectItem>
                  <SelectItem value="Box">{t("AddEditItem.unitTypes.Box")} (Box)</SelectItem>
                  <SelectItem value="Mtr">{t("AddEditItem.unitTypes.Mtr")} (Mtr)</SelectItem>
                  <SelectItem value="TbZ">{t("AddEditItem.unitTypes.TbZ")} (TbZ)</SelectItem>
                  <SelectItem value="Unt">{t("AddEditItem.unitTypes.Unt")} (Unt)</SelectItem>
                  <SelectItem value="g">{t("AddEditItem.unitTypes.g")} (g)</SelectItem>
                  <SelectItem value="Prs">{t("AddEditItem.unitTypes.Prs")} (Prs)</SelectItem>
                  <SelectItem value="pcs">{t("AddEditItem.unitTypes.Pcs")} (pcs)</SelectItem>
                  <SelectItem value="ml">{t("AddEditItem.unitTypes.ml")} (ml)</SelectItem>
                  <SelectItem value="l">{t("AddEditItem.unitTypes.L")} (L)</SelectItem>
                  <SelectItem value="packet">{t("AddEditItem.unitTypes.packet")}</SelectItem>
                  <SelectItem value="bora">{t("AddEditItem.unitTypes.bora")}</SelectItem>
                  <SelectItem value="peti">{t("AddEditItem.unitTypes.peti")}</SelectItem>
                  <SelectItem value="bundle">{t("AddEditItem.unitTypes.bundle")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field className="space-y-1">
              <FieldLabel htmlFor="MRP" className={labelCls}>
                {t("AddEditItem.ItemMRP")} <span className="text-orange-500">*</span>
              </FieldLabel>
              <Input
                disabled={itemLoading}
                type="number"
                min="0"
                step="0.01"
                value={editItemData.MRP}
                onChange={(e) => setEditItemData((prev) => ({ ...prev, MRP: e.target.value }))}
                onWheel={(e) => e.currentTarget.blur()}
                id="MRP"
                placeholder="₹ 0.00"
                className={`${inputCls} font-mono font-semibold`}
                required
              />
            </Field>
            <Field className="space-y-2 sm:col-span-2">
              <FieldLabel className={labelCls}>{t("AddEditItem.SellingPriceHeader")}</FieldLabel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={itemLoading}
                  onClick={() => setEditItemData((prev) => ({ ...prev, discountType: "%" }))}
                  aria-pressed={editItemData.discountType === "%"}
                  className={`rounded-xl border p-4 text-left transition-all ${editItemData.discountType === "%" ? "border-orange-500 bg-orange-50 ring-2 ring-orange-500/15" : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/40"}`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${editItemData.discountType === "%" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"}`}>%</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-800">{t("AddEditItem.SellingPriceOption1.header")}</span>
                      <span className="mt-1 block text-xs leading-4 text-slate-500">{t("AddEditItem.SellingPriceOption1.tagline")}</span>
                    </span>
                    <span className={`ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${editItemData.discountType === "%" ? "border-orange-500" : "border-slate-300"}`}>
                      {editItemData.discountType === "%" && <span className="h-2 w-2 rounded-full bg-orange-500" />}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  disabled={itemLoading}
                  onClick={() => setEditItemData((prev) => ({ ...prev, discountType: "Rs." }))}
                  aria-pressed={editItemData.discountType === "Rs."}
                  className={`rounded-xl border p-4 text-left transition-all ${editItemData.discountType === "Rs." ? "border-orange-500 bg-orange-50 ring-2 ring-orange-500/15" : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/40"}`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${editItemData.discountType === "Rs." ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"}`}>₹</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-800">{t("AddEditItem.SellingPriceOption2.header")}</span>
                      <span className="mt-1 block text-xs leading-4 text-slate-500">{t("AddEditItem.SellingPriceOption2.tagline")}</span>
                    </span>
                    <span className={`ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${editItemData.discountType === "Rs." ? "border-orange-500" : "border-slate-300"}`}>
                      {editItemData.discountType === "Rs." && <span className="h-2 w-2 rounded-full bg-orange-500" />}
                    </span>
                  </span>
                </button>
              </div>
            </Field>
            <Field className="space-y-1">
              <FieldLabel htmlFor="item-price" className={labelCls}>
                {editItemData.discountType === "%" ? t("AddEditItem.DiscountPercentage") : t("AddEditItem.FinalSellingAmount")}
                <span className="text-orange-500"> *</span>
              </FieldLabel>
              {editItemData.discountType === "%" ? (
                <Input
                  disabled={itemLoading}
                  id="item-price"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={editItemData.discount}
                  onChange={(e) => setEditItemData((prev) => ({ ...prev, discount: e.target.value }))}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder={`e.g. ${t("AddEditItem.DiscountPlaceholder")}`}
                  className={`${inputCls} font-mono font-semibold`}
                  autoComplete="off"
                  required
                />
              ) : (
                <Input
                  disabled={itemLoading}
                  id="item-price"
                  type="number"
                  min="0"
                  max={editItemData.MRP || undefined}
                  step="0.01"
                  value={editItemData.sellingPrice}
                  onChange={(e) => setEditItemData((prev) => ({ ...prev, sellingPrice: e.target.value }))}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="e.g. 420.00"
                  className={`${inputCls} font-mono font-semibold`}
                  autoComplete="off"
                  required
                />
              )}
              <p className="text-xs text-slate-500">
                {editItemData.discountType === "%"
                  ? `${t("AddEditItem.DiscountPercentageHelp")}${editItemData.MRP ? ` ${t("AddEditItem.MRPAmount")} ₹${mrpAmount.toFixed(2)}, ${t("AddEditItem.FinalPriceWillBe")} ₹${finalSellingPrice.toFixed(2)}.` : ` ${t("AddEditItem.EnterMRPToPreview")}`}`
                  : t("AddEditItem.FinalSellingPriceHelp")}
              </p>
            </Field>
            <div className="flex min-h-[100px] flex-col justify-center rounded-xl border border-orange-200 bg-orange-50/60 p-3 sm:p-4 sm:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-orange-700">{t("AddEditItem.FinalSellingPrice")}</p>
                  <p className="mt-1 text-xs text-slate-500">{t("AddEditItem.FinalSellingPriceDescription")}</p>
                </div>
                <p className="whitespace-nowrap font-mono text-xl font-bold text-orange-600">₹{finalSellingPrice.toFixed(2)}</p>
              </div>
              {editItemData.discountType === "%" && discountAmount > 0 && (
                <p className="mt-2 text-xs text-slate-500">{t("AddEditItem.DiscountFromMRP")}: ₹{discountAmount.toFixed(2)}</p>
              )}
            </div>
          </FieldGroup>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <Button
            variant="outline"
            type="button"
            className="h-10 rounded-xl border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:border-slate-300"
            onClick={handleCancel}
            disabled={isLoading || itemLoading}
          >
            {t("AddEditItem.Cancel")}
          </Button>
          <Button
            type="submit"
            className="h-10 rounded-xl bg-orange-500 px-6 text-sm font-bold text-white shadow-md shadow-orange-600/10 transition-all active:scale-[0.99] hover:bg-orange-600"
            disabled={isLoading || itemLoading}
          >
            {t("AddEditItem.UpdateItem")}
          </Button>
        </div>
      </form>
    </div>
  );
}
export default EditItem;
