
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import {
  MoreHorizontal,
  Plus,
  Search,
  FileText,
  AlertTriangle,
  X,
  Loader2 as LucideLoader,
  CalendarDays,
  Package,
  ReceiptText,
} from "lucide-react";

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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Status Helpers                                                             */
/* -------------------------------------------------------------------------- */

const getCalculatedStatus = (singleInvoice) => {
  const status = singleInvoice?.status;

  if (status === "Paid") return "Paid";

  if (status === "Cancel" || status === "cancel") {
    return "Void";
  }

  if (singleInvoice?.dueDate) {
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

const getBadgeStyle = (status) => {
  switch (status) {
    case "Paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "Partially Paid":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "Void":
      return "bg-slate-100 text-slate-600 border-slate-200";

    case "Overdue":
      return "bg-rose-50 text-rose-700 border-rose-200";

    case "Unpaid":
    default:
      return "bg-orange-50 text-orange-600 border-orange-200";
  }
};

/* -------------------------------------------------------------------------- */
/* Skeleton Components                                                        */
/* -------------------------------------------------------------------------- */

const SkeletonBlock = ({ className = "" }) => {
  return (
    <div
      className={`
        animate-pulse
        rounded-md
        bg-slate-200
        ${className}
      `}
    />
  );
};

const InvoiceTableSkeletonRow = ({ index }) => {
  return (
    <TableRow
      key={`invoice-skeleton-${index}`}
      className="border-b border-slate-100"
    >
      {/* Date */}
      <TableCell className="py-4 px-4">
        <div className="flex flex-col items-center gap-2">
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-2.5 w-12 bg-slate-100" />
        </div>
      </TableCell>

      {/* Invoice No */}
      <TableCell className="py-4 px-4">
        <div className="flex justify-center">
          <SkeletonBlock className="h-4 w-28" />
        </div>
      </TableCell>

      {/* Customer */}
      <TableCell className="py-4 px-4">
        <div className="flex flex-col items-center gap-2">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-2.5 w-16 bg-slate-100" />
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="py-4 px-4">
        <div className="flex justify-center">
          <SkeletonBlock className="h-7 w-20 rounded-md" />
        </div>
      </TableCell>

      {/* Due Date */}
      <TableCell className="py-4 px-4">
        <div className="flex justify-center">
          <SkeletonBlock className="h-4 w-20" />
        </div>
      </TableCell>

      {/* Items */}
      <TableCell className="py-4 px-4">
        <div className="flex justify-center">
          <SkeletonBlock className="h-4 w-16" />
        </div>
      </TableCell>

      {/* Amount */}
      <TableCell className="py-4 px-4">
        <div className="flex flex-col items-center gap-2">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-2.5 w-16 bg-slate-100" />
        </div>
      </TableCell>

      {/* Action */}
      <TableCell className="py-4 px-3">
        <div className="flex justify-center">
          <SkeletonBlock className="h-8 w-8 rounded-md" />
        </div>
      </TableCell>
    </TableRow>
  );
};

const DesktopTableSkeleton = () => {
  return (
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
            <TableHead className="text-center min-w-[130px] px-4">
              Date Created
            </TableHead>

            <TableHead className="text-center min-w-[150px] px-4">
              Invoice No.
            </TableHead>

            <TableHead className="text-center min-w-[220px] px-4">
              Customer
            </TableHead>

            <TableHead className="text-center min-w-[140px] px-4">
              Status
            </TableHead>

            <TableHead className="text-center min-w-[140px] px-4">
              Due Date
            </TableHead>

            <TableHead className="text-center min-w-[120px] px-4">
              Items
            </TableHead>

            <TableHead className="text-center min-w-[170px] px-4">
              Bill Amount
            </TableHead>

            <TableHead className="text-center min-w-[70px] px-3" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: 6 }).map((_, index) => (
            <InvoiceTableSkeletonRow
              key={index}
              index={index}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const MobileInvoiceSkeletonCard = ({ index }) => {
  return (
    <div
      key={`mobile-invoice-skeleton-${index}`}
      className="
        rounded-xl
        border border-slate-200
        bg-white
        p-4
        shadow-sm
        animate-pulse
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <SkeletonBlock className="h-11 w-11 rounded-lg shrink-0" />

          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-3 w-24 bg-slate-100" />
          </div>
        </div>

        <SkeletonBlock className="h-8 w-8 rounded-md shrink-0" />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <SkeletonBlock className="h-2.5 w-12 mx-auto" />
            <SkeletonBlock className="h-4 w-20 mx-auto mt-2" />
          </div>

          <div className="rounded-lg bg-orange-50/70 px-3 py-2.5">
            <SkeletonBlock className="h-2.5 w-14 mx-auto bg-orange-100" />
            <SkeletonBlock className="h-4 w-20 mx-auto mt-2" />
          </div>

          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <SkeletonBlock className="h-2.5 w-12 mx-auto" />
            <SkeletonBlock className="h-4 w-20 mx-auto mt-2" />
          </div>

          <div className="rounded-lg bg-emerald-50 px-3 py-2.5">
            <SkeletonBlock className="h-2.5 w-12 mx-auto bg-emerald-100" />
            <SkeletonBlock className="h-4 w-20 mx-auto mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileTableSkeleton = () => {
  return (
    <div className="md:hidden space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <MobileInvoiceSkeletonCard
          key={index}
          index={index}
        />
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

const EmptyState = ({
  isSearching,
  searchQuery,
  filter,
  onAddInvoice,
}) => {
  if (isSearching) {
    return (
      <div
        className="
          min-h-[300px]
          rounded-xl
          border border-slate-200
          bg-white
          flex flex-col
          items-center
          justify-center
          text-center
          px-6
        "
      >
        <div
          className="
            h-14 w-14
            rounded-full
            bg-slate-50
            border border-slate-100
            flex items-center
            justify-center
          "
        >
          <Search
            size={25}
            className="text-slate-300 stroke-[1.5]"
          />
        </div>

        <p className="text-base font-semibold text-slate-700 mt-4">
          No invoices found
        </p>

        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          We couldn't find anything matching{" "}
          <span className="font-medium text-slate-500">
            "{searchQuery}"
          </span>
          .
        </p>

        <p className="text-xs text-slate-400 mt-3">
          Try searching by customer name or invoice number.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        min-h-[300px]
        rounded-xl
        border border-slate-200
        bg-white
        flex flex-col
        items-center
        justify-center
        text-center
        px-6
      "
    >
      <div
        className="
          h-16 w-16
          rounded-full
          bg-orange-50
          border border-orange-100
          flex items-center
          justify-center
        "
      >
        <FileText
          size={29}
          className="text-orange-400 stroke-[1.5]"
        />
      </div>

      <p className="text-base font-semibold text-slate-700 mt-4">
        No {filter !== "All" ? filter : ""} invoices found
      </p>

      <p className="text-sm text-slate-400 mt-1 max-w-sm">
        {filter !== "All"
          ? `There are currently no ${filter.toLowerCase()} invoices in your records.`
          : "Your invoice list is empty. Create your first invoice to start managing your sales."}
      </p>

      <Button
        onClick={onAddInvoice}
        className="
          mt-5
          bg-orange-500
          hover:bg-orange-600
          shadow-sm
        "
      >
        <Plus size={17} />
        Add Invoice
      </Button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Invoice Actions                                                            */
/* -------------------------------------------------------------------------- */

const InvoiceActions = ({
  singleInvoice,
  navigate,
  onOpenCancelDialog,
}) => {
  const invoiceId =
    singleInvoice?._id || singleInvoice?.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="
            h-8 w-8
            p-0
            text-slate-400
            hover:text-slate-700
            hover:bg-slate-100
            transition-colors
            rounded-md
          "
        >
          <MoreHorizontal size={17} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-40"
      >
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() =>
            navigate(
              `/user/check-invoice/${invoiceId}`
            )
          }
        >
          View Details
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="
            cursor-pointer
            text-red-600
            focus:text-red-700
            focus:bg-red-50
          "
          onClick={(e) => {
            e.stopPropagation();
            onOpenCancelDialog(singleInvoice);
          }}
        >
          Void Invoice
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/* -------------------------------------------------------------------------- */
/* Desktop Row                                                                */
/* -------------------------------------------------------------------------- */

const CustomTableRow = React.memo(
  ({
    singleInvoice,
    navigate,
    onOpenCancelDialog,
  }) => {
    const computedStatus =
      getCalculatedStatus(singleInvoice);

    const remainingBalance =
      singleInvoice?.balanceAmount != null
        ? Number(singleInvoice.balanceAmount)
        : computedStatus === "Paid"
          ? 0
          : Number(singleInvoice?.amount || 0);

    const invoiceId =
      singleInvoice?._id || singleInvoice?.id;

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
        onClick={() =>
          navigate(
            `/user/check-invoice/${invoiceId}`
          )
        }
      >
        {/* Date */}
        <TableCell className="py-4 px-4 text-center align-middle">
          <div className="flex flex-col items-center">
            <span className="font-medium text-slate-700 whitespace-nowrap">
              {formatDisplayDate(singleInvoice?.date)}
            </span>

            <span className="text-[10px] text-slate-400 mt-1">
              Created
            </span>
          </div>
        </TableCell>

        {/* Invoice Number */}
        <TableCell className="py-4 px-4 text-center align-middle">
          <div className="flex flex-col items-center">
            <span
              className="
                font-semibold
                text-blue-600
                group-hover:text-orange-600
                transition-colors
                font-mono
                tracking-wide
                whitespace-nowrap
              "
            >
              {singleInvoice?.invoiceNo || "N/A"}
            </span>

            <span className="text-[10px] text-slate-400 mt-1">
              Invoice
            </span>
          </div>
        </TableCell>

        {/* Customer */}
        <TableCell
          className="py-4 px-4 text-center align-middle"
          title={singleInvoice?.customer}
        >
          <div className="flex flex-col items-center min-w-0">
            <span
              className="
                font-semibold
                text-slate-800
                whitespace-normal
                break-words
                leading-5
                text-center
                max-w-[220px]
              "
            >
              {singleInvoice?.customer || "Walk-in Customer"}
            </span>

            <span className="text-[10px] text-slate-400 mt-1">
              Customer
            </span>
          </div>
        </TableCell>

        {/* Status */}
        <TableCell className="py-4 px-4 text-center align-middle">
          <div className="flex flex-col items-center gap-1">
            <Badge
              variant="outline"
              className={`
                pointer-events-none
                rounded-md
                px-2.5
                py-1
                text-xs
                font-semibold
                whitespace-nowrap
                ${getBadgeStyle(computedStatus)}
              `}
            >
              {computedStatus}
            </Badge>

            <span className="text-[10px] text-slate-400">
              Payment status
            </span>
          </div>
        </TableCell>

        {/* Due Date */}
        <TableCell className="py-4 px-4 text-center align-middle">
          <div className="flex flex-col items-center">
            <span className="font-medium text-slate-600 whitespace-nowrap">
              {formatDisplayDate(singleInvoice?.dueDate)}
            </span>

            <span className="text-[10px] text-slate-400 mt-1">
              Due date
            </span>
          </div>
        </TableCell>

        {/* Items */}
        <TableCell className="py-4 px-4 text-center align-middle">
          <div className="flex flex-col items-center">
            <span className="font-semibold text-slate-700 whitespace-nowrap">
              {singleInvoice?.invoiceItems?.length || 0}
            </span>

            <span className="text-[10px] text-slate-400 mt-1">
              {singleInvoice?.invoiceItems?.length === 1
                ? "Item"
                : "Items"}
            </span>
          </div>
        </TableCell>

        {/* Amount */}
        <TableCell className="py-4 px-4 text-center align-middle">
          <div className="flex flex-col items-center">
            <span className="font-bold text-slate-800 font-mono text-sm whitespace-nowrap">
              {formatCurrency(singleInvoice?.amount)}
            </span>

            {remainingBalance > 0 &&
              computedStatus !== "Void" && (
                <span className="text-[10px] font-medium text-amber-600 font-mono mt-1 whitespace-nowrap">
                  Due {formatCurrency(remainingBalance)}
                </span>
              )}

            {remainingBalance <= 0 &&
              computedStatus === "Paid" && (
                <span className="text-[10px] text-emerald-500 mt-1">
                  Fully paid
                </span>
              )}
          </div>
        </TableCell>

        {/* Actions */}
        <TableCell
          onClick={(e) => e.stopPropagation()}
          className="py-4 px-3 text-center align-middle"
        >
          <div className="flex justify-center">
            <InvoiceActions
              singleInvoice={singleInvoice}
              navigate={navigate}
              onOpenCancelDialog={onOpenCancelDialog}
            />
          </div>
        </TableCell>
      </TableRow>
    );
  }
);

CustomTableRow.displayName = "CustomTableRow";

/* -------------------------------------------------------------------------- */
/* Mobile Invoice Card                                                        */
/* -------------------------------------------------------------------------- */

const MobileInvoiceCard = ({
  singleInvoice,
  navigate,
  onOpenCancelDialog,
}) => {
  const computedStatus =
    getCalculatedStatus(singleInvoice);

  const remainingBalance =
    singleInvoice?.balanceAmount != null
      ? Number(singleInvoice.balanceAmount)
      : computedStatus === "Paid"
        ? 0
        : Number(singleInvoice?.amount || 0);

  const invoiceId =
    singleInvoice?._id || singleInvoice?.id;

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
      onClick={() =>
        navigate(
          `/user/check-invoice/${invoiceId}`
        )
      }
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className="
              h-11 w-11
              rounded-lg
              bg-orange-50
              border border-orange-100
              flex items-center
              justify-center
              shrink-0
            "
          >
            <ReceiptText
              size={19}
              className="text-orange-500"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className="
                font-semibold
                text-slate-800
                text-[15px]
                leading-5
                break-words
              "
            >
              {singleInvoice?.invoiceNo || "N/A"}
            </h3>

            <p
              className="
                text-[11px]
                text-slate-400
                mt-1
                break-words
              "
            >
              {singleInvoice?.customer ||
                "Walk-in Customer"}
            </p>
          </div>
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
        >
          <InvoiceActions
            singleInvoice={singleInvoice}
            navigate={navigate}
            onOpenCancelDialog={onOpenCancelDialog}
          />
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400">
          Payment status
        </span>

        <Badge
          variant="outline"
          className={`
            rounded-md
            px-2.5
            py-1
            text-[10px]
            font-semibold
            whitespace-nowrap
            ${getBadgeStyle(computedStatus)}
          `}
        >
          {computedStatus}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
        {/* Date */}
        <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-center">
          <div className="text-[10px] text-slate-400 mb-1">
            Created
          </div>

          <p className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            {formatDisplayDate(singleInvoice?.date)}
          </p>
        </div>

        {/* Due */}
        <div className="rounded-lg bg-orange-50/70 px-3 py-2.5 text-center">
          <div className="text-[10px] text-orange-500 mb-1">
            Due Date
          </div>

          <p className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            {formatDisplayDate(singleInvoice?.dueDate)}
          </p>
        </div>

        {/* Items */}
        <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-center">
          <div className="text-[10px] text-slate-400 mb-1">
            Items
          </div>

          <p className="text-sm font-semibold text-slate-800">
            {singleInvoice?.invoiceItems?.length || 0}
          </p>
        </div>

        {/* Amount */}
        <div className="rounded-lg bg-emerald-50 px-3 py-2.5 text-center">
          <div className="text-[10px] text-emerald-500 mb-1">
            Bill Amount
          </div>

          <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">
            {formatCurrency(singleInvoice?.amount)}
          </p>
        </div>
      </div>

      {/* Balance */}
      {remainingBalance > 0 &&
        computedStatus !== "Void" && (
          <div
            className="
              mt-3
              rounded-lg
              bg-amber-50
              border border-amber-100
              px-3 py-2
              flex items-center
              justify-between
              gap-3
            "
          >
            <span className="text-[10px] font-medium text-amber-600">
              Remaining balance
            </span>

            <span className="text-xs font-bold text-amber-700 font-mono whitespace-nowrap">
              {formatCurrency(remainingBalance)}
            </span>
          </div>
        )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function Invoices() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDebouncing, setSearchIsDebouncing] =
    useState(false);

  const [filter, setFilter] = useState("All");

  const [invoiceToCancel, setInvoiceToCancel] =
    useState(null);

  const [isCancelModalOpen, setIsCancelModalOpen] =
    useState(false);

  const [isCancelling, setIsCancelling] =
    useState(false);

  const activeSearchRequestRef = useRef(null);
  const initialFetchKeyRef = useRef(null);
  const isMountedRef = useRef(true);

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

  /* ---------------------------------------------------------------------- */
  /* Mounted State                                                          */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Fetch Invoices                                                         */
  /* ---------------------------------------------------------------------- */

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
        if (isMountedRef.current) {
          toast.error(
            error?.message ||
              "Unable to load invoices"
          );
        }

        return false;
      }
    },
    [dispatch, invoiceLoading, filter]
  );

  /* ---------------------------------------------------------------------- */
  /* Open Cancel Dialog                                                     */
  /* ---------------------------------------------------------------------- */

  const handleOpenCancelDialog = useCallback(
    (invoice) => {
      setInvoiceToCancel(invoice);
      setIsCancelModalOpen(true);
    },
    []
  );

  /* ---------------------------------------------------------------------- */
  /* Confirm Cancel                                                         */
  /* ---------------------------------------------------------------------- */

  const handleConfirmCancel = async () => {
    if (!invoiceToCancel || isCancelling) return;

    const invoiceId =
      invoiceToCancel._id || invoiceToCancel.id;

    if (!invoiceId) {
      toast.error("Invoice ID is missing");
      return;
    }

    setIsCancelling(true);

    try {
      await dispatch(
        cancelInvoiceReq(invoiceId)
      ).unwrap();

      if (isMountedRef.current) {
        toast.success(
          "Invoice cancelled successfully"
        );

        setIsCancelModalOpen(false);
        setInvoiceToCancel(null);
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast.error(
          error?.message ||
            "Failed to cancel invoice"
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsCancelling(false);
      }
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Filter Change                                                          */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Initial Fetch                                                          */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      return;
    }

    if (invoiceLoading) return;

    if (invoices.length > 0) return;

    if (isEnd) return;

    const fetchKey = filter || "All";

    if (
      initialFetchKeyRef.current === fetchKey
    ) {
      return;
    }

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

  /* ---------------------------------------------------------------------- */
  /* Abort Search On Unmount                                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (activeSearchRequestRef.current) {
        activeSearchRequestRef.current.abort();
      }
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Search                                                                 */
  /* ---------------------------------------------------------------------- */

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

      activeSearchRequestRef.current =
        requestPromise;

      setSearchIsDebouncing(false);

      requestPromise
        .unwrap()
        .catch((err) => {
          if (
            err?.name === "AbortError" ||
            err === "Request cancelled"
          ) {
            return;
          }

          if (isMountedRef.current) {
            toast.error(
              err?.message ||
                "Unable to search invoices"
            );
          }
        })
        .finally(() => {
          if (
            activeSearchRequestRef.current ===
            requestPromise
          ) {
            activeSearchRequestRef.current = null;
          }
        });
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, dispatch, filter]);

  /* ---------------------------------------------------------------------- */
  /* Search Pagination                                                      */
  /* ---------------------------------------------------------------------- */

  const searchPagination = useCallback(
    async (limit = 10, cursor) => {
      if (searchQuery.trim().length === 0) {
        return;
      }

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

        if (isMountedRef.current) {
          toast.error(
            error?.message ||
              "Unable to load more invoices"
          );
        }
      }
    },
    [
      searchQuery,
      searchLoading,
      dispatch,
      filter,
    ]
  );

  /* ---------------------------------------------------------------------- */
  /* Derived State                                                          */
  /* ---------------------------------------------------------------------- */

  const isSearching =
    searchQuery.trim().length >= 1;

  const isSearchActive =
    isDebouncing || searchLoading;

  const isInitialLoading =
    !isSearching &&
    invoiceLoading &&
    invoices.length === 0;

  const isInitialSearchLoading =
    isSearching &&
    isSearchActive &&
    searchedInvoices.length === 0;

  const isLoading =
    isInitialLoading ||
    isInitialSearchLoading;

  const displayedInvoices = isSearching
    ? searchedInvoices
    : invoices;

  const showEmptyState =
    !isLoading &&
    !invoiceLoading &&
    !searchLoading &&
    displayedInvoices.length === 0;

  /* ---------------------------------------------------------------------- */
  /* Clear Search                                                           */
  /* ---------------------------------------------------------------------- */

  const handleClearSearch = () => {
    setSearchQuery("");
    dispatch(clearSearchedInvoices());
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
        min-h-screen
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
          <h1
            className="
              text-2xl
              font-bold
              text-gray-900
              flex items-center gap-2
            "
          >
            <FileText
              className="text-orange-500"
              size={28}
            />

            All Invoices
          </h1>

          <p className="text-sm text-gray-500">
            View, manage, and track your invoices,
            payments, balances, and collection status.
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Toolbar                                                          */}
      {/* ---------------------------------------------------------------- */}

      <div
        className="
          flex items-center
          py-4
          justify-between
          flex-wrap
          sm:flex-nowrap
          gap-2
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
            placeholder="Search by customer or invoice no..."
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
              {isDebouncing ||
              searchLoading ? (
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

        {/* Filter + Add */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={filter || "All"}
            onValueChange={setFilter}
          >
            <SelectTrigger
              id="invoice-filter"
              className="
                h-10
                w-full
                sm:w-40
                bg-white
                text-sm
                font-semibold
                border border-slate-300
                rounded-lg
                focus:ring-orange-500
              "
            >
              <SelectValue placeholder="Filter" />
            </SelectTrigger>

            <SelectContent
              className="
                bg-white
                border border-slate-200
                max-h-64
              "
            >
              <SelectItem value="All">
                All Invoices
              </SelectItem>

              <SelectItem value="Paid">
                Paid
              </SelectItem>

              <SelectItem value="Partially Paid">
                Partially Paid
              </SelectItem>

              <SelectItem value="Unpaid">
                Unpaid
              </SelectItem>

              <SelectItem value="Overdue">
                Overdue
              </SelectItem>

              <SelectItem value="Cancel">
                Void
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() =>
              navigate("/user/add-invoice")
            }
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
            <span className="hidden sm:inline">
              Add Invoice
            </span>
            <span className="sm:hidden">
              Add
            </span>
          </Button>
        </div>
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
        <InfiniteScroll
          dataLength={displayedInvoices.length}
          next={() => {
            if (isSearchActive || invoiceLoading) {
              return;
            }

            if (isSearching) {
              if (
                searchedInvoices.length > 0 &&
                searchNextCursor &&
                !searchIsEnd
              ) {
                searchPagination(
                  10,
                  searchNextCursor
                );
              }

              return;
            }

            if (
              invoices.length > 0 &&
              nextCursor &&
              !isEnd
            ) {
              fetchInvoices(
                10,
                nextCursor
              );
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
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <LucideLoader
                  size={17}
                  className="
                    animate-spin
                    text-orange-500
                  "
                />

                <span>
                  Loading more invoices...
                </span>
              </div>
            </div>
          }
          endMessage={
            displayedInvoices.length > 0 ? (
              <div className="py-5 text-center">
                <span className="text-[11px] text-slate-400">
                  You've reached the end of the
                  invoice list
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
            <EmptyState
              isSearching={isSearching}
              searchQuery={searchQuery}
              filter={filter}
              onAddInvoice={() =>
                navigate("/user/add-invoice")
              }
            />
          ) : (
            <>
              {/* -------------------------------------------------------- */}
              {/* Desktop Table                                             */}
              {/* -------------------------------------------------------- */}

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
                    <TableRow
                      className="
                        bg-muted/60
                        hover:bg-muted/60
                      "
                    >
                      <TableHead className="text-center min-w-[130px] px-4 whitespace-nowrap">
                        Date Created
                      </TableHead>

                      <TableHead className="text-center min-w-[150px] px-4 whitespace-nowrap">
                        Invoice No.
                      </TableHead>

                      <TableHead className="text-center min-w-[220px] px-4 whitespace-nowrap">
                        Customer
                      </TableHead>

                      <TableHead className="text-center min-w-[140px] px-4 whitespace-nowrap">
                        Status
                      </TableHead>

                      <TableHead className="text-center min-w-[140px] px-4 whitespace-nowrap">
                        Due Date
                      </TableHead>

                      <TableHead className="text-center min-w-[120px] px-4 whitespace-nowrap">
                        Items
                      </TableHead>

                      <TableHead className="text-center min-w-[170px] px-4 whitespace-nowrap">
                        Bill Amount
                      </TableHead>

                      <TableHead className="text-center min-w-[70px] px-3" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {displayedInvoices.map(
                      (singleInvoice) => (
                        <CustomTableRow
                          key={
                            singleInvoice._id ||
                            singleInvoice.id
                          }
                          singleInvoice={
                            singleInvoice
                          }
                          navigate={navigate}
                          onOpenCancelDialog={
                            handleOpenCancelDialog
                          }
                        />
                      )
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* -------------------------------------------------------- */}
              {/* Mobile Cards                                              */}
              {/* -------------------------------------------------------- */}

              <div className="md:hidden space-y-3">
                {displayedInvoices.map(
                  (singleInvoice) => (
                    <MobileInvoiceCard
                      key={
                        singleInvoice._id ||
                        singleInvoice.id
                      }
                      singleInvoice={
                        singleInvoice
                      }
                      navigate={navigate}
                      onOpenCancelDialog={
                        handleOpenCancelDialog
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
      {/* Void Confirmation Dialog                                         */}
      {/* ---------------------------------------------------------------- */}

      <Dialog
        open={isCancelModalOpen}
        onOpenChange={(open) => {
          if (!isCancelling) {
            setIsCancelModalOpen(open);

            if (!open) {
              setInvoiceToCancel(null);
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
                <DialogTitle
                  className="
                    text-base
                    font-bold
                    text-gray-900
                    break-words
                  "
                >
                  Void Invoice{" "}
                  {invoiceToCancel?.invoiceNo}?
                </DialogTitle>

                <DialogDescription
                  className="
                    text-xs
                    text-gray-500
                    mt-0.5
                  "
                >
                  This will mark the invoice as void
                  and automatically restock the
                  associated items.
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
              disabled={isCancelling}
              onClick={() => {
                setIsCancelModalOpen(false);
                setInvoiceToCancel(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={isCancelling}
              className="
                w-full
                sm:w-auto
                min-w-[125px]
                bg-red-600
                hover:bg-red-700
                text-white
              "
              onClick={handleConfirmCancel}
            >
              {isCancelling ? (
                <>
                  <LucideLoader
                    size={16}
                    className="animate-spin"
                  />

                  Voiding...
                </>
              ) : (
                "Confirm Void"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
