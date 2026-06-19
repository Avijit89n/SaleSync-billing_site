import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, FilePlusCorner, UserCheck, AlertCircle, MapPin, Mail, Search, ImageIcon, Eye } from 'lucide-react';
import { toast } from 'sonner';
import InfiniteScroll from "react-infinite-scroll-component";

// Custom UI Imports
import { DatePickerInput } from '@/components/other-ui/date-picker-input';
import { Button } from '@/components/ui/button';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Badge } from "@/components/ui/badge";
import Loader2 from '@/components/loaders/loader2';
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
} from "@/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

// Redux Actions
import { getAllCustomerReq, customerSearchReq, clearSearchedCustomers } from '@/redux/features/customerSlice';
import { getAllItemReq, itemSearchReq, clearSearchedItems } from '@/redux/features/itemSlice';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import InvoiceDesign1 from '@/components/other-ui/invoice-design-1';
import { addInvoiceReq } from '@/redux/features/invoiceSlice';
import api from '@/axios/interceptor';

const generateRowId = () => Date.now().toString() + Math.random().toString(36).substring(2);

const initialItemData = {
  _rowId: generateRowId(),
  _id: "",
  name: "",
  quantity: 1,
  image: null,
  discount: 0.00,
  discountType: "%",
  MRP: 0.00,
  unit: "",
  sellingPrice: 0.00
};

const labelCls = "block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2";
const inputCls = "w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium";
const countries = ["India", "United States", "United Kingdom", "United Arab Emirates", "Singapore"];

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

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

function AddInvoice() {
  const [itemData, setItemData] = useState([{ ...initialItemData }]);
  const [customerSearchValue, setCustomerSearchValue] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [itemSearchValue, setItemSearchValue] = useState("");
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [invoiceIssueDate, setInvoiceIssueDate] = useState(new Date());
  const [invoiceDueDate, setInvoiceDueDate] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(initialData)
  const [isAddressSame, setIsAddressSame] = useState(true);

  const [invoiceNumberSequence, setInvoiceNumberSequence] = useState("");

  const [isCustomerDebouncing, setIsCustomerDebouncing] = useState(false);
  const [isItemDebouncing, setIsItemDebouncing] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const customerAbortRef = useRef(null);
  const itemAbortRef = useRef(null);

  const {
    customers: allcustomers,
    isEnd: customerisEnd,
    nextCursor: customerNextCursor,
    searchLoading: customersSearchLoading,
    searchIsEnd: customersearchIsEnd,
    searchNextCursor: customersearchNextCursor,
    searchedCustomers
  } = useSelector(state => state.customer);

  const {
    items: allitems,
    isEnd: itemIsEnd,
    nextCursor: itemNextCursor,
    searchLoading: itemSearchLoading,
    searchIsEnd: itemsearchIsEnd,
    searchNextCursor: itemsearchNextCursor,
    searchedItems
  } = useSelector(state => state.item);

  const isSearchingCustomers = customerSearchValue.trim().length >= 2;
  const activeRowSearchQuery = itemSearchValue;
  const isSearchingItems = activeRowSearchQuery.trim().length >= 2;

  // STRICT FRONTEND FILTERING
  const customerDropdownItems = (searchedCustomers?.length > 0 ? searchedCustomers : allcustomers).filter(customer => {
    if (!isSearchingCustomers || !customerSearchValue) return true;
    const searchLower = customerSearchValue.toLowerCase();
    return customer?.displayName?.toLowerCase().includes(searchLower) ||
      customer?.workingPhone?.includes(searchLower);
  });

  const itemSearchDropdownItems = (searchedItems?.length > 0 ? searchedItems : allitems).filter(item => {
    if (!isSearchingItems || !activeRowSearchQuery) return true;
    return item?.name?.toLowerCase().includes(activeRowSearchQuery.toLowerCase());
  });

  const hasNoCustomerSearchResults = isSearchingCustomers && !customersSearchLoading && customerDropdownItems.length === 0;
  const hasNoItemSearchResults = isSearchingItems && !itemSearchLoading && itemSearchDropdownItems.length === 0;

  // Mobile device detection
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    if (allcustomers.length === 0) fetchCustomers(10);
    if (allitems.length === 0) fetchItems(10);
  }, []);

  useEffect(() => {
    if (customerSearchValue.length < 2) {
      dispatch(clearSearchedCustomers());
      setIsCustomerDebouncing(false);
      return;
    }
    if (selectedCustomer && customerSearchValue === selectedCustomer.displayName) {
      setIsCustomerDebouncing(false);
      return;
    }

    setIsCustomerDebouncing(true);

    const timer = setTimeout(() => {
      setIsCustomerDebouncing(false);
      customerAbortRef.current = dispatch(customerSearchReq({
        search: customerSearchValue,
        limit: 10,
        cursor: null
      }));

      customerAbortRef.current.unwrap().catch((err) => {
        if (err.name === 'AbortError' || err === "Request canceled") return;
        toast.error(err.message || "Something went wrong");
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      if (customerAbortRef.current) customerAbortRef.current.abort();
    };
  }, [customerSearchValue, selectedCustomer, dispatch]);

  useEffect(() => {
    if (activeRowIndex === null || activeRowSearchQuery.length < 2) {
      dispatch(clearSearchedItems());
      setIsItemDebouncing(false);
      return;
    }

    setIsItemDebouncing(true);

    const timer = setTimeout(() => {
      setIsItemDebouncing(false);
      itemAbortRef.current = dispatch(itemSearchReq({
        search: activeRowSearchQuery,
        limit: 10,
        cursor: null
      }));

      itemAbortRef.current.unwrap().catch((err) => {
        if (err.name === 'AbortError' || err === "Request canceled") return;
        toast.error(err.message || "Something went wrong");
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      if (itemAbortRef.current) itemAbortRef.current.abort();
    };
  }, [activeRowSearchQuery, activeRowIndex, dispatch]);

  const fetchCustomers = async (limit = 10, cursor = undefined) => {
    await dispatch(getAllCustomerReq({ limit, lastCreatedAt: cursor })).unwrap().catch((err) => toast.error(err.message));
  };

  const fetchItems = async (limit = 10, cursor = undefined) => {
    await dispatch(getAllItemReq({ limit, lastCreatedAt: cursor })).unwrap().catch((err) => toast.error(err.message));
  };

  const searchCustomerPagination = async (limit = 10, cursor) => {
    if (customerSearchValue.length < 2 || customersSearchLoading) return;

    await dispatch(customerSearchReq({
      search: customerSearchValue,
      limit,
      cursor
    }))
  }

  const searchItemPagination = async (limit = 10, cursor) => {
    if (activeRowSearchQuery.length < 2 || itemSearchLoading) return;
    await dispatch(itemSearchReq({ search: activeRowSearchQuery, limit, cursor })).unwrap().catch((err) => toast.error(err.message));
  };

  const subtotal = useMemo(() => {
    return itemData.reduce((acc, c) => acc + ((Number(c.quantity) || 0) * (Number(c.sellingPrice) || 0)), 0);
  }, [itemData]);

  const totalDiscount = useMemo(() => {
    return itemData.reduce((acc, c) => {
      const rowTotal = (Number(c.quantity) || 0) * (Number(c.sellingPrice) || 0);
      return acc + (c.discountType === "%" ? (rowTotal * ((Number(c.discount) || 0) / 100)) : (Number(c.discount) || 0));
    }, 0);
  }, [itemData]);

  const taxedAmount = useMemo(() => {
    return (subtotal - totalDiscount) * (Number(taxRate) / 100);
  }, [subtotal, totalDiscount, taxRate]);

  const grandTotal = useMemo(() => {
    return (subtotal - totalDiscount) + taxedAmount;
  }, [subtotal, totalDiscount, taxedAmount]);

  const updateItem = (index, field, value) =>
    setItemData(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));

  const removeItem = (index) => {
    setActiveRowIndex(null);
    setItemSearchValue("");
    dispatch(clearSearchedItems());

    if (itemData.length === 1) return setItemData([{ ...initialItemData, _rowId: generateRowId() }]);
    setItemData(prev => prev.filter((_, i) => i !== index));
  };

  const buildInvoicePayload = () => ({
    invoiceNumber: invoiceNumberSequence,
    customerId: selectedCustomer._id,
    customerName: selectedCustomer.displayName,

    items: itemData.map(item => {
      const cleanedItem = {
        name: item.name,
        quantity: Number(item.quantity) || 1,
        MRP: Number(item.MRP) || 0,
        sellingPrice: Number(item.sellingPrice) || 0,
        discount: Number(item.discount) || 0,
        discountType: item.discountType || "%",
        image: item.image || null,
        unit: item.unit || "pcs"
      };

      if (item._id && item._id.trim() !== "") {
        cleanedItem.itemId = item._id;
      }

      return cleanedItem;
    }),

    subtotal: Number(subtotal),

    invoiceDate: new Date(invoiceIssueDate).toISOString(),
    dueDate: new Date(invoiceDueDate).toISOString(),

    discount: Number(totalDiscount),
    tax: Number(taxedAmount),
    grandTotal: Number(grandTotal),
    notes: notes ? notes.trim() : "",
    terms: terms ? terms.trim() : "",
    status: isPaid ? "Paid" : "Unpaid"
  });

  const resetForm = () => {
    setSelectedCustomer(null);
    setCustomerSearchValue("");
    dispatch(clearSearchedCustomers());
    setNotes("");
    setTerms("");
    setTaxRate(0);
    setIsPaid(false);
    setItemData([{ ...initialItemData, _rowId: generateRowId() }]);
    setItemSearchValue("");
    setActiveRowIndex(null);
    dispatch(clearSearchedItems());
  };

  const saveInvoice = async (action = "save") => {
    if (saving) return;

    if (!selectedCustomer) {
      toast.error("Please select a verified customer.");
      return;
    }

    const invalidItems = itemData.some(
      (item) =>
        !item.name ||
        Number(item.quantity) <= 0 ||
        Number(item.sellingPrice) <= 0
    );

    if (invalidItems) {
      toast.error("Please complete all item rows correctly.");
      return;
    }

    if (invoiceDueDate < invoiceIssueDate) {
      toast.error("Due date cannot be before issue date.");
      return;
    }

    setSaving(true);

    try {
      const invoicePayload = buildInvoicePayload();

      const targetInvoiceNum = invoiceNumberSequence;
      const currentCustomer = selectedCustomer;
      const currentItems = [...itemData];
      const currentNotes = notes;
      const currentTerms = terms;
      const currentTaxRate = taxRate;

      const savePromise = dispatch(addInvoiceReq(invoicePayload)).unwrap();

      toast.promise(savePromise, {
        loading: 'Saving invoice...',
        success: 'Invoice saved successfully!'
      });

      await savePromise;

      if (action === "download") {
        await handleDownloadPdf(targetInvoiceNum, currentCustomer, currentItems, currentNotes, currentTerms, currentTaxRate);
      } else if (action === "print") {
        await handlePrintPdf(targetInvoiceNum, currentCustomer, currentItems, currentNotes, currentTerms, currentTaxRate);
      }

      const nextTokenRes = await api.get('/invoice/get-next-token');
      const nextInvoiceNum = nextTokenRes.data?.statusCode?.invoiceNumber || "";

      resetForm();
      setInvoiceNumberSequence(nextInvoiceNum);

    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await pdf(
        <InvoiceDesign1
          invoiceNumberSequence={invoiceNumberSequence}
          isPaid={isPaid}
          selectedCustomer={selectedCustomer}
          itemData={itemData}
          subtotal={subtotal}
          totalDiscount={totalDiscount}
          taxRate={taxRate}
          taxedAmount={taxedAmount}
          grandTotal={grandTotal}
          notes={notes}
          terms={terms}
          issueDate={invoiceIssueDate}
          dueDate={invoiceDueDate}
          isPreview={false}
          companyInfo={companyInfo}
          companyLogo={companyInfo?.logo || ""}
          companySignature={companyInfo?.signature || ""}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${invoiceNumberSequence}.pdf`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Failed to download invoice");
      throw err;
    }
  };

  const handlePrintPdf = async () => {
    const originalTitle = document.title;

    try {
      document.title = `Invoice-${invoiceNumberSequence}`;

      const blob = await pdf(
        <InvoiceDesign1
          invoiceNumberSequence={invoiceNumberSequence}
          isPaid={isPaid}
          selectedCustomer={selectedCustomer}
          itemData={itemData}
          subtotal={subtotal}
          totalDiscount={totalDiscount}
          taxRate={taxRate}
          taxedAmount={taxedAmount}
          grandTotal={grandTotal}
          notes={notes}
          terms={terms}
          issueDate={invoiceIssueDate}
          dueDate={invoiceDueDate}
          isPreview={false}
          companyInfo={companyInfo}
          companyLogo={companyInfo?.logo || ""}
          companySignature={companyInfo?.signature || ""}
        />
      ).toBlob();

      // ==========================
      // MOBILE
      // ==========================
      if (isMobile) {
        const file = new File(
          [blob],
          `Invoice-${invoiceNumberSequence}.pdf`,
          {
            type: "application/pdf",
          }
        );

        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({
            files: [file],
            title: `Invoice-${invoiceNumberSequence}`,
            text: `Invoice ${invoiceNumberSequence}`,
          });

          document.title = originalTitle;
          return;
        }

        // Fallback: Download PDF
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `Invoice-${invoiceNumberSequence}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 5000);

        toast.info(
          "PDF downloaded. Open it and use your PDF viewer's Print option."
        );

        document.title = originalTitle;
        return;
      }

      // ==========================
      // DESKTOP PRINT
      // ==========================
      const blobUrl = URL.createObjectURL(blob);

      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = blobUrl;

      document.body.appendChild(iframe);

      iframe.onload = () => {
        const cleanup = () => {
          try {
            URL.revokeObjectURL(blobUrl);

            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          } catch (err) {
            console.error(err);
          } finally {
            document.title = originalTitle;
          }
        };

        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        iframe.contentWindow.onafterprint = cleanup;

        setTimeout(cleanup, 10000);
      };
    } catch (err) {
      document.title = originalTitle;
      console.error(err);
      toast.error("Failed to generate invoice PDF.");
      throw err;
    }
  };

  const handlePreview = async () => {
    if (isMobile) {
      // 1. Open a blank window immediately to bypass popup blockers
      const previewWindow = window.open("", "_blank");

      if (!previewWindow) {
        toast.error("Please allow pop-ups to view the PDF preview.");
        return;
      }

      previewWindow.document.write(
        "<div style='font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; color: #64748b; background-color: #f8fafc;'>Generating Preview...</div>"
      );

      try {
        // 2. Generate the PDF blob
        const blob = await pdf(
          <InvoiceDesign1
            invoiceNumberSequence={invoiceNumberSequence}
            isPaid={isPaid}
            selectedCustomer={selectedCustomer}
            itemData={itemData}
            subtotal={subtotal}
            totalDiscount={totalDiscount}
            taxRate={taxRate}
            taxedAmount={taxedAmount}
            grandTotal={grandTotal}
            notes={notes}
            terms={terms}
            issueDate={invoiceIssueDate}
            dueDate={invoiceDueDate}
            isPreview={true}
            companyInfo={companyInfo}
            companyLogo={companyInfo?.logo || ""}
            companySignature={companyInfo?.signature || ""}
          />
        ).toBlob();

        // 3. Inject the PDF into the already-open window
        const url = URL.createObjectURL(blob);
        previewWindow.location.href = url;

        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } catch (err) {
        console.error(err);
        previewWindow.close();
        toast.error("Failed to generate preview");
      }
    } else {
      // If desktop, just open the modal normally
      setPreviewOpen(true);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await saveInvoice("save");
  };

  const fetchInvoiceNumber = async () => {
    try {
      const res = await api.get('/invoice/get-next-token')
      const data = res.data?.statusCode?.invoiceNumber || {};
      setInvoiceNumberSequence(data)
    } catch (error) {
      toast.error(error.message || "Failed to load Invoice Number. Please try again.")
    }
  }

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
    } catch (err) {
      toast.error(err.message || "Failed to load company details. Please try again.")
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setFetchLoading(true);
      try {
        await Promise.all([
          fetchInvoiceNumber(),
          fetchInvoiceSettings(),
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setFetchLoading(false);
      }
    };

    loadData();
  }, []);

  return fetchLoading ?
    <div className='h-full flex justify-center items-center'>
      <Loader2 />
    </div>
    : (
      <div className="opacity-0 animate-fade-in-scale transition-all duration-500 bg-white min-h-screen text-slate-900 antialiased px-4 py-4 md:px-12 md:py-6 font-sans select-none">
        <form
          onSubmit={handleFormSubmit}
          className={`space-y-12 print:hidden ${saving ? "pointer-events-none opacity-60" : ""
            }`}
        >

          {/* ── Page Header ── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-5 mb-12 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <FilePlusCorner className="text-orange-500" size={28} /> Create New Invoice
              </h1>
              <p className="text-sm text-slate-500 mt-1">Generate dynamic invoices and track automated customer balances.</p>
            </div>
          </div>

          {/* ── Section 1: Customer Allocation ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                Client Allocation
              </h2>
              <FieldGroup>
                <Field className="space-y-1">
                  <FieldLabel htmlFor="customer-name" className={labelCls}>
                    Customer Name <span className="text-orange-500">*</span>
                  </FieldLabel>
                  <Combobox items={customerDropdownItems}>
                    <ComboboxInput
                      placeholder="Search customer by name or phone number..."
                      value={
                        customerSearchValue ||
                        selectedCustomer?.displayName ||
                        ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomerSearchValue(value);
                        if (selectedCustomer) {
                          setSelectedCustomer(null);
                        }
                        if (value === "") {
                          dispatch(clearSearchedCustomers());
                        }
                      }}
                    />
                    <ComboboxContent className="border border-slate-200 bg-white shadow-xl rounded-lg mt-1 w-full z-50">
                      {isCustomerDebouncing || (customersSearchLoading && customerDropdownItems.length === 0) ? (
                        <div className="p-4 flex items-center justify-center w-full">
                          <Loader2 />
                        </div>
                      ) : hasNoCustomerSearchResults ? (
                        <ComboboxEmpty className="p-6 text-center">
                          <div className="flex flex-col items-center justify-center space-y-1 text-gray-400">
                            <Search size={24} className="text-gray-300" />
                            <p className="text-sm font-medium text-gray-600">No customers found</p>
                            <Dialog
                              open={customerDialogOpen}
                              onOpenChange={setCustomerDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  type="button"
                                  className="mt-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                                >
                                  <Plus size={14} className="stroke-[3]" /> Add New Customer
                                </Button>
                              </DialogTrigger>

                              <DialogContent className="max-w-[95vw] md:max-w-[850px] h-[92vh] overflow-auto bg-white p-6">
                                <DialogHeader className="space-y-1 border-b border-slate-100 pb-4">
                                  <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <UserCheck className="text-orange-500" size={24} /> Register New Customer Record
                                  </DialogTitle>
                                  <DialogDescription className="text-xs text-slate-500">
                                    Configure client ledger profiles, communication endpoints, and logistics addresses natively into the database ecosystem.
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-8 pt-4">
                                  <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Primary Profile Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="space-y-1">
                                        <label className={labelCls}>Customer Type</label>
                                        <Select name="customerType" defaultValue="Individual">
                                          <SelectTrigger className="w-full h-11 bg-white text-sm font-semibold border border-slate-300 rounded-lg">
                                            <SelectValue placeholder="Select classification" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-white border border-slate-200">
                                            <SelectItem value="Individual">Individual</SelectItem>
                                            <SelectItem value="Business">Business</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-1">
                                        <label className={labelCls}>Customer Name</label>
                                        <Input name="customerName" placeholder="e.g. John Doe" className={inputCls} />
                                      </div>
                                      <div className="space-y-1">
                                        <label className={labelCls}>Company Name</label>
                                        <Input name="companyName" placeholder="e.g. Corporate Entity Ltd." className={inputCls} />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <label className={labelCls}><span className="text-orange-500">Customer Display Name *</span></label>
                                        <Input name="displayName" required placeholder="Public billing profile alias lookup name" className={inputCls} />
                                      </div>
                                      <div className="space-y-1">
                                        <label className={labelCls}><span className="text-orange-500">Work Phone *</span></label>
                                        <Input name="workingPhone" required placeholder="Primary communication line number" className={inputCls} />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <label className={labelCls}>Email Address</label>
                                        <Input name="email" type="email" placeholder="client@domain.com" className={inputCls} />
                                      </div>
                                      <div className="space-y-1">
                                        <label className={labelCls}>Mobile Number</label>
                                        <Input name="mobile" placeholder="Personal verification cell reference" className={inputCls} />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                                    <div className="space-y-4">
                                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Billing Address</h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <label className={labelCls}>Attention Counterpart</label>
                                          <Input name="billing_attention" placeholder="Accounts Department" className={inputCls} />
                                        </div>
                                        <div className="space-y-1">
                                          <label className={labelCls}>Country/Region</label>
                                          <Select name="billing_country" defaultValue="India">
                                            <SelectTrigger className="w-full h-11 bg-white text-sm font-semibold border border-slate-300 rounded-lg">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-48 bg-white border border-slate-200">
                                              {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <label className={labelCls}>Street Address 1</label>
                                        <Textarea name="billing_street1" className="w-full min-h-[64px] text-sm border border-slate-300 rounded-lg bg-white p-2.5 font-medium resize-none" placeholder="Plot line, building details, sector..." />
                                      </div>
                                      <div className="space-y-1">
                                        <label className={labelCls}>Street Address 2</label>
                                        <Textarea name="billing_street2" className="w-full min-h-[64px] text-sm border border-slate-300 rounded-lg bg-white p-2.5 font-medium resize-none" placeholder="Apartment unit, landmark parameters..." />
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                          <label className={labelCls}>City</label>
                                          <Input name="billing_city" placeholder="City Name" className={inputCls} />
                                        </div>
                                        <div className="space-y-1">
                                          <label className={labelCls}>State</label>
                                          <Select name="billing_state" defaultValue="West Bengal">
                                            <SelectTrigger className="w-full h-11 bg-white text-xs font-semibold border border-slate-300 rounded-lg px-2">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-48 bg-white border border-slate-200">
                                              {indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-1">
                                          <label className={labelCls}>Pincode</label>
                                          <Input name="billing_pincode" placeholder="Pincode" className={`${inputCls} font-mono px-1 text-center`} />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Shipping Logistics Address</h3>
                                      <div
                                        className="flex items-start gap-3 rounded-xl border border-orange-500/30 bg-orange-50/20 p-4 cursor-pointer select-none mb-4 border-dashed"
                                        onClick={() => setIsAddressSame(!isAddressSame)}
                                      >
                                        <div
                                          data-state={isAddressSame ? "checked" : "unchecked"}
                                          className="h-4 w-4 shrink-0 rounded border border-orange-500 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center transition-all data-[state=unchecked]:bg-white data-[state=unchecked]:text-transparent data-[state=unchecked]:border-slate-300"
                                        >
                                          {isAddressSame ? "✓" : ""}
                                        </div>
                                        <div className="grid gap-0.5 font-normal">
                                          <p className="text-xs font-bold text-slate-900 leading-none">Mirror Billing Address Parameters</p>
                                          <p className="text-slate-400 text-[11px] mt-0.5 leading-normal">Automatically route product inventory logs directly to billing coordinates.</p>
                                        </div>
                                      </div>

                                      {!isAddressSame && (
                                        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                              <label className={labelCls}>Attention Target</label>
                                              <Input name="shipping_attention" placeholder="Receiving Bay 2" className={inputCls} />
                                            </div>
                                            <div className="space-y-1">
                                              <label className={labelCls}>Country/Region</label>
                                              <Select name="shipping_country" defaultValue="India">
                                                <SelectTrigger className="w-full h-11 bg-white text-sm font-semibold border border-slate-300 rounded-lg">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-48 bg-white border border-slate-200">
                                                  {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                          <div className="space-y-1">
                                            <label className={labelCls}>Street Address 1</label>
                                            <Textarea name="shipping_street1" className="w-full min-h-[64px] text-sm border border-slate-300 rounded-lg bg-white p-2.5 font-medium resize-none" placeholder="Warehouse plot destination details..." />
                                          </div>
                                          <div className="space-y-1">
                                            <label className={labelCls}>Street Address 2</label>
                                            <Textarea name="shipping_street2" className="w-full min-h-[64px] text-sm border border-slate-300 rounded-lg bg-white p-2.5 font-medium resize-none" placeholder="Crossroad coordinate indices..." />
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <div className="space-y-1">
                                              <label className={labelCls}>City</label>
                                              <Input name="shipping_city" placeholder="Logistics City" className={inputCls} />
                                            </div>
                                            <div className="space-y-1">
                                              <label className={labelCls}>State</label>
                                              <Select name="shipping_state" defaultValue="West Bengal">
                                                <SelectTrigger className="w-full h-11 bg-white text-xs font-semibold border border-slate-300 rounded-lg px-2">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-48 bg-white border border-slate-200">
                                                  {indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div className="space-y-1">
                                              <label className={labelCls}>Pincode</label>
                                              <Input name="shipping_pincode" placeholder="700001" className={`${inputCls} font-mono px-1 text-center`} />
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="pt-4 border-t border-slate-200 flex justify-end items-center gap-3">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => setCustomerDialogOpen(false)}
                                      className="border-slate-200 hover:border-slate-300 text-slate-600 bg-white text-sm h-11 px-5 font-bold rounded-lg shadow-sm"
                                    >
                                      Dismiss
                                    </Button>
                                    <Button
                                      type="button"
                                      className="bg-orange-500 hover:bg-orange-700 text-white font-bold text-sm h-11 px-6 rounded-lg shadow-md"
                                    >
                                      Save Customer
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </ComboboxEmpty>
                      ) : (
                        <ComboboxList className="max-h-[260px] overflow-y-auto" id="customer-scroll-container">
                          <InfiniteScroll
                            dataLength={customerDropdownItems.length}
                            next={() => {
                              if (!isSearchingCustomers) {
                                fetchCustomers(10, customerNextCursor);
                              } else {
                                searchCustomerPagination(10, customersearchNextCursor);
                              }
                            }}
                            hasMore={!isSearchingCustomers ? !customerisEnd : !customersearchIsEnd}
                            scrollableTarget="customer-scroll-container"
                            loader={<div className="py-2 text-center"><Loader2 /></div>}
                          >
                            {customerDropdownItems.map((customer) => (
                              <ComboboxItem
                                key={customer._id}
                                value={customer._id}
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setCustomerSearchValue(customer.displayName);
                                }}
                                className="py-3 px-4 text-sm font-medium text-slate-800 data-selected:bg-slate-50 data-selected:text-slate-900 flex justify-between items-center cursor-pointer"
                              >
                                <span className="font-semibold">{customer.displayName}</span>
                                <span className="text-xs text-slate-400 font-mono">{customer.workingPhone || 'No contact attached'}</span>
                              </ComboboxItem>
                            ))}
                          </InfiniteScroll>
                        </ComboboxList>
                      )}
                    </ComboboxContent>
                  </Combobox>
                </Field>
              </FieldGroup>

              {/* Smart Client Record Info Box */}
              <div className="mt-4 min-h-[165px]">
                {selectedCustomer ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-fade-in transition-all space-y-3 h-[190px] overflow-y-auto scrollbar-thin">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <UserCheck size={16} className="text-orange-500" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide truncate max-w-xs">{selectedCustomer.companyName || selectedCustomer.displayName}</h4>
                      </div>
                      <Badge className="text-[10px] uppercase font-bold px-2 py-0.5 pointer-events-none bg-orange-100 text-orange-700">
                        {selectedCustomer.customerType}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="space-y-2">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                          <p className="font-semibold text-slate-700 font-mono mt-0.5 truncate">{selectedCustomer.workingPhone || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Mail size={10} /> Email</p>
                          <p className="font-semibold text-slate-600 font-sans mt-0.5 truncate">{selectedCustomer.email || "N/A"}</p>
                        </div>
                      </div>
                      <div className="col-span-2 pl-3 border-l border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><MapPin size={10} /> Billing Address</p>
                        <p className="font-medium text-slate-600 mt-0.5 leading-relaxed text-xs whitespace-pre-line">
                          {[
                            selectedCustomer.billingAddress?.attention,
                            selectedCustomer.billingAddress?.street1,
                            selectedCustomer.billingAddress?.street2,
                            [
                              selectedCustomer.billingAddress?.city,
                              selectedCustomer.billingAddress?.state,
                              selectedCustomer.billingAddress?.pincode,
                            ]
                              .filter(Boolean)
                              .join(", "),
                            selectedCustomer.billingAddress?.country,
                          ]
                            .filter(Boolean)
                            .join("\n") || "No billing address available"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 bg-slate-50/40 border border-dashed border-slate-200 rounded-xl h-[165px] text-slate-400 text-xs text-center px-6">
                    <AlertCircle size={22} className="text-slate-300 stroke-[1.5]" />
                    <p className="font-medium max-w-xs leading-normal">No active record allocated. Use lookup terminal above.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ledger Metadata Fields */}
            <div className="space-y-6 border-l-0 lg:border-l lg:pl-12 border-slate-200">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Timeline Details</h2>
              <div className="space-y-4">
                <div className="space-y-1"><label className={labelCls}>Invoice Issue Date</label><DatePickerInput onChange={setInvoiceIssueDate} value={invoiceIssueDate} /></div>
                <div className="space-y-1"><label className={labelCls}>Payment Due Date</label><DatePickerInput onChange={setInvoiceDueDate} value={invoiceDueDate} /></div>
                <div className="space-y-1">
                  <label htmlFor="invoice-number" className={labelCls}>Invoice Number Sequence</label>
                  <Input className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-500 cursor-not-allowed" value={invoiceNumberSequence} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 2: Line Items Matrix ── */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Line Items Matrix</h2>
            <div className="hidden md:block overflow-visible border border-slate-200 rounded-xl bg-white shadow-sm">
              <Table className="w-full">
                <TableHeader className="bg-slate-50/70 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-4 py-4 min-w-[280px]">Product / Asset Entry</TableHead>
                    <TableHead className="text-center text-xs font-bold text-slate-700 uppercase tracking-wider py-4 w-20">Qty</TableHead>
                    <TableHead className="text-center text-xs font-bold text-slate-700 uppercase tracking-wider py-4 w-28">MRP</TableHead>
                    <TableHead className="text-center text-xs font-bold text-slate-700 uppercase tracking-wider py-4 w-32">Unit Price</TableHead>
                    <TableHead className="text-center text-xs font-bold text-slate-700 uppercase tracking-wider py-4 w-44">Deduction</TableHead>
                    <TableHead className="text-right text-xs font-bold text-slate-700 uppercase tracking-wider py-4 pr-4 min-w-[120px]">Net Gross Price</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemData.map((data, index) => {
                    const rowAmount = ((Number(data.quantity) || 0) * (Number(data.sellingPrice) || 0)) -
                      (data.discountType === "%" ? (((Number(data.quantity) || 0) * (Number(data.sellingPrice) || 0)) * ((Number(data.discount) || 0) / 100)) : (Number(data.discount) || 0));

                    return (
                      <TableRow key={data._rowId} className="border-b border-slate-200 hover:bg-slate-50/20 transition-colors bg-white last:border-0 vertical-align-middle">
                        <TableCell className="pl-4 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                              {data.image ? <img src={data.image} className="h-full w-full object-cover" alt="" /> : <ImageIcon size={16} className="text-slate-400" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <Combobox items={itemSearchDropdownItems}>
                                <ComboboxInput
                                  id={`desktop-item-${index}`}
                                  className={inputCls}
                                  placeholder="Type to search stock inventory..."
                                  value={
                                    activeRowIndex === index
                                      ? itemSearchValue || data.name
                                      : data.name
                                  }
                                  onFocus={() => {
                                    setActiveRowIndex(index);
                                    // FIX: Always reset search value on focus so the full list opens,
                                    // instead of filtering down to just the currently selected item.
                                    setItemSearchValue("");
                                    dispatch(clearSearchedItems());
                                  }}
                                  onChange={(e) => {
                                    const value = e.target.value;

                                    setActiveRowIndex(index);
                                    setItemSearchValue(value);

                                    if (value === "") {
                                      setItemData(prev =>
                                        prev.map((it, i) =>
                                          i === index
                                            ? {
                                              ...it,
                                              _id: "",
                                              name: "",
                                              MRP: 0,
                                              sellingPrice: 0,
                                              image: null,
                                              unit: "",
                                            }
                                            : it
                                        )
                                      );

                                      dispatch(clearSearchedItems());
                                    }
                                  }}
                                />
                                <ComboboxContent className="border border-slate-200 bg-white shadow-xl rounded-lg w-full z-50">
                                  {(isItemDebouncing && activeRowIndex === index) || (itemSearchLoading && itemSearchDropdownItems.length === 0) ? (
                                    <div className="p-4 flex justify-center w-full"><Loader2 /></div>
                                  ) : hasNoItemSearchResults && activeRowIndex === index ? (
                                    <ComboboxEmpty className="p-4 text-center text-sm text-slate-400">No matching item records located.</ComboboxEmpty>
                                  ) : (
                                    <ComboboxList className="max-h-[240px] overflow-y-auto" id={`item-scroll-container-${index}`}>
                                      <InfiniteScroll
                                        dataLength={itemSearchDropdownItems.length}
                                        next={() => {
                                          if (!isSearchingItems) {
                                            fetchItems(10, itemNextCursor);
                                          } else {
                                            searchItemPagination(10, itemsearchNextCursor);
                                          }
                                        }}
                                        hasMore={!isSearchingItems ? !itemIsEnd : !itemsearchIsEnd}
                                        scrollableTarget={`item-scroll-container-${index}`}
                                        loader={<div className="py-2 text-center"><Loader2 /></div>}
                                      >
                                        {itemSearchDropdownItems.map((product) => (
                                          <ComboboxItem
                                            key={product._id}
                                            value={product._id}
                                            onClick={() => {
                                              // 1. Update the actual data immediately so UI reacts fast
                                              setItemData(prev =>
                                                prev.map((it, i) =>
                                                  i === index ? {
                                                    ...it,
                                                    _id: product._id,
                                                    name: product.name,
                                                    unit: product.unit || "",
                                                    MRP: product.MRP || 0,
                                                    sellingPrice: product.sellingPrice || 0,
                                                    image: product.image || null,
                                                  } : it
                                                )
                                              );
                                              setActiveRowIndex(null);
                                              setItemSearchValue("");
                                              dispatch(clearSearchedItems());
                                            }}
                                            className="py-3 px-4 text-sm font-medium cursor-pointer flex justify-between items-center"
                                          >
                                            <span>{product.name}</span>
                                            <span className="text-xs font-mono font-bold text-slate-400">₹{product.sellingPrice}</span>
                                          </ComboboxItem>
                                        ))}
                                      </InfiniteScroll>
                                    </ComboboxList>
                                  )}
                                </ComboboxContent>
                              </Combobox>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-4 align-middle">
                          <div className="flex items-center justify-end">
                            <input
                              value={data.quantity}
                              onFocus={() => {
                                if (data.quantity === 1) {
                                  updateItem(index, "quantity", "");
                                }
                              }}
                              onBlur={() => {
                                if (
                                  data.quantity === "" ||
                                  Number(data.quantity) <= 0
                                ) {
                                  updateItem(index, "quantity", 1);
                                }
                              }}
                              onChange={(e) =>
                                updateItem(index, "quantity", e.target.value)
                              }
                              type="number"
                              className="w-16 h-11 px-2 bg-white border border-slate-300 border-r-0 rounded-l-lg text-sm text-center font-semibold"
                            />

                            <span className="h-11 px-3 flex items-center justify-center bg-slate-50 border border-slate-300 rounded-r-lg text-[11px] font-bold text-slate-600 uppercase shrink-0">
                              {data.unit || "pcs"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className=" py-4 align-middle">
                          <input value={data.MRP} className="w-full h-11 px-2 text-center min-w-20 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400 font-mono outline-none cursor-not-allowed font-bold" type="number" readOnly />
                        </TableCell>
                        <TableCell className="text-right py-4 align-middle">
                          <input value={data.sellingPrice} onChange={(e) => updateItem(index, 'sellingPrice', e.target.value)} className="w-full h-11 px-2 min-w-20 bg-white border border-slate-300 rounded-lg text-sm text-center font-mono font-medium" type="number" />
                        </TableCell>

                        <TableCell className="py-4 align-middle">
                          <div className="flex items-center max-w-[140px] mx-auto">

                            <input
                              value={data.discount}
                              onFocus={() => {
                                if (data.discount === 0) {
                                  updateItem(index, "discount", "");
                                }
                              }}
                              onBlur={() => {
                                if (
                                  data.discount === "" ||
                                  data.discount === null
                                ) {
                                  updateItem(index, "discount", 0);
                                }
                              }}
                              onChange={(e) => {
                                let value = e.target.value;

                                if (value === "") {
                                  updateItem(index, "discount", "");
                                  return;
                                }

                                value = Number(value);

                                if (data.discountType === "%") {
                                  value = Math.min(100, Math.max(0, value));
                                } else {
                                  value = Math.max(0, value);
                                }

                                updateItem(index, "discount", value);
                              }}
                              className="w-full h-11 px-2 min-w-20 bg-white border border-slate-300 rounded-lg text-sm text-center font-mono font-medium rounded-r-none border-r-0"
                              type="number"
                            />
                            <Select
                              value={data.discountType}
                              onValueChange={(val) =>
                                updateItem(index, "discountType", val)
                              }
                            >
                              <SelectTrigger className="w-14 h-11 rounded-l-none border border-slate-300 bg-slate-50 px-2 py-[21px] font-bold">
                                <SelectValue />
                              </SelectTrigger>

                              <SelectContent>
                                <SelectItem value="%">%</SelectItem>
                                <SelectItem value="Rs.">₹</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>

                        <TableCell className="text-right pr-4 py-4 font-bold text-slate-900 font-mono text-base align-middle">₹{rowAmount.toFixed(2)}</TableCell>
                        <TableCell className="pr-3 py-4 align-middle text-center">
                          <button type="button" onClick={() => removeItem(index)} className="text-slate-400 hover:text-rose-600 p-2 transition-colors"><Trash2 size={16} /></button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View Card Grid Stack Layout */}
            <div className="md:hidden space-y-4">
              {itemData.map((data, index) => {
                const rowAmount = ((Number(data.quantity) || 0) * (Number(data.sellingPrice) || 0)) -
                  (data.discountType === "%" ? (((Number(data.quantity) || 0) * (Number(data.sellingPrice) || 0)) * ((Number(data.discount) || 0) / 100)) : (Number(data.discount) || 0));

                return (
                  <div key={data._rowId} className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 relative shadow-sm">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                      <span className="text-xs font-bold text-orange-600 tracking-wide">Item Entry #{index + 1}</span>
                      <button type="button" onClick={() => removeItem(index)} className="text-slate-400 hover:text-rose-600 transition-colors p-1"><Trash2 size={16} /></button>
                    </div>

                    <div className="space-y-1">
                      <label className={labelCls}>Item Definition</label>
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {data.image ? <img src={data.image} className="h-full w-full object-cover" alt="" /> : <ImageIcon size={16} className="text-slate-400" />}
                        </div>
                        <div className="flex-1">
                          <Combobox items={itemSearchDropdownItems}>
                            <ComboboxInput
                              id={`mobile-item-${index}`}
                              className={inputCls}
                              placeholder="Select descriptor..."
                              value={
                                activeRowIndex === index
                                  ? itemSearchValue || data.name
                                  : data.name
                              }
                              onFocus={() => {
                                setActiveRowIndex(index);
                                // FIX: Always reset search value on focus so the full list opens
                                setItemSearchValue("");
                                dispatch(clearSearchedItems());
                              }}
                              onChange={(e) => {
                                const value = e.target.value;

                                setActiveRowIndex(index);
                                setItemSearchValue(value);

                                if (value === "") {
                                  setItemData(prev =>
                                    prev.map((it, i) =>
                                      i === index
                                        ? {
                                          ...it,
                                          _id: "",
                                          name: "",
                                          MRP: 0,
                                          sellingPrice: 0,
                                          image: null,
                                          unit: "",
                                        }
                                        : it
                                    )
                                  );

                                  dispatch(clearSearchedItems());
                                }
                              }}
                            />
                            <ComboboxContent className="border border-slate-200 bg-white w-full z-50">
                              <ComboboxList className="max-h-[200px] overflow-y-auto" id={`item-mobile-scroll-${index}`}>
                                <InfiniteScroll
                                  dataLength={itemSearchDropdownItems.length}
                                  next={() => {
                                    if (!isSearchingItems) {
                                      fetchItems(10, itemNextCursor);
                                    } else {
                                      searchItemPagination(10, itemsearchNextCursor);
                                    }
                                  }}
                                  hasMore={!isSearchingItems ? !itemIsEnd : !itemsearchIsEnd}
                                  scrollableTarget={`item-mobile-scroll-${index}`}
                                  loader={<div className="py-1 text-center"><Loader2 /></div>}
                                >
                                  {itemSearchDropdownItems.map((prod) => (
                                    <ComboboxItem key={prod._id} value={prod._id} className="py-2.5 font-medium cursor-pointer"
                                      onClick={() => {
                                        setItemData(prev =>
                                          prev.map((it, i) =>
                                            i === index
                                              ? {
                                                ...it,
                                                _id: prod._id,
                                                name: prod.name,
                                                MRP: prod.MRP || 0,
                                                sellingPrice: prod.sellingPrice || 0,
                                                image: prod.image || null,
                                                unit: prod.unit || "",
                                              }
                                              : it
                                          )
                                        );

                                        setActiveRowIndex(null);
                                        setItemSearchValue("");
                                        dispatch(clearSearchedItems());
                                      }}
                                    >
                                      {prod.name}
                                    </ComboboxItem>
                                  ))}
                                </InfiniteScroll>
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div>
                        <label className={labelCls}>Qty</label>

                        <div className="flex items-center">
                          <input
                            value={data.quantity}
                            onFocus={() => {
                              if (data.quantity === 1) {
                                updateItem(index, "quantity", "");
                              }
                            }}
                            onBlur={() => {
                              if (
                                data.quantity === "" ||
                                Number(data.quantity) <= 0
                              ) {
                                updateItem(index, "quantity", 1);
                              }
                            }}
                            onChange={(e) =>
                              updateItem(index, "quantity", e.target.value)
                            }
                            type="number"
                            className="w-full h-11 px-2 bg-white border border-slate-300 border-r-0 rounded-l-lg text-sm text-center font-semibold"
                          />

                          <span className="h-11 px-2 flex items-center justify-center bg-slate-50 border border-slate-300 rounded-r-lg text-[11px] font-bold text-slate-600 uppercase shrink-0">
                            {data.unit || "pcs"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Price</label>
                        <input value={data.sellingPrice} onChange={(e) => updateItem(index, 'sellingPrice', e.target.value)} className="w-full h-11 px-2 bg-white border border-slate-300 rounded-lg text-sm text-center font-semibold font-mono" type="number" />
                      </div>


                      <div>
                        <label className={labelCls}>Discount</label>

                        <div className="flex items-center">

                          <input
                            value={data.discount}
                            onFocus={() => {
                              if (data.discount === 0) {
                                updateItem(index, "discount", "");
                              }
                            }}
                            onBlur={() => {
                              if (
                                data.discount === "" ||
                                data.discount === null
                              ) {
                                updateItem(index, "discount", 0);
                              }
                            }}
                            onChange={(e) => {
                              let value = e.target.value;

                              if (value === "") {
                                updateItem(index, "discount", "");
                                return;
                              }

                              value = Number(value);

                              if (data.discountType === "%") {
                                value = Math.min(100, Math.max(0, value));
                              } else {
                                value = Math.max(0, value);
                              }

                              updateItem(index, "discount", value);
                            }}
                            className="w-full h-11 px-2 bg-white border border-slate-300 border-r-0 rounded-l-lg text-sm text-center font-mono"
                            type="number"
                          />

                          <Select
                            value={data.discountType}
                            onValueChange={(val) =>
                              updateItem(index, "discountType", val)
                            }
                          >
                            <SelectTrigger className="w-14 h-11 rounded-l-none border py-[21px] border-slate-300 bg-slate-50 px-2 font-bold">
                              <SelectValue />
                            </SelectTrigger>

                            <SelectContent className="bg-white border border-slate-200">
                              <SelectItem value="%">%</SelectItem>
                              <SelectItem value="Rs.">₹</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>


                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center bg-white">
                      <span className="text-xs text-slate-400 uppercase font-semibold">Row Total</span>
                      <span className="text-sm font-bold font-mono text-slate-900">₹{rowAmount.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={() => {
                // FIX: Clear active row states when adding a new row
                setActiveRowIndex(null);
                setItemSearchValue("");
                dispatch(clearSearchedItems());

                setItemData(prev => [
                  ...prev,
                  { ...initialItemData, _rowId: generateRowId() }
                ]);
              }}
              className="text-orange-600 hover:text-orange-700 bg-white border border-slate-200 hover:border-slate-300 font-bold text-xs h-10 px-4 rounded-lg transition-all shadow-sm"
              type="button"
              variant="outline"
            >
              <Plus size={14} className="mr-1.5 stroke-[2.5]" /> Add New Item Line
            </Button>
          </div>

          {/* ── Section 3: Notes, Statements & Balances ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4 border-t border-slate-200">
            <div className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Notes & Statements</h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={labelCls}>Recipient Invoice Annotation</label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Insert custom statement notes visible directly on customer ledger sheets..." className="w-full min-h-[90px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium placeholder-slate-400" />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Legal Payment Conditions</label>
                  <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="Specify default terms bounds, processing delay structures..." className="w-full min-h-[90px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium placeholder-slate-400" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Statement Balance</h2>
              <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-4 shadow-sm">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-500">Gross Subtotal Balance</span>
                  <span className="font-mono text-slate-900 font-bold text-base">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-emerald-600">Aggregate Deductions</span>
                  <span className="font-mono text-emerald-600 font-bold text-base">−₹{totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                    <span>Surcharge / Tax Rate</span>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>

                      <input
                        type="number"
                        className="w-14 h-8 text-center border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none bg-white text-slate-900 font-semibold"
                        value={taxRate}
                        onFocus={() => {
                          if (taxRate === 0) {
                            setTaxRate("");
                          }
                        }}
                        onBlur={() => {
                          if (
                            taxRate === "" ||
                            taxRate === null
                          ) {
                            setTaxRate(0);
                          }
                        }}
                        onChange={(e) =>
                          setTaxRate(
                            e.target.value === ""
                              ? ""
                              : Math.min(
                                100,
                                Math.max(0, Number(e.target.value))
                              )
                          )
                        }
                      />
                      <span className="text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                  <span className="font-mono text-sm text-slate-900 font-bold">₹{taxedAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">Net Total Due</span>
                  <span className="text-3xl font-bold font-mono text-orange-500 tracking-tight">₹{grandTotal.toFixed(2)}</span>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Payment Status
                  </p>

                  <div className="flex items-center gap-6">

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentStatus"
                        checked={!isPaid}
                        onChange={() => setIsPaid(false)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-slate-700">Unpaid</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentStatus"
                        checked={isPaid}
                        onChange={() => setIsPaid(true)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-slate-700">Paid</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Action Footer Panel */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-end gap-2 flex-wrap">

              <Button
                variant="outline"
                type="button"
                onClick={handlePreview}
              >
                Preview
              </Button>

              <Button
                variant="outline"
                type="button"
                onClick={() => saveInvoice("download")}
                disabled={saving}
              >
                Save & Download
              </Button>

              <Button
                variant="outline"
                type="button"
                onClick={() => saveInvoice("print")}
                disabled={saving}
              >
                Save & Print
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                Save Invoice
              </Button>

            </div>
          </div>

        </form>

        {/* ── Refactored Document Preview Canvas Model (Desktop Only) ── */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-[95vw] md:max-w-[850px] h-[92vh] overflow-hidden bg-white p-0 rounded-2xl flex flex-col border border-slate-200 shadow-2xl">

            <div className="p-5 border-b border-slate-200 bg-slate-50/50 shrink-0">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Eye size={20} className="text-orange-500" /> Invoice Preview
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-medium leading-normal">
                  Review your invoice carefully before compilation.
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Safe Iframe Sandboxed Render Window */}
            <div className="flex-1 w-full bg-slate-100 p-3 overflow-hidden">
              {previewOpen && !isMobile && (
                <PDFViewer width="100%" height="100%" showToolbar={true} className="border-0 rounded-xl shadow-inner bg-slate-200">
                  <InvoiceDesign1
                    invoiceNumberSequence={invoiceNumberSequence}
                    isPaid={isPaid}
                    selectedCustomer={selectedCustomer}
                    itemData={itemData}
                    subtotal={subtotal}
                    totalDiscount={totalDiscount}
                    taxRate={taxRate}
                    taxedAmount={taxedAmount}
                    grandTotal={grandTotal}
                    notes={notes}
                    terms={terms}
                    issueDate={invoiceIssueDate}
                    dueDate={invoiceDueDate}
                    isPreview={true}
                    companyInfo={companyInfo}
                    companyLogo={companyInfo?.logo || ""}
                    companySignature={companyInfo?.signature || ""}
                  />
                </PDFViewer>
              )}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    );
}

export default AddInvoice;