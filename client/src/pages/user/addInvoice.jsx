import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, FilePlus2, UserCheck, AlertCircle, MapPin, Mail, Search, ImageIcon, Eye } from 'lucide-react';
import { toast } from 'sonner';
import InfiniteScroll from "react-infinite-scroll-component";

// Custom UI Imports
import { DatePickerInput } from '@/components/other-ui/date-picker-input';
import { Button } from '@/components/ui/button';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
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
} from "@/components/ui/dialog";
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
  discount: "0.00",
  discountType: "%",
  MRP: "0.00",
  unit: "",
  sellingPrice: "0.00"
};

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

const labelCls = "block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5";
const sectionHeadingCls = "text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100 pb-2";
const cardCls = "border border-slate-200 rounded-xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

const calcRowAmount = (item) => {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.sellingPrice) || 0;
  const disc = Number(item.discount) || 0;
  const rowTotal = qty * price;
  const discountAmount = item.discountType === "%" ? rowTotal * (disc / 100) : disc * qty;
  return rowTotal - discountAmount;
};

const DECIMAL_INPUT_REGEX = /^\d*\.?\d*$/;
const INTEGER_INPUT_REGEX = /^\d*$/;

const isValidDecimalInput = (value) => DECIMAL_INPUT_REGEX.test(value);
const isValidIntegerInput = (value) => INTEGER_INPUT_REGEX.test(value);

const normalizeMoney = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const looksLikePhoneNumber = (value) => {
  const trimmed = value.trim();
  return /^[\+\d\s\-]+$/.test(trimmed) && trimmed.replace(/\D/g, '').length >= 5;
};

function AddInvoice() {
  const [itemData, setItemData] = useState([{ ...initialItemData }]);
  const [customerSearchValue, setCustomerSearchValue] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [taxRate, setTaxRate] = useState(0);

  // Payment Tracking State
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentNote, setPaymentNote] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  // Modal Catalog State
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");

  const [invoiceIssueDate, setInvoiceIssueDate] = useState(new Date());
  const [invoiceDueDate, setInvoiceDueDate] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(initialData);

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
  const isSearchingItems = catalogSearch.trim().length >= 2;

  const customerDropdownItems = (searchedCustomers?.length > 0 ? searchedCustomers : allcustomers).filter(customer => {
    if (!isSearchingCustomers || !customerSearchValue) return true;
    const searchLower = customerSearchValue.toLowerCase();
    return customer?.displayName?.toLowerCase().includes(searchLower) ||
      customer?.workingPhone?.includes(searchLower);
  });

  const itemSearchDropdownItems = (searchedItems?.length > 0 ? searchedItems : allitems).filter(item => {
    if (!isSearchingItems || !catalogSearch) return true;
    return item?.name?.toLowerCase().includes(catalogSearch.toLowerCase());
  });

  const hasNoCustomerSearchResults = isSearchingCustomers && !customersSearchLoading && customerDropdownItems.length === 0;
  const hasNoItemSearchResults = isSearchingItems && !itemSearchLoading && itemSearchDropdownItems.length === 0;

  const isMobile = useMemo(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent), []);

  const isPhoneNumberSearchCurrent = useMemo(
    () => looksLikePhoneNumber(customerSearchValue),
    [customerSearchValue]
  );

  const handleInstantClientCreate = (searchValue) => {
    const val = searchValue.trim();
    const isPhoneNumberSearch = looksLikePhoneNumber(val);

    const instantClient = {
      _id: `temp_${Date.now()}`,
      displayName: isPhoneNumberSearch ? "" : val,
      workingPhone: isPhoneNumberSearch ? val : "",
      customerType: "Individual",
      isInstantNew: true
    };

    setSelectedCustomer(instantClient);
    toast.success(isPhoneNumberSearch ? `Record allocated with phone "${val}"` : `Created "${val}"`);
  };

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
    if (catalogSearch.length < 2) {
      dispatch(clearSearchedItems());
      setIsItemDebouncing(false);
      return;
    }

    setIsItemDebouncing(true);

    const timer = setTimeout(() => {
      setIsItemDebouncing(false);
      itemAbortRef.current = dispatch(itemSearchReq({
        search: catalogSearch,
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
  }, [catalogSearch, dispatch]);

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
    })).unwrap().catch((err) => toast.error(err.message || "Something went wrong"));
  };

  const searchItemPagination = async (limit = 10, cursor) => {
    if (catalogSearch.length < 2 || itemSearchLoading) return;
    await dispatch(itemSearchReq({ search: catalogSearch, limit, cursor })).unwrap().catch((err) => toast.error(err.message));
  };

  const subtotal = useMemo(() => {
    return itemData.reduce((acc, c) => acc + ((Number(c.quantity) || 0) * (Number(c.sellingPrice) || 0)), 0);
  }, [itemData]);

  const totalDiscount = useMemo(() => {
    return itemData.reduce((acc, c) => {
      const qty = Number(c.quantity) || 0;
      const price = Number(c.sellingPrice) || 0;
      const disc = Number(c.discount) || 0;
      const rowTotal = qty * price;
      return acc + (c.discountType === "%" ? (rowTotal * (disc / 100)) : (disc * qty));
    }, 0);
  }, [itemData]);

  const taxedAmount = useMemo(() => {
    return (subtotal - totalDiscount) * (Number(taxRate) / 100);
  }, [subtotal, totalDiscount, taxRate]);

  const grandTotal = useMemo(() => {
    return (subtotal - totalDiscount) + taxedAmount;
  }, [subtotal, totalDiscount, taxedAmount]);

  const numericEnteredPaidAmount = useMemo(() => {
    const amount = normalizeMoney(paidAmount);
    return Math.min(Math.max(amount, 0), Math.max(grandTotal, 0));
  }, [paidAmount, grandTotal]);

  const numericPaidAmount = useMemo(() => {
    if (paymentStatus === "Paid") return Number(grandTotal.toFixed(2));
    if (paymentStatus === "Unpaid") return 0;
    return Number(numericEnteredPaidAmount.toFixed(2));
  }, [paymentStatus, numericEnteredPaidAmount, grandTotal]);

  const balanceAmount = useMemo(
    () => Number(Math.max(0, grandTotal - numericPaidAmount).toFixed(2)),
    [grandTotal, numericPaidAmount]
  );

  const effectivePaymentStatus = useMemo(() => {
    if (grandTotal <= 0 || numericPaidAmount <= 0) return "Unpaid";
    if (balanceAmount <= 0) return "Paid";
    return "Partially Paid";
  }, [grandTotal, numericPaidAmount, balanceAmount]);

  const updateItem = (index, field, value) =>
    setItemData(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));

  const removeItem = (index) => {
    setActiveRowIndex(null);
    setCatalogSearch("");
    dispatch(clearSearchedItems());

    if (itemData.length === 1) return setItemData([{ ...initialItemData, _rowId: generateRowId() }]);
    setItemData(prev => prev.filter((_, i) => i !== index));
  };

  const buildInvoicePayload = () => {
    const finalPaid = Number(numericPaidAmount.toFixed(2));

    const initialPayments = finalPaid > 0 ? [{
      amount: finalPaid,
      paymentDate: invoiceIssueDate
        ? new Date(invoiceIssueDate).toISOString()
        : new Date().toISOString(),
      paymentMethod: paymentMethod || "Cash",
      note: paymentNote.trim() || "Initial payment on invoice creation",
    }] : [];

    return {
      invoiceNumber: invoiceNumberSequence,
      customerId: selectedCustomer._id,
      customerName: selectedCustomer.displayName,
      customerPhone: selectedCustomer.workingPhone || "",
      items: itemData.map(item => {
        const cleanedItem = {
          name: item.name,
          quantity: Number(item.quantity) || 1,
          MRP: Number(item.MRP) || 0,
          sellingPrice: Number(item.sellingPrice) || 0,
          discount: Number(item.discount) || 0,
          discountType: item.discountType || "%",
          image: item.image || null,
          unit: item.unit || ""
        };
        if (item._id && item._id.trim() !== "") cleanedItem.itemId = item._id;
        return cleanedItem;
      }),
      subtotal: Number(subtotal.toFixed(2)),
      invoiceDate: invoiceIssueDate ? new Date(invoiceIssueDate).toISOString() : new Date().toISOString(),
      dueDate: invoiceDueDate ? new Date(invoiceDueDate).toISOString() : new Date().toISOString(),
      discount: Number(totalDiscount.toFixed(2)),
      tax: Number(taxedAmount.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
      notes: notes ? notes.trim() : "",
      terms: terms ? terms.trim() : "",
      status: effectivePaymentStatus,
      paidAmount: finalPaid,
      balanceAmount,
      payments: initialPayments
    };
  };

  const resetForm = async () => {
    setSelectedCustomer(null);
    setCustomerSearchValue("");
    dispatch(clearSearchedCustomers());
    setNotes("");
    setTerms("");
    setTaxRate(0);
    setPaymentStatus("Unpaid");
    setPaidAmount("");
    setPaymentMethod("Cash");
    setPaymentNote("");
    setItemData([{ ...initialItemData, _rowId: generateRowId() }]);
    setCatalogSearch("");
    setActiveRowIndex(null);
    dispatch(clearSearchedItems());
  };

  const saveInvoice = async (action = "save") => {
    if (saving) return;

    if (!selectedCustomer || (selectedCustomer.isInstantNew && (!selectedCustomer.displayName || !selectedCustomer.displayName.trim()))) {
      toast.error("Please provide a valid client name.");
      return;
    }

    const invalidItems = itemData.some(
      (item) =>
        !item.name ||
        Number(item.quantity) <= 0 ||
        Number(item.sellingPrice) < 0
    );

    if (invalidItems) {
      toast.error("Please complete all item rows correctly.");
      return;
    }

    if (invoiceDueDate < invoiceIssueDate) {
      toast.error("Due date cannot be before issue date.");
      return;
    }

    if (grandTotal <= 0) {
      toast.error("Invoice total must be greater than ₹0.");
      return;
    }

    if (effectivePaymentStatus === "Partially Paid") {
      const amount = normalizeMoney(paidAmount);

      if (amount <= 0) {
        toast.error("Enter the amount received.");
        return;
      }

      if (amount >= grandTotal) {
        toast.error("For a full payment, select Paid instead.");
        return;
      }
    }

    setSaving(true);

    try {
      const invoicePayload = buildInvoicePayload();

      const savePromise = dispatch(addInvoiceReq(invoicePayload)).unwrap();

      toast.promise(savePromise, {
        loading: 'Saving invoice...',
        success: 'Invoice saved successfully!'
      });

      await savePromise;

      if (action === "download") {
        await handleDownloadPdf();
      } else if (action === "print") {
        await handlePrintPdf();
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

  const renderInvoiceDocument = (isPreview) => (
    <InvoiceDesign1
      invoiceNumberSequence={invoiceNumberSequence}
      isPaid={effectivePaymentStatus === "Paid"}
      paymentStatus={effectivePaymentStatus}
      paidAmount={numericPaidAmount}
      balanceAmount={balanceAmount}
      payments={numericPaidAmount > 0 ? [{
        amount: numericPaidAmount,
        paymentDate: invoiceIssueDate,
        paymentMethod,
        note: paymentNote.trim()
      }] : []}
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
      isPreview={isPreview}
      companyInfo={companyInfo}
      companyLogo={companyInfo?.logo || ""}
      companySignature={companyInfo?.signature || ""}
    />
  );

  const handleDownloadPdf = async () => {
    try {
      const blob = await pdf(renderInvoiceDocument(false)).toBlob();

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

      const blob = await pdf(renderInvoiceDocument(false)).toBlob();

      if (isMobile) {
        const file = new File(
          [blob],
          `Invoice-${invoiceNumberSequence}.pdf`,
          { type: "application/pdf" }
        );

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Invoice-${invoiceNumberSequence}`,
            text: `Invoice ${invoiceNumberSequence}`,
          });

          document.title = originalTitle;
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Invoice-${invoiceNumberSequence}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 5000);

        toast.info("PDF downloaded. Open it and use your PDF viewer's Print option.");
        document.title = originalTitle;
        return;
      }

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
      const previewWindow = window.open("", "_blank");

      if (!previewWindow) {
        toast.error("Please allow pop-ups to view the PDF preview.");
        return;
      }

      previewWindow.document.write(
        "<div style='font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; color: #64748b; background-color: #f8fafc;'>Generating Preview...</div>"
      );

      try {
        const blob = await pdf(renderInvoiceDocument(true)).toBlob();
        const url = URL.createObjectURL(blob);
        previewWindow.location.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } catch (err) {
        console.error(err);
        previewWindow.close();
        toast.error("Failed to generate preview");
      }
    } else {
      setPreviewOpen(true);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await saveInvoice("save");
  };

  const fetchInvoiceNumber = async () => {
    try {
      const res = await api.get('/invoice/get-next-token');
      const data = res.data?.statusCode?.invoiceNumber || "";
      setInvoiceNumberSequence(data);
    } catch (error) {
      toast.error(error.message || "Failed to load Invoice Number. Please try again.");
    }
  };

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
      toast.error(err.message || "Failed to load company details. Please try again.");
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

  return fetchLoading ? (
    <div className='h-full flex justify-center items-center'>
      <Loader2 />
    </div>
  ) : (
    <div className="opacity-0 animate-fade-in-scale transition-all duration-500 bg-white min-h-screen text-slate-900 antialiased px-4 py-4 md:px-12 md:py-6 font-sans select-none">
      <form
        onSubmit={handleFormSubmit}
        className={`space-y-10 print:hidden ${saving ? "pointer-events-none opacity-60" : ""}`}
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-7 gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FilePlus2 className="text-orange-500" size={28} /> Create New Invoice
            </h1>
            <p className="text-sm text-gray-500">Generate invoices and track customer balances automatically.</p>
          </div>
        </div>

        {/* Section 1: Customer Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-4">
            <h2 className={sectionHeadingCls}>Client Allocation</h2>
            <FieldGroup>
              <Field className="space-y-1">
                <FieldLabel htmlFor="customer-name" className={labelCls}>
                  Customer Name / Phone <span className="text-orange-500">*</span>
                </FieldLabel>

                <Combobox items={customerDropdownItems}>
                  <ComboboxInput
                    placeholder="Search customer by name or phone..."
                    value={customerSearchValue || selectedCustomer?.displayName || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomerSearchValue(value);
                      if (selectedCustomer) setSelectedCustomer(null);
                      if (value === "") dispatch(clearSearchedCustomers());
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && hasNoCustomerSearchResults && customerSearchValue.trim()) {
                        e.preventDefault();
                        handleInstantClientCreate(customerSearchValue);
                      }
                    }}
                  />
                  <ComboboxContent className="border border-slate-200 bg-white shadow-lg rounded-lg mt-1 w-full z-50">
                    {isCustomerDebouncing || (customersSearchLoading && customerDropdownItems.length === 0) ? (
                      <div className="p-4 flex items-center justify-center w-full"><Loader2 /></div>
                    ) : hasNoCustomerSearchResults ? (
                      <div
                        onClick={() => handleInstantClientCreate(customerSearchValue)}
                        className="p-3 hover:bg-orange-50/70 cursor-pointer flex items-center justify-between group border-l-2 border-transparent hover:border-orange-500 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                            <Plus size={16} />
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Record not found</p>
                            <p className="text-sm font-semibold text-slate-800">
                              Add <span className="text-orange-600">"{customerSearchValue}"</span> as new {isPhoneNumberSearchCurrent ? "phone record" : "client"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded font-semibold">
                          <span>Press</span> <kbd className="text-slate-700">Enter</kbd>
                        </div>
                      </div>
                    ) : (
                      <ComboboxList className="max-h-[260px] overflow-y-auto" id="customer-scroll-container">
                        <InfiniteScroll
                          dataLength={customerDropdownItems.length}
                          next={() => !isSearchingCustomers ? fetchCustomers(10, customerNextCursor) : searchCustomerPagination(10, customersearchNextCursor)}
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
                              className="py-3 px-4 text-sm font-medium text-slate-800 data-[selected]:bg-slate-50 flex justify-between items-center cursor-pointer"
                            >
                              <span className="font-semibold">{customer.displayName}</span>
                              <span className="text-xs text-slate-400 font-mono">{customer.workingPhone || 'No phone'}</span>
                            </ComboboxItem>
                          ))}
                        </InfiniteScroll>
                      </ComboboxList>
                    )}
                  </ComboboxContent>
                </Combobox>
              </Field>
            </FieldGroup>

            {/* Client Record Info Box */}
            <div className="mt-4 min-h-[165px]">
              {selectedCustomer ? (
                <div
                  className={`relative bg-white rounded-xl border ${selectedCustomer.isInstantNew ? "border-orange-200" : "border-slate-200"} overflow-hidden shadow-sm transition-colors`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedCustomer.isInstantNew ? "bg-orange-50 text-orange-500" : "bg-emerald-50 text-emerald-600"}`}
                        >
                          <UserCheck size={18} strokeWidth={2.25} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[15px] font-bold text-slate-800 tracking-tight">
                              {selectedCustomer.displayName || "New Client"}
                            </h4>
                            {selectedCustomer.isInstantNew && (
                              <span className="bg-orange-50 text-orange-600 text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wide">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {selectedCustomer.customerType} Profile
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                      <div className="flex-1 space-y-4">
                        <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-3">
                          <Mail size={13} className="text-slate-300" /> Contact
                        </h5>

                        <div className="space-y-3">
                          {selectedCustomer.isInstantNew ? (
                            <>
                              <Input
                                autoFocus={!selectedCustomer.displayName}
                                placeholder="Customer Name *"
                                value={selectedCustomer.displayName || ""}
                                onChange={(e) => setSelectedCustomer((prev) => ({ ...prev, displayName: e.target.value }))}
                                className={`bg-white ${!selectedCustomer.displayName ? 'border-orange-300 ring-2 ring-orange-500/10' : ''}`}
                              />
                              <Input
                                autoFocus={!!selectedCustomer.displayName}
                                placeholder="Phone number"
                                value={selectedCustomer.workingPhone || ""}
                                onChange={(e) => setSelectedCustomer((prev) => ({ ...prev, workingPhone: e.target.value }))}
                                className="bg-white"
                              />
                              <Input
                                placeholder="Email address"
                                value={selectedCustomer.email || ""}
                                onChange={(e) => setSelectedCustomer((prev) => ({ ...prev, email: e.target.value }))}
                                className="bg-white"
                              />
                            </>
                          ) : (
                            <div className="space-y-2.5">
                              <p className="text-sm font-medium text-slate-700 font-mono flex items-center h-10 bg-slate-50 px-4 rounded-lg">
                                {selectedCustomer.workingPhone || "No phone provided"}
                              </p>
                              <p className="text-sm font-medium text-slate-700 flex items-center h-10 bg-slate-50 px-4 rounded-lg truncate">
                                {selectedCustomer.email || "No email provided"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-[1.5] space-y-4">
                        <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-3">
                          <MapPin size={13} className="text-slate-300" /> Billing Address
                        </h5>

                        {selectedCustomer.isInstantNew ? (
                          <div className="space-y-3">
                            <Input
                              placeholder="Street Address (e.g. 123 Main St)"
                              value={selectedCustomer.billingAddress?.street1 || ""}
                              onChange={(e) => setSelectedCustomer(prev => ({
                                ...prev, billingAddress: { ...prev.billingAddress, street1: e.target.value }
                              }))}
                              className="bg-white"
                            />

                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                placeholder="City"
                                value={selectedCustomer.billingAddress?.city || ""}
                                onChange={(e) => setSelectedCustomer(prev => ({
                                  ...prev, billingAddress: { ...prev.billingAddress, city: e.target.value }
                                }))}
                                className="bg-white"
                              />
                              <Input
                                placeholder="State"
                                value={selectedCustomer.billingAddress?.state || ""}
                                onChange={(e) => setSelectedCustomer(prev => ({
                                  ...prev, billingAddress: { ...prev.billingAddress, state: e.target.value }
                                }))}
                                className="bg-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                placeholder="Pincode"
                                value={selectedCustomer.billingAddress?.pincode || ""}
                                onChange={(e) => setSelectedCustomer(prev => ({
                                  ...prev, billingAddress: { ...prev.billingAddress, pincode: e.target.value }
                                }))}
                                className="bg-white"
                              />
                              <Input
                                placeholder="Country"
                                value={selectedCustomer.billingAddress?.country ?? "India"}
                                onChange={(e) => setSelectedCustomer(prev => ({
                                  ...prev, billingAddress: { ...prev.billingAddress, country: e.target.value }
                                }))}
                                className="bg-white"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 p-4 rounded-lg min-h-[128px] border border-slate-100 flex flex-col justify-center">
                            {selectedCustomer.billingAddress?.street1 ? (
                              <div className="text-sm text-slate-700 leading-relaxed">
                                <p className="font-semibold text-slate-800">
                                  {[selectedCustomer.billingAddress.street1, selectedCustomer.billingAddress.street2].filter(Boolean).join(", ")}
                                </p>
                                <p className="text-slate-500 mt-1">
                                  {[
                                    selectedCustomer.billingAddress.city,
                                    selectedCustomer.billingAddress.state,
                                    selectedCustomer.billingAddress.pincode
                                  ].filter(Boolean).join(", ")}
                                </p>
                                <div className="inline-block mt-2 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold tracking-wide text-slate-400 uppercase">
                                  {selectedCustomer.billingAddress.country || "India"}
                                </div>
                              </div>
                            ) : (
                              <p className="text-slate-400 italic text-sm text-center">No billing address provided</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 bg-slate-50/60 border-2 border-dashed border-slate-200 rounded-xl min-h-[220px] h-full text-center px-6 transition-colors hover:bg-slate-50">
                  <div className="w-11 h-11 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                    <AlertCircle size={22} className="text-slate-300" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-700">No client selected</p>
                    <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      Search for an existing client or type a new name/number above to allocate a record.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Metadata */}
          <div className="space-y-5 lg:border-l lg:pl-10 border-slate-200">
            <h2 className={sectionHeadingCls}>Timeline Details</h2>
            <div className="space-y-4">
              <div className="space-y-1"><label className={labelCls}>Issue Date</label><DatePickerInput onChange={setInvoiceIssueDate} value={invoiceIssueDate} /></div>
              <div className="space-y-1"><label className={labelCls}>Due Date</label><DatePickerInput onChange={setInvoiceDueDate} value={invoiceDueDate} /></div>
              <div className="space-y-1">
                <label className={labelCls}>Invoice No.</label>
                <Input className="w-full h-11 px-3 bg-slate-50 border-slate-200 text-sm font-mono font-bold text-slate-500 cursor-not-allowed" value={invoiceNumberSequence} readOnly />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Line Items */}
        <div className="space-y-4">
          <h2 className={sectionHeadingCls}>Line Items</h2>
          <div className={`hidden md:block overflow-visible ${cardCls}`}>
            <Table className="w-full">
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide pl-4 py-3.5 min-w-[320px]">Product / Item</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide py-3.5 w-24">Qty</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide py-3.5 w-28">MRP</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide py-3.5 w-32">Unit Price</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide py-3.5 w-44">Discount</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide py-3.5 pr-4 min-w-[120px]">Amount</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemData.map((data, index) => {
                  const rowAmount = calcRowAmount(data);

                  return (
                    <TableRow key={data._rowId} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors bg-white last:border-0 align-middle">
                      <TableCell className="pl-4 py-3.5 align-middle">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-11 w-11 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                            {data.image ? <img src={data.image} className="h-full w-full object-cover" alt="" /> : <ImageIcon size={18} className="text-slate-300" />}
                          </div>

                          <div
                            onClick={() => {
                              setActiveRowIndex(index);
                              setCatalogSearch("");
                              setIsCatalogOpen(true);
                            }}
                            className="flex-1 min-w-0 h-11 bg-white border border-slate-200 rounded-lg px-3.5 flex items-center justify-between gap-2 cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-colors"
                          >
                            {data.name ? (
                              <span className="font-semibold text-slate-800 truncate min-w-0 text-sm">{data.name}</span>
                            ) : (
                              <span className="font-medium text-slate-400 truncate min-w-0 text-sm">Tap to select product...</span>
                            )}
                            <Search size={16} className="text-slate-400 shrink-0" />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 align-middle">
                        <div className="flex items-center justify-end">
                          <input
                            value={data.quantity ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (!isValidIntegerInput(value)) return;
                              updateItem(index, "quantity", value);
                            }}
                            onBlur={() => {
                              const value = parseInt(data.quantity, 10);
                              updateItem(index, "quantity", Number.isFinite(value) && value > 0 ? String(value) : "1");
                            }}
                            type="text"
                            inputMode="numeric"
                            className="w-16 h-10 px-2 bg-white border border-slate-300 border-r-0 rounded-l-lg text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-400"
                          />

                          {!data._id ? (
                            <input
                              type="text"
                              value={data.unit}
                              onChange={(e) => updateItem(index, "unit", e.target.value)}
                              placeholder="Unit"
                              className="w-16 h-10 px-1 bg-white border border-slate-300 rounded-r-lg text-[11px] font-semibold text-slate-600 uppercase text-center focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-400 focus:z-10 shrink-0"
                              maxLength={5}
                            />
                          ) : (
                            <span className="w-16 h-10 px-1 flex items-center justify-center bg-slate-50 border border-slate-300 rounded-r-lg text-[11px] font-semibold text-slate-600 uppercase shrink-0">
                              {data.unit || ""}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 align-middle">
                        <input value={data.MRP} className="w-full h-10 px-2 text-center min-w-20 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400 font-mono outline-none cursor-not-allowed font-semibold" type="number" readOnly />
                      </TableCell>
                      
                      <TableCell className="text-right py-3.5 align-middle">
                        <input
                          value={data.sellingPrice ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!isValidDecimalInput(value)) return;
                            updateItem(index, "sellingPrice", value);
                          }}
                          onBlur={() => {
                            const value = normalizeMoney(data.sellingPrice);
                            updateItem(index, "sellingPrice", value.toFixed(2));
                          }}
                          inputMode="decimal"
                          type="text"
                          className="w-full h-10 px-2 min-w-20 bg-white border border-slate-300 rounded-lg text-sm text-center font-mono font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-400"
                        />
                      </TableCell>

                      <TableCell className="py-3.5 align-middle">
                        <div className="flex items-center max-w-[140px] mx-auto">
                          <input
                            value={data.discount ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (!isValidDecimalInput(value)) return;
                              if (data.discountType === "%" && value !== "" && Number(value) > 100) return;
                              updateItem(index, "discount", value);
                            }}
                            onBlur={() => {
                              const value = normalizeMoney(data.discount);
                              const normalized = data.discountType === "%"
                                ? Math.min(100, Math.max(0, value))
                                : Math.max(0, value);
                              updateItem(index, "discount", normalized.toFixed(2));
                            }}
                            inputMode="decimal"
                            type="text"
                            className="w-full h-10 px-2 min-w-20 bg-white border border-slate-300 rounded-lg text-sm text-center font-mono font-medium rounded-r-none border-r-0 focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-400"
                          />
                          <Select
                            value={data.discountType}
                            onValueChange={(val) => updateItem(index, "discountType", val)}
                          >
                            <SelectTrigger className="w-14 h-10 rounded-l-none border border-slate-300 bg-slate-50 px-2 py-[18px] font-semibold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="%">%</SelectItem>
                              <SelectItem value="Rs.">₹</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>

                      <TableCell className="text-right pr-4 py-3.5 font-bold text-slate-900 font-mono text-[15px] align-middle">₹{rowAmount.toFixed(2)}</TableCell>
                      <TableCell className="pr-3 py-3.5 align-middle text-center">
                        <button type="button" onClick={() => removeItem(index)} className="text-slate-300 hover:text-rose-600 p-2 transition-colors"><Trash2 size={16} /></button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View Card Stack Layout */}
          <div className="md:hidden space-y-3">
            {itemData.map((data, index) => {
              const rowAmount = calcRowAmount(data);

              return (
                <div key={data._rowId} className={`p-4 space-y-4 relative ${cardCls}`}>
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <span className="text-xs font-semibold text-orange-600 tracking-wide">Item #{index + 1}</span>
                    <button type="button" onClick={() => removeItem(index)} className="text-slate-300 hover:text-rose-600 transition-colors p-1"><Trash2 size={16} /></button>
                  </div>

                  <div className="space-y-1">
                    <label className={labelCls}>Item</label>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {data.image ? <img src={data.image} className="h-full w-full object-cover" alt="" /> : <ImageIcon size={18} className="text-slate-300" />}
                      </div>

                      <div
                        onClick={() => {
                          setActiveRowIndex(index);
                          setCatalogSearch("");
                          setIsCatalogOpen(true);
                        }}
                        className="flex-1 min-w-0 h-12 bg-white border border-slate-200 rounded-lg px-3.5 flex items-center justify-between gap-2 cursor-pointer active:border-orange-400"
                      >
                        {data.name ? (
                          <span className="font-semibold text-slate-800 truncate min-w-0 text-sm">{data.name}</span>
                        ) : (
                          <span className="font-medium text-slate-400 truncate min-w-0 text-sm">Tap to select product...</span>
                        )}
                        <Search size={16} className="text-slate-400 shrink-0" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <label className={labelCls}>Qty</label>
                      <div className="flex items-center">
                        <input
                          value={data.quantity ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!isValidIntegerInput(value)) return;
                            updateItem(index, "quantity", value);
                          }}
                          onBlur={() => {
                            const value = parseInt(data.quantity, 10);
                            updateItem(index, "quantity", Number.isFinite(value) && value > 0 ? String(value) : "1");
                          }}
                          type="text"
                          inputMode="numeric"
                          className="w-full h-11 px-2 bg-white border border-slate-300 border-r-0 rounded-l-lg text-sm text-center font-semibold"
                        />

                        {!data._id ? (
                          <input
                            type="text"
                            value={data.unit}
                            onChange={(e) => updateItem(index, "unit", e.target.value)}
                            placeholder="Unit"
                            className="w-14 h-11 px-1 bg-white border border-slate-300 rounded-r-lg text-[11px] font-semibold text-slate-600 uppercase text-center focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:z-10 shrink-0"
                            maxLength={5}
                          />
                        ) : (
                          <span className="w-14 h-11 px-1 flex items-center justify-center bg-slate-50 border border-slate-300 rounded-r-lg text-[11px] font-semibold text-slate-600 uppercase shrink-0">
                            {data.unit || ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Price</label>
                      <input
                        value={data.sellingPrice ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!isValidDecimalInput(value)) return;
                          updateItem(index, "sellingPrice", value);
                        }}
                        onBlur={() => {
                          const value = normalizeMoney(data.sellingPrice);
                          updateItem(index, "sellingPrice", value.toFixed(2));
                        }}
                        inputMode="decimal"
                        type="text"
                        className="w-full h-11 px-2 bg-white border border-slate-300 rounded-lg text-sm text-center font-semibold font-mono"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Discount</label>
                      <div className="flex items-center">
                        <input
                          value={data.discount ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!isValidDecimalInput(value)) return;
                            if (data.discountType === "%" && value !== "" && Number(value) > 100) return;
                            updateItem(index, "discount", value);
                          }}
                          onBlur={() => {
                            const value = normalizeMoney(data.discount);
                            const normalized = data.discountType === "%"
                              ? Math.min(100, Math.max(0, value))
                              : Math.max(0, value);
                            updateItem(index, "discount", normalized.toFixed(2));
                          }}
                          inputMode="decimal"
                          type="text"
                          className="w-full h-11 px-2 bg-white border border-slate-300 border-r-0 rounded-l-lg text-sm text-center font-mono"
                        />

                        <Select
                          value={data.discountType}
                          onValueChange={(val) => updateItem(index, "discountType", val)}
                        >
                          <SelectTrigger className="w-14 h-11 rounded-l-none border py-[21px] border-slate-300 bg-slate-50 px-2 font-semibold">
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
              setActiveRowIndex(null);
              setCatalogSearch("");
              dispatch(clearSearchedItems());

              setItemData(prev => [
                ...prev,
                { ...initialItemData, _rowId: generateRowId() }
              ]);
            }}
            className="text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 font-semibold text-xs h-10 px-4 rounded-lg transition-colors shadow-sm"
            type="button"
            variant="outline"
          >
            <Plus size={14} className="mr-1.5 stroke-[2.5]" /> Add New Item Line
          </Button>
        </div>

        {/* Section 3: Notes, Terms & Balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-slate-200">
          <div className="space-y-5">
            <h2 className={sectionHeadingCls}>Notes & Terms</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>Invoice Note</label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note visible on the customer's invoice..." className="w-full min-h-[90px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-400 font-medium placeholder-slate-400" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Payment Terms</label>
                <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="Specify payment terms, due windows, late fees..." className="w-full min-h-[90px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-400 font-medium placeholder-slate-400" />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <h2 className={sectionHeadingCls}>Balance Summary</h2>
            <div className={`p-6 space-y-4 ${cardCls}`}>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-mono text-slate-900 font-semibold text-[15px]">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-emerald-600">Discount</span>
                <span className="font-mono text-emerald-600 font-semibold text-[15px]">−₹{totalDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
                  <span>Tax Rate</span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-14 h-8 text-center border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-orange-500/15 focus:border-orange-400 focus:outline-none bg-white text-slate-900 font-semibold"
                      value={taxRate ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!isValidDecimalInput(value)) return;
                        if (value !== "" && Number(value) > 100) return;
                        setTaxRate(value);
                      }}
                      onBlur={() => {
                        const value = normalizeMoney(taxRate);
                        setTaxRate(Math.min(100, Math.max(0, value)).toFixed(2));
                      }}
                    />
                    <span className="text-xs text-slate-400 font-semibold">%</span>
                  </div>
                </div>
                <span className="font-mono text-sm text-slate-900 font-semibold">₹{taxedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">Total Due</span>
                <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight">₹{grandTotal.toFixed(2)}</span>
              </div>

              {/* Payment Section */}
              <div className="pt-4 mt-1 border-t border-slate-100">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-3">
                  Payment Status
                </p>

                <div className="flex flex-wrap items-center gap-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentStatus"
                      checked={effectivePaymentStatus === "Unpaid"}
                      onChange={() => {
                        setPaymentStatus("Unpaid");
                        setPaidAmount("");
                      }}
                      className="h-4 w-4 accent-slate-900"
                    />
                    <span className="text-sm text-slate-700">Unpaid</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentStatus"
                      checked={effectivePaymentStatus === "Partially Paid"}
                      onChange={() => {
                        setPaymentStatus("Partially Paid");
                        if (paidAmount === "") setPaidAmount("0");
                      }}
                      className="h-4 w-4 accent-orange-500"
                    />
                    <span className="text-sm text-slate-700">Partially Paid</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentStatus"
                      checked={effectivePaymentStatus === "Paid"}
                      onChange={() => {
                        setPaymentStatus("Paid");
                        setPaidAmount(grandTotal.toFixed(2));
                      }}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <span className="text-sm text-slate-700">Paid</span>
                  </label>
                </div>

                {/* Additional Payment Fields for Paid / Partially Paid */}
                {(paymentStatus === "Partially Paid" || paymentStatus === "Paid") && (
                  <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {paymentStatus === "Partially Paid" ? (
                        <div>
                          <label className={labelCls}>Amount Received</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">₹</span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={paidAmount}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (!isValidDecimalInput(value)) return;
                                if (value !== "" && Number(value) > grandTotal) {
                                  setPaidAmount(grandTotal.toFixed(2));
                                  return;
                                }
                                setPaidAmount(value);
                              }}
                              onBlur={() => {
                                const value = Math.min(Math.max(normalizeMoney(paidAmount), 0), Math.max(grandTotal, 0));
                                setPaidAmount(value ? value.toFixed(2) : "");
                              }}
                              placeholder="0.00"
                              className="w-full h-11 pl-8 pr-3 bg-white border border-slate-300 rounded-lg text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-400"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className={labelCls}>Amount Received</label>
                          <div className="h-11 px-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-700">Fully Paid</span>
                            <span className="font-mono font-bold text-emerald-700">₹{grandTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className={labelCls}>Payment Method</label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger className="w-full h-11 border border-slate-300 bg-white font-medium text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-slate-200">
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="UPI">UPI</SelectItem>
                            <SelectItem value="Card">Card</SelectItem>
                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Payment Note (Optional)</label>
                        <Input
                          placeholder="e.g. Transaction ID / Ref"
                          value={paymentNote}
                          onChange={(e) => setPaymentNote(e.target.value)}
                          className="bg-white text-sm h-11"
                        />
                      </div>

                      <div className="flex flex-col justify-end">
                        <div className="h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500">Due Later</span>
                          <span className="font-mono font-bold text-slate-900">₹{balanceAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentStatus === "Unpaid" && grandTotal > 0 && (
                  <div className="mt-4 flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-xs font-semibold text-slate-500">Due Later</span>
                    <span className="font-mono font-bold text-slate-900">₹{grandTotal.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-8 pt-5 border-t border-slate-200">
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

      {/* Document Preview Modal (Desktop Only) */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-[850px] h-[92vh] overflow-hidden bg-white p-0 rounded-2xl flex flex-col border border-slate-200 shadow-2xl">
          <div className="p-5 border-b border-slate-200 bg-slate-50/60 shrink-0">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Eye size={20} className="text-orange-500" /> Invoice Preview
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium leading-normal">
                Review your invoice carefully before compilation.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 w-full bg-slate-100 p-3 overflow-hidden">
            {previewOpen && !isMobile && (
              <PDFViewer width="100%" height="100%" showToolbar={true} className="border-0 rounded-xl shadow-inner bg-slate-200">
                {renderInvoiceDocument(true)}
              </PDFViewer>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Catalog Modal */}
      <Dialog open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-[850px] h-[85vh] flex flex-col bg-slate-50 p-0 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 bg-white border-b border-slate-200 shrink-0">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold text-slate-900">Select a Product</DialogTitle>
              <DialogDescription className="text-sm text-slate-500 font-medium">
                Tap any product below to instantly add it to your invoice.
              </DialogDescription>
            </DialogHeader>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <Input
                autoFocus
                className="w-full h-12 pl-11 text-[15px] rounded-xl border-2 border-slate-200 focus:border-orange-400 font-medium"
                placeholder="Search products..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6" id="catalog-scroll-container">
            {hasNoItemSearchResults ? (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-slate-500 font-medium mb-4 text-center text-[15px]">No products found for "{catalogSearch}"</p>
                <Button
                  onClick={() => {
                    setItemData(prev => prev.map((it, i) => i === activeRowIndex ? {
                      ...it,
                      _id: "",
                      name: catalogSearch,
                      unit: "",
                      MRP: 0,
                      sellingPrice: 0,
                      image: null,
                    } : it));
                    setIsCatalogOpen(false);
                    setCatalogSearch("");
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11 px-6 rounded-xl"
                >
                  <Plus size={18} className="mr-2" /> Add "{catalogSearch}" as Custom Item
                </Button>
              </div>
            ) : (
              <InfiniteScroll
                dataLength={itemSearchDropdownItems.length}
                next={() => !isSearchingItems ? fetchItems(10, itemNextCursor) : searchItemPagination(10, itemsearchNextCursor)}
                hasMore={!isSearchingItems ? !itemIsEnd : !itemsearchIsEnd}
                scrollableTarget="catalog-scroll-container"
                loader={<div className="py-4 flex justify-center w-full"><Loader2 /></div>}
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
              >
                {itemSearchDropdownItems.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => {
                      setItemData(prev => prev.map((it, i) => i === activeRowIndex ? {
                        ...it,
                        _id: product._id,
                        name: product.name,
                        unit: product.unit || "",
                        MRP: product.MRP || 0,
                        sellingPrice: product.sellingPrice || 0,
                        image: product.image || null,
                      } : it));
                      setIsCatalogOpen(false);
                      setCatalogSearch("");
                    }}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-orange-400 hover:shadow-md transition-all group flex flex-col h-full"
                  >
                    <div className="aspect-square bg-slate-50 flex items-center justify-center p-3 border-b border-slate-100">
                      {product.image ? (
                        <img src={product.image} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" alt={product.name} />
                      ) : (
                        <ImageIcon size={40} className="text-slate-300" />
                      )}
                    </div>
                    <div className="p-3 text-center flex-1 flex flex-col justify-between bg-white">
                      <p className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-orange-600">{product.name}</p>
                      <p className="font-mono font-bold text-slate-500 text-sm">₹{product.sellingPrice}</p>
                    </div>
                  </div>
                ))}
              </InfiniteScroll>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddInvoice;