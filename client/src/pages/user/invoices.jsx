import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MoreHorizontal, Plus, Search, FileText, AlertTriangle, X, Loader2 as LucideLoader, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearSearchedInvoices, clearInvoices, getAllInvoiceReq, invoiceSearchReq, cancelInvoiceReq } from "@/redux/features/invoiceSlice.js";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "sonner";
const formatCurrency = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));
const formatDisplayDate = (dateValue) => {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? dateValue : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const getCalculatedStatus = (singleInvoice) => {
  const status = singleInvoice?.status;
  if (status === "Paid") return "Paid";
  if (status === "Cancel" || status === "cancel") return "Void";
  if (singleInvoice?.dueDate) {
    const dueDate = new Date(singleInvoice.dueDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    if (currentDate > dueDate) return "Overdue";
  }
  return status || "Unpaid";
};
const getBadgeStyle = (status) => {
  switch (status) {
    case "Paid": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Partially Paid": return "bg-amber-50 text-amber-700 border-amber-200";
    case "Void": return "bg-slate-100 text-slate-600 border-slate-200";
    case "Overdue": return "bg-rose-50 text-rose-700 border-rose-200";
    default: return "bg-orange-50 text-orange-600 border-orange-200";
  }
};
const Skel = ({ c }) => <div className={`animate-pulse rounded-md bg-slate-200 ${c}`} />;
export default function Invoices() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDebouncing, setSearchIsDebouncing] = useState(false);
  const [filter, setFilter] = useState("All");
  const [invoiceToCancel, setInvoiceToCancel] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const activeSearchRequestRef = useRef(null);
  const initialFetchKeyRef = useRef(null);
  const isMountedRef = useRef(true);
  const { invoices, searchedInvoices, isEnd, searchLoading, nextCursor, searchIsEnd, searchNextCursor, invoiceLoading } = useSelector((state) => state.invoice);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);
  const fetchInvoices = useCallback(async (limit = 10, cursor = undefined) => {
    if (invoiceLoading) return false;
    try {
      await dispatch(getAllInvoiceReq({ limit, lastCreatedAt: cursor, filter })).unwrap();
      return true;
    } catch (error) {
      if (isMountedRef.current) toast.error(error?.message || t("Invoices.Errors.LoadFailed"));
      return false;
    }
  }, [dispatch, invoiceLoading, filter, t]);
  const handleOpenCancelDialog = useCallback((invoice) => {
    setInvoiceToCancel(invoice);
    setIsCancelModalOpen(true);
  }, []);
  const handleConfirmCancel = async () => {
    if (!invoiceToCancel || isCancelling) return;
    const invoiceId = invoiceToCancel._id || invoiceToCancel.id;
    if (!invoiceId) { toast.error(t("Invoices.Errors.MissingInvoiceId")); return; }
    setIsCancelling(true);
    try {
      await dispatch(cancelInvoiceReq(invoiceId)).unwrap();
      if (isMountedRef.current) {
        toast.success(t("Invoices.Toast.CancelSuccess"));
        setIsCancelModalOpen(false);
        setInvoiceToCancel(null);
      }
    } catch (error) {
      if (isMountedRef.current) toast.error(error?.message || t("Invoices.Errors.CancelFailed"));
    } finally {
      if (isMountedRef.current) setIsCancelling(false);
    }
  };
  useEffect(() => {
    dispatch(clearInvoices());
    dispatch(clearSearchedInvoices());
    initialFetchKeyRef.current = null;
    if (activeSearchRequestRef.current) { activeSearchRequestRef.current.abort(); activeSearchRequestRef.current = null; }
    setSearchQuery("");
    setSearchIsDebouncing(false);
  }, [filter, dispatch]);
  useEffect(() => {
    if (searchQuery.trim().length > 0 || invoiceLoading || invoices.length > 0 || isEnd) return;
    const fetchKey = filter || "All";
    if (initialFetchKeyRef.current === fetchKey) return;
    initialFetchKeyRef.current = fetchKey;
    fetchInvoices(10);
  }, [searchQuery, invoiceLoading, invoices.length, isEnd, filter, fetchInvoices]);
  useEffect(() => {
    return () => { if (activeSearchRequestRef.current) activeSearchRequestRef.current.abort(); };
  }, []);
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      if (activeSearchRequestRef.current) { activeSearchRequestRef.current.abort(); activeSearchRequestRef.current = null; }
      dispatch(clearSearchedInvoices());
      setSearchIsDebouncing(false);
      return;
    }
    setSearchIsDebouncing(true);
    const timer = setTimeout(() => {
      if (activeSearchRequestRef.current) activeSearchRequestRef.current.abort();
      const requestPromise = dispatch(invoiceSearchReq({ search: searchQuery.trim(), limit: 10, cursor: null, filter }));
      activeSearchRequestRef.current = requestPromise;
      setSearchIsDebouncing(false);
      requestPromise.unwrap().catch((err) => {
        if (err?.name === "AbortError" || err === "Request cancelled") return;
        if (isMountedRef.current) toast.error(err?.message || t("Invoices.Errors.SearchFailed"));
      }).finally(() => {
        if (activeSearchRequestRef.current === requestPromise) activeSearchRequestRef.current = null;
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, dispatch, filter, t]);
  const searchPagination = useCallback(async (limit = 10, cursor) => {
    if (searchQuery.trim().length === 0 || searchLoading || !cursor) return;
    try {
      await dispatch(invoiceSearchReq({ search: searchQuery.trim(), limit, cursor, filter })).unwrap();
    } catch (error) {
      if (error?.name === "AbortError" || error === "Request cancelled") return;
      if (isMountedRef.current) toast.error(error?.message || t("Invoices.Errors.LoadMoreFailed"));
    }
  }, [searchQuery, searchLoading, dispatch, filter, t]);
  const isSearching = searchQuery.trim().length >= 1;
  const isSearchActive = isDebouncing || searchLoading;
  const isInitialLoading = !isSearching && invoiceLoading && invoices.length === 0;
  const isInitialSearchLoading = isSearching && isSearchActive && searchedInvoices.length === 0;
  const displayedInvoices = isSearching ? searchedInvoices : invoices;
  const showEmptyState = !isInitialLoading && !isInitialSearchLoading && !invoiceLoading && !searchLoading && displayedInvoices.length === 0;
  const handleClearSearch = () => { setSearchQuery(""); dispatch(clearSearchedInvoices()); };
  const renderActions = (singleInvoice) => {
    const invoiceId = singleInvoice?._id || singleInvoice?.id;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-md" onClick={(e) => e.stopPropagation()}><MoreHorizontal size={17} /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem className="cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/user/check-invoice/${invoiceId}`); }}>{t("Invoices.ViewDetails")}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50" onClick={(e) => { e.stopPropagation(); handleOpenCancelDialog(singleInvoice); }}>{t("Invoices.VoidInvoice")}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  const renderEmptyState = () => {
    if (isSearching) return (
      <div className="min-h-[300px] rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center px-6">
        <div className="h-14 w-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center"><Search size={25} className="text-slate-300 stroke-[1.5]" /></div>
        <p className="text-base font-semibold text-slate-700 mt-4">{t("Invoices.Empty.SearchTitle")}</p>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">{t("Invoices.Empty.SearchDescription", { searchQuery })}</p>
        <p className="text-xs text-slate-400 mt-3">{t("Invoices.Empty.SearchHint")}</p>
      </div>
    );
    return (
      <div className="min-h-[300px] rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center px-6">
        <div className="h-16 w-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center"><FileText size={29} className="text-orange-400 stroke-[1.5]" /></div>
        <p className="text-base font-semibold text-slate-700 mt-4">{t("Invoices.Empty.FilterTitle", { filter: filter !== "All" ? t(`Invoices.Status.${filter === "Cancel" ? "Void" : filter.replace(/ /g, "")}`) : "" })}</p>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">{filter !== "All" ? t("Invoices.Empty.FilterDescription", { filter: t(`Invoices.Status.${filter === "Cancel" ? "Void" : filter.replace(/ /g, "")}`).toLowerCase() }) : t("Invoices.Empty.NoInvoices")}</p>
        <Button onClick={() => navigate("/user/add-invoice")} className="mt-5 bg-orange-500 hover:bg-orange-600 shadow-sm"><Plus size={17} className="mr-1" /> {t("Invoices.AddInvoice")}</Button>
      </div>
    );
  };
  const skeletonsRender = (
    <div className="mt-1">
      <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <Table className="min-w-[1100px] w-full table-auto">
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              <TableHead className="text-center min-w-[130px] px-4">{t("Invoices.DateCreated")}</TableHead><TableHead className="text-center min-w-[150px] px-4">{t("Invoices.InvoiceNo")}</TableHead><TableHead className="text-center min-w-[220px] px-4">{t("Invoices.Customer")}</TableHead><TableHead className="text-center min-w-[140px] px-4">{t("Invoices.StatusLabel")}</TableHead><TableHead className="text-center min-w-[140px] px-4">{t("Invoices.DueDate")}</TableHead><TableHead className="text-center min-w-[120px] px-4">{t("Invoices.Items")}</TableHead><TableHead className="text-center min-w-[170px] px-4">{t("Invoices.BillAmount")}</TableHead><TableHead className="text-center min-w-[70px] px-3" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={`inv-skel-${i}`} className="border-b border-slate-100">
                <TableCell className="py-4 px-4"><div className="flex flex-col items-center gap-2"><Skel c="h-4 w-20" /><Skel c="h-2.5 w-12 bg-slate-100" /></div></TableCell><TableCell className="py-4 px-4"><div className="flex justify-center"><Skel c="h-4 w-28" /></div></TableCell><TableCell className="py-4 px-4"><div className="flex flex-col items-center gap-2"><Skel c="h-4 w-32" /><Skel c="h-2.5 w-16 bg-slate-100" /></div></TableCell><TableCell className="py-4 px-4"><div className="flex justify-center"><Skel c="h-7 w-20 rounded-md" /></div></TableCell><TableCell className="py-4 px-4"><div className="flex justify-center"><Skel c="h-4 w-20" /></div></TableCell><TableCell className="py-4 px-4"><div className="flex justify-center"><Skel c="h-4 w-16" /></div></TableCell><TableCell className="py-4 px-4"><div className="flex flex-col items-center gap-2"><Skel c="h-4 w-24" /><Skel c="h-2.5 w-16 bg-slate-100" /></div></TableCell><TableCell className="py-4 px-3"><div className="flex justify-center"><Skel c="h-8 w-8 rounded-md" /></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="md:hidden space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`mob-inv-skel-${i}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse">
            <div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3 min-w-0 flex-1"><Skel c="h-11 w-11 rounded-lg shrink-0" /><div className="min-w-0 flex-1 space-y-2"><Skel c="h-4 w-32" /><Skel c="h-3 w-24 bg-slate-100" /></div></div><Skel c="h-8 w-8 rounded-md shrink-0" /></div>
            <div className="mt-4 pt-4 border-t border-slate-100"><div className="grid grid-cols-2 gap-2"><div className="rounded-lg bg-slate-50 px-3 py-2.5"><Skel c="h-2.5 w-12 mx-auto" /><Skel c="h-4 w-20 mx-auto mt-2" /></div><div className="rounded-lg bg-orange-50/70 px-3 py-2.5"><Skel c="h-2.5 w-14 mx-auto bg-orange-100" /><Skel c="h-4 w-20 mx-auto mt-2" /></div><div className="rounded-lg bg-slate-50 px-3 py-2.5"><Skel c="h-2.5 w-12 mx-auto" /><Skel c="h-4 w-20 mx-auto mt-2" /></div><div className="rounded-lg bg-emerald-50 px-3 py-2.5"><Skel c="h-2.5 w-12 mx-auto bg-emerald-100" /><Skel c="h-4 w-20 mx-auto mt-2" /></div></div></div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="opacity-0 animate-fade-in-scale transition-all duration-500 px-4 py-4 sm:px-6 md:px-12 md:py-6 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-7 gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileText className="text-orange-500" size={28} />{t("Invoices.Title")}</h1>
          <p className="text-sm text-gray-500">{t("Invoices.Subtitle")}</p>
        </div>
      </div>
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between py-4 gap-2">
        <div className="relative max-w-sm w-full">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input placeholder={t("Invoices.SearchPlaceholder")} className="w-full pl-9 pr-9 transition-all focus-visible:ring-orange-500 focus-visible:border-orange-300" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {searchQuery.length > 0 && (
            <button type="button" onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors" aria-label={t("Invoices.ClearSearch")}>
              {isDebouncing || searchLoading ? <LucideLoader size={16} className="animate-spin" /> : <X size={16} />}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={filter || "All"} onValueChange={setFilter}>
            <SelectTrigger id="invoice-filter" className="h-10 w-full sm:w-40 bg-white text-sm font-semibold border border-slate-300 rounded-lg focus:ring-orange-500"><SelectValue placeholder={t("Invoices.Filter")} /></SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 max-h-64">
              <SelectItem value="All">{t("Invoices.Title")}</SelectItem>
              <SelectItem value="Paid">{t("Invoices.Status.Paid")}</SelectItem>
              <SelectItem value="Partially Paid">{t("Invoices.Status.PartiallyPaid")}</SelectItem>
              <SelectItem value="Unpaid">{t("Invoices.Status.Unpaid")}</SelectItem>
              <SelectItem value="Overdue">{t("Invoices.Status.Overdue")}</SelectItem>
              <SelectItem value="Cancel">{t("Invoices.Status.Void")}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => navigate("/user/add-invoice")} className="bg-orange-500 hover:bg-orange-600 shrink-0 shadow-sm transition-all active:scale-[0.98]">
            <Plus size={18} className="mr-1 sm:mr-2" /><span className="hidden sm:inline">{t("Invoices.AddInvoice")}</span><span className="sm:hidden">{t("Invoices.AddShort")}</span>
          </Button>
        </div>
      </div>
      {isInitialLoading ? skeletonsRender : (
        <InfiniteScroll dataLength={displayedInvoices.length} next={() => { if (isSearchActive || invoiceLoading) return; if (isSearching) { if (searchedInvoices.length > 0 && searchNextCursor && !searchIsEnd) searchPagination(10, searchNextCursor); return; } if (invoices.length > 0 && nextCursor && !isEnd) fetchInvoices(10, nextCursor); }} hasMore={isSearchActive || invoiceLoading ? false : isSearching ? searchedInvoices.length > 0 && Boolean(searchNextCursor) && !searchIsEnd : invoices.length > 0 && Boolean(nextCursor) && !isEnd} loader={<div className="py-6 flex items-center justify-center w-full"><div className="flex items-center gap-2 text-sm text-slate-400"><LucideLoader size={17} className="animate-spin text-orange-500" /><span>{t("Invoices.LoadingMore")}</span></div></div>} endMessage={displayedInvoices.length > 0 ? <div className="py-5 text-center"><span className="text-[11px] text-slate-400">{t("Invoices.EndOfList")}</span></div> : null}>
          {isInitialSearchLoading ? skeletonsRender : showEmptyState ? renderEmptyState() : (
            <>
              <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <Table className="min-w-[1100px] w-full table-auto">
                  <TableHeader>
                    <TableRow className="bg-muted/60 hover:bg-muted/60">
                      <TableHead className="text-center min-w-[130px] px-4 whitespace-nowrap">{t("Invoices.DateCreated")}</TableHead><TableHead className="text-center min-w-[150px] px-4 whitespace-nowrap">{t("Invoices.InvoiceNo")}</TableHead><TableHead className="text-center min-w-[220px] px-4 whitespace-nowrap">{t("Invoices.Customer")}</TableHead><TableHead className="text-center min-w-[140px] px-4 whitespace-nowrap">{t("Invoices.StatusLabel")}</TableHead><TableHead className="text-center min-w-[140px] px-4 whitespace-nowrap">{t("Invoices.DueDate")}</TableHead><TableHead className="text-center min-w-[120px] px-4 whitespace-nowrap">{t("Invoices.Items")}</TableHead><TableHead className="text-center min-w-[170px] px-4 whitespace-nowrap">{t("Invoices.BillAmount")}</TableHead><TableHead className="text-center min-w-[70px] px-3" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedInvoices.map((singleInvoice) => {
                      const computedStatus = getCalculatedStatus(singleInvoice);
                      const remainingBalance = singleInvoice?.balanceAmount != null ? Number(singleInvoice.balanceAmount) : computedStatus === "Paid" ? 0 : Number(singleInvoice?.amount || 0);
                      const invoiceId = singleInvoice?._id || singleInvoice?.id;
                      return (
                        <TableRow key={invoiceId} className="group cursor-pointer border-b border-slate-100 transition-all duration-200 hover:bg-orange-50/40 hover:shadow-[inset_3px_0_0_0_#f97316]" onClick={() => navigate(`/user/check-invoice/${invoiceId}`)}>
                          <TableCell className="py-4 px-4 text-center align-middle"><div className="flex flex-col items-center"><span className="font-medium text-slate-700 whitespace-nowrap">{formatDisplayDate(singleInvoice?.date)}</span><span className="text-[10px] text-slate-400 mt-1">{t("Invoices.Created")}</span></div></TableCell>
                          <TableCell className="py-4 px-4 text-center align-middle"><div className="flex flex-col items-center"><span className="font-semibold text-blue-600 group-hover:text-orange-600 transition-colors font-mono tracking-wide whitespace-nowrap">{singleInvoice?.invoiceNo || t("Invoices.NotAvailable")}</span><span className="text-[10px] text-slate-400 mt-1">{t("Invoices.Invoice")}</span></div></TableCell>
                          <TableCell className="py-4 px-4 text-center align-middle" title={singleInvoice?.customer}><div className="flex flex-col items-center min-w-0"><span className="font-semibold text-slate-800 whitespace-normal break-words leading-5 text-center max-w-[220px]">{singleInvoice?.customer || t("Invoices.WalkInCustomer")}</span><span className="text-[10px] text-slate-400 mt-1">{t("Invoices.Customer")}</span></div></TableCell>
                          <TableCell className="py-4 px-4 text-center align-middle"><div className="flex flex-col items-center gap-1"><Badge variant="outline" className={`pointer-events-none rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${getBadgeStyle(computedStatus)}`}>{computedStatus}</Badge><span className="text-[10px] text-slate-400">{t("Invoices.PaymentStatus")}</span></div></TableCell>
                          <TableCell className="py-4 px-4 text-center align-middle"><div className="flex flex-col items-center"><span className="font-medium text-slate-600 whitespace-nowrap">{formatDisplayDate(singleInvoice?.dueDate)}</span><span className="text-[10px] text-slate-400 mt-1">{t("Invoices.DueDate")}</span></div></TableCell>
                          <TableCell className="py-4 px-4 text-center align-middle"><div className="flex flex-col items-center"><span className="font-semibold text-slate-700 whitespace-nowrap">{singleInvoice?.invoiceItems?.length || 0}</span><span className="text-[10px] text-slate-400 mt-1">{singleInvoice?.invoiceItems?.length === 1 ? "Item" : "Items"}</span></div></TableCell>
                          <TableCell className="py-4 px-4 text-center align-middle"><div className="flex flex-col items-center"><span className="font-bold text-slate-800 font-mono text-sm whitespace-nowrap">{formatCurrency(singleInvoice?.amount)}</span>{remainingBalance > 0 && computedStatus !== "Void" && (<span className="text-[10px] font-medium text-amber-600 font-mono mt-1 whitespace-nowrap">Due {formatCurrency(remainingBalance)}</span>)}{remainingBalance <= 0 && computedStatus === "Paid" && (<span className="text-[10px] text-emerald-500 mt-1">{t("Invoices.FullyPaid")}</span>)}</div></TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()} className="py-4 px-3 text-center align-middle"><div className="flex justify-center">{renderActions(singleInvoice)}</div></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden space-y-3">
                {displayedInvoices.map((singleInvoice) => {
                  const computedStatus = getCalculatedStatus(singleInvoice);
                  const remainingBalance = singleInvoice?.balanceAmount != null ? Number(singleInvoice.balanceAmount) : computedStatus === "Paid" ? 0 : Number(singleInvoice?.amount || 0);
                  const invoiceId = singleInvoice?._id || singleInvoice?.id;
                  return (
                    <div key={invoiceId} className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-orange-200 hover:shadow-md cursor-pointer" onClick={() => navigate(`/user/check-invoice/${invoiceId}`)}>
                      <div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3 min-w-0 flex-1"><div className="h-11 w-11 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0"><ReceiptText size={19} className="text-orange-500" /></div><div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-800 text-[15px] leading-5 break-words">{singleInvoice?.invoiceNo || t("Invoices.NotAvailable")}</h3><p className="text-[11px] text-slate-400 mt-1 break-words">{singleInvoice?.customer || t("Invoices.WalkInCustomer")}</p></div></div><div onClick={(e) => e.stopPropagation()} className="shrink-0">{renderActions(singleInvoice)}</div></div>
                      <div className="mt-3 flex items-center justify-between gap-2"><span className="text-[10px] text-slate-400">{t("Invoices.PaymentStatus")}</span><Badge variant="outline" className={`rounded-md px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap ${getBadgeStyle(computedStatus)}`}>{computedStatus}</Badge></div>
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100"><div className="rounded-lg bg-slate-50 px-3 py-2.5 text-center"><div className="text-[10px] text-slate-400 mb-1">{t("Invoices.Created")}</div><p className="text-xs font-semibold text-slate-700 whitespace-nowrap">{formatDisplayDate(singleInvoice?.date)}</p></div><div className="rounded-lg bg-orange-50/70 px-3 py-2.5 text-center"><div className="text-[10px] text-orange-500 mb-1">{t("Invoices.DueDate")}</div><p className="text-xs font-semibold text-slate-700 whitespace-nowrap">{formatDisplayDate(singleInvoice?.dueDate)}</p></div><div className="rounded-lg bg-slate-50 px-3 py-2.5 text-center"><div className="text-[10px] text-slate-400 mb-1">{t("Invoices.Items")}</div><p className="text-sm font-semibold text-slate-800">{singleInvoice?.invoiceItems?.length || 0}</p></div><div className="rounded-lg bg-emerald-50 px-3 py-2.5 text-center"><div className="text-[10px] text-emerald-500 mb-1">{t("Invoices.BillAmount")}</div><p className="text-sm font-semibold text-slate-800 whitespace-nowrap">{formatCurrency(singleInvoice?.amount)}</p></div></div>
                      {remainingBalance > 0 && computedStatus !== "Void" && (<div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 flex items-center justify-between gap-3"><span className="text-[10px] font-medium text-amber-600">{t("Invoices.RemainingBalance")}</span><span className="text-xs font-bold text-amber-700 font-mono whitespace-nowrap">{formatCurrency(remainingBalance)}</span></div>)}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </InfiniteScroll>
      )}
      <Dialog open={isCancelModalOpen} onOpenChange={(open) => { if (!isCancelling) { setIsCancelModalOpen(open); if (!open) setInvoiceToCancel(null); } }}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-[26px] border border-slate-200 bg-white p-0 shadow-[0_25px_70px_rgba(15,23,42,0.20)] sm:rounded-[32px]">
          <div className="h-24 w-full bg-gradient-to-br from-red-100/60 via-slate-50 to-slate-100/50" />
          <div className="px-6 pb-6 pt-0 sm:px-8 sm:pb-8">
            <div className="-mt-10 mb-5 flex justify-center"><div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-red-50 text-red-600 shadow-sm"><AlertTriangle size={32} strokeWidth={2} /></div></div>
            <div className="text-center text-slate-950"><h2 className="text-lg font-bold tracking-tight">{t("Invoices.CancelDialog.Title", { invoiceNo: invoiceToCancel?.invoiceNo })}</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">{t("Invoices.CancelDialog.Description")}</p></div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" disabled={isCancelling} onClick={() => { setIsCancelModalOpen(false); setInvoiceToCancel(null); }} className="h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">Cancel</Button>
              <Button type="button" variant="destructive" disabled={isCancelling} onClick={handleConfirmCancel} className="h-11 rounded-xl bg-red-600 text-white hover:bg-red-700">{isCancelling ? (<><LucideLoader size={16} className="mr-2 animate-spin" />{t("Invoices.Voiding")}</>) : (t("Invoices.ConfirmVoid"))}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}