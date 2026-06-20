import React, { useEffect, useState, useCallback, useRef } from "react"
import { MoreHorizontal, Plus, Search, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"

import { clearSearchedInvoices, getAllInvoiceReq, invoiceSearchReq } from "@/redux/features/invoiceSlice.js"
import InfiniteScroll from "react-infinite-scroll-component"
import Loader2 from '@/components/loaders/loader2'
import { toast } from "sonner"

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

const formatDisplayDate = (dateValue) => {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

const CustomTableRow = React.memo(({ singleInvoice, navigate }) => {
  const getCalculatedStatus = () => {
    const status = singleInvoice.status;
    if (status === "Paid") return "Paid";

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
        return "bg-green-100 text-green-700 border-green-200";
      case "Overdue":
        return "bg-red-100 text-red-700 font-bold border-red-200";
      case "Unpaid":
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => navigate(`/home/${singleInvoice._id || singleInvoice.id}`)}
    >
      <TableCell className="text-center font-medium text-gray-600 px-4 py-3 whitespace-nowrap">
        {formatDisplayDate(singleInvoice.date)}
      </TableCell>

      <TableCell className="font-semibold text-blue-600 text-center px-4 py-3 whitespace-nowrap tracking-wide">
        {singleInvoice.invoiceNo}
      </TableCell>

      <TableCell className="text-center font-medium text-gray-800 px-4 py-3 whitespace-nowrap">
        {singleInvoice.customer}
      </TableCell>

      <TableCell className="text-center px-4 py-3 whitespace-nowrap">
        <Badge variant="outline" className={`capitalize pointer-events-none rounded px-2.5 py-0.5 text-xs font-semibold ${getBadgeStyle(computedStatus)}`}>
          {computedStatus}
        </Badge>
      </TableCell>

      <TableCell className="text-center text-gray-500 font-medium px-4 py-3 whitespace-nowrap">
        {formatDisplayDate(singleInvoice.dueDate)}
      </TableCell>

      {/* Reads array metrics safely returned by backend configuration parameters */}
      <TableCell className="text-center text-gray-600 font-medium px-4 py-3 whitespace-nowrap">
        {singleInvoice.invoiceItems?.length || 0} {singleInvoice.invoiceItems?.length === 1 ? 'Item' : 'Items'}
      </TableCell>

      <TableCell className="text-center font-semibold text-gray-900 px-4 py-3 whitespace-nowrap">
        {formatCurrency(singleInvoice.amount)}
      </TableCell>

      <TableCell onClick={(e) => e.stopPropagation()} className="text-center px-4 py-3 w-12">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-200 rounded-full">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="cursor-pointer">Edit</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Change Status</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
});

CustomTableRow.displayName = "CustomTableRow";

export default function Invoices() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("")
  const [isDebouncing, setSearchIsDebouncing] = useState(false)
  const [filter, setFilter] = useState("All")

  const activeSearchRequestRef = useRef(null);

  const {
    invoices,
    searchedInvoices,
    isEnd,
    searchLoading,
    nextCursor,
    searchIsEnd,
    searchNextCursor,
    invoiceLoading
  } = useSelector(state => state.invoice)

  const fetchInvoices = useCallback(async (limit = 10, cursor = undefined) => {
    // Prevent duplicate API calls if already loading
    if (invoiceLoading) return;

    await dispatch(getAllInvoiceReq({ limit, lastCreatedAt: cursor }))
      .unwrap()
      .catch((error) => {
        toast.error(error.message || "Something went wrong");
      });
  }, [dispatch, invoiceLoading]);

  // Change this specific useEffect block in your Invoices.jsx file
  useEffect(() => {
    // Force a fetch if the cursor is totally null AND it's not the end of the list.
    // This guarantees the first page loads even if you manually pushed 1 item into Redux.
    if (invoices.length === 0 || (!isEnd && nextCursor === null)) {
      fetchInvoices(10);
    }
  }, [invoices.length, isEnd, nextCursor, fetchInvoices]);

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
      dispatch(clearSearchedInvoices())
      setSearchIsDebouncing(false)
      return;
    }

    setSearchIsDebouncing(true)

    const timer = setTimeout(() => {
      setSearchIsDebouncing(false)

      if (activeSearchRequestRef.current) {
        activeSearchRequestRef.current.abort();
      }

      const requestPromise = dispatch(invoiceSearchReq({
        search: searchQuery.trim(),
        limit: 10,
        cursor: null
      }));

      const currentRequest = requestPromise;
      activeSearchRequestRef.current = currentRequest;

      currentRequest
        .unwrap()
        .catch((err) => {
          if (err.name === 'AbortError' || err === "Request canceled") return;
          toast.error(err.message || "Something went wrong");
        })
        .finally(() => {
          if (activeSearchRequestRef.current === currentRequest) {
            activeSearchRequestRef.current = null;
          }
        });

    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, dispatch]);

  const searchPagination = useCallback(async (limit = 10, cursor) => {
    if (searchQuery.trim().length === 0 || searchLoading) return;

    await dispatch(invoiceSearchReq({
      search: searchQuery.trim(),
      limit,
      cursor
    }))
      .unwrap()
      .catch((error) => {
        if (error.name === 'AbortError' || error === "Request canceled") return;
        toast.error(error.message || "Something went wrong");
      });
  }, [searchQuery, searchLoading, dispatch]);

  const isSearching = searchQuery.trim().length >= 1;
  const isSearchActive = isDebouncing || searchLoading;

  const showInitialLoader = isSearchActive && searchedInvoices.length === 0;

  return (
    <div className="opacity-0 animate-fade-in-scale transition-all duration-500 px-6 py-4 md:px-12 md:py-6">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-7 gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-orange-500" size={28} /> All Invoices
          </h1>
          <p className="text-sm text-gray-500">View and manage all your invoices in one place, review balances, and monitor collection statuses.</p>
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
            <SelectTrigger id="item-unit" className="h-11 w-35 bg-white text-sm font-semibold border border-slate-300 rounded-lg">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 max-h-64">
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => navigate("/user/add-invoice")} className="bg-orange-500 hover:bg-orange-600 transition-colors shadow-sm font-medium">
            <Plus size={18} className="mr-1" /> Add Invoice
          </Button>
        </div>
      </div>

      <InfiniteScroll
        dataLength={isSearching ? searchedInvoices.length : invoices.length}
        next={() => {
          if (searchLoading) return;

          if (isSearching) {
            searchPagination(10, searchNextCursor);
          } else {
            fetchInvoices(10, nextCursor);
          }
        }}
        hasMore={isSearching ? (!searchLoading && !searchIsEnd) : !isEnd}
        loader={
          <Table className="w-full border-t border-transparent">
            <TableBody>
              <TableRow>
                <TableCell colSpan={8} className="py-6 text-center">
                  <div className="flex items-center justify-center w-full">
                    <Loader2 />
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        }
      >
        <div className="rounded-md border border-gray-100 bg-white shadow-sm overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50/70 hover:bg-gray-50/70 border-b border-gray-100">
                <TableHead className="text-center font-semibold text-gray-700 px-4 py-3 whitespace-nowrap">Date Created</TableHead>
                <TableHead className="text-center font-semibold text-gray-700 px-4 py-3 whitespace-nowrap">Invoice No.</TableHead>
                <TableHead className="text-center font-semibold text-gray-700 px-4 py-3 whitespace-nowrap">Customer Name</TableHead>
                <TableHead className="text-center font-semibold text-gray-700 px-4 py-3 whitespace-nowrap">Status</TableHead>
                <TableHead className="text-center font-semibold text-gray-700 px-4 py-3 whitespace-nowrap">Due Date</TableHead>
                <TableHead className="text-center font-semibold text-gray-700 px-4 py-3 whitespace-nowrap">Total Items</TableHead>
                <TableHead className="text-center font-semibold text-gray-700 px-4 py-3 whitespace-nowrap">Bill Amount</TableHead>
                <TableHead className="text-center px-4 py-3 w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showInitialLoader ? (
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
              ) : (
                invoices.map((singleInvoice) => (
                  <CustomTableRow
                    key={singleInvoice._id || singleInvoice.id}
                    singleInvoice={singleInvoice}
                    navigate={navigate}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </InfiniteScroll>
    </div>
  )
}