import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Trash2, FileText, Upload, ZoomIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { useTranslation } from "react-i18next";
import { addItemReq } from '@/redux/features/itemSlice';

const initialData = {
  name: "",
  description: "",
  image: null,
  MRP: "",
  sellingPrice: "",
  discount: "",
  discountType: "%",
  stock: 0,
  unit: "",
  status: "Active",
};

const labelCls = "block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2";
const inputCls = "w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium";

function AddItems() {
  const [preview, setPreview] = useState(null);
  const [addItemData, setAddItemData] = useState(initialData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { itemLoading } = useSelector((state) => state.item);
  const { t } = useTranslation();

  const mrpAmount = Number(addItemData.MRP) || 0;
  const enteredDiscount = Number(addItemData.discount) || 0;
  const discountAmount = addItemData.discountType === "%"
    ? mrpAmount * (enteredDiscount / 100)
    : Math.max(0, mrpAmount - (Number(addItemData.sellingPrice) || 0));
  const finalSellingPrice = addItemData.discountType === "%"
    ? Math.max(0, mrpAmount - discountAmount)
    : Math.max(0, Number(addItemData.sellingPrice) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mrpAmount < 0 || finalSellingPrice < 0) {
      toast.error(t("AddEditItem.PricesCannotBeNegative"));
      return;
    }
    if (addItemData.discountType === "%" && (enteredDiscount < 0 || enteredDiscount > 100)) {
      toast.error(t("AddEditItem.DiscountRangeError"));
      return;
    }
    if (addItemData.discountType === "Rs." && finalSellingPrice > mrpAmount) {
      toast.error(t("AddEditItem.SellingAmountExceedsMRP"));
      return;
    }

    const formdata = new FormData();
    for (const key in addItemData) {
      if (["discount", "discountType", "sellingPrice"].includes(key)) continue;
      formdata.append(key, addItemData[key]);
    }
    formdata.append("sellingPrice", finalSellingPrice.toFixed(2));

    toast.promise(
      dispatch(addItemReq(formdata)).unwrap(),
      {
        loading: t("AddEditItem.AddingItem"),
        success: (res) => {
          setAddItemData(initialData);
          setPreview(null);
          navigate("/user/all-items");
          return res?.message || t("AddEditItem.ItemAddedSuccessfully");
        },
        error: (err) => {
          return err?.message || t("AddEditItem.SomethingWentWrong");
        }
      }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setAddItemData(prev => ({ ...prev, image: file }));
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="opacity-0 animate-fade-in-scale transition-all duration-500 bg-white min-h-screen text-slate-900 antialiased px-6 py-4 md:px-12 md:py-6 font-sans">
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-12 gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-orange-500" size={28} /> {t("AddEditItem.PageTitle")}
            </h1>
            <p className="text-sm text-gray-500">{t("AddEditItem.PageSubtitle")}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start bg-white">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
              {t("AddEditItem.MediaAsset")}
            </h2>
            <FieldGroup>
              <Field className="relative">
                <FieldLabel htmlFor="item-image" className="cursor-pointer block">
                  {preview ? (
                    <div className="flex flex-col items-center justify-center h-full w-full bg-white">
                      <div className="flex relative flex-col p-3 pb-2 justify-between items-center h-56 w-56 border border-slate-300 rounded-xl bg-white shadow-sm">
                        <div className="flex items-center justify-center w-full h-40 rounded-lg overflow-hidden bg-slate-50/50">
                          <img src={preview} alt={t("AddEditItem.ImagePreviewAlt")} className="h-full object-cover rounded-lg" />
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="absolute duration-300 transition-opacity top-3 left-3 w-[200px] h-40 opacity-0 hover:opacity-100 flex items-center justify-center">
                              <div className="w-full h-full bg-slate-900/80 rounded-lg flex items-center justify-center cursor-pointer shadow-sm">
                                <ZoomIn className="text-white h-10 w-10" />
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="bg-white border border-slate-200">
                            <DialogHeader>
                              <DialogTitle className="text-slate-900 font-bold">{t("AddEditItem.ImagePreviewTitle")}</DialogTitle>
                              <DialogDescription className="text-slate-400 text-xs">{t("AddEditItem.ImagePreviewDescription")}</DialogDescription>
                              <div className="h-full w-full flex items-center justify-center pt-4">
                                <img src={preview} alt={t("AddEditItem.ImagePreviewAlt")} className="max-h-[380px] w-full rounded-xl object-contain bg-white" />
                              </div>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                        <div className="flex items-center justify-between w-full pt-1">
                          <FieldLabel htmlFor="item-image2" className={`text-xs font-bold ${itemLoading ? "text-slate-400" : "text-orange-500 hover:text-orange-600"} ml-1 cursor-pointer uppercase tracking-wider`}>
                            {t("AddEditItem.ChangeImage")}
                            <Input disabled={itemLoading} id="item-image2" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                          </FieldLabel>
                          <Button
                            disabled={itemLoading}
                            variant="ghost"
                            className="h-8 w-8 p-0 cursor-pointer hover:bg-rose-50 rounded-lg text-rose-500"
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setPreview(null);
                              setAddItemData(prev => ({ ...prev, image: null }));
                            }}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2.5} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center w-full h-full bg-white">
                      <div className="w-56 h-56 flex flex-col items-center justify-center border border-slate-300 border-dashed rounded-xl cursor-pointer hover:border-orange-500 transition-colors bg-white shadow-sm p-4 text-center">
                        <Input disabled={itemLoading} id="item-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        <Upload className="h-7 w-7 text-slate-400 mb-2 stroke-[2.5]" />
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">{t("AddEditItem.UploadImage")}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{t("AddEditItem.ImageUploadHint")}</p>
                      </div>
                    </div>
                  )}
                </FieldLabel>
              </Field>
            </FieldGroup>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
              {t("AddEditItem.ItemParameters")}
            </h2>
            <FieldGroup className="space-y-4">
              <Field className="space-y-1">
                <FieldLabel htmlFor="item-name" className={labelCls}>{t("AddEditItem.ItemName")} <span className='text-orange-500'>*</span></FieldLabel>
                <Input
                  disabled={itemLoading}
                  id="item-name"
                  placeholder={t("AddEditItem.ItemNamePlaceholder")}
                  value={addItemData.name}
                  onChange={(e) => setAddItemData(prev => ({ ...prev, name: e.target.value }))}
                  className={inputCls}
                  required
                  autoComplete="off"
                />
              </Field>
              <Field className="space-y-1">
                <FieldLabel htmlFor="item-description" className={labelCls}>{t("AddEditItem.ItemDescription")}</FieldLabel>
                <Textarea
                  disabled={itemLoading}
                  value={addItemData.description}
                  onChange={(e) => setAddItemData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full min-h-[100px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder-slate-400 resize-none"
                  id="item-description"
                  placeholder={t("AddEditItem.ItemDescriptionPlaceholder")}
                />
              </Field>
            </FieldGroup>
          </div>
        </div>
        <div className="space-y-6 pt-4 border-t border-slate-200 bg-white">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
            {t("AddEditItem.MetricsValuation")}
          </h2>
          <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field className="space-y-1">
              <FieldLabel htmlFor="item-unit" className={labelCls}>{t("AddEditItem.ItemUnit")} <span className='text-orange-500'>*</span></FieldLabel>
              <Select
                disabled={itemLoading}
                value={addItemData.unit}
                onValueChange={(value) => setAddItemData(prev => ({ ...prev, unit: value }))}
              >
                <SelectTrigger id="item-unit" className="w-full h-11 bg-white text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500">
                  <SelectValue placeholder={t("AddEditItem.unitPlaceholder")} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 max-h-64">
                  <SelectItem value="kg">{t("AddEditItem.unitTypes.kg")} (kg)</SelectItem>
                  <SelectItem value="DoZ">{t("AddEditItem.unitTypes.DoZ")} (DoZ)</SelectItem>
                  <SelectItem value="Box">{t("AddEditItem.unitTypes.Box")} (Box)</SelectItem>
                  <SelectItem value="Mtr">{t("AddEditItem.unitTypes.Mtr")} (Mtr)</SelectItem>
                  <SelectItem value="TbZ">{t("AddEditItem.unitTypes.TbZ")} (TbZ)</SelectItem>
                  <SelectItem value="Unt">{t("AddEditItem.unitTypes.Unt")} (Unt)</SelectItem>
                  <SelectItem value="g">{t("AddEditItem.unitTypes.g")} (g)</SelectItem>
                  <SelectItem value="Prs">{t("AddEditItem.unitTypes.Prs")} (Prs)</SelectItem>
                  <SelectItem value="pcs">{t("AddEditItem.unitTypes.Pcs")} (Pcs)</SelectItem>
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
              <FieldLabel htmlFor="MRP" className={labelCls}>{t("AddEditItem.ItemMRP")} <span className='text-orange-500'>*</span></FieldLabel>
              <Input
                disabled={itemLoading}
                type="number"
                value={addItemData.MRP}
                onChange={(e) => setAddItemData(prev => ({ ...prev, MRP: e.target.value }))}
                onWheel={(e) => e.target.blur()}
                id="MRP"
                placeholder={t("AddEditItem.MRPPlaceholder")}
                className={`${inputCls} font-mono font-semibold`}
                required
                autoComplete="off"
              />
            </Field>
            <Field className="space-y-2 sm:col-span-2">
              <FieldLabel className={labelCls}>{t("AddEditItem.SellingPriceHeader")}</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={itemLoading}
                  onClick={() => setAddItemData(prev => ({ ...prev, discountType: "%" }))}
                  aria-pressed={addItemData.discountType === "%"}
                  className={`rounded-xl border p-4 text-left transition-all ${addItemData.discountType === "%" ? "border-orange-500 bg-orange-50 ring-2 ring-orange-500/15" : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/40"}`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${addItemData.discountType === "%" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"}`}>%</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-800">{t("AddEditItem.SellingPriceOption1.header")}</span>
                      <span className="mt-1 block text-xs leading-4 text-slate-500">{t("AddEditItem.SellingPriceOption1.tagline")}</span>
                    </span>
                    <span className={`ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${addItemData.discountType === "%" ? "border-orange-500" : "border-slate-300"}`}>
                      {addItemData.discountType === "%" && <span className="h-2 w-2 rounded-full bg-orange-500" />}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  disabled={itemLoading}
                  onClick={() => setAddItemData(prev => ({ ...prev, discountType: "Rs." }))}
                  aria-pressed={addItemData.discountType === "Rs."}
                  className={`rounded-xl border p-4 text-left transition-all ${addItemData.discountType === "Rs." ? "border-orange-500 bg-orange-50 ring-2 ring-orange-500/15" : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/40"}`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${addItemData.discountType === "Rs." ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"}`}>₹</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-800">{t("AddEditItem.SellingPriceOption2.header")}</span>
                      <span className="mt-1 block text-xs leading-4 text-slate-500">{t("AddEditItem.SellingPriceOption2.tagline")}</span>
                    </span>
                    <span className={`ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${addItemData.discountType === "Rs." ? "border-orange-500" : "border-slate-300"}`}>
                      {addItemData.discountType === "Rs." && <span className="h-2 w-2 rounded-full bg-orange-500" />}
                    </span>
                  </span>
                </button>
              </div>
            </Field>
            <Field className="space-y-1">
              <FieldLabel htmlFor="item-price" className={labelCls}>
                {addItemData.discountType === "%" ? `${t("AddEditItem.DiscountPercentage")}` : `${t("AddEditItem.FinalSellingAmount")}`}
                <span className="text-orange-500"> *</span>
              </FieldLabel>
              {addItemData.discountType === "%" ? (
                <Input
                  disabled={itemLoading}
                  id="item-price"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={addItemData.discount}
                  onChange={(e) => setAddItemData(prev => ({ ...prev, discount: e.target.value }))}
                  onWheel={(e) => e.target.blur()}
                  placeholder={`e.g. ${t("AddEditItem.DiscountPlaceholder")}`}
                  className={`${inputCls} font-mono font-semibold`}
                  required
                  autoComplete="off"
                />
              ) : (
                <Input
                  disabled={itemLoading}
                  id="item-price"
                  type="number"
                  min="0"
                  max={addItemData.MRP || undefined}
                  step="0.01"
                  value={addItemData.sellingPrice}
                  onChange={(e) => setAddItemData(prev => ({ ...prev, sellingPrice: e.target.value }))}
                  onWheel={(e) => e.target.blur()}
                  placeholder={t("AddEditItem.SellingAmountPlaceholder")}
                  className={`${inputCls} font-mono font-semibold`}
                  required
                  autoComplete="off"
                />
              )}
              <p className="text-xs text-slate-500">
                {addItemData.discountType === "%"
                  ? `${t("AddEditItem.DiscountPercentageHelp")}${addItemData.MRP ? ` ${t("AddEditItem.MRPAmount")} ₹${mrpAmount.toFixed(2)}, ${t("AddEditItem.FinalPriceWillBe")} ₹${finalSellingPrice.toFixed(2)}.` : ` ${t("AddEditItem.EnterMRPToPreview")}`}`
                  : t("AddEditItem.FinalSellingPriceHelp")}
              </p>
            </Field>
            <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-3 sm:p-4 flex flex-col justify-center min-h-[100px]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-orange-700">
                    {t("AddEditItem.FinalSellingPrice")}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {t("AddEditItem.FinalSellingPriceDescription")}
                  </p>
                </div>
                <p className="text-xl font-bold font-mono text-orange-600 whitespace-nowrap">
                  ₹{finalSellingPrice.toFixed(2)}
                </p>
              </div>
              {addItemData.discountType === "%" && discountAmount > 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  {t("AddEditItem.DiscountFromMRP")}: ₹{discountAmount.toFixed(2)}
                </p>
              )}
            </div>
          </FieldGroup>
        </div>
        <div className="pt-4 border-t border-slate-200 flex justify-end items-center gap-3">
          <Button
            variant="outline"
            type="button"
            className="border-slate-200 hover:border-slate-300 text-slate-600 bg-white text-sm h-10 px-5 font-bold rounded-xl transition-all shadow-sm"
            onClick={() => {
              setAddItemData(initialData);
              setPreview(null);
            }}
            disabled={itemLoading}
          >
            {t("AddEditItem.Cancel")}
          </Button>
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm h-10 px-6 rounded-xl transition-all shadow-md shadow-orange-600/10"
            disabled={itemLoading}
          >
            {t("AddEditItem.SaveItem")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddItems;