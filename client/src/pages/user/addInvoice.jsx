import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, useBlocker } from 'react-router-dom';
import { Plus, Trash2, FilePlus2, UserCheck, AlertCircle, AlertTriangle, MapPin, Mail, Search, ImageIcon, Eye, Package } from 'lucide-react';
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
import InvoiceDesign2 from '@/components/other-ui/invoice-design-2';
import InvoiceDesign3 from '@/components/other-ui/invoice-design-3';
import InvoiceDesign4 from '@/components/other-ui/invoice-design-4';
import ThermalInvoice1 from '@/components/other-ui/thermal-design-1';
import ThermalInvoice2 from '@/components/other-ui/thermal-design-2';
import ThermalInvoice1Hindi from '@/components/other-ui/thermal-design-1-hindi';
import ThermalInvoice2Hindi from '@/components/other-ui/thermal-design-2-hindi';
import InvoiceDesign1Hindi from "@/components/other-ui/invoice-design-1-hindi";
import InvoiceDesign2Hindi from "@/components/other-ui/invoice-design-2-hindi";
import InvoiceDesign3Hindi from "@/components/other-ui/invoice-design-3-hindi";
import InvoiceDesign4Hindi from "@/components/other-ui/invoice-design-4-hindi";
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
  a4Layout: "invoiceDesign1",
  thermalLayout: "thermalDesign1",
};

const labelCls = "block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5";
const sectionHeadingCls = "text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100 pb-2";
const cardCls = "border border-slate-200 rounded-xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

// Keep all invoice math at two-decimal currency precision to avoid floating-point drift.
const money = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round((number + Number.EPSILON) * 100) / 100;
};

const nonNegativeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
};

const getQuantity = (item) => nonNegativeNumber(item.quantity);
const getMRP = (item) => money(nonNegativeNumber(item.MRP));
const getSellingPrice = (item) => money(nonNegativeNumber(item.sellingPrice));
const getDiscountValue = (item) => nonNegativeNumber(item.discount);

const hasApplicableDiscount = (item) =>
  getSellingPrice(item) > 0 && getDiscountValue(item) > 0 && getMRP(item) > 0;

// Discount is calculated from MRP. A fixed-rupee discount applies per unit.
// The per-unit discount is capped at MRP so an item's amount can never be negative.
const getDiscountPerUnit = (item) => {
  if (!hasApplicableDiscount(item)) return 0;
  const mrp = getMRP(item);
  const discount = getDiscountValue(item);
  const requestedDiscount = item.discountType === "%"
    ? money(mrp * (Math.min(discount, 100) / 100))
    : money(discount);
  return money(Math.min(mrp, requestedDiscount));
};

const getItemDiscountAmount = (item) =>
  money(getDiscountPerUnit(item) * getQuantity(item));

// Subtotal is the sum of original selling price × quantity, whether discounted or not.
const getItemBaseAmount = (item) =>
  money(getSellingPrice(item) * getQuantity(item));

// Amount per row: discounted MRP × quantity when a valid discount exists;
// otherwise selling price × quantity. Selling price itself is never overwritten.
const getDiscountedUnitPrice = (item) => {
  if (!hasApplicableDiscount(item)) return getSellingPrice(item);
  return money(Math.max(0, getMRP(item) - getDiscountPerUnit(item)));
};

const calcRowAmount = (item) =>
  money(getDiscountedUnitPrice(item) * getQuantity(item));

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
  const { t } = useTranslation();
  const [itemData, setItemData] = useState([{ ...initialItemData }]);
  const [customerSearchValue, setCustomerSearchValue] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerComboboxOpen, setCustomerComboboxOpen] = useState(false);
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
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);

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
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get('customerId');
  const dispatch = useDispatch();

  const customerAbortRef = useRef(null);
  const itemAbortRef = useRef(null);
  const baselineSignatureRef = useRef(null);
  const preselectedBaselineSetRef = useRef(false);
  const savedRef = useRef(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Compare the actual invoice draft with its original values. This means adding
  // and then removing a customer/item returns the form to clean state.
  const draftSignature = useMemo(() => JSON.stringify({
    customer: selectedCustomer || null,
    items: itemData.map(({ _rowId, ...item }) => item),
    notes,
    terms,
    taxRate,
    paymentStatus,
    paidAmount,
    paymentMethod,
    paymentNote,
    invoiceIssueDate: invoiceIssueDate ? new Date(invoiceIssueDate).toISOString() : null,
    invoiceDueDate: invoiceDueDate ? new Date(invoiceDueDate).toISOString() : null,
  }), [
    selectedCustomer, itemData, notes, terms, taxRate, paymentStatus, paidAmount,
    paymentMethod, paymentNote, invoiceIssueDate, invoiceDueDate,
  ]);

  const confirmLeave = () => window.confirm(
    t("AddInvoice.UnsavedChanges.Message", {
      defaultValue: "You have an unsaved invoice. Are you sure you want to leave this page? Your changes will be lost.",
    })
  );

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges &&
      !savedRef.current &&
      !saving &&
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search ||
        currentLocation.hash !== nextLocation.hash)
  );

  useEffect(() => {
    // Capture the initial form state once. If a customer was preselected through
    // ?customerId=..., that preselection is setup, not an unsaved user change.
    if (baselineSignatureRef.current === null) {
      baselineSignatureRef.current = draftSignature;
      return;
    }

    // A successful save resets the form; treat the reset state as the new baseline.
    if (savedRef.current) {
      baselineSignatureRef.current = draftSignature;
      savedRef.current = false;
      setHasUnsavedChanges(false);
      return;
    }

    if (
      customerId &&
      selectedCustomer?._id === customerId &&
      !preselectedBaselineSetRef.current
    ) {
      baselineSignatureRef.current = draftSignature;
      preselectedBaselineSetRef.current = true;
      setHasUnsavedChanges(false);
      return;
    }

    setHasUnsavedChanges(draftSignature !== baselineSignatureRef.current);
  }, [draftSignature, customerId, selectedCustomer?._id]);

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (confirmLeave()) blocker.proceed();
    else blocker.reset();
  }, [blocker.state, blocker, t]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedChanges || savedRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

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

  const itemSearchDropdownItems = (isSearchingItems
    ? (searchedItems || [])
    : allitems
  ).filter(item => {
    if (!isSearchingItems || !catalogSearch) return true;
    return item?.name?.toLowerCase().includes(catalogSearch.toLowerCase());
  });

  const hasNoCustomerSearchResults = isSearchingCustomers && !customersSearchLoading && customerDropdownItems.length === 0;
  const hasNoItemSearchResults =
    isSearchingItems &&
    !isItemDebouncing &&
    !itemSearchLoading &&
    itemSearchDropdownItems.length === 0;

  const isMobile = useMemo(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent), []);

  const isPhoneNumberSearchCurrent = useMemo(
    () => looksLikePhoneNumber(customerSearchValue),
    [customerSearchValue]
  );

  // Preselect the customer when Add Invoice is opened with ?customerId=...
  // The customer is taken directly from the Redux customer slice, so no
  // additional customer API request is required when the record is already loaded.
  useEffect(() => {
    if (!customerId || !allcustomers?.length) return;

    const customerFromSlice = allcustomers.find(
      (customer) => customer?._id === customerId
    );

    if (!customerFromSlice) return;

    setSelectedCustomer(customerFromSlice);
    setCustomerSearchValue(customerFromSlice?.displayName || "");
    setCustomerComboboxOpen(false);
    dispatch(clearSearchedCustomers());
  }, [customerId, allcustomers, dispatch]);

  const handleInstantClientCreate = (searchValue) => {
    const val = searchValue.trim();

    const isPhoneNumberSearch =
      looksLikePhoneNumber(val);

    const instantClient = {
      _id: `temp_${Date.now()}`,
      displayName: isPhoneNumberSearch ? "" : val,
      workingPhone: isPhoneNumberSearch ? val : "",
      email: "",
      customerType: "Individual",
      isInstantNew: true,
      billingAddress: {
        attention: "",
        country: "India",
        street1: "",
        street2: "",
        city: "",
        state: "",
        pincode: "",
        phone: isPhoneNumberSearch ? val : "",
        fax: "",
      },
      shippingAddress: {
        attention: "",
        country: "India",
        street1: "",
        street2: "",
        city: "",
        state: "",
        pincode: "",
        phone: isPhoneNumberSearch ? val : "",
        fax: "",
      },
    };

    setSelectedCustomer(instantClient);

    // Close the customer suggestions immediately after creating a new client.
    setCustomerComboboxOpen(false);
    dispatch(clearSearchedCustomers());
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
        toast.error(err.message || t("AddInvoice.Errors.SomethingWentWrong"));
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
        toast.error(err.message || t("AddInvoice.Errors.SomethingWentWrong"));
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      if (itemAbortRef.current) itemAbortRef.current.abort();
    };
  }, [catalogSearch, dispatch]);

  const fetchCustomers = async (limit = 10, cursor = undefined) => {
    await dispatch(getAllCustomerReq({ limit, lastCreatedAt: cursor })).unwrap().catch((err) => toast.error(err.message || t("AddInvoice.Errors.SomethingWentWrong")));
  };

  const fetchItems = async (limit = 10, cursor = undefined) => {
    await dispatch(getAllItemReq({ limit, lastCreatedAt: cursor })).unwrap().catch((err) => toast.error(err.message || t("AddInvoice.Errors.SomethingWentWrong")));
  };

  const searchCustomerPagination = async (limit = 10, cursor) => {
    if (customerSearchValue.length < 2 || customersSearchLoading) return;
    await dispatch(customerSearchReq({
      search: customerSearchValue,
      limit,
      cursor
    })).unwrap().catch((err) => toast.error(err.message || t("AddInvoice.Errors.SomethingWentWrong")));
  };

  const searchItemPagination = async (limit = 10, cursor) => {
    if (catalogSearch.length < 2 || itemSearchLoading) return;
    await dispatch(itemSearchReq({ search: catalogSearch, limit, cursor })).unwrap().catch((err) => toast.error(err.message || t("AddInvoice.Errors.SomethingWentWrong")));
  };

  const subtotal = useMemo(() =>
    money(itemData.reduce((acc, item) => acc + getItemBaseAmount(item), 0)),
    [itemData]
  );

  // The totals must reconcile: Subtotal - Discount = Discounted Item Total.
  // Calculate the payable item total from the actual row Amount values, then
  // derive the invoice-level discount as the difference from the subtotal.
  const discountedItemsTotal = useMemo(() =>
    money(itemData.reduce((acc, item) => acc + calcRowAmount(item), 0)),
    [itemData]
  );

  const totalDiscount = useMemo(() =>
    money(subtotal - discountedItemsTotal),
    [subtotal, discountedItemsTotal]
  );

  const normalizedTaxRate = useMemo(() => {
    const rate = Number(taxRate);
    return Number.isFinite(rate) ? Math.min(100, Math.max(0, rate)) : 0;
  }, [taxRate]);

  const taxedAmount = useMemo(() =>
    money(discountedItemsTotal * (normalizedTaxRate / 100)),
    [discountedItemsTotal, normalizedTaxRate]
  );

  const grandTotal = useMemo(() =>
    money(discountedItemsTotal + taxedAmount),
    [discountedItemsTotal, taxedAmount]
  );

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
    const initialPayments = finalPaid > 0 ? [
      {
        amount: finalPaid,
        paymentDate: invoiceIssueDate
          ? new Date(invoiceIssueDate).toISOString()
          : new Date().toISOString(),
        paymentMethod: paymentMethod || "Cash",
        note: paymentNote.trim() || "Initial payment on invoice creation",
      }
    ] : [];
    const billingAddress = {
      attention: selectedCustomer?.billingAddress?.attention || "",
      country: selectedCustomer?.billingAddress?.country || "India",
      street1: selectedCustomer?.billingAddress?.street1 || "",
      street2: selectedCustomer?.billingAddress?.street2 || "",
      city: selectedCustomer?.billingAddress?.city || "",
      state: selectedCustomer?.billingAddress?.state || "",
      pincode: selectedCustomer?.billingAddress?.pincode || "",
      phone: selectedCustomer?.billingAddress?.phone || selectedCustomer?.workingPhone || "",
      fax: selectedCustomer?.billingAddress?.fax || "",
    };
    const shippingAddress = {
      attention: selectedCustomer?.shippingAddress?.attention || "",
      country: selectedCustomer?.shippingAddress?.country || "India",
      street1: selectedCustomer?.shippingAddress?.street1 || "",
      street2: selectedCustomer?.shippingAddress?.street2 || "",
      city: selectedCustomer?.shippingAddress?.city || "",
      state: selectedCustomer?.shippingAddress?.state || "",
      pincode: selectedCustomer?.shippingAddress?.pincode || "",
      phone: selectedCustomer?.shippingAddress?.phone || selectedCustomer?.workingPhone || "",
      fax: selectedCustomer?.shippingAddress?.fax || "",
    };
    return {
      invoiceNumber: invoiceNumberSequence,
      customerId: selectedCustomer?._id,
      customerName: selectedCustomer?.displayName || "",
      customerPhone: selectedCustomer?.workingPhone || "",
      customerEmail: selectedCustomer?.email || "",
      customerBillingAddress: billingAddress,
      customerShippingAddress: shippingAddress,
      items:
        itemData.map(item => {
          const cleanedItem = {
            name: item.name,
            quantity: Number(item.quantity) || 1,
            MRP: Number(item.MRP) || 0,
            // Keep selling price unchanged. The discount is calculated from MRP
            // and the final line amount is supplied separately for invoice displays.
            sellingPrice: Number((Number(item.sellingPrice) || 0).toFixed(2)),
            discount: hasApplicableDiscount(item) ? Number(item.discount) || 0 : 0,
            discountType: item.discountType || "%",
            discountAmount: Number(getItemDiscountAmount(item).toFixed(2)),
            discountedPrice: getDiscountedUnitPrice(item),
            amount: Number(calcRowAmount(item).toFixed(2)),
            image: item.image || null,
            unit: item.unit || "",
            description: item.description || item.itemDescription || "",
          };
          if (item._id && item._id.trim() !== "") {
            cleanedItem.itemId = item._id;
          }
          return cleanedItem;
        }),
      subtotal:
        Number(subtotal.toFixed(2)),
      invoiceDate: invoiceIssueDate ? new Date(invoiceIssueDate).toISOString() : new Date().toISOString(),
      dueDate: invoiceDueDate ? new Date(invoiceDueDate).toISOString() : new Date().toISOString(),
      discount: Number(totalDiscount.toFixed(2)),
      tax: Number(taxedAmount.toFixed(2)),
      taxRate: normalizedTaxRate,
      grandTotal: Number(grandTotal.toFixed(2)),
      notes: notes ? notes.trim() : "",
      terms: terms ? terms.trim() : "",
      status: effectivePaymentStatus,
      paidAmount: finalPaid,
      balanceAmount: balanceAmount,
      payments: initialPayments,
    };
  };

  const resetForm = async () => {
    setSelectedCustomer(null);
    setCustomerSearchValue("");
    setCustomerComboboxOpen(false);
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

  const saveInvoice = async (action = "save", type = "Normal") => {
    if (saving) return;

    if (!selectedCustomer || (selectedCustomer.isInstantNew && (!selectedCustomer.displayName || !selectedCustomer.displayName.trim()))) {
      toast.error(t("AddInvoice.Errors.ValidCustomerName"));
      return;
    }

    // New customers use a temporary frontend ID until customerValidation
    // resolves or creates the customer on the backend during /add-invoice.
    // Do not block invoice submission just because this ID starts with "temp_".
    if (!selectedCustomer._id) {
      toast.error(t("AddInvoice.Errors.ValidCustomerName"));
      return;
    }

    const invalidItems = itemData.some(
      (item) =>
        !item.name ||
        Number(item.quantity) <= 0 ||
        Number(item.sellingPrice) < 0
    );

    if (invalidItems) {
      toast.error(t("AddInvoice.Errors.CompleteItemRows"));
      return;
    }

    if (invoiceDueDate < invoiceIssueDate) {
      toast.error(t("AddInvoice.Errors.DueDateBeforeIssue"));
      return;
    }

    if (grandTotal <= 0) {
      toast.error(t("AddInvoice.Errors.TotalMustBePositive"));
      return;
    }

    if (effectivePaymentStatus === "Partially Paid") {
      const amount = normalizeMoney(paidAmount);

      if (amount <= 0) {
        toast.error(t("AddInvoice.Errors.EnterAmountReceived"));
        return;
      }

      if (amount >= grandTotal) {
        toast.error(t("AddInvoice.Errors.SelectPaidForFullPayment"));
        return;
      }
    }

    setSaving(true);

    try {
      const invoicePayload = buildInvoicePayload();

      const savePromise = dispatch(addInvoiceReq(invoicePayload)).unwrap();

      toast.promise(savePromise, {
        loading: t("AddInvoice.Toast.SavingInvoice"),
        success: t("AddInvoice.Toast.InvoiceSaved"),
      });

      await savePromise;
      savedRef.current = true;
      setHasUnsavedChanges(false);

      if (action === "download") {
        await handleDownloadPdf();
      } else if (action === "print" && type === "Normal") {
        await handlePrintPdf();
      } else if (action === "print" && type === "Thermal") {
        await handlePrintPdf("Thermal");
      }

      const nextTokenRes = await api.get('/invoice/get-next-token');
      const nextInvoiceNum = nextTokenRes.data?.statusCode?.invoiceNumber || "";

      resetForm();
      setInvoiceNumberSequence(nextInvoiceNum);

    } catch (error) {
      toast.error(error.message || t("AddInvoice.Errors.GenericRetry"));
    } finally {
      setSaving(false);
    }
  };

  const renderInvoiceDocument = (isPreview, type) => {
    const invoiceInfo = {
      invoiceNumberSequence: invoiceNumberSequence,
      isPaid: effectivePaymentStatus === "Paid",
      paymentStatus: effectivePaymentStatus,
      paidAmount: numericPaidAmount,
      balanceAmount: balanceAmount,
      payments: numericPaidAmount > 0 ? [{
        amount: numericPaidAmount,
        paymentDate: invoiceIssueDate,
        paymentMethod: paymentMethod,
        note: paymentNote.trim()
      }] : [],
      selectedCustomer: selectedCustomer,
      // Keep the PDF template unchanged. It calculates each line as
      // quantity * rate - itemDiscountAmount, so pass the reconciled discount
      // (selling-price subtotal minus the intended discounted line amount),
      // not the configured discount input from the product form.
      itemData: itemData.map((item) => {
        const discountApplied = hasApplicableDiscount(item);
        const rowSubtotal = getItemBaseAmount(item);
        const rowAmount = calcRowAmount(item);
        const reconciledItemDiscount = money(Math.max(0, rowSubtotal - rowAmount));
        const sellingPrice = getSellingPrice(item);
        const mrp = getMRP(item);
        const discountedPrice = getDiscountedUnitPrice(item);

        return {
          ...item,
          name: item.name,
          // Supply the exact aliases consumed by existing PDF templates.
          sellingPrice,
          itemSellingPrice: sellingPrice,
          MRP: mrp,
          mrp,
          itemMRP: mrp,
          itemMrp: mrp,
          // The PDF uses itemDiscountAmount first for both the discount label
          // and line amount. Make every discount alias consistent with the
          // reconciled amount (e.g. ₹780), rather than the input value (₹1,500).
          discount: reconciledItemDiscount,
          itemDiscount: reconciledItemDiscount,
          itemDiscountAmount: reconciledItemDiscount,
          discountAmount: reconciledItemDiscount,
          discountType: "Rs.",
          discountedPrice,
          amount: rowAmount,
        };
      }),
      subtotal: money(subtotal),
      totalDiscount: money(totalDiscount),
      discountedItemsTotal: money(discountedItemsTotal),
      itemsTotal: money(discountedItemsTotal),
      taxRate: normalizedTaxRate,
      taxedAmount: money(taxedAmount),
      grandTotal: money(grandTotal),
      notes: notes,
      terms: terms,
      issueDate: invoiceIssueDate,
      dueDate: invoiceDueDate,
      isPreview: isPreview,
      companyInfo: companyInfo,
      companyLogo: companyInfo?.logo || "",
      companySignature: companyInfo?.signature || ""
    };
    if (type == "Thermal") {
      switch (companyInfo?.thermalLayout) {
        case "thermalDesign2":
          return <ThermalInvoice2 {...invoiceInfo} />;
        case 'thermalDesign1_hindi':
          return <ThermalInvoice1Hindi {...invoiceInfo} />;
        case 'thermalDesign2_hindi':
          return <ThermalInvoice2Hindi {...invoiceInfo} />;

        default:
          return <ThermalInvoice1 {...invoiceInfo} />;
      }
    }
    switch (companyInfo?.a4Layout) {
      case "invoiceDesign2":
        return <InvoiceDesign2 {...invoiceInfo} />;
      case "invoiceDesign3":
        return <InvoiceDesign3 {...invoiceInfo} />;
      case "invoiceDesign4":
        return <InvoiceDesign4 {...invoiceInfo} />;
      case 'invoiceDesign1Hindi':
        return <InvoiceDesign1Hindi {...invoiceInfo} />;
      case 'invoiceDesign2Hindi':
        return <InvoiceDesign2Hindi {...invoiceInfo} />;
      case 'invoiceDesign3Hindi':
        return <InvoiceDesign3Hindi {...invoiceInfo} />;
      case 'invoiceDesign4Hindi':
        return <InvoiceDesign4Hindi {...invoiceInfo} />;


      default:
        return <InvoiceDesign1 {...invoiceInfo} />;
    }
  };

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
      toast.error(t("AddInvoice.Errors.DownloadFailed"));
      throw err;
    }
  };

  const handlePrintPdf = async (type = "Normal") => {
    const originalTitle = document.title;
    const invoiceNumber = invoiceNumberSequence || "Invoice";

    try {
      const blob = await pdf(renderInvoiceDocument(false, type)).toBlob();
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const file = new File([blob], `${invoiceNumber}.pdf`, { type: "application/pdf" });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: invoiceNumber,
              text: `Here is ${invoiceNumber}`,
            });
            document.title = originalTitle;
            return;
          } catch (shareError) {
            if (shareError.name === 'AbortError' || shareError.message.toLowerCase().includes('cancel')) {
              console.log('User cancelled the share sheet');
              document.title = originalTitle;
              return;
            }
            throw shareError;
          }
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        toast.info(t("AddInvoice.Toast.PdfDownloadedPrint"));
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
      toast.error(t("AddInvoice.Errors.GeneratePdfFailed"));
    }
  };

  const handlePreview = async () => {
    if (isMobile) {
      const previewWindow = window.open("", "_blank");

      if (!previewWindow) {
        toast.error(t("AddInvoice.Errors.AllowPopups"));
        return;
      }

      previewWindow.document.write(
        `<div style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; color: #64748b; background-color: #f8fafc;">${t("AddInvoice.GeneratingPreview")}</div>`
      );

      try {
        const blob = await pdf(renderInvoiceDocument(true)).toBlob();
        const url = URL.createObjectURL(blob);
        previewWindow.location.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } catch (err) {
        console.error(err);
        previewWindow.close();
        toast.error(t("AddInvoice.Errors.PreviewFailed"));
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
      toast.error(error.message || t("AddInvoice.Errors.LoadInvoiceNumberFailed"));
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
        a4Layout: data.companyA4LayoutId || "invoiceDesign1",
        thermalLayout: data.companyThermalLayoutId || "thermalDesign1",
        logo: data.companyLogo || null,
        signature: data.companySignature || null,
      });
    } catch (err) {
      toast.error(err.message || t("AddInvoice.Errors.LoadCompanyDetailsFailed"));
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
    <div className="opacity-0 animate-fade-in-scale transition-all duration-500 bg-white min-h-screen text-slate-900 antialiased px-4 py-4 sm:px-6 md:px-12 md:py-6 font-sans select-none">
      <form
        onSubmit={handleFormSubmit}
        className={`space-y-7 print:hidden ${saving ? "pointer-events-none opacity-60" : ""}`}
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-7 gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FilePlus2 className="text-orange-500" size={28} /> {t("AddInvoice.PageTitle")}
            </h1>
            <p className="text-sm text-gray-500">{t("AddInvoice.PageSubtitle")}</p>
          </div>
        </div>

        {/* Section 1: Customer Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <h2 className={sectionHeadingCls}>{t("AddInvoice.ClientAllocation")}</h2>
            <FieldGroup>
              <Field className="space-y-1">
                <FieldLabel htmlFor="customer-name" className={labelCls}>
                  {t("AddInvoice.CustomerNameNumber")} <span className="text-orange-500">*</span>
                </FieldLabel>

                <Combobox
                  items={customerDropdownItems}
                  open={customerComboboxOpen}
                  onOpenChange={setCustomerComboboxOpen}
                >
                  <ComboboxInput
                    placeholder={t("AddInvoice.SearchCustomerPlaceholder")}
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
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t("AddInvoice.RecordNotFound")}</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {t("AddInvoice.AddNewCustomer", {
                                search: customerSearchValue,
                                type: isPhoneNumberSearchCurrent ? t("AddInvoice.PhoneRecord") : t("AddInvoice.Client")
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded font-semibold">
                          <span>{t("AddInvoice.Press")}</span> <kbd className="text-slate-700">Enter</kbd>
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
                                setCustomerComboboxOpen(false);
                              }}
                              className="py-3 px-4 text-sm font-medium text-slate-800 data-[selected]:bg-slate-50 flex justify-between items-center cursor-pointer"
                            >
                              <span className="font-semibold">{customer.displayName}</span>
                              <span className="text-xs text-slate-400 font-mono">{customer.workingPhone || t("AddInvoice.NoPhone")}</span>
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
                              {selectedCustomer.displayName || t("AddInvoice.NewCustomer")}
                            </h4>
                            {selectedCustomer.isInstantNew && (
                              <span className="bg-orange-50 text-orange-600 text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wide">
                                {t("AddInvoice.New")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {t("AddInvoice.CustomerProfile", { type: selectedCustomer.customerType })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                      <div className="flex-1 space-y-4">
                        <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-3">
                          <Mail size={13} className="text-slate-300" /> {t("AddInvoice.Contact")}
                        </h5>

                        <div className="space-y-3">
                          {selectedCustomer.isInstantNew ? (
                            <>
                              <Input
                                autoFocus={!selectedCustomer.displayName}
                                placeholder={t("AddInvoice.CustomerNameMandatory")}
                                value={selectedCustomer.displayName || ""}
                                onChange={(e) => setSelectedCustomer((prev) => ({ ...prev, displayName: e.target.value }))}
                                className={`bg-white ${!selectedCustomer.displayName ? 'border-orange-300 ring-2 ring-orange-500/10' : ''}`}
                              />
                              <Input
                                autoFocus={!!selectedCustomer.displayName}
                                placeholder={t("AddInvoice.PhoneMandatory")}
                                value={selectedCustomer.workingPhone || ""}
                                onChange={(e) => setSelectedCustomer((prev) => ({ ...prev, workingPhone: e.target.value }))}
                                className={`bg-white ${!selectedCustomer.workingPhone ? 'border-orange-300 ring-2 ring-orange-500/10' : ''}`}
                              />
                              <Input
                                placeholder={t("AddInvoice.EmailAddress")}
                                value={selectedCustomer.email || ""}
                                onChange={(e) => setSelectedCustomer((prev) => ({ ...prev, email: e.target.value }))}
                                className="bg-white"
                              />
                            </>
                          ) : (
                            <div className="space-y-1.5">
                              <p className="text-sm font-medium text-slate-700 font-mono flex items-center h-10 bg-slate-50 px-4 rounded-lg">
                                {selectedCustomer.workingPhone || t("AddInvoice.NoPhoneProvided")}
                              </p>
                              <p className="text-sm font-medium text-slate-700 flex items-center h-10 bg-slate-50 px-4 rounded-lg truncate">
                                {selectedCustomer.email || t("AddInvoice.NoEmailProvided")}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-[1.5] space-y-4">
                        <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-3">
                          <MapPin size={13} className="text-slate-300" /> {t("AddInvoice.BillingAddress")}
                        </h5>

                        {selectedCustomer.isInstantNew ? (
                          <div className="space-y-3">
                            <Input
                              placeholder={t("AddInvoice.StreetAddressPlaceholder")}
                              value={selectedCustomer.billingAddress?.street1 || ""}
                              onChange={(e) => setSelectedCustomer(prev => ({
                                ...prev, billingAddress: { ...prev.billingAddress, street1: e.target.value }
                              }))}
                              className="bg-white"
                            />

                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                placeholder={t("AddInvoice.City")}
                                value={selectedCustomer.billingAddress?.city || ""}
                                onChange={(e) => setSelectedCustomer(prev => ({
                                  ...prev, billingAddress: { ...prev.billingAddress, city: e.target.value }
                                }))}
                                className="bg-white"
                              />
                              <Input
                                placeholder={t("AddInvoice.State")}
                                value={selectedCustomer.billingAddress?.state || ""}
                                onChange={(e) => setSelectedCustomer(prev => ({
                                  ...prev, billingAddress: { ...prev.billingAddress, state: e.target.value }
                                }))}
                                className="bg-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                placeholder={t("AddInvoice.Pincode")}
                                value={selectedCustomer.billingAddress?.pincode || ""}
                                onChange={(e) => setSelectedCustomer(prev => ({
                                  ...prev, billingAddress: { ...prev.billingAddress, pincode: e.target.value }
                                }))}
                                className="bg-white"
                              />
                              <Input
                                placeholder={t("AddInvoice.Country")}
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
                              <p className="text-slate-400 italic text-sm text-center">{t("AddInvoice.NoBillingAddress")}</p>
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
                    <p className="text-base font-semibold text-slate-700">{t("AddInvoice.NoCustomerSelected")}</p>
                    <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      {t("AddInvoice.NoCustomerSelectedDescription")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Metadata */}
          <div className="space-y-5 lg:border-l lg:pl-10 border-slate-200">
            <h2 className={sectionHeadingCls}>{t("AddInvoice.TimelineDetails")}</h2>
            <div className="space-y-4">
              <div className="space-y-1"><label className={labelCls}>{t("AddInvoice.IssueDate")}</label><DatePickerInput onChange={setInvoiceIssueDate} value={invoiceIssueDate} /></div>
              <div className="space-y-1"><label className={labelCls}>{t("AddInvoice.DueDate")}</label><DatePickerInput onChange={setInvoiceDueDate} value={invoiceDueDate} /></div>
              <div className="space-y-1">
                <label className={labelCls}>{t("AddInvoice.InvoiceNumber")}</label>
                <Input className="w-full h-11 px-3 bg-slate-50 border-slate-200 text-sm font-mono font-bold text-slate-500 cursor-not-allowed" value={invoiceNumberSequence} readOnly />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: {t("AddInvoice.LineItems")} */}
        <div className="space-y-4">
          <h2 className={sectionHeadingCls}>{t("AddInvoice.LineItems")}</h2>
          <div className={`hidden md:block overflow-visible ${cardCls}`}>
            <Table className="w-full">
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide pl-4 py-3.5 min-w-[320px]">{t("AddInvoice.ProductItem")}</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide py-3.5 w-24">{t("AddInvoice.Quantity")}</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide py-3.5 w-28">{t("AddInvoice.MRP")}</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide py-3.5 w-32">{t("AddInvoice.UnitPrice")}</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide py-3.5 w-44">{t("AddInvoice.Discount")}</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide py-3.5 pr-4 min-w-[120px]">{t("AddInvoice.Amount")}</TableHead>
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
                            {data.image ? <img src={data.image} className="h-full w-full object-cover" alt={t("AddInvoice.ItemImageAlt")} /> : <ImageIcon size={18} className="text-slate-300" />}
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
                              <span className="font-semibold text-slate-800 truncate min-w-0 text-sm" title={data.name}>{data.name}</span>
                            ) : (
                              <span className="font-medium text-slate-400 truncate min-w-0 text-sm">{t("AddInvoice.SelectProductPlaceholder")}</span>
                            )}
                            <Search size={16} className="text-slate-400 shrink-0" />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 align-middle">
                        <div className="flex items-center justify-end">
                          <input
                            value={data.quantity ?? ""}
                            onFocus={(e) => e.target.select()}
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
                              onFocus={(e) => e.target.select()}
                              value={data.unit}
                              onChange={(e) => updateItem(index, "unit", e.target.value)}
                              placeholder={t("AddInvoice.Unit")}
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
                        <input
                          value={data.MRP ?? ""}
                          readOnly={Boolean(data._id)}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            if (data._id) return;
                            const value = e.target.value;
                            if (!isValidDecimalInput(value)) return;
                            updateItem(index, "MRP", value);
                          }}
                          onBlur={() => {
                            if (!data._id) updateItem(index, "MRP", normalizeMoney(data.MRP).toFixed(2));
                          }}
                          inputMode="decimal"
                          type="text"
                          className={`w-full h-10 px-2 text-center min-w-20 border border-slate-200 rounded-lg text-sm font-mono font-semibold outline-none ${data._id ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white text-slate-700 focus:border-orange-400"}`}
                        />
                      </TableCell>

                      <TableCell className="text-right py-3.5 align-middle">
                        <input
                          value={data.sellingPrice ?? ""}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!isValidDecimalInput(value)) return;
                            updateItem(index, "sellingPrice", value);
                            if (value !== "" && Number(value) <= 0 && Number(data.discount) > 0) {
                              updateItem(index, "discount", "0.00");
                            }
                          }}
                          onBlur={() => {
                            const value = normalizeMoney(data.sellingPrice);
                            updateItem(index, "sellingPrice", value.toFixed(2));
                          }}
                          inputMode="decimal"
                          type="text"
                          title="Selling price remains editable; discount is calculated from MRP"
                          className="w-full h-10 px-2 min-w-20 border border-slate-300 rounded-lg text-sm text-center font-mono font-medium bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-400"
                        />
                      </TableCell>

                      <TableCell className="py-3.5 align-middle">
                        <div className="flex items-center max-w-[140px] mx-auto">
                          <input
                            onFocus={(e) => e.target.select()}
                            value={data.discount ?? ""}
                            disabled={(Number(data.sellingPrice) || 0) <= 0}
                            onChange={(e) => {
                              if ((Number(data.sellingPrice) || 0) <= 0) return;
                              const value = e.target.value;
                              if (!isValidDecimalInput(value)) return;
                              if (data.discountType === "%" && value !== "" && Number(value) > 100) return;
                              updateItem(index, "discount", value);
                            }}
                            onBlur={() => {
                              if ((Number(data.sellingPrice) || 0) <= 0) {
                                updateItem(index, "discount", "0.00");
                                return;
                              }
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
                            disabled={(Number(data.sellingPrice) || 0) <= 0}
                            onValueChange={(val) => {
                              if ((Number(data.sellingPrice) || 0) > 0) updateItem(index, "discountType", val);
                            }}
                          >
                            <SelectTrigger className="w-14  rounded-l-none border border-slate-300 bg-slate-50 px-2 py-[19px] font-semibold">
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
                        <button type="button" onClick={() => setPendingDeleteIndex(index)} className="text-slate-300 hover:text-rose-600 p-2 transition-colors"><Trash2 size={16} /></button>
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
                    <button type="button" onClick={() => setPendingDeleteIndex(index)} className="text-slate-300 hover:text-rose-600 transition-colors p-1"><Trash2 size={16} /></button>
                  </div>

                  <div className="space-y-1">
                    <label className={labelCls}>{t("AddInvoice.Item")}</label>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {data.image ? <img src={data.image} className="h-full w-full object-cover" alt={t("AddInvoice.ItemImageAlt")} /> : <ImageIcon size={18} className="text-slate-300" />}
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
                          <span className="font-semibold text-slate-800 truncate min-w-0 text-sm" title={data.name}>{data.name}</span>
                        ) : (
                          <span className="font-medium text-slate-400 truncate min-w-0 text-sm">{t("AddInvoice.SelectProductPlaceholder")}</span>
                        )}
                        <Search size={16} className="text-slate-400 shrink-0" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className={labelCls}>{t("AddInvoice.Quantity")}</label>
                      <div className="flex items-center">
                        <input
                          onFocus={(e) => e.target.select()}
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
                            onFocus={(e) => e.target.select()}
                            placeholder={t("AddInvoice.Unit")}
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
                    <div className="min-w-0">
                      <label className={labelCls}>{t("AddInvoice.MRP")}</label>
                      {data._id ? (
                        <div className="flex h-11 min-w-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm font-semibold font-mono text-slate-500 tabular-nums">
                          ₹{normalizeMoney(data.MRP).toFixed(2)}
                        </div>
                      ) : (
                        <input
                          value={data.MRP ?? ""}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (isValidDecimalInput(value)) updateItem(index, "MRP", value);
                          }}
                          onBlur={() => updateItem(index, "MRP", normalizeMoney(data.MRP).toFixed(2))}
                          inputMode="decimal"
                          type="text"
                          className="w-full h-11 min-w-0 rounded-lg border border-slate-300 bg-white px-2 text-center text-sm font-semibold font-mono focus:border-orange-400 focus:outline-none"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <label className={labelCls}>{t("AddInvoice.Price")}</label>
                      <input
                        value={data.sellingPrice ?? ""}
                        onFocus={(e) => e.target.select()}
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
                        title="Selling price remains editable; discount is calculated from MRP"
                        className="w-full min-w-0 h-11 px-1.5 border border-slate-300 rounded-lg text-[13px] text-center font-semibold font-mono bg-white focus:border-orange-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>{t("AddInvoice.Discount")}</label>
                      <div className="flex min-w-0 items-center">
                        <input
                          value={data.discount ?? ""}
                          onFocus={(e) => e.target.select()}
                          disabled={(Number(data.sellingPrice) || 0) <= 0}
                          onChange={(e) => {
                            if ((Number(data.sellingPrice) || 0) <= 0) return;
                            const value = e.target.value;
                            if (!isValidDecimalInput(value)) return;
                            if (data.discountType === "%" && value !== "" && Number(value) > 100) return;
                            updateItem(index, "discount", value);
                          }}
                          onBlur={() => {
                            if ((Number(data.sellingPrice) || 0) <= 0) {
                              updateItem(index, "discount", "0.00");
                              return;
                            }
                            const value = normalizeMoney(data.discount);
                            const normalized = data.discountType === "%"
                              ? Math.min(100, Math.max(0, value))
                              : Math.max(0, value);
                            updateItem(index, "discount", normalized.toFixed(2));
                          }}
                          inputMode="decimal"
                          type="text"
                          className={`w-full min-w-0 h-11 px-1 border border-slate-300 border-r-0 rounded-l-lg text-[12px] text-center font-mono tabular-nums ${(Number(data.sellingPrice) || 0) <= 0 ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white"}`}
                        />

                        <Select
                          value={data.discountType}
                          disabled={(Number(data.sellingPrice) || 0) <= 0}
                          onValueChange={(val) => {
                            if ((Number(data.sellingPrice) || 0) > 0) updateItem(index, "discountType", val);
                          }}
                        >
                          <SelectTrigger className="w-11 min-w-11 py-[21.5px] rounded-l-none border border-slate-300 bg-slate-50 px-1 font-semibold text-xs">
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
                    <span className="text-xs text-slate-400 uppercase font-semibold">{t("AddInvoice.RowTotal")}</span>
                    <span className="text-sm font-bold font-mono text-slate-900">₹{rowAmount.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            onClick={() => {
              const newRowIndex = itemData.length;
              setItemData(prev => [
                ...prev,
                { ...initialItemData, _rowId: generateRowId() }
              ]);
              setActiveRowIndex(newRowIndex);
              setCatalogSearch("");
              dispatch(clearSearchedItems());
              setIsCatalogOpen(true);
            }}
            className="text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 font-semibold text-xs h-10 px-4 rounded-lg transition-colors shadow-sm"
            type="button"
            variant="outline"
          >
            <Plus size={14} className="mr-1.5 stroke-[2.5]" />
            {t("AddInvoice.AddNewItem")}
          </Button>
        </div>

        {/* Section 3: Notes, Terms & Balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-5 border-t border-slate-200">
          <div className="space-y-5">
            <h2 className={sectionHeadingCls}>{t("AddInvoice.NotesTerms")}</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>{t("AddInvoice.InvoiceNote")}</label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("AddInvoice.InvoiceNotePlaceholder")} className="w-full min-h-[90px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-400 font-medium placeholder-slate-400" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>{t("AddInvoice.PaymentTerms")}</label>
                <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} placeholder={t("AddInvoice.PaymentTermsPlaceholder")} className="w-full min-h-[90px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-400 font-medium placeholder-slate-400" />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <h2 className={sectionHeadingCls}>{t("AddInvoice.BalanceSummary")}</h2>
            <div className={`p-6 space-y-4 ${cardCls}`}>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-500">{t("AddInvoice.Subtotal")}</span>
                <span className="font-mono text-slate-900 font-semibold text-[15px]">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-emerald-600">{t("AddInvoice.Discount")}</span>
                <span className="font-mono text-emerald-600 font-semibold text-[15px]">₹{totalDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-500">{t("AddInvoice.DiscountedItemTotal", "Discounted Item Total")}</span>
                <span className="font-mono text-slate-900 font-semibold text-[15px]">₹{discountedItemsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
                  <span>{t("AddInvoice.TaxRate")}</span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-14 h-8 text-center border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-orange-500/15 focus:border-orange-400 focus:outline-none bg-white text-slate-900 font-semibold"
                      value={taxRate ?? ""}
                      onFocus={(e) => e.target.select()}
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
                <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">{t("AddInvoice.TotalDue")}</span>
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
                    <span className="text-sm text-slate-700">{t("AddInvoice.Unpaid")}</span>
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
                    <span className="text-sm text-slate-700">{t("AddInvoice.PartiallyPaid")}</span>
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
                    <span className="text-sm text-slate-700">{t("AddInvoice.Paid")}</span>
                  </label>
                </div>

                {/* Additional Payment Fields for Paid / Partially Paid */}
                {(paymentStatus === "Partially Paid" || paymentStatus === "Paid") && (
                  <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {paymentStatus === "Partially Paid" ? (
                        <div>
                          <label className={labelCls}>{t("AddInvoice.AmountReceived")}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">₹</span>
                            <input
                              type="text"
                              inputMode="decimal"
                              onFocus={(e) => e.target.select()}
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
                          <label className={labelCls}>{t("AddInvoice.AmountReceived")}</label>
                          <div className="h-11 px-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-700">{t("AddInvoice.FullyPaid")}</span>
                            <span className="font-mono font-bold text-emerald-700">₹{grandTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className={labelCls}>{t("AddInvoice.PaymentMethod")}</label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger className="w-full h-11 border border-slate-300 bg-white font-medium text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-slate-200">
                            <SelectItem value="Cash">{t("AddInvoice.PaymentMethods.Cash")}</SelectItem>
                            <SelectItem value="UPI">{t("AddInvoice.PaymentMethods.UPI")}</SelectItem>
                            <SelectItem value="Card">{t("AddInvoice.PaymentMethods.Card")}</SelectItem>
                            <SelectItem value="Bank Transfer">{t("AddInvoice.PaymentMethods.BankTransfer")}</SelectItem>
                            <SelectItem value="Other">{t("AddInvoice.PaymentMethods.Other")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>{t("AddInvoice.PaymentNoteOptional")}</label>
                        <Input
                          placeholder={t("AddInvoice.PaymentNotePlaceholder")}
                          value={paymentNote}
                          onChange={(e) => setPaymentNote(e.target.value)}
                          className="bg-white text-sm h-11"
                        />
                      </div>

                      <div className="flex flex-col justify-end">
                        <div className="h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500">{t("AddInvoice.DueLater")}</span>
                          <span className="font-mono font-bold text-slate-900">₹{balanceAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentStatus === "Unpaid" && grandTotal > 0 && (
                  <div className="mt-4 flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-xs font-semibold text-slate-500">{t("AddInvoice.DueLater")}</span>
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
              {t("AddInvoice.Preview")}
            </Button>

            <Button
              variant="outline"
              type="button"
              onClick={() => saveInvoice("download")}
              disabled={saving}
            >
              {t("AddInvoice.SaveDownload")}
            </Button>

            <Button
              variant="outline"
              type="button"
              onClick={() => saveInvoice("print")}
              disabled={saving}
            >
              {t("AddInvoice.SavePrint")}
            </Button>

            <Button
              variant="outline"
              type="button"
              onClick={() => saveInvoice("print", "Thermal")}
              disabled={saving}
            >
              {t("AddInvoice.SaveThermalPrint")}
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {t("AddInvoice.SaveInvoice")}
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
                <Eye size={20} className="text-orange-500" /> {t("AddInvoice.InvoicePreview")}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium leading-normal">
                {t("AddInvoice.PreviewDescription")}
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
        <DialogContent className="w-[calc(100vw-1.25rem)] !max-w-[920px] h-[82vh] max-h-[720px] flex flex-col gap-0 bg-white p-0 rounded-xl overflow-hidden border border-slate-200 shadow-xl">
          <div className="px-4 py-3 border-b border-slate-200 bg-white shrink-0 sm:px-5">
            <DialogHeader className="mb-3 space-y-0.5">
              <DialogTitle className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <span className="h-7 w-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center"><Search size={15} /></span> {t("AddInvoice.SelectProduct")}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 pl-0.5">
                {t("AddInvoice.SelectProductDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
              <Input
                autoFocus
                className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-slate-200 bg-white shadow-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-400 placeholder:text-slate-400"
                placeholder={t("AddInvoice.SearchProductPlaceholder")}
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50/60" id="catalog-scroll-container">
            {(isItemDebouncing || (itemSearchLoading && isSearchingItems)) ? (
              <div className="min-h-[280px] h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
                <Loader2 size={24} />
                <p className="text-sm font-medium text-slate-500">{t("AddInvoice.SearchingProducts", "Searching products...")}</p>
              </div>
            ) : hasNoItemSearchResults ? (
              <div className="min-h-[280px] h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
                  <Package size={22} className="text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-1">{t("AddInvoice.NoProductsFound")}</p>
                <p className="text-sm text-slate-500 mb-4 max-w-sm break-words">
                  {t("AddInvoice.NoProductMatches", { search: catalogSearch })}
                </p>
                <Button
                  type="button"
                  onClick={() => {
                    setItemData(prev => prev.map((it, i) => i === activeRowIndex ? {
                      ...it, _id: "", name: catalogSearch, unit: "", MRP: 0, sellingPrice: 0, image: null,
                    } : it));
                    setIsCatalogOpen(false);
                    setCatalogSearch("");
                  }}
                  className="h-9 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  <Plus size={15} className="mr-2" /> {t("AddInvoice.AddCustomItem", { search: catalogSearch })}
                </Button>
              </div>
            ) : (
              <>
                <InfiniteScroll
                  dataLength={itemSearchDropdownItems.length}
                  next={() => !isSearchingItems ? fetchItems(10, itemNextCursor) : searchItemPagination(10, itemsearchNextCursor)}
                  hasMore={!isSearchingItems ? !itemIsEnd : !itemsearchIsEnd}
                  scrollableTarget="catalog-scroll-container"
                  loader={<div className="py-4 flex justify-center"><Loader2 size={18} className="text-orange-500" /></div>}
                  className="flex flex-col px-0"
                >
                  {itemSearchDropdownItems.map((product) => (
                    <button
                      type="button"
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
                      className="group flex w-full flex-col gap-2.5 border-b border-slate-200/80 bg-white px-3 py-3 text-left transition-colors hover:bg-orange-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500/30 sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-2.5"
                    >
                      {/* Mobile: full product name first, details beneath. Desktop: compact single row. */}
                      <span className="order-1 block w-full whitespace-normal break-words text-sm font-semibold leading-5 text-slate-800 group-hover:text-orange-700 sm:hidden" title={product.name}>
                        {product.name}
                      </span>
                      <span className="order-2 flex w-full min-w-0 items-center gap-3 sm:contents">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white sm:h-11 sm:w-11">
                          {product.image ? (
                            <img src={product.image} className="h-full w-full object-contain p-1" alt={product.name || "Product"} />
                          ) : (
                            <ImageIcon size={20} className="text-slate-300" />
                          )}
                        </span>
                        <span className="hidden min-w-0 flex-1 sm:block">
                          <span className="block whitespace-normal break-words text-sm font-semibold leading-5 text-slate-800 group-hover:text-orange-700" title={product.name}>{product.name}</span>
                          <span className="mt-0.5 block whitespace-normal break-words text-xs text-slate-400">{product.unit ? t("AddInvoice.UnitWithValue", { unit: product.unit }) : t("AddInvoice.Product")}</span>
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col sm:hidden">
                          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="flex flex-col">
                              <span className="text-sm font-semibold tabular-nums text-slate-700">₹{Number(product.MRP || 0).toFixed(2)}</span>
                              <span className="text-[10px] leading-3 text-slate-400">{t("AddInvoice.MRP")}</span>
                            </span>
                            <span className="flex flex-col">
                              <span className="text-sm font-bold tabular-nums text-orange-600">₹{Number(product.sellingPrice || 0).toFixed(2)}</span>
                              <span className="text-[10px] leading-3 text-slate-400">{t("AddInvoice.Rate")}</span>
                            </span>
                          </span>
                          <span className="mt-1 text-xs text-slate-400">{product.unit ? t("AddInvoice.UnitWithValue", { unit: product.unit }) : t("AddInvoice.Product")}</span>
                        </span>
                        <span className="hidden w-[76px] shrink-0 flex-col items-end px-1 sm:flex sm:w-[92px]">
                          <span className="text-sm font-semibold tabular-nums text-slate-700">₹{Number(product.MRP || 0).toFixed(2)}</span>
                          <span className="mt-0.5 text-[10px] leading-3 text-slate-400">{t("AddInvoice.MRP")}</span>
                        </span>
                        <span className="hidden w-[76px] shrink-0 flex-col items-end px-1 sm:flex sm:w-[92px]">
                          <span className="text-sm font-bold tabular-nums text-orange-600">₹{Number(product.sellingPrice || 0).toFixed(2)}</span>
                          <span className="mt-0.5 text-[10px] leading-3 text-slate-400">{t("AddInvoice.Rate")}</span>
                        </span>
                        <span className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors group-hover:bg-orange-500 group-hover:text-white sm:ml-0">
                          <Plus size={16} />
                        </span>
                      </span>
                    </button>
                  ))}
                </InfiniteScroll>
              </>
            )}
          </div>
          <div className="px-4 py-2 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0 sm:px-5">
            <span className="text-xs text-slate-500">{t("AddInvoice.ItemsShown", { count: itemSearchDropdownItems.length })}</span>
            <Button type="button" variant="outline" onClick={() => setIsCatalogOpen(false)} className="h-8 rounded-lg border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50">{t("AddInvoice.Close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm item deletion — styled to match the Items page delete dialog */}
      <Dialog
        open={pendingDeleteIndex !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteIndex(null);
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-[26px] border border-slate-200 bg-white p-0 shadow-[0_25px_70px_rgba(15,23,42,0.20)] sm:rounded-[32px]">
          <div className="h-24 w-full bg-gradient-to-br from-red-100/60 via-slate-50 to-slate-100/50" />

          <div className="px-6 pb-6 pt-0 sm:px-8 sm:pb-8">
            <div className="-mt-10 mb-5 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-red-50 text-red-600 shadow-sm">
                <AlertTriangle size={32} strokeWidth={2} />
              </div>
            </div>

            <div className="text-center text-slate-950">
              <DialogTitle className="text-lg font-bold tracking-tight">{t("AddInvoice.DeleteItemTitle")}</DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed text-slate-500">
                {t("AddInvoice.DeleteItemQuestion")}{" "}
                <span className="font-semibold text-slate-900">
                  {pendingDeleteIndex !== null && itemData[pendingDeleteIndex]?.name
                    ? `“${itemData[pendingDeleteIndex].name}”`
                    : t("AddInvoice.ThisItem")}
                </span>{" "}
                {t("AddInvoice.DeleteItemDescription")}
              </DialogDescription>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingDeleteIndex(null)}
                className="h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-[0.98]"
              >
                {t("AddInvoice.Cancel")}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (pendingDeleteIndex !== null) removeItem(pendingDeleteIndex);
                  setPendingDeleteIndex(null);
                }}
                className="h-11 rounded-xl bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]"
              >
                {t("AddInvoice.ConfirmDelete")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddInvoice;