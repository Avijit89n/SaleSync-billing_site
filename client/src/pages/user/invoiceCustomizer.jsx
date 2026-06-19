import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Trash2, Upload, Settings, Eye, FileCog } from 'lucide-react';

// Custom UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';

// Dynamic Rendering Import
import { PDFViewer } from '@react-pdf/renderer';
import InvoiceDesign1 from "@/components/other-ui/invoice-design-1";
import InvoiceDesign2 from "@/components/other-ui/invoice-design-2";
import InvoiceDesign3 from "@/components/other-ui/invoice-design-3";
import InvoiceDesign4 from "@/components/other-ui/invoice-design-4";
import api from '@/axios/interceptor';
import Loader1 from '@/components/loaders/loader1';
import Loader from '@/components/loaders/loader2';

const initialData = {
  companyName: "",
  gstin: "",
  phone: "",
  email: "",
  address: "",
  logo: null,
  signature: null,
  layout: "invoiceDesign1",
};

const invoiceLayouts = [
  {
    id: "invoiceDesign1",
    name: "Classic Blueprint",
    description: "Traditional professional invoice layout",
    component: InvoiceDesign1,
  },
  {
    id: "invoiceDesign2",
    name: "Modern Minimalist",
    description: "Clean and modern invoice design",
    component: InvoiceDesign2,
  },
  {
    id: "invoiceDesign3",
    name: "Corporate Premium",
    description: "Premium business-focused invoice template",
    component: InvoiceDesign3,
  },
  {
    id: "invoiceDesign4",
    name: "Compact Transactional",
    description: "Compact invoice for quick billing",
    component: InvoiceDesign4,
  },
];

// High-contrast typographical settings matching your original configuration token keys
const labelCls = "block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2";
const inputCls = "w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium";

function InvoiceCustomizer() {
  const [activePreviewLayout, setActivePreviewLayout] = useState(null);
  const [preview, setPreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    console.log("Submitted Data:", companyInfo);
    
    const formData = new FormData();
    formData.append("companyName", companyInfo.companyName);
    formData.append("gstin", companyInfo.gstin);
    formData.append("phone", companyInfo.phone);
    formData.append("email", companyInfo.email);
    formData.append("address", companyInfo.address);
    formData.append("layout", companyInfo.layout);
    
    if (companyInfo.logo instanceof File) {
      formData.append("companyLogo", companyInfo.logo);
    } else {
      formData.append("currentLogo", companyInfo.logo || "");
    }

    if (companyInfo.signature instanceof File) {
      formData.append("companySignature", companyInfo.signature);
    } else {
      formData.append("currentSignature", companyInfo.signature || "");
    }

    toast.promise(
      api.post("/invoice-customizer/create-update", formData),
      {
        loading: 'Saving invoice settings...',
        success: (res) => {
          setSaving(false);
          return res?.message || "Invoice customization saved successfully!";
        },
        error: (err) => {
          setSaving(false);
          return err?.response?.data?.message || "Failed to save invoice settings. Please try again.";
        }
      }
    );
  };

  useEffect(() => {
    setFetchLoading(true)
    const fetchInvoiceSettings = async () => {
      try {
        const res = await api.get("/invoice-customizer/get-invoice-settings");
        const data = res?.data?.data || {};

        setCompanyInfo({
          companyName: data.companyName || "",
          gstin: data.companyGSTIN || "",
          phone: data.companyPhone || "",
          email: data.companyEmail || "",
          address: data.companyAddress || "",
          layout: data.companyInvoiceLayoutId || "invoiceDesign1",
          logo: data.companyLogo || null,
          signature: data.companySignature || null,
        });

        if (data.companyLogo) setPreview(data.companyLogo);
        if (data.companySignature) setSignaturePreview(data.companySignature);
        
      } catch (err) {
        console.log(err);
        setCompanyInfo(initialData);
      } finally {
        setFetchLoading(false)
      }
    };

    fetchInvoiceSettings();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PNG and JPG images are supported.");
      return;
    }

    setCompanyInfo(prev => ({ ...prev, logo: file }));

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PNG and JPG images are supported.");
      return;
    }

    setCompanyInfo(prev => ({ ...prev, signature: file }));

    const reader = new FileReader();
    reader.onloadend = () => setSignaturePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const PreviewComponent = invoiceLayouts.find(l => l.id === activePreviewLayout)?.component;

  return fetchLoading ?
    <div className='h-full flex justify-center items-center'>
      <Loader />
    </div>
    : (
      <div className="opacity-0 animate-fade-in-scale transition-all duration-500 bg-white min-h-screen text-slate-900 antialiased px-6 py-4 md:px-12 md:py-6 font-sans">
        <form onSubmit={handleSubmit} className="space-y-12">

          {/* ── Page Header ── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-12 gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileCog className="text-orange-500" size={28} />Customize Invoice
              </h1>
              <p className="text-sm text-gray-500">Configure global metadata structures, custom branding vectors, and print engine profiles.</p>
            </div>
          </div>

          {/* ── Section 1: Logo, Signature & Company Info ── */}
          {/* Removed items-start to allow columns to stretch equally */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 bg-white">

            {/* Logo & Signature Left Column Block */}
            <div className="space-y-8 flex flex-col">
              
              {/* Logo Block */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                  Logo & Branding
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
                            <div className="flex items-center justify-between w-full pt-1">
                              <FieldLabel htmlFor="item-image2" className={`text-xs font-bold ${saving ? "text-slate-400" : "text-orange-500 hover:text-orange-600"} ml-1 cursor-pointer uppercase tracking-wider`}>
                                Change Image
                                <Input disabled={saving} id="item-image2" type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" className="hidden" onChange={handleImageChange} />
                              </FieldLabel>
                              <Button
                                disabled={saving}
                                variant="ghost"
                                className="h-8 w-8 p-0 cursor-pointer hover:bg-rose-50 rounded-lg text-rose-500"
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPreview(null);
                                  setCompanyInfo(prev => ({ ...prev, logo: null }));
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
                            <Input disabled={saving} id="item-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            <Upload className="h-7 w-7 text-slate-400 mb-2 stroke-[2.5]" />
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Upload Logo</p>
                            <p className="text-[11px] text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                      )}
                    </FieldLabel>
                  </Field>
                </FieldGroup>
              </div>

              {/* Signature Block */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                  Authorized Signature
                </h2>
                <FieldGroup>
                  <Field className="relative">
                    <FieldLabel htmlFor="item-signature" className="cursor-pointer block">
                      {signaturePreview ? (
                        <div className="flex flex-col items-center justify-center h-full w-full bg-white">
                          <div className="flex relative flex-col p-3 pb-2 justify-between items-center h-48 w-56 border border-slate-300 rounded-xl bg-white shadow-sm">
                            <div className="flex items-center justify-center w-full h-32 rounded-lg overflow-hidden bg-slate-50/50">
                              <img src={signaturePreview} alt="Signature Preview" className="h-full object-contain rounded-lg" />
                            </div>
                            <div className="flex items-center justify-between w-full pt-1">
                              <FieldLabel htmlFor="item-signature2" className={`text-xs font-bold ${saving ? "text-slate-400" : "text-orange-500 hover:text-orange-600"} ml-1 cursor-pointer uppercase tracking-wider`}>
                                Change Signature
                                <Input disabled={saving} id="item-signature2" type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" className="hidden" onChange={handleSignatureChange} />
                              </FieldLabel>
                              <Button
                                disabled={saving}
                                variant="ghost"
                                className="h-8 w-8 p-0 cursor-pointer hover:bg-rose-50 rounded-lg text-rose-500"
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSignaturePreview(null);
                                  setCompanyInfo(prev => ({ ...prev, signature: null }));
                                }}
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={2.5} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center w-full h-full bg-white">
                          <div className="w-56 h-48 flex flex-col items-center justify-center border border-slate-300 border-dashed rounded-xl cursor-pointer hover:border-orange-500 transition-colors bg-white shadow-sm p-4 text-center">
                            <Input disabled={saving} id="item-signature" type="file" accept="image/*" className="hidden" onChange={handleSignatureChange} />
                            <Upload className="h-7 w-7 text-slate-400 mb-2 stroke-[2.5]" />
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Upload Signature</p>
                            <p className="text-[11px] text-slate-400 mt-1">PNG, JPG transparent bg ideal</p>
                          </div>
                        </div>
                      )}
                    </FieldLabel>
                  </Field>
                </FieldGroup>
              </div>

            </div>

            {/* Core Info Fields - Added flex layout to stretch to the bottom */}
            <div className="lg:col-span-2 flex flex-col h-full space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                Company Information
              </h2>
              {/* Added flex-1 to push the address down appropriately */}
              <FieldGroup className="flex-1 flex flex-col space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field className="space-y-1">
                    <FieldLabel htmlFor="comp-name" className={labelCls}>Company name <span className='text-orange-500'>*</span></FieldLabel>
                    <Input disabled={saving} id="comp-name" placeholder="Enter Company Name" value={companyInfo.companyName} onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })} className={inputCls} required />
                  </Field>
                  <Field className="space-y-1">
                    <FieldLabel htmlFor="comp-gstin" className={labelCls}>GSTIN (tax id) <span className='text-orange-500'>*</span></FieldLabel>
                    <Input disabled={saving} id="comp-gstin" placeholder="Enter GSTIN" value={companyInfo.gstin} onChange={(e) => setCompanyInfo({ ...companyInfo, gstin: e.target.value })} className={inputCls} required />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field className="space-y-1">
                    <FieldLabel htmlFor="comp-phone" className={labelCls}>Company Phone No <span className='text-orange-500'>*</span></FieldLabel>
                    <Input disabled={saving} id="comp-phone" placeholder="Enter Phone Number" value={companyInfo.phone} onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })} className={inputCls} required />
                  </Field>
                  <Field className="space-y-1">
                    <FieldLabel htmlFor="comp-email" className={labelCls}>Email <span className='text-orange-500'>*</span></FieldLabel>
                    <Input disabled={saving} id="comp-email" type="email" placeholder="Enter Email Address" value={companyInfo.email} onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })} className={inputCls} required />
                  </Field>
                </div>
                {/* Address field absorbs the remaining space */}
                <Field className="flex-1 flex flex-col space-y-1 pb-1">
                  <FieldLabel htmlFor="comp-address" className={labelCls}>Company address</FieldLabel>
                  <Textarea disabled={saving} value={companyInfo.address} onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })} className="flex-1 w-full min-h-[150px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder-slate-400 resize-none" id="comp-address" placeholder="Enter Company Address..." />
                </Field>
              </FieldGroup>
            </div>
          </div>

          {/* ── Section 2: Invoice Layout Architecture (Scalable Inventory Engine matched to Orange Theme) ── */}
          <div className="space-y-6 pt-8 border-t border-slate-200 bg-white">

            {/* Section Section Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Output Documentation Blueprints
                </h2>
              </div>
            </div>

            {/* High-Performance Extensible Blueprint Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {invoiceLayouts.map((layout, index) => {
                const isSelected = companyInfo.layout === layout.id;

                return (
                  <div
                    key={layout.id}
                    onClick={() => {
                      if (saving) return;
                      setCompanyInfo({ ...companyInfo, layout: layout.id });
                    }}
                    className={`${saving ? "pointer-events-none opacity-50" : ""} group relative flex flex-col justify-between rounded-xl border p-5 bg-white cursor-pointer transition-all duration-200 select-none ${isSelected
                      ? "border-orange-500 shadow-sm ring-1 ring-orange-500 bg-orange-50/5"
                      : "border-slate-300 hover:border-orange-400 hover:bg-slate-50/30"
                      }`}
                  >
                    {/* Top Details Metadata Bar */}
                    <div className="flex items-center justify-between gap-4 w-full">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded transition-colors ${isSelected
                          ? "bg-orange-500 text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/70"
                          }`}>
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="text-[11px] font-bold tracking-tight text-slate-400 uppercase font-mono">
                          {layout.id}
                        </span>
                      </div>

                      {/* Integrated Radio Indicator matching Original Theme */}
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${isSelected
                        ? "border-orange-500 bg-orange-500 text-white scale-105"
                        : "border-slate-300 bg-white group-hover:border-slate-400"
                        }`}>
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* Core Content Body Text */}
                    <div className="space-y-1 my-5">
                      <h3 className="font-bold text-sm tracking-tight text-slate-800 group-hover:text-orange-600 transition-colors">
                        {layout.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium leading-normal line-clamp-2">
                        {layout.description}
                      </p>
                    </div>

                    {/* Operational Control Item Footer */}
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between w-full mt-auto">
                      <span className="text-[11px] font-medium text-slate-400 inline-flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-orange-500 animate-pulse" : "bg-slate-300"}`} />
                        {isSelected ? "Active Layout" : "Idle State"}
                      </span>

                      <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        disabled={saving}
                        className="h-8 px-3 text-xs font-bold border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:text-orange-500 rounded-lg transition-all shadow-2xs flex items-center gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePreviewLayout(layout.id);
                        }}
                      >
                        <Eye size={12} className="stroke-[2.5]" /> Preview
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Diagnostic Status Strip matching Orange Theme */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </div>
                <p className="text-sm text-orange-700 font-medium leading-none">
                  Active compilation template: <span className="font-bold text-orange-900 uppercase font-mono">{invoiceLayouts.find(l => l.id === companyInfo.layout)?.name || companyInfo.layout}</span>
                </p>
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-orange-600 bg-white border border-orange-200 px-2 py-0.5 rounded-md shadow-2xs">
                System Live
              </span>
            </div>
          </div>

          {/* ── Action Footer Console Bar ── */}
          <div className="pt-4 border-t border-slate-200 flex justify-end items-center gap-3">
            <Button
              variant="outline"
              type="button"
              className="border-slate-200 hover:border-slate-300 text-slate-600 bg-white text-sm h-10 px-5 font-bold rounded-xl transition-all shadow-sm"
              onClick={() => {
                setCompanyInfo(initialData);
                setPreview(null);
                setSignaturePreview(null);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm h-10 px-6 rounded-xl transition-all shadow-md shadow-orange-600/10"
              disabled={saving}
            >
              Save Settings
            </Button>
          </div>

        </form>

        {/* ── Centralized On-Demand PDF Viewer Modal ── */}
        <Dialog open={!!activePreviewLayout} onOpenChange={(open) => !open && setActivePreviewLayout(null)}>
          <DialogContent className="max-w-[95vw] md:max-w-[850px] h-[92vh] bg-white border border-slate-200 flex flex-col p-0 overflow-hidden rounded-xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <DialogTitle className="text-slate-900 font-bold">
                  {invoiceLayouts.find(l => l.id === activePreviewLayout)?.name} Preview
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-xs mt-0.5">
                  Real-time generated sandbox document vector stream.
                </DialogDescription>
              </div>
            </div>
            <div className="flex-1 bg-slate-800 relative">
              {PreviewComponent && (
                <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
                  <PreviewComponent
                    companyLogo={preview}
                    companySignature={signaturePreview}
                    invoiceNumberSequence={"INV-0000-0001"}
                    isPaid={false}
                    issueDate={"17 Jun 2026"}
                    dueDate={"02 Jul 2026"}
                    selectedCustomer={{
                      displayName: "Avijit Biswas",
                      companyName: "SaleSync",
                      workingPhone: "+91 98765 43210",
                      email: "abc@salesync.com",
                      billingAddress: {
                        attention: "Accounts Dept.",
                        street1: "Plot 42, Sector V",
                        street2: "Bidhan Nagar Road, Salt Lake",
                        city: "Kolkata",
                        state: "West Bengal",
                        pincode: "700091",
                        country: "India",
                      }
                    }}
                    itemData={[
                      { name: "Enterprise SaaS Suite License", quantity: 1, unit: "Unit", sellingPrice: 75000.00 },
                      { name: "Technical Integration Consultation", quantity: 12, unit: "Hrs", sellingPrice: 2500.00 }
                    ]}
                    subtotal={105000.00}
                    totalDiscount={5000.00}
                    taxRate={18}
                    taxedAmount={18000.00}
                    grandTotal={118000.00}
                    notes={"Please reference invoice ID sequence number on bank wiring reference configurations to optimize ledger settlement sync timelines."}
                    terms={"Standard Net-15 corporate credit balance arrangement. Overdue items are subjected to standard 1.5% compilation cycles per month."}
                    companyInfo={companyInfo} />
                </PDFViewer>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
}

export default InvoiceCustomizer;