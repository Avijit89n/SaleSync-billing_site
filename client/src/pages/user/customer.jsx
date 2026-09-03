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
import Loader2 from "@/components/loaders/loader2";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

/* -------------------------------------------------------------------------- */
/* Skeletons                                                                  */
/* -------------------------------------------------------------------------- */

const TableSkeletonRow = ({ index }) => {
  return (
    <TableRow
      className="border-b border-slate-100 animate-pulse"
      key={`table-skeleton-${index}`}
    >
      <TableCell className="py-4 px-4">
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-32 rounded-md bg-slate-200" />
          <div className="h-3 w-20 rounded-md bg-slate-100" />
        </div>
      </TableCell>

      <TableCell className="py-4 px-4">
        <div className="mx-auto h-4 w-28 rounded-md bg-slate-200" />
      </TableCell>

      <TableCell className="py-4 px-4">
        <div className="mx-auto h-4 w-40 rounded-md bg-slate-200" />
      </TableCell>

      <TableCell className="py-4 px-4">
        <div className="mx-auto h-7 w-10 rounded-md bg-slate-200" />
      </TableCell>

      <TableCell className="py-4 px-4">
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-24 rounded-md bg-slate-200" />
          <div className="h-2.5 w-14 rounded-md bg-slate-100" />
        </div>
      </TableCell>

      <TableCell className="py-4 px-4">
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-24 rounded-md bg-slate-200" />
          <div className="h-2.5 w-16 rounded-md bg-slate-100" />
        </div>
      </TableCell>

      <TableCell className="py-4 px-3">
        <div className="mx-auto h-8 w-8 rounded-md bg-slate-200" />
      </TableCell>
    </TableRow>
  );
};

const MobileSkeletonCard = ({ index }) => {
  return (
    <div
      key={`mobile-skeleton-${index}`}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse"
    >
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

      <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100">
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
    <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <Table className="min-w-[1100px] w-full table-auto">
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead className="text-center min-w-[240px] w-[240px] px-4 whitespace-nowrap">
              Name
            </TableHead>

            <TableHead className="text-center min-w-[150px] w-[150px] px-4 whitespace-nowrap">
              Phone Number
            </TableHead>

            <TableHead className="text-center min-w-[280px] w-[280px] px-4 whitespace-nowrap">
              Email
            </TableHead>

            <TableHead className="text-center min-w-[120px] w-[120px] px-4 whitespace-nowrap">
              Total Bills
            </TableHead>

            <TableHead className="text-center min-w-[150px] w-[150px] px-4 whitespace-nowrap">
              Total Sales
            </TableHead>

            <TableHead className="text-center min-w-[150px] w-[150px] px-4 whitespace-nowrap">
              Pending
            </TableHead>

            <TableHead className="text-center min-w-[70px] w-[70px] px-3" />
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
    <div className="md:hidden space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <MobileSkeletonCard index={index} key={index} />
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

const EmptyState = ({ isSearching, searchQuery, onAddCustomer }) => {
  if (isSearching) {
    return (
      <div className="min-h-[300px] rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center px-6">
        <div className="h-14 w-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
          <Search
            size={25}
            className="text-slate-300 stroke-[1.5]"
          />
        </div>

        <p className="text-base font-semibold text-slate-700 mt-4">
          No customers found
        </p>

        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          We couldn't find any customer matching{" "}
          <span className="font-medium text-slate-500">
            "{searchQuery}"
          </span>
          .
        </p>

        <p className="text-xs text-slate-400 mt-3">
          Try searching with a different name or phone number.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[300px] rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center px-6">
      <div className="h-16 w-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
        <Users
          size={29}
          className="text-orange-400 stroke-[1.5]"
        />
      </div>

      <p className="text-base font-semibold text-slate-700 mt-4">
        No customers yet
      </p>

      <p className="text-sm text-slate-400 mt-1 max-w-sm">
        Your customer list is empty. Add your first customer to start
        managing their billing information.
      </p>

      <Button
        onClick={onAddCustomer}
        className="mt-5 bg-orange-500 hover:bg-orange-600 shadow-sm"
      >
        <Plus size={17} />
        Add Customer
      </Button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Customer Actions                                                           */
/* -------------------------------------------------------------------------- */

const CustomerActions = ({
  singleItem,
  navigate,
  setDialogOpen,
  setCustomerName,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="
            h-8 w-8 p-0
            text-slate-400
            hover:text-slate-700
            hover:bg-slate-100
            transition-colors
          "
        >
          <MoreHorizontal size={17} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() =>
            navigate(`/user/edit-customer/${singleItem?._id}`)
          }
        >
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

const CustomTableRow = ({
  singleItem,
  navigate,
  setDialogOpen,
  setCustomerName,
}) => {
  const pendingAmount = Number(singleItem?.pendingAmount || 0);

  return (
    <TableRow
      className="
        group
        cursor-pointer
        border-b border-slate-100
        transition-all duration-200
        hover:bg-orange-50/40
        hover:shadow-[inset_3px_0_0_0_#f97316]
      "
      onClick={() => {
        navigate(`/user/edit-customer/${singleItem._id}`);
      }}
    >
      {/* Name */}
      <TableCell
        className="py-4 px-4 text-center align-middle"
        title={singleItem.displayName}
      >
        <div className="flex flex-col items-center justify-center min-w-0 w-full">
          <span
            className="
              font-semibold
              text-slate-800
              group-hover:text-orange-600
              transition-colors
              whitespace-normal
              break-words
              leading-5
              text-center
              max-w-full
            "
          >
            {singleItem.displayName}
          </span>

          {singleItem.companyName &&
            singleItem.companyName !== singleItem.displayName && (
              <span
                className="
                  text-[11px]
                  text-slate-400
                  mt-0.5
                  whitespace-normal
                  break-words
                  leading-4
                  text-center
                  max-w-full
                "
                title={singleItem.companyName}
              >
                {singleItem.companyName}
              </span>
            )}
        </div>
      </TableCell>

      {/* Phone */}
      <TableCell
        className="py-4 px-4 text-center align-middle"
        title={singleItem.workingPhone}
      >
        <span className="font-medium text-blue-600 whitespace-nowrap">
          {singleItem.workingPhone}
        </span>
      </TableCell>

      {/* Email */}
      <TableCell
        className="py-4 px-4 text-center align-middle"
        title={singleItem.email || "No email"}
      >
        <span className="text-sm text-slate-500 whitespace-normal break-words leading-5">
          {singleItem.email || "—"}
        </span>
      </TableCell>

      {/* Bills */}
      <TableCell className="py-4 px-4 text-center align-middle">
        <span
          className="
            inline-flex
            items-center
            justify-center
            min-w-[36px]
            h-7
            px-2
            rounded-md
            bg-orange-50
            text-orange-600
            text-sm
            font-semibold
          "
        >
          {singleItem?.totalBills || 0}
        </span>
      </TableCell>

      {/* Sales */}
      <TableCell className="py-4 px-4 text-center align-middle">
        <div className="flex flex-col items-center">
          <span className="font-semibold text-slate-800 whitespace-nowrap">
            {formatCurrency(singleItem?.totalSales)}
          </span>

          <span className="text-[10px] text-slate-400 mt-0.5">
            Total billed
          </span>
        </div>
      </TableCell>

      {/* Pending */}
      <TableCell className="py-4 px-4 text-center align-middle">
        <div className="flex flex-col items-center">
          <span
            className={`font-semibold whitespace-nowrap ${
              pendingAmount > 0
                ? "text-red-600"
                : "text-emerald-600"
            }`}
          >
            {formatCurrency(pendingAmount)}
          </span>

          <span
            className={`text-[10px] mt-0.5 ${
              pendingAmount > 0
                ? "text-red-400"
                : "text-emerald-400"
            }`}
          >
            {pendingAmount > 0 ? "Payment due" : "Fully paid"}
          </span>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell
        onClick={(e) => e.stopPropagation()}
        className="py-4 px-3 text-center align-middle"
      >
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

const MobileCustomerCard = ({
  singleItem,
  navigate,
  setDialogOpen,
  setCustomerName,
}) => {
  const pendingAmount = Number(singleItem?.pendingAmount || 0);

  return (
    <div
      className="
        group
        rounded-xl
        border border-slate-200
        bg-white
        p-4
        shadow-sm
        transition-all duration-200
        hover:border-orange-200
        hover:shadow-md
        cursor-pointer
      "
      onClick={() => {
        navigate(`/user/edit-customer/${singleItem._id}`);
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3
            className="
              font-semibold
              text-slate-800
              text-[15px]
              leading-5
              whitespace-normal
              break-words
            "
          >
            {singleItem.displayName}
          </h3>

          {singleItem.companyName &&
            singleItem.companyName !== singleItem.displayName && (
              <p
                className="
                  text-xs
                  text-slate-400
                  mt-1
                  whitespace-normal
                  break-words
                  leading-4
                "
              >
                {singleItem.companyName}
              </p>
            )}
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
        >
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
        <div className="flex items-center gap-2 text-sm min-w-0">
          <Phone
            size={14}
            className="text-blue-500 shrink-0"
          />

          <span className="text-blue-600 font-medium whitespace-nowrap">
            {singleItem.workingPhone}
          </span>
        </div>

        <div className="flex items-start gap-2 text-sm min-w-0">
          <Mail
            size={14}
            className="text-slate-400 shrink-0 mt-0.5"
          />

          <span className="text-slate-500 whitespace-normal break-words leading-5">
            {singleItem.email || "No email"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
        {/* Bills */}
        <div className="rounded-lg bg-slate-50 px-2 py-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
            <Receipt size={12} />

            <span className="text-[10px]">
              Bills
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-800">
            {singleItem?.totalBills || 0}
          </p>
        </div>

        {/* Sales */}
        <div className="rounded-lg bg-orange-50/70 px-2 py-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
            <IndianRupee size={12} />

            <span className="text-[10px]">
              Sales
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-800 truncate">
            {formatCurrency(singleItem?.totalSales)}
          </p>
        </div>

        {/* Pending */}
        <div
          className={`rounded-lg px-2 py-2.5 text-center ${
            pendingAmount > 0
              ? "bg-red-50"
              : "bg-emerald-50"
          }`}
        >
          <div
            className={`flex items-center justify-center gap-1 mb-1 ${
              pendingAmount > 0
                ? "text-red-500"
                : "text-emerald-500"
            }`}
          >
            <IndianRupee size={12} />

            <span className="text-[10px]">
              Pending
            </span>
          </div>

          <p
            className={`text-sm font-semibold truncate ${
              pendingAmount > 0
                ? "text-red-600"
                : "text-emerald-600"
            }`}
          >
            {formatCurrency(pendingAmount)}
          </p>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Fetch Customers                                                        */
  /* ---------------------------------------------------------------------- */

  const fetchCustomers = async (
    limit = 10,
    cursor = undefined
  ) => {
    if (customerLoading) return;

    try {
      await dispatch(
        getAllCustomerReq({
          limit,
          lastCreatedAt: cursor,
        })
      ).unwrap();
    } catch (error) {
      toast.error(
        error?.message || "Unable to load customers"
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Delete Customer                                                        */
  /* ---------------------------------------------------------------------- */

  const handleDeleting = async (e, id) => {
    e.preventDefault();

    if (!id || deleteLoading) return;

    try {
      await dispatch(deleteCustomerReq(id)).unwrap();

      toast.success("Customer deleted successfully");

      setDialogOpen(false);
      setCustomerName("");
    } catch (error) {
      toast.error(
        error?.message ||
          `Failed to delete customer ${
            customerName?.displayName || ""
          }`
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Initial Fetch                                                          */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (initialFetchStarted.current) return;

    initialFetchStarted.current = true;

    if (customers.length === 0) {
      fetchCustomers(10);
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Search                                                                  */
  /* ---------------------------------------------------------------------- */

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
        customerSearchReq({
          search: trimmedQuery,
          limit: 10,
          cursor: null,
        })
      );

      requestPromise.unwrap().catch((err) => {
        if (
          err?.name === "AbortError" ||
          err === "Request canceled"
        ) {
          return;
        }

        toast.error(
          err?.message || "Unable to search customers"
        );
      });
    }, 350);

    return () => {
      clearTimeout(timer);

      if (requestPromise) {
        requestPromise.abort();
      }
    };
  }, [searchQuery, dispatch]);

  /* ---------------------------------------------------------------------- */
  /* Search Pagination                                                      */
  /* ---------------------------------------------------------------------- */

  const searchPagination = async (
    limit = 10,
    cursor
  ) => {
    if (
      searchQuery.trim().length < 2 ||
      searchLoading ||
      !cursor
    ) {
      return;
    }

    try {
      await dispatch(
        customerSearchReq({
          search: searchQuery.trim(),
          limit,
          cursor,
        })
      ).unwrap();
    } catch (error) {
      if (
        error?.name === "AbortError" ||
        error === "Request canceled"
      ) {
        return;
      }

      toast.error(
        error?.message || "Unable to load more customers"
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Derived State                                                          */
  /* ---------------------------------------------------------------------- */

  const isSearching = searchQuery.trim().length >= 2;

  const displayedCustomers = isSearching
    ? searchedCustomers
    : customers;

  const isInitialLoading =
    !isSearching &&
    customerLoading &&
    customers.length === 0;

  const isInitialSearchLoading =
    isSearching &&
    (isDebouncing ||
      (searchLoading && searchedCustomers.length === 0));

  const isLoading =
    isInitialLoading || isInitialSearchLoading;

  const showEmptyState =
    !isLoading &&
    !customerLoading &&
    !searchLoading &&
    displayedCustomers.length === 0;

  /* ---------------------------------------------------------------------- */
  /* Clear Search                                                           */
  /* ---------------------------------------------------------------------- */

  const handleClearSearch = () => {
    setSearchQuery("");
    dispatch(clearSearchedCustomers());
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div
      className="
        opacity-0
        animate-fade-in-scale
        transition-all duration-500
        px-4 py-4
        sm:px-6
        md:px-12 md:py-6
      "
    >
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                           */}
      {/* ---------------------------------------------------------------- */}

      <div
        className="
          flex flex-col
          sm:flex-row
          justify-between
          items-start
          sm:items-center
          border-b border-gray-200
          pb-5 mb-7
          gap-4
        "
      >
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users
              className="text-orange-500"
              size={28}
            />

            All Customers
          </h1>

          <p className="text-sm text-gray-500">
            View and configure client ledger indices,
            communication endpoints, and billing targets.
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Toolbar                                                          */}
      {/* ---------------------------------------------------------------- */}

      <div
        className="
          flex items-center
          justify-between
          flex-wrap
          sm:flex-nowrap
          gap-2
          py-4
        "
      >
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search
            size={17}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-400
              pointer-events-none
            "
          />

          <Input
            placeholder="Search by customer name / number..."
            className="
              w-full
              pl-9
              pr-9
              transition-all
              focus-visible:ring-orange-500
              focus-visible:border-orange-300
            "
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
          />

          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-slate-400
                hover:text-slate-700
                transition-colors
              "
              aria-label="Clear search"
            >
              {isDebouncing || searchLoading ? (
                <LucideLoader
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <X size={16} />
              )}
            </button>
          )}
        </div>

        {/* Add */}
        <Button
          onClick={() => {
            navigate("/user/add-customer");
          }}
          className="
            bg-orange-500
            hover:bg-orange-600
            shrink-0
            shadow-sm
            transition-all
            active:scale-[0.98]
          "
        >
          <Plus size={18} />
          Add Customer
        </Button>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Initial Loading                                                  */}
      {/* ---------------------------------------------------------------- */}

      {isInitialLoading ? (
        <div className="mt-1">
          <DesktopTableSkeleton />
          <MobileTableSkeleton />
        </div>
      ) : (
        /* -------------------------------------------------------------- */
        /* Customer Content                                               */
        /* -------------------------------------------------------------- */

        <InfiniteScroll
          dataLength={displayedCustomers.length}
          next={() => {
            if (isSearching) {
              searchPagination(
                10,
                searchNextCursor
              );
            } else {
              fetchCustomers(
                10,
                nextCursor
              );
            }
          }}
          hasMore={
            isSearchActive(searchQuery, isDebouncing, searchLoading)
              ? false
              : isSearching
              ? !searchIsEnd
              : !isEnd
          }
          loader={
            <div className="py-6 flex items-center justify-center w-full">
              <div
                className="
                  flex items-center
                  gap-2
                  text-sm
                  text-slate-400
                "
              >
                <LucideLoader
                  size={17}
                  className="animate-spin text-orange-500"
                />

                <span>
                  Loading more customers...
                </span>
              </div>
            </div>
          }
          endMessage={
            displayedCustomers.length > 0 ? (
              <div className="py-5 text-center">
                <span className="text-[11px] text-slate-400">
                  You've reached the end of the customer list
                </span>
              </div>
            ) : null
          }
        >
          {/* ------------------------------------------------------------ */}
          {/* Search Loading                                                */}
          {/* ------------------------------------------------------------ */}

          {isInitialSearchLoading ? (
            <div className="mt-1">
              <DesktopTableSkeleton />
              <MobileTableSkeleton />
            </div>
          ) : showEmptyState ? (
            /* ---------------------------------------------------------- */
            /* Empty                                                       */
            /* ---------------------------------------------------------- */

            <EmptyState
              isSearching={isSearching}
              searchQuery={searchQuery}
              onAddCustomer={() =>
                navigate("/user/add-customer")
              }
            />
          ) : (
            /* ---------------------------------------------------------- */
            /* Data                                                        */
            /* ---------------------------------------------------------- */

            <>
              {/* Desktop */}
              <div
                className="
                  hidden md:block
                  w-full
                  overflow-x-auto
                  rounded-xl
                  border border-slate-200
                  bg-white
                  shadow-[0_1px_2px_rgba(15,23,42,0.03)]
                "
              >
                <Table className="min-w-[1100px] w-full table-auto">
                  <TableHeader>
                    <TableRow className="bg-muted/60 hover:bg-muted/60">
                      <TableHead className="text-center min-w-[240px] w-[240px] px-4 whitespace-nowrap">
                        Name
                      </TableHead>

                      <TableHead className="text-center min-w-[150px] w-[150px] px-4 whitespace-nowrap">
                        Phone Number
                      </TableHead>

                      <TableHead className="text-center min-w-[280px] w-[280px] px-4 whitespace-nowrap">
                        Email
                      </TableHead>

                      <TableHead className="text-center min-w-[120px] w-[120px] px-4 whitespace-nowrap">
                        Total Bills
                      </TableHead>

                      <TableHead className="text-center min-w-[150px] w-[150px] px-4 whitespace-nowrap">
                        Total Sales
                      </TableHead>

                      <TableHead className="text-center min-w-[150px] w-[150px] px-4 whitespace-nowrap">
                        Pending
                      </TableHead>

                      <TableHead className="text-center min-w-[70px] w-[70px] px-3" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {displayedCustomers.map(
                      (singleItem) => (
                        <CustomTableRow
                          key={singleItem._id}
                          singleItem={singleItem}
                          navigate={navigate}
                          setDialogOpen={setDialogOpen}
                          setCustomerName={
                            setCustomerName
                          }
                        />
                      )
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="md:hidden space-y-3">
                {displayedCustomers.map(
                  (singleItem) => (
                    <MobileCustomerCard
                      key={singleItem._id}
                      singleItem={singleItem}
                      navigate={navigate}
                      setDialogOpen={setDialogOpen}
                      setCustomerName={
                        setCustomerName
                      }
                    />
                  )
                )}
              </div>
            </>
          )}
        </InfiniteScroll>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Delete Dialog                                                    */}
      {/* ---------------------------------------------------------------- */}

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
        <DialogContent
          className="
            fixed
            left-1/2
            top-1/2
            !-translate-x-1/2
            !-translate-y-1/2
            w-[calc(100%-2rem)]
            max-w-md
            bg-white
            p-6
            rounded-xl
          "
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className="
                  p-2.5
                  bg-rose-50
                  rounded-full
                  border border-rose-100
                  text-rose-600
                  shrink-0
                "
              >
                <AlertTriangle size={20} />
              </div>

              <div className="min-w-0">
                <DialogTitle className="text-base font-bold text-gray-900">
                  Delete Customer{" "}
                  <span className="break-words">
                    {customerName?.displayName}
                  </span>
                  ?
                </DialogTitle>

                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                  This action will permanently delete
                  the customer.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogFooter
            className="
              mt-4
              flex flex-col-reverse
              sm:flex-row
              gap-2
              sm:justify-end
            "
          >
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
              className="
                w-full
                sm:w-auto
                bg-red-600
                hover:bg-red-700
                text-white
                min-w-[125px]
              "
              onClick={(e) =>
                handleDeleting(
                  e,
                  customerName?._id
                )
              }
            >
              {deleteLoading ? (
                <>
                  <LucideLoader
                    size={16}
                    className="animate-spin"
                  />
                  Deleting...
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

/* -------------------------------------------------------------------------- */
/* Search loading helper                                                      */
/* -------------------------------------------------------------------------- */

function isSearchActive(
  searchQuery,
  isDebouncing,
  searchLoading
) {
  return (
    searchQuery.trim().length >= 2 &&
    (isDebouncing || searchLoading)
  );
}
