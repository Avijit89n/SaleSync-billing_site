import React, { useEffect, useState, useCallback, useRef } from "react";
import { MoreHorizontal, Plus, Search, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  clearSearchedInvoices,
  clearInvoices,
  getAllInvoiceReq,
  invoiceSearchReq,
  cancelInvoiceReq,
} from "@/redux/features/invoiceSlice.js";
import InfiniteScroll from "react-infinite-scroll-component";
import Loader2 from "@/components/loaders/loader2";
import { toast } from "sonner";

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDisplayDate = (dateValue) => {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const CustomTableRow = React.memo(({ singleInvoice, navigate, onCancel }) => {
  const getCalculatedStatus = () => {
    const status = singleInvoice.status;
    if (status === "Paid") return "Paid";
    if (status === "Cancel" || status === "cancel") return "Void";

    if (singleInvoice.dueDate) {
      const dueDate = new Date(singleInvoice.dueDate);
      const currentDate = new Date();

      currentDate.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);

      if (currentDate > dueDate) {
        return "Overdue";
      }
    }
    return status || "Unpaid";
  };

  const computedStatus = getCalculatedStatus();

  const getBadgeStyle = (status) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Partially Paid":
        return "bg-amber-100 text-amber-700 border-amber-200 font-semibold";
      case "Void":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "Overdue":
        return "bg-rose-700 text-white font-bold border-red-700";
      case "Unpaid":
      default:
        return "bg-rose-100 text-rose-700 border-rose-200";
    }
  };

  const remainingBalance = singleInvoice.balanceAmount != null ? Number(singleInvoice.balanceAmount) : computedStatus === "Paid" ? 0 : Number(singleInvoice.amount || 0);

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => navigate(`/user/check-invoice/${singleInvoice._id || singleInvoice.id}`)}
    >
      <TableCell className="text-center font-medium text-gray-600 px-4 py-3 whitespace-nowrap">
        {formatDisplayDate(singleInvoice.date)}
      </TableCell>

      <TableCell className="font-semibold text-blue-600 text-center px-4 py-3 whitespace-nowrap tracking-wide font-mono">
        {singleInvoice.invoiceNo}
      </TableCell>

      <TableCell className="text-center font-medium text-gray-800 px-4 py-3 whitespace-nowrap">
        {singleInvoice.customer}
      </TableCell>

      <TableCell className="text-center px-4 py-3 whitespace-nowrap">
        <Badge
          variant="outline"
          className={`capitalize pointer-events-none rounded px-2.5 py-0.5 text-xs font-semibold ${getBadgeStyle(
            computedStatus
          )}`}
        >
          {computedStatus}
        </Badge>
      </TableCell>

      <TableCell className="text-center text-gray-500 font-medium px-4 py-3 whitespace-nowrap">
        {formatDisplayDate(singleInvoice.dueDate)}
      </TableCell>

      <TableCell className="text-center text-gray-600 font-medium px-4 py-3 whitespace-nowrap">
        {singleInvoice.invoiceItems?.length || 0}{" "}
        {singleInvoice.invoiceItems?.length === 1 ? "Item" : "Items"}
      </TableCell>

      <TableCell className="text-center px-4 py-3 whitespace-nowrap">
        <div className="font-bold text-gray-900 font-mono text-sm">
          {formatCurrency(singleInvoice.amount)}
        </div>
        {remainingBalance > 0 && computedStatus !== "Void" && (
          <div className="text-[11px] font-medium text-amber-600 font-mono mt-0.5">
            Due: {formatCurrency(remainingBalance)}
          </div>
        )}
      </TableCell>

      <TableCell onClick={(e) => e.stopPropagation()} className="text-center px-4 py-3 w-12">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-200 rounded-full">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate(`/home/${singleInvoice._id || singleInvoice.id}`)}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onCancel(singleInvoice._id || singleInvoice.id);
              }}
            >
              Void Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

CustomTableRow.displayName = "CustomTableRow";

export default function Invoices() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDebouncing, setSearchIsDebouncing] = useState(false);
  const [filter, setFilter] = useState("All");

  const activeSearchRequestRef = useRef(null);
  const initialFetchKeyRef = useRef(null);

  const {
    invoices,
    searchedInvoices,
    isEnd,
    searchLoading,
    nextCursor,
    searchIsEnd,
    searchNextCursor,
    invoiceLoading,
  } = useSelector((state) => state.invoice);

  const fetchInvoices = useCallback(
    async (limit = 10, cursor = undefined) => {
      if (invoiceLoading) return false;

      try {
        await dispatch(
          getAllInvoiceReq({
            limit,
            lastCreatedAt: cursor,
            filter,
          })
        ).unwrap();

        return true;
      } catch (error) {
        toast.error(error?.message || "Something went wrong");
        return false;
      }
    },
    [dispatch, invoiceLoading, filter]
  );

  const handleCancelInvoice = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to cancel this invoice? Items will be restocked."))
      return;

    try {
      await dispatch(cancelInvoiceReq(invoiceId)).unwrap();
      toast.success("Invoice cancelled successfully");
    } catch (error) {
      toast.error(error.message || "Failed to cancel invoice");
    }
  };

  useEffect(() => {
    dispatch(clearInvoices());
    dispatch(clearSearchedInvoices());

    initialFetchKeyRef.current = null;

    if (activeSearchRequestRef.current) {
      activeSearchRequestRef.current.abort();
      activeSearchRequestRef.current = null;
    }

    setSearchQuery("");
    setSearchIsDebouncing(false);
  }, [filter, dispatch]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) return;
    if (invoiceLoading) return;
    if (invoices.length > 0) return;
    if (isEnd) return;

    const fetchKey = filter || "All";

    // React StrictMode and state updates can run this effect more than once.
    if (initialFetchKeyRef.current === fetchKey) return;

    initialFetchKeyRef.current = fetchKey;
    fetchInvoices(10);
  }, [
    searchQuery,
    invoiceLoading,
    invoices.length,
    isEnd,
    filter,
    fetchInvoices,
  ]);

  useEffect(() => {
    return () => {
      if (activeSearchRequestRef.current) {
        activeSearchRequestRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      if (activeSearchRequestRef.current) {
        activeSearchRequestRef.current.abort();
        activeSearchRequestRef.current = null;
      }
      dispatch(clearSearchedInvoices());
      setSearchIsDebouncing(false);
      return;
    }

    setSearchIsDebouncing(true);

    const timer = setTimeout(() => {
      if (activeSearchRequestRef.current) {
        activeSearchRequestRef.current.abort();
      }

      const requestPromise = dispatch(
        invoiceSearchReq({
          search: searchQuery.trim(),
          limit: 10,
          cursor: null,
          filter,
        })
      );

      activeSearchRequestRef.current = requestPromise;

      setSearchIsDebouncing(false);

      requestPromise
        .unwrap()
        .catch((err) => {
          if (err.name === "AbortError" || err === "Request cancelled") return;
          toast.error(err.message || "Something went wrong");
        })
        .finally(() => {
          if (activeSearchRequestRef.current === requestPromise) {
            activeSearchRequestRef.current = null;
          }
        });
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, dispatch, filter]);

  const searchPagination = useCallback(
    async (limit = 10, cursor) => {
      if (searchQuery.trim().length === 0) return;
      if (searchLoading) return;
      if (!cursor) return;

      try {
        await dispatch(
          invoiceSearchReq({
            search: searchQuery.trim(),
            limit,
            cursor,
            filter,
          })
        ).unwrap();
      } catch (error) {
        if (
          error?.name === "AbortError" ||
          error === "Request cancelled"
        ) {
          return;
        }

        toast.error(
          error?.message || "Something went wrong"
        );
      }
    },
    [searchQuery, searchLoading, dispatch, filter]
  );

  const isSearching = searchQuery.trim().length >= 1;
  const isSearchActive = isDebouncing || searchLoading;

  const showLoader =
    (isSearching && isSearchActive && searchedInvoices.length === 0) ||
    (!isSearching && invoiceLoading && invoices.length === 0);

  return (
    <div className="opacity-0 animate-fade-in-scale transition-all duration-500 px-4 py-4 sm:px-6 md:px-12 md:py-6 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-7 gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-orange-500" size={28} /> All Invoices
          </h1>
          <p className="text-sm text-gray-500">
            View and manage all your invoices in one place, review balances, and monitor collection statuses.
          </p>
        </div>
      </div>

      <div className="flex items-center py-4 justify-between flex-wrap sm:flex-nowrap gap-2">
        <div className="relative max-w-sm w-full">
          <Input
            placeholder="Search by customer name or invoice number..."
            className="w-full pl-9 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
        <div className="flex justify-center items-center gap-2">
          <Select value={filter || "All"} onValueChange={(value) => setFilter(value)}>
            <SelectTrigger id="invoice-filter" className="h-11 w-40 bg-white text-sm font-semibold border border-slate-300 rounded-lg">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 max-h-64">
              <SelectItem value="All">All Invoices</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Partially Paid">Partially Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Cancel">Void</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => navigate("/user/add-invoice")}
            className="bg-orange-500 hover:bg-orange-600 transition-colors shadow-sm font-medium"
          >
            <Plus size={18} className="mr-1" /> Add Invoice
          </Button>
        </div>
      </div>

      <InfiniteScroll
        dataLength={isSearching ? searchedInvoices.length : invoices.length}
        next={() => {
          if (isSearchActive || invoiceLoading) return;

          if (isSearching) {
            if (
              searchedInvoices.length > 0 &&
              searchNextCursor &&
              !searchIsEnd
            ) {
              searchPagination(10, searchNextCursor);
            }

            return;
          }

          if (
            invoices.length > 0 &&
            nextCursor &&
            !isEnd
          ) {
            fetchInvoices(10, nextCursor);
          }
        }}
        hasMore={
          isSearchActive || invoiceLoading
            ? false
            : isSearching
              ? searchedInvoices.length > 0 &&
                Boolean(searchNextCursor) &&
                !searchIsEnd
              : invoices.length > 0 &&
                Boolean(nextCursor) &&
                !isEnd
        }
        loader={
          <div className="py-6 flex items-center justify-center w-full">
            <Loader2 />
          </div>
        }
      >
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.035)] overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200/70">
                <TableHead className="text-center font-semibold text-gray-700 px-4 py-3 whitespace-nowrap">
                  Date Created
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 px-4 py-3 whitespace-nowrap">
                  Invoice No.
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 px-4 py-3 whitespace-nowrap">
                  Customer Name
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 px-4 py-3 whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 px-4 py-3 whitespace-nowrap">
                  Due Date
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 px-4 py-3 whitespace-nowrap">
                  Total Items
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 px-4 py-3 whitespace-nowrap">
                  Bill Amount
                </TableHead>
                <TableHead className="text-center px-4 py-3 w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showLoader ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <div className="flex items-center justify-center w-full h-full">
                      <Loader2 />
                    </div>
                  </TableCell>
                </TableRow>
              ) : isSearching ? (
                searchedInvoices.length > 0 ? (
                  searchedInvoices.map((singleInvoice) => (
                    <CustomTableRow
                      key={singleInvoice._id || singleInvoice.id}
                      singleInvoice={singleInvoice}
                      navigate={navigate}
                      onCancel={handleCancelInvoice}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-56 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 text-gray-400">
                        <Search size={40} className="text-gray-300 stroke-[1.5]" />
                        <p className="text-base font-semibold text-gray-700">No invoices found</p>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto">
                          We couldn't find anything matching "{searchQuery}". Try checking for typos or searching a different field.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              ) : invoices.length > 0 ? (
                invoices.map((singleInvoice) => (
                  <CustomTableRow
                    key={singleInvoice._id || singleInvoice.id}
                    singleInvoice={singleInvoice}
                    navigate={navigate}
                    onCancel={handleCancelInvoice}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-56 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-gray-400">
                      <FileText size={40} className="text-gray-300 stroke-[1.5]" />
                      <p className="text-base font-semibold text-gray-700">
                        No {filter !== "All" ? filter : ""} invoices found
                      </p>
                      <p className="text-xs text-gray-400 max-w-xs mx-auto">
                        There are currently no records matching this criteria.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </InfiniteScroll>
    </div>
  );
}