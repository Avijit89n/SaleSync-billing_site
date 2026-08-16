import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, FilePlusCorner, UserCheck, AlertCircle, MapPin, Mail, Search, ImageIcon, Eye, UserPlus, X } from 'lucide-react';
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
  const [invoiceIssueDate, setInvoiceIssueDate] = useState(new Date());
  const [invoiceDueDate, setInvoiceDueDate] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(initialData)

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

  // --- SMART INSTANT CREATION LOGIC ---
  const handleInstantClientCreate = (searchValue) => {
    const val = searchValue.trim();
    const isPhoneNumberSearch = /^[\+\d\s\-]+$/.test(val) && val.replace(/\D/g, '').length >= 5;

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

  const isPhoneNumberSearchCurrent = /^[\+\d\s\-]+$/.test(customerSearchValue.trim()) && customerSearchValue.replace(/\D/g, '').length >= 5;

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
    customerPhone: selectedCustomer.workingPhone || "", // Added Customer Phone here
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

      if (item._id && item._id.trim() !== "") {
        cleanedItem.itemId = item._id;
      }

      return cleanedItem;
    }),

    subtotal: Number(subtotal),

    invoiceDate: invoiceIssueDate ? new Date(invoiceIssueDate).toISOString() : new Date().toISOString(),
    dueDate: invoiceDueDate ? new Date(invoiceDueDate).toISOString() : new Date().toISOString(),

    discount: Number(totalDiscount),
    tax: Number(taxedAmount),
    grandTotal: Number(grandTotal),
    notes: notes ? notes.trim() : "",
    terms: terms ? terms.trim() : "",
    status: isPaid ? "Paid" : "Unpaid"
  });

  const resetForm = async() => {
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

          {/* ── Section 1: Customer Allocation (Upgraded Zero-Click UX) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                Client Allocation
              </h2>
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
                        // The magic trigger: If they hit Enter on an unmatched name/number, create it instantly
                        if (e.key === 'Enter' && hasNoCustomerSearchResults && customerSearchValue.trim()) {
                          e.preventDefault();
                          handleInstantClientCreate(customerSearchValue);
                        }
                      }}
                    />
                    <ComboboxContent className="border border-slate-200 bg-white shadow-xl rounded-lg mt-1 w-full z-50">
                      {isCustomerDebouncing || (customersSearchLoading && customerDropdownItems.length === 0) ? (
                        <div className="p-4 flex items-center justify-center w-full"><Loader2 /></div>
                      ) : hasNoCustomerSearchResults ? (

                        /* THE UPGRADED "CREATE ON THE FLY" DROPDOWN OPTION */
                        <div
                          onClick={() => {
                            handleInstantClientCreate(customerSearchValue);
                          }}
                          className="p-3 hover:bg-orange-50/80 cursor-pointer flex items-center justify-between group border-l-2 border-transparent hover:border-orange-500 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                              <Plus size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Record not found</p>
                              <p className="text-sm font-bold text-slate-800">
                                Add <span className="text-orange-600">"{customerSearchValue}"</span> as new {isPhoneNumberSearchCurrent ? "phone record" : "client"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded font-bold">
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

              {/* Smart Client Record Info Box */}
              <div className="mt-4 min-h-[165px]">
                {selectedCustomer ? (
                  <div
                    className={`relative bg-white rounded-2xl border ${selectedCustomer.isInstantNew ? "border-orange-200/80 shadow-md shadow-orange-100/20" : "border-slate-200 shadow-sm shadow-slate-100/50"
                      } overflow-hidden transition-all duration-300`}
                  >
                    

                    <div className="p-6">
                      {/* Header Section */}
                      <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-5">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${selectedCustomer.isInstantNew
                                ? "bg-orange-50 text-orange-500"
                                : "bg-emerald-50 text-emerald-500"
                              }`}
                          >
                            <UserCheck size={20} strokeWidth={2.5} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5">
                              <h4 className="text-base font-bold text-slate-800 tracking-tight">
                                {selectedCustomer.displayName || "New Client"}
                              </h4>
                              {selectedCustomer.isInstantNew && (
                                <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wide">
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

                      {/* Content Section - 2 Column Split */}
                      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                        {/* Contact Column */}
                        <div className="flex-1 space-y-4">
                          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <Mail size={14} className="text-slate-300" /> Contact
                          </h5>

                          <div className="space-y-3">
                            {selectedCustomer.isInstantNew ? (
                              <>
                                <Input
                                  autoFocus={!selectedCustomer.displayName}
                                  placeholder="Customer Name *"
                                  value={selectedCustomer.displayName || ""}
                                  onChange={(e) => setSelectedCustomer((prev) => ({ ...prev, displayName: e.target.value }))}
                                  className={`bg-white ${!selectedCustomer.displayName ? 'border-orange-300 ring-2 ring-orange-500/20' : ''}`}
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
                              <div className="space-y-3">
                                <p className="text-sm font-medium text-slate-700 font-mono flex items-center h-10 bg-slate-50/50 px-4 rounded-xl">
                                  {selectedCustomer.workingPhone || "No phone provided"}
                                </p>
                                <p className="text-sm font-medium text-slate-700 flex items-center h-10 bg-slate-50/50 px-4 rounded-xl truncate">
                                  {selectedCustomer.email || "No email provided"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Address Column */}
                        <div className="flex-[1.5] space-y-4">
                          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <MapPin size={14} className="text-slate-300" /> Billing Address
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
                            <div className="bg-slate-50/60 p-4 rounded-xl min-h-[128px] border border-slate-100 flex flex-col justify-center">
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
                                  <div className="inline-block mt-2 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold tracking-widest text-slate-400 uppercase">
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
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center gap-4 bg-slate-50/30 border-2 border-dashed border-slate-200 rounded-2xl min-h-[220px] h-full text-center px-6 transition-colors hover:bg-slate-50/50">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                      <AlertCircle size={24} className="text-slate-300" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-700">No client selected</p>
                      <p className="text-sm text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                        Search for an existing client or type a new name/number above to dynamically allocate a record.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Timeline Metadata */}
            <div className="space-y-6 lg:border-l lg:pl-12 border-slate-200">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Timeline Details</h2>
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
                      (data.discountType === "%" 
                        ? (((Number(data.quantity) || 0) * (Number(data.sellingPrice) || 0)) * ((Number(data.discount) || 0) / 100)) 
                        : ((Number(data.discount) || 0) * (Number(data.quantity) || 0)));

                    return (
                      <TableRow key={data._rowId} className="border-b border-slate-200 hover:bg-slate-50/20 transition-colors bg-white last:border-0 align-middle">
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
                                  placeholder="Search inventory or type custom item..."
                                  value={data.name}
                                  onFocus={() => {
                                    setActiveRowIndex(index);
                                    setItemSearchValue(data.name);
                                    dispatch(clearSearchedItems());
                                  }}
                                  onChange={(e) => {
                                    const value = e.target.value;

                                    setActiveRowIndex(index);
                                    setItemSearchValue(value);

                                    setItemData(prev =>
                                      prev.map((it, i) =>
                                        i === index
                                          ? {
                                            ...it,
                                            name: value,
                                            _id: "",
                                            ...(value === "" ? { MRP: 0, sellingPrice: 0, image: null, unit: "" } : {})
                                          }
                                          : it
                                      )
                                    );

                                    if (value === "") {
                                      dispatch(clearSearchedItems());
                                    }
                                  }}
                                />
                                <ComboboxContent className="border border-slate-200 bg-white shadow-xl rounded-lg w-full z-50">
                                  {(isItemDebouncing && activeRowIndex === index) || (itemSearchLoading && itemSearchDropdownItems.length === 0) ? (
                                    <div className="p-4 flex justify-center w-full"><Loader2 /></div>
                                  ) : hasNoItemSearchResults && activeRowIndex === index ? (
                                    <ComboboxEmpty className="p-4 text-center text-sm text-slate-500 bg-slate-50/50 rounded-b-lg">
                                      <span className="font-bold text-slate-800">"{itemSearchValue}" {"\u00A0"}</span> will be saved as a custom item.
                                    </ComboboxEmpty>
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

                            {!data._id ? (
                              <input
                                type="text"
                                value={data.unit}
                                onChange={(e) => updateItem(index, "unit", e.target.value)}
                                placeholder="Unit"
                                className="w-14 h-11 px-1 bg-white border border-slate-300 rounded-r-lg text-[11px] font-bold text-slate-600 uppercase text-center focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:z-10 shrink-0"
                                maxLength={5}
                              />
                            ) : (
                              <span className="w-14 h-11 px-1 flex items-center justify-center bg-slate-50 border border-slate-300 rounded-r-lg text-[11px] font-bold text-slate-600 uppercase shrink-0">
                                {data.unit || ""}
                              </span>
                            )}
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
                  (data.discountType === "%" 
                    ? (((Number(data.quantity) || 0) * (Number(data.sellingPrice) || 0)) * ((Number(data.discount) || 0) / 100)) 
                    : ((Number(data.discount) || 0) * (Number(data.quantity) || 0)));

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
                              placeholder="Search or type custom item..."
                              value={data.name}
                              onFocus={() => {
                                setActiveRowIndex(index);
                                setItemSearchValue(data.name);
                                dispatch(clearSearchedItems());
                              }}
                              onChange={(e) => {
                                const value = e.target.value;

                                setActiveRowIndex(index);
                                setItemSearchValue(value);

                                setItemData(prev =>
                                  prev.map((it, i) =>
                                    i === index
                                      ? {
                                        ...it,
                                        name: value,
                                        _id: "",
                                        ...(value === "" ? { MRP: 0, sellingPrice: 0, image: null, unit: "" } : {})
                                      }
                                      : it
                                  )
                                );

                                if (value === "") {
                                  dispatch(clearSearchedItems());
                                }
                              }}
                            />
                            <ComboboxContent className="border border-slate-200 bg-white w-full z-50">
                              {(isItemDebouncing && activeRowIndex === index) || (itemSearchLoading && itemSearchDropdownItems.length === 0) ? (
                                <div className="p-4 flex justify-center w-full"><Loader2 /></div>
                              ) : hasNoItemSearchResults && activeRowIndex === index ? (
                                <ComboboxEmpty className="p-4 text-center text-sm text-slate-500 bg-slate-50/50 rounded-b-lg">
                                  <span className="font-bold text-slate-800">"{itemSearchValue}" {"\u00A0"}</span> will be saved as a custom item.
                                </ComboboxEmpty>
                              ) : (
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
                              )}
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

                          {!data._id ? (
                            <input
                              type="text"
                              value={data.unit}
                              onChange={(e) => updateItem(index, "unit", e.target.value)}
                              placeholder="Unit"
                              className="w-14 h-11 px-1 bg-white border border-slate-300 rounded-r-lg text-[11px] font-bold text-slate-600 uppercase text-center focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:z-10 shrink-0"
                              maxLength={5}
                            />
                          ) : (
                            <span className="w-14 h-11 px-1 flex items-center justify-center bg-slate-50 border border-slate-300 rounded-r-lg text-[11px] font-bold text-slate-600 uppercase shrink-0">
                              {data.unit || ""}
                            </span>
                          )}
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