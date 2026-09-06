import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Trash2, Upload, ZoomIn, ClipboardPen  } from 'lucide-react';
import Loader from '../../components/loaders/loader2';

// Custom UI Imports
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { updateItemReq } from '../../redux/features/itemSlice';
import { useDispatch, useSelector } from 'react-redux';

const initialData = {
  name: "",
  description: "",
  image: null,
  MRP: "",
  sellingPrice: "",
  stock: 0,
  unit: "",
  status: "Active",
};

// Precise high-contrast typographical settings matching the Invoice final configuration
const labelCls = "block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2";
const inputCls = "w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium";

function EditItem() {
  const [preview, setPreview] = useState(null);
  const [editItemData, setEditItemData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { itemLoading } = useSelector((state) => state.item);

  const fetchItemFromBackend = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`/item/item-id/${id}`);

      if (response.status === 200) {
        const itemData = response.data.data;
        setEditItemData({
          name: itemData.name || "",
          description: itemData.description || "",
          image: itemData.image || null,
          MRP: itemData.MRP || "",
          sellingPrice: itemData.sellingPrice || "",
          stock: itemData.stock || 0,
          unit: itemData.unit || "",
          status: itemData.status || "Active",
        });
        if (itemData.imageUrl || itemData.image) {
          setPreview(itemData.imageUrl || itemData.image);
        }
      } else {
        toast.error("Failed to fetch item data");
      }
    } catch (error) {
      console.error("Error fetching item data:", error);
      toast.error("An error occurred while fetching item data");
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    fetchItemFromBackend();
  }, [id]);

  //mocking the update process for now, as the backend update endpoint is not yet implemented
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      for (const key in editItemData) {
        formData.append(key, editItemData[key]);
      }

      toast.promise(
        dispatch(updateItemReq({ id, data: formData })).unwrap(),
        {
          loading: "Updating item...",
          success: (res) => {
            navigate("/user/all-items");
            return res?.message || "Item updated successfully!";
          },
          error: (err) => err?.message || "Failed to update item",
        }
      );

    } catch (error) {
      console.error("Error updating item:", error);
      // Safely extract the backend error message if it exists
      toast.error(
        error.response?.data?.message || "An error occurred while updating the item"
      );
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setEditItemData({ ...editItemData, image: file });
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  return isLoading ?
    <div className='flex h-full justify-center items-center w-full'>
      <Loader />
    </div> : (
      <div className="opacity-0 animate-fade-in-scale transition-all duration-500 bg-white min-h-screen text-slate-900 antialiased px-6 py-4 md:px-12 md:py-6 font-sans">
        <form onSubmit={handleSubmit} className="space-y-12">

          {/* ── Page Header ── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-12 gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ClipboardPen className="text-orange-500" size={28} />
                Edit Item Details
              </h1>
              <p className="text-sm text-gray-500">Update item parameters, visual assets, and valuation metrics.</p>
            </div>
          </div>

          {/* ── Section 1: Split Media & Descriptor Column Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start bg-white">

            {/* Item Visual Media File Drop Block */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                Media Asset
              </h2>
              <FieldGroup>
                <Field className="relative">
                  <FieldLabel htmlFor="item-image" className="cursor-pointer block">
                    {preview ? (
                      <div className="flex flex-col items-center justify-center h-full w-full bg-white">
                        <div className="flex relative flex-col p-3 pb-2 justify-between items-center h-56 w-56 border border-slate-300 rounded-xl bg-white shadow-sm">
                          <div className="flex items-center justify-center w-full h-40 rounded-lg overflow-hidden bg-slate-50/50">
                            <img src={preview} alt="Preview" className="h-full object-cover rounded-lg" />
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
                                <DialogTitle className="text-slate-900 font-bold">Image Preview</DialogTitle>
                                <DialogDescription className="text-slate-400 text-xs">Manage your item's asset visual profile.</DialogDescription>
                                <div className="h-full w-full flex items-center justify-center pt-4">
                                  <img src={preview} alt="Preview Zoom" className="max-h-[380px] w-full rounded-xl object-contain bg-white" />
                                </div>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>

                          <div className="flex items-center justify-between w-full pt-1">
                            <FieldLabel htmlFor="item-image2" className={`text-xs font-bold ${(isLoading || itemLoading) ? "text-slate-400 cursor-not-allowed" : "text-orange-500 hover:text-orange-600 cursor-pointer"} ml-1 uppercase tracking-wider`}>
                              Change Image
                              <Input disabled={isLoading || itemLoading} id="item-image2" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </FieldLabel>
                            <Button
                              disabled={isLoading || itemLoading}
                              variant="ghost"
                              className="h-8 w-8 p-0 cursor-pointer hover:bg-rose-50 rounded-lg text-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setPreview(null);
                                setEditItemData({ ...editItemData, image: "" });
                              }
                              }
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={2.5} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center w-full h-full bg-white">
                        <div className={`w-56 h-56 flex flex-col items-center justify-center border border-slate-300 border-dashed rounded-xl transition-colors bg-white shadow-sm p-4 text-center ${(isLoading || itemLoading) ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:border-orange-500"}`}>
                          <Input disabled={isLoading || itemLoading} id="item-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                          <Upload className="h-7 w-7 text-slate-400 mb-2 stroke-[2.5]" />
                          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Upload Image</p>
                          <p className="text-[11px] text-slate-400 mt-1">PNG, JPG formats up to 5MB metrics</p>
                        </div>
                      </div>
                    )}
                  </FieldLabel>
                </Field>
              </FieldGroup>
            </div>

            {/* Primary Core Descriptor Fields */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                Item Parameters
              </h2>
              <FieldGroup className="space-y-4">
                <Field className="space-y-1">
                  <FieldLabel htmlFor="item-name" className={labelCls}>Item Name <span className='text-orange-500'>*</span></FieldLabel>
                  <Input
                    disabled={isLoading || itemLoading}
                    id="item-name"
                    placeholder="Enter your item name description..."
                    value={editItemData.name}
                    onChange={(e) => setEditItemData({ ...editItemData, name: e.target.value })}
                    className={inputCls}
                    required
                  />
                </Field>
                <Field className="space-y-1">
                  <FieldLabel htmlFor="item-description" className={labelCls}>Item Description</FieldLabel>
                  <Textarea
                    disabled={isLoading || itemLoading}
                    value={editItemData.description}
                    onChange={(e) => setEditItemData({ ...editItemData, description: e.target.value })}
                    className="w-full min-h-[100px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder-slate-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    id="item-description"
                    placeholder="Enter explicit stock item specifications..."
                  />
                </Field>
              </FieldGroup>
            </div>
          </div>

          {/* ── Section 2: Metrics and Values Core Architecture Column Split ── */}
          <div className="space-y-6 pt-4 border-t border-slate-200 bg-white">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
              Metrics & Valuation
            </h2>

            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Field className="space-y-1">
                <FieldLabel htmlFor="item-unit" className={labelCls}>Unit <span className='text-orange-500'>*</span></FieldLabel>
                <Select
                  disabled={isLoading || itemLoading}
                  value={editItemData.unit}
                  onValueChange={(value) => setEditItemData({ ...editItemData, unit: value })}
                >
                  <SelectTrigger id="item-unit" className="w-full h-11 bg-white text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder="Select item metrics unit" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 max-h-64">
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="DoZ">Dozen (DoZ)</SelectItem>
                    <SelectItem value="Box">Box (Box)</SelectItem>
                    <SelectItem value="Mtr">Meter (Mtr)</SelectItem>
                    <SelectItem value="TbZ">Tablet (TbZ)</SelectItem>
                    <SelectItem value="Unt">Unit (Unt)</SelectItem>
                    <SelectItem value="g">Gram (g)</SelectItem>
                    <SelectItem value="Prs">Pair (Prs)</SelectItem>
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                    <SelectItem value="ml">Millilitre (ml)</SelectItem>
                    <SelectItem value="l">Litre (L)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* <Field className="space-y-1">
              <FieldLabel htmlFor="item-status" className={labelCls}>Status <span className='text-orange-500'>*</span></FieldLabel>
              <Select
                disabled={isLoading || itemLoading}
                value={editItemData.status}
                onValueChange={(value) => setEditItemData({ ...editItemData, status: value })}
              >
                <SelectTrigger id="item-status" className="w-full h-11 bg-white text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue placeholder="Select current status profile" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200">
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field> */}

              <Field className="space-y-1">
                <FieldLabel htmlFor="MRP" className={labelCls}>MRP <span className='text-orange-500'>*</span></FieldLabel>
                <Input
                  disabled={isLoading || itemLoading}
                  type="number"
                  value={editItemData.MRP}
                  onChange={(e) => setEditItemData({ ...editItemData, MRP: e.target.value })}
                  id="MRP"
                  placeholder="₹ 0.00"
                  className={`${inputCls} font-mono font-semibold`}
                  required
                />
              </Field>

              <Field className="space-y-1">
                <FieldLabel htmlFor="item-price" className={labelCls}>Selling Price <span className='text-orange-500'>*</span></FieldLabel>
                <Input
                  disabled={isLoading || itemLoading}
                  type="number"
                  value={editItemData.sellingPrice}
                  onChange={(e) => setEditItemData({ ...editItemData, sellingPrice: e.target.value })}
                  id="item-price"
                  placeholder="₹ 0.00"
                  className={`${inputCls} font-mono font-semibold`}
                  required
                />
              </Field>
            </FieldGroup>

            {/* <FieldGroup className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
          </FieldGroup> */}
          </div>

          {/* ── Action Footer Console Bar ── */}
          <div className="pt-4 border-t border-slate-200 flex justify-end items-center gap-3">
            <Button
              variant="outline"
              type="button"
              className="border-slate-200 hover:border-slate-300 text-slate-600 bg-white text-sm h-10 px-5 font-bold rounded-xl transition-all shadow-sm"
              onClick={() => navigate("/user/all-items")}
              disabled={isLoading || itemLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm h-10 px-6 rounded-xl transition-all shadow-md shadow-orange-600/10"
              disabled={isLoading || itemLoading}
            >
              Update Item
            </Button>
          </div>

        </form>
      </div>
    );
}

export default EditItem;