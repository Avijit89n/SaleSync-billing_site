import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowUpRight, Building2, CalendarDays, Check,
  CheckCircle2, ChevronDown, ChevronUp, Clock3, CreditCard,
  FileText, Mail, MapPin, MoreHorizontal, Phone, ReceiptText,
  Search, User, Wallet, X, Users,
  Plus,
} from "lucide-react";
import api from "@/axios/interceptor";
import { toast } from "sonner";
import Loader2 from "@/components/loaders/loader2";
import { Button } from '@/components/ui/button';

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "No data";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name) => {
  if (!name || typeof name !== "string") return "NA";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
};

const isOverdue = (invoice) => {
  if ((invoice?.balanceAmount || 0) <= 0) return false;
  return new Date(invoice?.dueDate || new Date()) < new Date("2026-09-05T23:59:59");
};

const getDisplayStatus = (invoice) => {
  if (invoice?.status === "Paid") return "Paid";
  if (isOverdue(invoice)) return "Overdue";
  if (invoice?.status === "Partially Paid") return "Partially Paid";
  if (invoice?.status === "Cancel") return "Cancelled";
  return "Unpaid";
};

function StatusBadge({ invoice }) {
  const status = getDisplayStatus(invoice);

  const config = {
    Paid: { wrapper: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
    Overdue: { wrapper: "bg-red-50 text-red-600", dot: "bg-red-500" },
    "Partially Paid": { wrapper: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
    Unpaid: { wrapper: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
    Cancelled: { wrapper: "bg-slate-100 text-slate-500", dot: "bg-slate-400" },
  };

  const item = config[status] || config.Unpaid;

  return (
    <span className={`inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${item.wrapper}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.dot}`} />
      <span>{status || "No data"}</span>
    </span>
  );
}

function StatCard({ icon: Icon, label, value, subtext, color = "slate" }) {
  const colorStyles = {
    slate: "text-slate-600 bg-slate-50",
    emerald: "text-emerald-600 bg-emerald-50",
    orange: "text-orange-600 bg-orange-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };

  return (
    <div className="group relative overflow-hidden rounded-[20px] bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] ring-1 ring-slate-900/10 transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]">
      <div className="relative z-10">
        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${colorStyles[color]}`}>
          <Icon size={20} strokeWidth={2.2} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {label || "No data"}
        </p>
        <p className="mt-1 break-all font-mono text-2xl font-black tracking-tight text-slate-900">
          {value || "0"}
        </p>
        {subtext && (
          <p className="mt-1.5 text-[11px] font-medium text-slate-500">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

function AddressBox({ title, address, icon: Icon, displayName }) {
  const hasAddress =
    address &&
    (address.street1 || address.street2 || address.city || address.state || address.country || address.pincode);

  return (
    <div className="min-w-0 rounded-[18px] bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
      <div className="mb-4 flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-slate-50 text-slate-500">
          <Icon size={17} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {title || "Address"}
          </p>
          <p className="truncate text-xs font-bold text-slate-800">
            {address?.attention || displayName || "No info available"}
          </p>
        </div>
      </div>
      <div className="min-w-0 space-y-1 break-words text-xs font-medium leading-relaxed text-slate-500">
        {hasAddress ? (
          <>
            {address.street1 && <p>{address.street1}</p>}
            {address.street2 && <p>{address.street2}</p>}
            {(address.city || address.state) && (
              <p>{[address.city, address.state].filter(Boolean).join(", ")}</p>
            )}
            {(address.country || address.pincode) && (
              <p>{[address.country, address.pincode].filter(Boolean).join(" - ")}</p>
            )}
          </>
        ) : (
          <p className="text-slate-400">No data available</p>
        )}
      </div>
    </div>
  );
}

function InvoiceRow({ invoice, expanded, onToggle, navigate}) {
  const status = getDisplayStatus(invoice);

  return (
    <div className={`group min-w-0 max-w-full overflow-hidden rounded-[20px] bg-white transition-all duration-300 ${expanded ? "shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] ring-1 ring-slate-200" : "shadow-sm ring-1 ring-slate-900/5 hover:shadow-md hover:ring-slate-200"}`}>
      <div className="relative min-w-0 cursor-pointer px-4 py-4 sm:px-5 md:px-6" onClick={onToggle}>
        {/* LARGE DESKTOP ONLY - 2XL */}
        <div className="hidden min-w-0 items-center gap-4 2xl:grid 2xl:grid-cols-[minmax(0,1.4fr)_minmax(90px,0.8fr)_minmax(100px,0.9fr)_minmax(100px,0.9fr)_150px_35px]">
          {/* Invoice */}
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] transition-colors ${expanded ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"}`}>
                <ReceiptText size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900" title={invoice?.invoiceNumber || "No Invoice #"}>
                  {invoice?.invoiceNumber || "No Invoice #"}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                  {invoice?.invoiceItems?.length || 0} item{(invoice?.invoiceItems?.length || 0) !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Date</p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
              {formatDate(invoice?.invoiceDate)}
            </p>
          </div>

          {/* Due Date */}
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Due Date</p>
            <p className={`mt-1 truncate text-xs font-semibold ${status === "Overdue" ? "text-red-500" : "text-slate-700"}`}>
              {formatDate(invoice?.dueDate)}
            </p>
          </div>

          {/* Balance */}
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Balance</p>
            <p className={`mt-1 truncate font-mono text-sm font-bold ${(invoice?.balanceAmount || 0) > 0 ? "text-slate-900" : "text-emerald-500"}`}>
              ₹{formatMoney(invoice?.balanceAmount)}
            </p>
          </div>

          {/* Total + status */}
          <div className="min-w-0">
            <div className="flex min-w-0 flex-col items-end gap-1.5">
              <p className="whitespace-nowrap font-mono text-sm font-black text-slate-900">
                ₹{formatMoney(invoice?.grandTotal)}
              </p>
              <StatusBadge invoice={invoice} />
            </div>
          </div>

          {/* Expand */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition-colors ${expanded ? "bg-slate-100 text-slate-600" : "text-slate-400 group-hover:bg-slate-50 group-hover:text-slate-600"}`}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* BELOW 2XL - COMPACT RESPONSIVE LAYOUT */}
        <div className="min-w-0 2xl:hidden">
          {/* TOP ROW */}
          <div className="flex min-w-0 items-start gap-3">
            <div className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-[12px] sm:flex ${expanded ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"}`}>
              <ReceiptText size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="min-w-0 truncate text-sm font-bold text-slate-900" title={invoice?.invoiceNumber || "No Invoice #"}>
                {invoice?.invoiceNumber || "No Invoice #"}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                {invoice?.invoiceItems?.length || 0} item{(invoice?.invoiceItems?.length || 0) !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex min-w-0 shrink-0 flex-col items-end gap-1.5">
              <p className="whitespace-nowrap font-mono text-sm font-black text-slate-900">
                ₹{formatMoney(invoice?.grandTotal)}
              </p>
              <StatusBadge invoice={invoice} />
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-slate-50 text-slate-500 sm:flex"
            >
              {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
            </button>
          </div>

          {/* SECOND ROW */}
          <div className="mt-4 grid min-w-0 grid-cols-3 gap-3 border-t border-slate-100 pt-3">
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Date</p>
              <p className="mt-1 truncate text-[11px] font-semibold text-slate-700">
                {formatDate(invoice?.invoiceDate)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Due Date</p>
              <p className={`mt-1 truncate text-[11px] font-semibold ${status === "Overdue" ? "text-red-500" : "text-slate-700"}`}>
                {formatDate(invoice?.dueDate)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Balance</p>
              <p className={`mt-1 truncate font-mono text-[11px] font-bold ${(invoice?.balanceAmount || 0) > 0 ? "text-slate-900" : "text-emerald-500"}`}>
                ₹{formatMoney(invoice?.balanceAmount)}
              </p>
            </div>
          </div>

          {/* Mobile expand */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-500 sm:hidden"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* EXPANDED INVOICE */}
      {expanded && (
        <div className="border-t border-slate-100 bg-[#f8fafc] p-4 sm:p-5 md:p-6">
          <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Invoice Breakdown</p>
              <p className="mt-1 truncate text-sm font-black text-slate-900" title={invoice?.invoiceNumber || "No Invoice #"}>
                {invoice?.invoiceNumber || "No Invoice #"}
              </p>
            </div>
              <button
                type="button"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[12px] bg-white px-4 py-2 text-[11px] font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-orange-500"
                onClick={() => {navigate(`/user/check-invoice/${invoice?._id}`)}}
              >
                View Invoice <ArrowUpRight size={14} />
              </button>
          </div>

          {/* Items */}
          <div className="min-w-0 overflow-hidden rounded-[16px] bg-white shadow-sm ring-1 ring-slate-900/5">
            <div className="hidden grid-cols-[minmax(0,1fr)_80px_110px_110px] border-b border-slate-100 bg-slate-50 px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 sm:grid">
              <span>Item</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Amount</span>
            </div>

            {(!invoice?.invoiceItems || invoice.invoiceItems.length === 0) ? (
              <div className="p-4 text-center text-xs font-medium text-slate-500">No data available</div>
            ) : (
              invoice.invoiceItems.map((item, index) => (
                <div key={`${invoice?._id}-${index}`} className="grid min-w-0 gap-2 border-b border-slate-50 px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_80px_110px_110px] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800" title={item?.itemName || "Item info missing"}>
                      {item?.itemName || "Item info missing"}
                    </p>
                    {item?.itemDescription && (
                      <p className="mt-0.5 break-words text-[10px] font-medium text-slate-400">
                        {item.itemDescription}
                      </p>
                    )}
                  </div>
                  <div className="flex min-w-0 justify-between sm:block sm:text-right">
                    <span className="text-[9px] font-bold text-slate-400 sm:hidden">Qty</span>
                    <span className="truncate text-xs font-semibold text-slate-700">
                      {item?.quantity || 0} {item?.itemUnit || ""}
                    </span>
                  </div>
                  <div className="flex min-w-0 justify-between sm:block sm:text-right">
                    <span className="text-[9px] font-bold text-slate-400 sm:hidden">Rate</span>
                    <span className="whitespace-nowrap font-mono text-xs font-medium text-slate-700">
                      ₹{formatMoney(item?.itemSellingPrice)}
                    </span>
                  </div>
                  <div className="flex min-w-0 justify-between sm:block sm:text-right">
                    <span className="text-[9px] font-bold text-slate-400 sm:hidden">Amount</span>
                    <span className="whitespace-nowrap font-mono text-xs font-black text-slate-900">
                      ₹{formatMoney((item?.quantity || 0) * (item?.itemSellingPrice || 0) - (item?.itemDiscountAmount || 0))}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment + Totals */}
          <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0 rounded-[16px] bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
              <p className="mb-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">Payment Activity</p>

              {(!invoice?.payments || invoice.payments.length === 0) ? (
                <div className="flex min-w-0 items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm ring-1 ring-slate-100">
                    <Clock3 size={15} />
                  </div>
                  <p className="min-w-0 text-xs font-medium text-slate-500">No payment recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoice.payments.map((payment, index) => (
                    <div key={index} className="flex min-w-0 items-center gap-3 rounded-[12px] bg-slate-50 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-500 shadow-sm ring-1 ring-slate-100">
                        <Check size={15} strokeWidth={3} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-800">
                          {payment?.paymentMethod || "Payment"}
                        </p>
                        <p className="text-[10px] font-medium text-slate-500">
                          {formatDate(payment?.paymentDate)}
                        </p>
                      </div>
                      <p className="shrink-0 whitespace-nowrap font-mono text-xs font-black text-emerald-600">
                        +₹{formatMoney(payment?.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="min-w-0 rounded-[16px] bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
              <div className="space-y-3">
                <div className="flex min-w-0 justify-between gap-4 text-xs font-medium text-slate-500">
                  <span>Subtotal</span>
                  <span className="shrink-0 whitespace-nowrap font-mono text-slate-700">₹{formatMoney(invoice?.subtotal)}</span>
                </div>
                <div className="flex min-w-0 justify-between gap-4 text-xs font-medium text-slate-500">
                  <span>Discount</span>
                  <span className="shrink-0 whitespace-nowrap font-mono text-orange-500">-₹{formatMoney(invoice?.discount)}</span>
                </div>
                <div className="flex min-w-0 justify-between gap-4 text-xs font-medium text-slate-500">
                  <span>Tax</span>
                  <span className="shrink-0 whitespace-nowrap font-mono text-slate-700">₹{formatMoney(invoice?.tax)}</span>
                </div>
                <div className="my-3 border-t border-slate-100" />
                <div className="flex min-w-0 justify-between gap-4">
                  <span className="text-sm font-bold text-slate-900">Grand Total</span>
                  <span className="shrink-0 whitespace-nowrap font-mono text-base font-black text-slate-900">
                    ₹{formatMoney(invoice?.grandTotal)}
                  </span>
                </div>
                <div className="flex min-w-0 justify-between gap-4 text-xs font-medium text-slate-500">
                  <span>Paid Amount</span>
                  <span className="shrink-0 whitespace-nowrap font-mono text-emerald-600">
                    ₹{formatMoney(invoice?.paidAmount)}
                  </span>
                </div>
                <div className="mt-3 rounded-[10px] bg-orange-50 px-3 py-2.5 ring-1 ring-orange-100">
                  <div className="flex min-w-0 items-center justify-between gap-3 text-xs font-bold text-orange-600">
                    <span>Balance Due</span>
                    <span className="shrink-0 whitespace-nowrap font-mono text-[15px]">
                      ₹{formatMoney(invoice?.balanceAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6 min-w-0 rounded-[20px] bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Notes</p>
            <p className="mt-2 break-words text-xs font-medium leading-relaxed text-slate-600">
              {invoice?.notes || "No data available"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerInformation() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [customer, setCustomer] = useState({});

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customer/get-customer-details/${id}`);
      console.log("Fetched customer data:", res.data);
      setCustomer(res.data?.data?.customer || {});
      setInvoices(Array.isArray(res.data?.data?.invoices) ? res.data.data.invoices : []);
    } catch (error) {
      console.error("Error fetching customer data:", error);
      toast.error("Failed to fetch customer data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const totals = useMemo(() => {
    const safeInvoices = Array.isArray(invoices) ? invoices : [];

    const totalBilled = safeInvoices.reduce((sum, invoice) => sum + Number(invoice?.grandTotal || 0), 0);
    const totalPaid = safeInvoices.reduce((sum, invoice) => sum + Number(invoice?.paidAmount || 0), 0);
    const totalDue = safeInvoices.reduce((sum, invoice) => sum + Number(invoice?.balanceAmount || 0), 0);
    const overdue = safeInvoices.reduce((sum, invoice) => sum + (isOverdue(invoice) ? Number(invoice?.balanceAmount || 0) : 0), 0);
    const paidInvoices = safeInvoices.filter((invoice) => getDisplayStatus(invoice) === "Paid").length;

    return { totalBilled, totalPaid, totalDue, overdue, paidInvoices, invoiceCount: safeInvoices.length };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const safeInvoices = Array.isArray(invoices) ? invoices : [];
    const term = search.trim().toLowerCase();

    return safeInvoices.filter((invoice) => {
      const displayStatus = getDisplayStatus(invoice);
      const invoiceNumber = invoice?.invoiceNumber?.toLowerCase() || "";
      const matchesSearch = !term || invoiceNumber.includes(term) || (invoice?.invoiceItems || []).some((item) => item?.itemName?.toLowerCase().includes(term));
      const matchesStatus = statusFilter === "All" || displayStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const paymentActivity = useMemo(() => {
    const safeInvoices = Array.isArray(invoices) ? invoices : [];

    return safeInvoices
      .flatMap((invoice) => (invoice?.payments || []).map((payment) => ({ ...payment, invoiceNumber: invoice?.invoiceNumber })))
      .sort((a, b) => new Date(b?.paymentDate || 0).getTime() - new Date(a?.paymentDate || 0).getTime());
  }, [invoices]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 />
      </div>
    );
  }

  return (
    <div className="opacity-0 animate-fade-in-scale transition-all duration-500 overflow-x-hidden bg-white px-4 py-4 font-sans text-slate-900 antialiased sm:px-6 md:px-10 md:py-6 lg:px-12">
      {/* PAGE HEADER */}
      <div className="mb-9 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
        <div className="min-w-0 space-y-2">
          <h1 className="flex min-w-0 items-center gap-2 text-2xl font-bold text-gray-900">
            <Users className="shrink-0 text-orange-500" size={28} />
            <span className="truncate">Customer Details</span>
          </h1>
          <p className="break-words text-sm text-gray-500">
            View and configure client ledger indices, communication endpoints, and billing targets.
          </p>
        </div>
        <div className="items-center gap-2 flex-wrap flex">
              <Button
                onClick={() => navigate(`/user/edit-customer/${customer?._id}`)}
                variant="outline"
                className="h-9 rounded-lg border-slate-300 bg-white px-3.5 text-xs font-bold text-slate-600 shadow-none hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
              >
                Edit Customer
              </Button>

              <Button
                onClick={() => navigate(`/user/add-invoice?customerId=${customer?._id}`)}
                variant="outline"
                className="h-9 rounded-lg border-orange-500 bg-orange-500 px-3.5 text-xs font-bold text-white hover:text-white shadow-none hover:border-orange-700 hover:bg-orange-700"
              >
                <Plus size={14}/>
                Add Invoice
              </Button>
            </div>
      </div>

      <main className="mx-auto max-w-[1500px] py-4">
        {/* CUSTOMER HEADER */}
        <section className="relative overflow-hidden rounded-[24px] shadow-sm ring-2 ring-slate-900/5">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="min-w-0 p-6 md:p-8 lg:p-10">
              <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-orange-500 to-orange-600 text-2xl font-black text-white shadow-lg shadow-orange-500/20 md:h-24 md:w-24 md:text-3xl">
                  {getInitials(customer?.displayName)}
                  <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-emerald-500 text-white">
                    <Check size={12} strokeWidth={4} />
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="mb-2.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      {customer?.customerType || "No data"}
                    </span>
                    <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-600">
                      Active
                    </span>
                  </div>
                  <h1 className="break-words text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                    {customer?.displayName || "No info available"}
                  </h1>
                  <div className="mt-3 flex min-w-0 flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Phone size={14} className="shrink-0 text-slate-400" />
                      <span className="truncate">{customer?.workingPhone ? `+91 ${customer.workingPhone}` : "No info available"}</span>
                    </span>
                    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
                      <Mail size={14} className="shrink-0 text-slate-400" />
                      <span className="min-w-0 truncate">{customer?.email || "No info available"}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="min-w-0 rounded-[16px] bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Member Since</p>
                  <p className="mt-1.5 text-sm font-bold text-slate-800">{formatDate(customer?.createdAt)}</p>
                </div>
                <div className="min-w-0 rounded-[16px] bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Invoices</p>
                  <p className="mt-1.5 text-sm font-bold text-slate-800">{totals?.invoiceCount || 0} generated</p>
                </div>
                <div className="min-w-0 rounded-[16px] bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Clearance</p>
                  <p className="mt-1.5 text-sm font-bold text-emerald-600">{totals?.paidInvoices || 0} paid</p>
                </div>
              </div>
            </div>

            {/* OUTSTANDING */}
            <div className="relative flex min-w-0 flex-col justify-between bg-slate-900 p-6 text-white md:p-8 lg:p-10">
              <div className="absolute inset-0 overflow-hidden rounded-r-[24px]">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/[0.02] blur-3xl" />
                <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-orange-500/[0.05] blur-2xl" />
              </div>

              <div className="relative z-10 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Total Outstanding</p>
                  {(totals?.totalDue || 0) === 0 && <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />}
                </div>
                <div className="mt-3 flex min-w-0 items-end gap-2">
                  <span className="break-all font-mono text-4xl font-black tracking-tight text-white md:text-5xl">
                    ₹{formatMoney(totals?.totalDue)}
                  </span>
                </div>
              </div>

              <div className="relative z-10 mt-8 grid grid-cols-2 gap-4">
                <div className="min-w-0 rounded-[16px] bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Overdue</p>
                  <p className="mt-1 truncate font-mono text-lg font-bold text-red-400">₹{formatMoney(totals?.overdue)}</p>
                </div>
                <div className="min-w-0 rounded-[16px] bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Collected</p>
                  <p className="mt-1 truncate font-mono text-lg font-bold text-emerald-400">₹{formatMoney(totals?.totalPaid)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ACCOUNT SUMMARY */}
        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Account Summary</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={ReceiptText} label="Total Billed" value={`₹${formatMoney(totals?.totalBilled)}`} subtext="Lifetime value" color="indigo" />
            <StatCard icon={Wallet} label="Total Collected" value={`₹${formatMoney(totals?.totalPaid)}`} subtext="Successfully received" color="emerald" />
            <StatCard icon={Clock3} label="Overdue Amount" value={`₹${formatMoney(totals?.overdue)}`} subtext="Requires follow-up" color="orange" />
            <StatCard icon={CheckCircle2} label="Paid Invoices" value={totals?.paidInvoices || 0} subtext={`out of ${totals?.invoiceCount || 0} total`} color="slate" />
          </div>
        </section>

        {/* MAIN CONTENT */}
        <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* INVOICES */}
          <div className="min-w-0">
            <section className="mb-4 min-w-0 rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-slate-900/5 md:p-5">
              <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-orange-50 text-orange-500">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-black text-slate-900">Invoice History</h2>
                  </div>
                </div>
                <div className="relative w-full min-w-0 md:max-w-[280px]">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search invoices..."
                    className="h-10 w-full min-w-0 rounded-[12px] bg-slate-50 pl-10 pr-4 text-xs font-medium text-slate-800 outline-none ring-1 ring-slate-200 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div className="hide-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
                {["All", "Paid", "Partially Paid", "Overdue", "Unpaid"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-bold transition-all ${statusFilter === status ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" : "bg-slate-50 text-slate-500 ring-1 ring-slate-200/50 hover:bg-slate-100 hover:text-slate-700"}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </section>

            <section className="min-w-0 space-y-4">
              {filteredInvoices.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[16px] bg-slate-50 text-slate-400 ring-1 ring-slate-100">
                    <Search size={20} />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-slate-800">No data available</h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">Adjust your filters or search term to find what you need.</p>
                </div>
              ) : (
                filteredInvoices.map((invoice) => (
                  <InvoiceRow
                    key={invoice?._id}
                    navigate={navigate}
                    invoice={invoice}
                    expanded={expandedInvoice === invoice?._id}
                    onToggle={() => setExpandedInvoice((current) => (current === invoice?._id ? null : invoice?._id))}
                  />
                ))
              )}
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="min-w-0 space-y-6 xl:sticky xl:top-6 xl:self-start">
            {/* CONTACT */}
            <section className="min-w-0 rounded-[20px] bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black text-slate-900">Contact Details</h3>
                <MoreHorizontal size={18} className="shrink-0 text-slate-300" />
              </div>
              <div className="space-y-3">
                <div className="flex min-w-0 items-center gap-3 rounded-[14px] bg-slate-50 p-3 ring-1 ring-slate-100">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-slate-500 shadow-sm ring-1 ring-slate-900/5">
                    <Phone size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Phone</p>
                    <p className="mt-0.5 truncate text-xs font-bold text-slate-700">
                      {customer?.workingPhone ? `+91 ${customer.workingPhone}` : "No info available"}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-3 rounded-[14px] bg-slate-50 p-3 ring-1 ring-slate-100">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-slate-500 shadow-sm ring-1 ring-slate-900/5">
                    <Mail size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Email</p>
                    <p className="mt-0.5 truncate text-xs font-bold text-slate-700">
                      {customer?.email || "No info available"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* LOCATIONS */}
            <section className="min-w-0">
              <h3 className="mb-3 px-1 text-sm font-black text-slate-900">Saved Locations</h3>
              <div className="space-y-3">
                <AddressBox
                  title="Billing Address"
                  address={customer?.billingAddress}
                  icon={Building2}
                  displayName={customer?.displayName}
                />
                <AddressBox
                  title="Shipping Address"
                  address={customer?.shippingAddress}
                  icon={MapPin}
                  displayName={customer?.displayName}
                />
              </div>
            </section>

            {/* RECENT PAYMENTS */}
            <section className="min-w-0 overflow-hidden rounded-[20px] bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
              <div className="mb-5 flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-500">
                  <CreditCard size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black text-slate-900">Recent Payments</h3>
                </div>
              </div>

              {paymentActivity.length === 0 ? (
                <div className="rounded-[12px] border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-xs font-medium text-slate-500">No data available.</p>
                </div>
              ) : (
                <div className="relative space-y-5 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-[2px] before:bg-slate-100">
                  {paymentActivity.slice(0, 5).map((payment, index) => (
                    <div key={index} className="relative flex min-w-0 gap-4">
                      <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white ring-[4px] ring-white">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex min-w-0 items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-800">
                              {payment?.paymentMethod || "Payment"}
                            </p>
                            <p className="mt-0.5 truncate text-[10px] font-medium text-slate-500">
                              {payment?.invoiceNumber || "No info"}
                            </p>
                          </div>
                          <p className="shrink-0 whitespace-nowrap font-mono text-xs font-black text-emerald-600">
                            +₹{formatMoney(payment?.amount)}
                          </p>
                        </div>
                        <p className="mt-1.5 text-[9px] font-bold text-slate-400">
                          {formatDate(payment?.paymentDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}