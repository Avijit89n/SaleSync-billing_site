import React, { useEffect, useRef, useState } from "react";
import {
  MoreHorizontal,
  Plus,
  Users,
  Search,
  AlertTriangle,
  Phone,
  Mail,
  Receipt,
  IndianRupee,
  X,
  Loader2 as LucideLoader,
  RefreshCw,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useNavigate } from "react-router-dom";

import {
  clearSearchedCustomers,
  customerSearchReq,
  getAllCustomerReq,
  deleteCustomerReq,
} from "@/redux/features/customerSlice";

import { useDispatch, useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "sonner";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const TableSkeletonRow = ({ index }) => {
  return (
    <TableRow className="animate-pulse border-b border-slate-100" key={`table-skeleton-${index}`}>
      <TableCell className="px-4 py-4">
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-32 rounded-md bg-slate-200" />
          <div className="h-3 w-20 rounded-md bg-slate-100" />
        </div>
      </TableCell>

      <TableCell className="px-4 py-4">
        <div className="mx-auto h-4 w-28 rounded-md bg-slate-200" />
      </TableCell>

      <TableCell className="px-4 py-4">
        <div className="mx-auto h-4 w-40 rounded-md bg-slate-200" />
      </TableCell>

      <TableCell className="px-4 py-4">
        <div className="mx-auto h-7 w-10 rounded-md bg-slate-200" />
      </TableCell>

      <TableCell className="px-4 py-4">
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-24 rounded-md bg-slate-200" />
          <div className="h-2.5 w-14 rounded-md bg-slate-100" />
        </div>
      </TableCell>

      <TableCell className="px-4 py-4">
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-24 rounded-md bg-slate-200" />
          <div className="h-2.5 w-16 rounded-md bg-slate-100" />
        </div>
      </TableCell>

      <TableCell className="px-3 py-4">
        <div className="mx-auto h-8 w-8 rounded-md bg-slate-200" />
      </TableCell>
    </TableRow>
  );
};

const MobileSkeletonCard = ({ index }) => {
  return (
    <div key={`mobile-skeleton-${index}`} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-36 rounded-md bg-slate-200" />
          <div className="h-3 w-24 rounded-md bg-slate-100" />
        </div>
        <div className="h-8 w-8 rounded-md bg-slate-100" />
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-slate-200" />
          <div className="h-4 w-28 rounded-md bg-slate-200" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-slate-200" />
          <div className="h-4 w-40 rounded-md bg-slate-100" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
        <div className="rounded-lg bg-slate-100 px-2 py-3">
          <div className="mx-auto h-2.5 w-10 rounded bg-slate-200" />
          <div className="mx-auto mt-2 h-4 w-8 rounded bg-slate-200" />
        </div>
        <div className="rounded-lg bg-slate-100 px-2 py-3">
          <div className="mx-auto h-2.5 w-10 rounded bg-slate-200" />
          <div className="mx-auto mt-2 h-4 w-12 rounded bg-slate-200" />
        </div>
        <div className="rounded-lg bg-slate-100 px-2 py-3">
          <div className="mx-auto h-2.5 w-12 rounded bg-slate-200" />
          <div className="mx-auto mt-2 h-4 w-12 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
};

const DesktopTableSkeleton = () => {
  return (
    <div className="hidden w-full overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
      <Table className="min-w-[1100px] w-full table-auto">
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead className="min-w-[240px] w-[240px] whitespace-nowrap px-4 text-center">Name</TableHead>
            <TableHead className="min-w-[150px] w-[150px] whitespace-nowrap px-4 text-center">Phone Number</TableHead>
            <TableHead className="min-w-[280px] w-[280px] whitespace-nowrap px-4 text-center">Email</TableHead>
            <TableHead className="min-w-[120px] w-[120px] whitespace-nowrap px-4 text-center">Total Bills</TableHead>
            <TableHead className="min-w-[150px] w-[150px] whitespace-nowrap px-4 text-center">Total Sales</TableHead>
            <TableHead className="min-w-[150px] w-[150px] whitespace-nowrap px-4 text-center">Pending</TableHead>
            <TableHead className="min-w-[70px] w-[70px] px-3 text-center" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: 6 }).map((_, index) => (
            <TableSkeletonRow index={index} key={index} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const MobileTableSkeleton = () => {
  return (
    <div className="space-y-3 md:hidden">
      {Array.from({ length: 4 }).map((_, index) => (
        <MobileSkeletonCard index={index} key={index} />
      ))}
    </div>
  );
};

const EmptyState = ({ isSearching, searchQuery, onAddCustomer }) => {
  if (isSearching) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-100 bg-slate-50">
          <Search size={25} className="stroke-[1.5] text-slate-300" />
        </div>
        <p className="mt-4 text-base font-semibold text-slate-700">No customers found</p>
        <p className="mt-1 max-w-sm text-sm text-slate-400">
          We couldn't find any customer matching <span className="font-medium text-slate-500">"{searchQuery}"</span>.
        </p>
        <p className="mt-3 text-xs text-slate-400">Try searching with a different name or phone number.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-orange-100 bg-orange-50">
        <Users size={29} className="stroke-[1.5] text-orange-400" />
      </div>
      <p className="mt-4 text-base font-semibold text-slate-700">No customers yet</p>
      <p className="mt-1 max-w-sm text-sm text-slate-400">
        Your customer list is empty. Add your first customer to start managing their billing information.
      </p>
      <Button onClick={onAddCustomer} className="mt-5 bg-orange-500 shadow-sm hover:bg-orange-600">
        <Plus size={17} />
        Add Customer
      </Button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Customer Actions                                                           */
/* -------------------------------------------------------------------------- */

const CustomerActions = ({ singleItem, navigate, setDialogOpen, setCustomerName }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <MoreHorizontal size={17} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate(`/user/edit-customer/${singleItem?._id}`)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => {
            setCustomerName(singleItem);
            setDialogOpen(true);
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/* -------------------------------------------------------------------------- */
/* Desktop Row                                                                */
/* -------------------------------------------------------------------------- */

const CustomTableRow = ({ singleItem, navigate, setDialogOpen, setCustomerName }) => {
  const pendingAmount = Number(singleItem?.pendingAmount || 0);

  return (
    <TableRow
      className="group cursor-pointer border-b border-slate-100 transition-all duration-200 hover:bg-orange-50/40 hover:shadow-[inset_3px_0_0_0_#f97316]"
      onClick={() => navigate(`/user/customer-information/${singleItem._id}`)}
    >
      {/* Name */}
      <TableCell className="px-4 py-4 text-center align-middle" title={singleItem.displayName}>
        <div className="flex min-w-0 w-full flex-col items-center justify-center">
          <span className="max-w-full break-words text-center font-semibold leading-5 text-slate-800 transition-colors whitespace-normal group-hover:text-orange-600">
            {singleItem.displayName}
          </span>
          {singleItem.companyName && singleItem.companyName !== singleItem.displayName && (
            <span
              className="mt-0.5 max-w-full break-words text-center text-[11px] leading-4 text-slate-400 whitespace-normal"
              title={singleItem.companyName}
            >
              {singleItem.companyName}
            </span>
          )}
        </div>
      </TableCell>

      {/* Phone */}
      <TableCell className="px-4 py-4 text-center align-middle" title={singleItem.workingPhone}>
        <span className="whitespace-nowrap font-medium text-blue-600">{singleItem.workingPhone}</span>
      </TableCell>

      {/* Email */}
      <TableCell className="px-4 py-4 text-center align-middle" title={singleItem.email || "No email"}>
        <span className="break-words text-sm leading-5 text-slate-500 whitespace-normal">
          {singleItem.email || "—"}
        </span>
      </TableCell>

      {/* Bills */}
      <TableCell className="px-4 py-4 text-center align-middle">
        <span className="inline-flex h-7 min-w-[36px] items-center justify-center rounded-md bg-orange-50 px-2 text-sm font-semibold text-orange-600">
          {singleItem?.totalBills || 0}
        </span>
      </TableCell>

      {/* Sales */}
      <TableCell className="px-4 py-4 text-center align-middle">
        <div className="flex flex-col items-center">
          <span className="whitespace-nowrap font-semibold text-slate-800">
            {formatCurrency(singleItem?.totalSales)}
          </span>
          <span className="mt-0.5 text-[10px] text-slate-400">Total billed</span>
        </div>
      </TableCell>

      {/* Pending */}
      <TableCell className="px-4 py-4 text-center align-middle">
        <div className="flex flex-col items-center">
          <span className={`whitespace-nowrap font-semibold ${pendingAmount > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {formatCurrency(pendingAmount)}
          </span>
          <span className={`mt-0.5 text-[10px] ${pendingAmount > 0 ? "text-red-400" : "text-emerald-400"}`}>
            {pendingAmount > 0 ? "Payment due" : "Fully paid"}
          </span>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell onClick={(e) => e.stopPropagation()} className="px-3 py-4 text-center align-middle">
        <CustomerActions
          singleItem={singleItem}
          navigate={navigate}
          setDialogOpen={setDialogOpen}
          setCustomerName={setCustomerName}
        />
      </TableCell>
    </TableRow>
  );
};

/* -------------------------------------------------------------------------- */
/* Mobile Card                                                                */
/* -------------------------------------------------------------------------- */

const MobileCustomerCard = ({ singleItem, navigate, setDialogOpen, setCustomerName }) => {
  const pendingAmount = Number(singleItem?.pendingAmount || 0);

  return (
    <div
      className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-orange-200 hover:shadow-md"
      onClick={() => navigate(`/user/customer-information/${singleItem._id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-[15px] font-semibold leading-5 text-slate-800 whitespace-normal">
            {singleItem.displayName}
          </h3>
          {singleItem.companyName && singleItem.companyName !== singleItem.displayName && (
            <p className="mt-1 break-words text-xs leading-4 text-slate-400 whitespace-normal">
              {singleItem.companyName}
            </p>
          )}
        </div>
        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          <CustomerActions
            singleItem={singleItem}
            navigate={navigate}
            setDialogOpen={setDialogOpen}
            setCustomerName={setCustomerName}
          />
        </div>
      </div>

      {/* Contact */}
      <div className="mt-4 grid grid-cols-1 gap-2">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Phone size={14} className="shrink-0 text-blue-500" />
          <span className="whitespace-nowrap font-medium text-blue-600">{singleItem.workingPhone}</span>
        </div>
        <div className="flex min-w-0 items-start gap-2 text-sm">
          <Mail size={14} className="mt-0.5 shrink-0 text-slate-400" />
          <span className="break-words leading-5 text-slate-500 whitespace-normal">
            {singleItem.email || "No email"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
        {/* Bills */}
        <div className="rounded-lg bg-slate-50 px-2 py-2.5 text-center">
          <div className="mb-1 flex items-center justify-center gap-1 text-slate-400">
            <Receipt size={12} />
            <span className="text-[10px]">Bills</span>
          </div>
          <p className="text-sm font-semibold text-slate-800">{singleItem?.totalBills || 0}</p>
        </div>

        {/* Sales */}
        <div className="rounded-lg bg-orange-50/70 px-2 py-2.5 text-center">
          <div className="mb-1 flex items-center justify-center gap-1 text-orange-500">
            <IndianRupee size={12} />
            <span className="text-[10px]">Sales</span>
          </div>
          <p className="truncate text-sm font-semibold text-slate-800">{formatCurrency(singleItem?.totalSales)}</p>
        </div>

        {/* Pending */}
        <div className={`rounded-lg px-2 py-2.5 text-center ${pendingAmount > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
          <div className={`mb-1 flex items-center justify-center gap-1 ${pendingAmount > 0 ? "text-red-500" : "text-emerald-500"}`}>
            <IndianRupee size={12} />
            <span className="text-[10px]">Pending</span>
          </div>
          <p className={`truncate text-sm font-semibold ${pendingAmount > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {formatCurrency(pendingAmount)}
          </p>
        </div>
      </div>
    </div>
  );
};


export default function Customer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialFetchStarted = useRef(false);

  const {
    customers,
    isEnd,
    nextCursor,
    searchedCustomers,
    customerLoading,
    searchLoading,
    deleteLoading,
    searchIsEnd,
    searchNextCursor,
  } = useSelector((state) => state.customer);


  const fetchCustomers = async (limit = 10, cursor = undefined) => {
    if (customerLoading) return;

    try {
      await dispatch(getAllCustomerReq({ limit, lastCreatedAt: cursor })).unwrap();
    } catch (error) {
      toast.error(error?.message || "Unable to load customers");
    }
  };
  

  const handleDeleting = async (e, id) => {
    e.preventDefault();

    if (!id || deleteLoading) return;

    try {
      await dispatch(deleteCustomerReq(id)).unwrap();
      toast.success("Customer deleted successfully");

      setDialogOpen(false);
      setCustomerName("");
    } catch (error) {
      toast.error(error?.message || `Failed to delete customer ${customerName?.displayName || ""}`);
    }
  };
  

  useEffect(() => {
    if (initialFetchStarted.current) return;

    initialFetchStarted.current = true;

    if (customers.length === 0) {
      fetchCustomers(10);
    }
  }, []);
  

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      dispatch(clearSearchedCustomers());
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    let requestPromise = null;

    const timer = setTimeout(() => {
      setIsDebouncing(false);

      requestPromise = dispatch(
        customerSearchReq({ search: trimmedQuery, limit: 10, cursor: null })
      );

      requestPromise.unwrap().catch((err) => {
        if (err?.name === "AbortError" || err === "Request canceled") {
          return;
        }
        toast.error(err?.message || "Unable to search customers");
      });
    }, 350);

    return () => {
      clearTimeout(timer);
      if (requestPromise) {
        requestPromise.abort();
      }
    };
  }, [searchQuery, dispatch]);
  

  const searchPagination = async (limit = 10, cursor) => {
    if (searchQuery.trim().length < 2 || searchLoading || !cursor) {
      return;
    }

    try {
      await dispatch(
        customerSearchReq({ search: searchQuery.trim(), limit, cursor })
      ).unwrap();
    } catch (error) {
      if (error?.name === "AbortError" || error === "Request canceled") {
        return;
      }
      toast.error(error?.message || "Unable to load more customers");
    }
  };

  const isSearching = searchQuery.trim().length >= 2;
  const displayedCustomers = isSearching ? searchedCustomers : customers;
  const isInitialLoading = !isSearching && customerLoading && customers.length === 0;
  const isInitialSearchLoading = isSearching && (isDebouncing || (searchLoading && searchedCustomers.length === 0));
  const isLoading = isInitialLoading || isInitialSearchLoading;
  const showEmptyState = !isLoading && !customerLoading && !searchLoading && displayedCustomers.length === 0;


  const handleClearSearch = () => {
    setSearchQuery("");
    dispatch(clearSearchedCustomers());
  };


  return (
    <div className="animate-fade-in-scale px-4 py-4 opacity-0 transition-all duration-500 sm:px-6 md:px-12 md:py-6">

      <div className="mb-7 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Users className="text-orange-500" size={28} />
            All Customers
          </h1>
          <p className="text-sm text-gray-500">
            View and configure client ledger indices, communication endpoints, and billing targets.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 py-4 sm:flex-nowrap">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by customer name / number..."
            className="w-full pl-9 pr-9 transition-all focus-visible:border-orange-300 focus-visible:ring-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
              aria-label="Clear search"
            >
              {isDebouncing || searchLoading ? (
                <LucideLoader size={16} className="animate-spin" />
              ) : (
                <X size={16} />
              )}
            </button>
          )}
        </div>

        {/* Add */}
        <Button
          onClick={() => navigate("/user/add-customer")}
          className="shrink-0 bg-orange-500 shadow-sm transition-all hover:bg-orange-600 active:scale-[0.98]"
        >
          <Plus size={18} />
          Add Customer
        </Button>
      </div>

      {isInitialLoading ? (
        <div className="mt-1">
          <DesktopTableSkeleton />
          <MobileTableSkeleton />
        </div>
      ) : (
        <InfiniteScroll
          dataLength={displayedCustomers.length}
          next={() => {
            if (isSearching) {
              searchPagination(10, searchNextCursor);
            } else {
              fetchCustomers(10, nextCursor);
            }
          }}
          hasMore={isSearchActive(searchQuery, isDebouncing, searchLoading) ? false : isSearching ? !searchIsEnd : !isEnd}
          loader={
            <div className="flex w-full items-center justify-center py-6">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <LucideLoader size={17} className="animate-spin text-orange-500" />
                <span>Loading more customers...</span>
              </div>
            </div>
          }
          endMessage={
            displayedCustomers.length > 0 ? (
              <div className="py-5 text-center">
                <span className="text-[11px] text-slate-400">You've reached the end of the customer list</span>
              </div>
            ) : null
          }
        >

          {isInitialSearchLoading ? (
            <div className="mt-1">
              <DesktopTableSkeleton />
              <MobileTableSkeleton />
            </div>
          ) : showEmptyState ? (
            <EmptyState
              isSearching={isSearching}
              searchQuery={searchQuery}
              onAddCustomer={() => navigate("/user/add-customer")}
            />
          ) : (
            /* ---------------------------------------------------------- */
            /* Data                                                       */
            /* ---------------------------------------------------------- */
            <>
              {/* Desktop */}
              <div className="hidden w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] md:block">
                <Table className="min-w-[1100px] w-full table-auto">
                  <TableHeader>
                    <TableRow className="bg-muted/60 hover:bg-muted/60">
                      <TableHead className="min-w-[240px] w-[240px] whitespace-nowrap px-4 text-center">Name</TableHead>
                      <TableHead className="min-w-[150px] w-[150px] whitespace-nowrap px-4 text-center">Phone Number</TableHead>
                      <TableHead className="min-w-[280px] w-[280px] whitespace-nowrap px-4 text-center">Email</TableHead>
                      <TableHead className="min-w-[120px] w-[120px] whitespace-nowrap px-4 text-center">Total Bills</TableHead>
                      <TableHead className="min-w-[150px] w-[150px] whitespace-nowrap px-4 text-center">Total Sales</TableHead>
                      <TableHead className="min-w-[150px] w-[150px] whitespace-nowrap px-4 text-center">Pending</TableHead>
                      <TableHead className="min-w-[70px] w-[70px] px-3 text-center" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedCustomers.map((singleItem) => (
                      <CustomTableRow
                        key={singleItem._id}
                        singleItem={singleItem}
                        navigate={navigate}
                        setDialogOpen={setDialogOpen}
                        setCustomerName={setCustomerName}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="space-y-3 md:hidden">
                {displayedCustomers.map((singleItem) => (
                  <MobileCustomerCard
                    key={singleItem._id}
                    singleItem={singleItem}
                    navigate={navigate}
                    setDialogOpen={setDialogOpen}
                    setCustomerName={setCustomerName}
                  />
                ))}
              </div>
            </>
          )}
        </InfiniteScroll>
      )}


      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!deleteLoading) {
            setDialogOpen(open);
            if (!open) {
              setCustomerName("");
            }
          }
        }}
      >
        <DialogContent className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md !-translate-x-1/2 !-translate-y-1/2 rounded-xl bg-white p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-full border border-rose-100 bg-rose-50 p-2.5 text-rose-600">
                <AlertTriangle size={20} />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold text-gray-900">
                  Delete Customer <span className="break-words">{customerName?.displayName}</span>?
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-gray-500">
                  This action will permanently delete the customer.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={deleteLoading}
              onClick={() => {
                setDialogOpen(false);
                setCustomerName("");
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteLoading}
              className="min-w-[125px] w-full bg-red-600 text-white hover:bg-red-700 sm:w-auto"
              onClick={(e) => handleDeleting(e, customerName?._id)}
            >
              {deleteLoading ? (
                <>
                  <LucideLoader size={16} className="animate-spin" /> Deleting...
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function isSearchActive(searchQuery, isDebouncing, searchLoading) {
  return searchQuery.trim().length >= 2 && (isDebouncing || searchLoading);
}