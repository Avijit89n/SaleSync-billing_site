import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  MoreHorizontal,
  Plus,
  Search,
  ShoppingBag,
  X,
  Loader2 as LucideLoader,
} from "lucide-react";

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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  clearSearchedItems,
  getAllItemReq,
  itemSearchReq,
  deleteItemReq,
} from "@/redux/features/itemSlice.js";

import InfiniteScroll from "react-infinite-scroll-component";
import Loader2 from "@/components/loaders/loader2";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const discountCalculate = (MRP, sellingPrice) => {
  const mrp = Number(MRP || 0);
  const price = Number(sellingPrice || 0);

  if (!mrp || !price) return 0;

  const discount = ((mrp - price) / mrp) * 100;

  return discount.toFixed(0);
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

/* -------------------------------------------------------------------------- */
/* Product Image                                                              */
/* -------------------------------------------------------------------------- */

const ProductImage = ({
  src,
  alt = "Product",
  size = "table",
}) => {
  const [imageError, setImageError] = useState(false);

  const wrapperClass =
    size === "mobile"
      ? "h-11 w-11 rounded-lg"
      : "h-11 w-11 rounded-xl";

  const imageClass =
    size === "mobile"
      ? "h-9 w-9 rounded-md"
      : "h-9 w-9 rounded-lg";

  if (!src || imageError) {
    return (
      <div
        className={`
          ${wrapperClass}
          flex items-center justify-center
          bg-gradient-to-br
          from-slate-50
          to-slate-100
          border border-slate-200
          shadow-sm
          shrink-0
        `}
      >
        <ShoppingBag
          size={18}
          className="text-slate-300"
        />
      </div>
    );
  }

  return (
    <div
      className={`
        ${wrapperClass}
        flex items-center justify-center
        bg-gradient-to-br
        from-slate-50
        to-slate-100
        border border-slate-200
        shadow-sm
        shrink-0
        overflow-hidden
        group-hover:border-orange-200
        transition-all
      `}
    >
      <img
        loading="lazy"
        className={`${imageClass} object-cover`}
        src={src}
        alt={alt}
        onError={() => setImageError(true)}
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Skeleton Components                                                        */
/* -------------------------------------------------------------------------- */

const SkeletonBlock = ({
  className = "",
}) => {
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

const TableSkeletonRow = ({ index }) => {
  return (
    <TableRow
      key={`item-skeleton-${index}`}
      className="border-b border-slate-100"
    >
      {/* Product */}
      <TableCell className="py-4 px-4 text-center">
        <div className="flex justify-center">
          <SkeletonBlock className="h-11 w-11 rounded-xl" />
        </div>
      </TableCell>

      {/* Name */}
      <TableCell className="py-4 px-4">
        <div className="flex flex-col items-center gap-2">
          <SkeletonBlock className="h-4 w-36" />
          <SkeletonBlock className="h-2.5 w-14 bg-slate-100" />
        </div>
      </TableCell>

      {/* MRP */}
      <TableCell className="py-4 px-4">
        <div className="flex flex-col items-center gap-2">
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-2.5 w-8 bg-slate-100" />
        </div>
      </TableCell>

      {/* Price */}
      <TableCell className="py-4 px-4">
        <div className="flex flex-col items-center gap-2">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-2.5 w-16 bg-slate-100" />
        </div>
      </TableCell>

      {/* Offer */}
      <TableCell className="py-4 px-4">
        <div className="flex flex-col items-center gap-2">
          <SkeletonBlock className="h-7 w-16 rounded-md" />
          <SkeletonBlock className="h-2.5 w-20 bg-slate-100" />
        </div>
      </TableCell>

      {/* Actions */}
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
      "
    >
      <Table className="min-w-[1000px] w-full table-auto">
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead className="text-center min-w-[90px] w-[90px] px-4">
              Product
            </TableHead>

            <TableHead className="text-center min-w-[280px] w-[280px] px-4">
              Name
            </TableHead>

            <TableHead className="text-center min-w-[140px] w-[140px] px-4">
              MRP
            </TableHead>

            <TableHead className="text-center min-w-[140px] w-[140px] px-4">
              Price
            </TableHead>

            <TableHead className="text-center min-w-[120px] w-[120px] px-4">
              Offer
            </TableHead>

            <TableHead className="text-center min-w-[70px] w-[70px] px-3" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: 6 }).map((_, index) => (
            <TableSkeletonRow
              key={index}
              index={index}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const MobileSkeletonCard = ({ index }) => {
  return (
    <div
      key={`mobile-item-skeleton-${index}`}
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
            <SkeletonBlock className="h-4 w-36" />
            <SkeletonBlock className="h-3 w-20 bg-slate-100" />
          </div>
        </div>

        <SkeletonBlock className="h-8 w-8 rounded-md shrink-0" />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
        <div className="rounded-lg bg-slate-50 px-2 py-2.5">
          <SkeletonBlock className="h-2.5 w-8 mx-auto bg-slate-200" />
          <SkeletonBlock className="h-4 w-16 mx-auto mt-2" />
        </div>

        <div className="rounded-lg bg-orange-50/70 px-2 py-2.5">
          <SkeletonBlock className="h-2.5 w-10 mx-auto bg-orange-100" />
          <SkeletonBlock className="h-4 w-16 mx-auto mt-2" />
        </div>

        <div className="rounded-lg bg-emerald-50 px-2 py-2.5">
          <SkeletonBlock className="h-2.5 w-10 mx-auto bg-emerald-100" />
          <SkeletonBlock className="h-4 w-16 mx-auto mt-2" />
        </div>
      </div>
    </div>
  );
};

const MobileTableSkeleton = () => {
  return (
    <div className="md:hidden space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <MobileSkeletonCard
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
  onAddItem,
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
            flex items-center justify-center
          "
        >
          <Search
            size={25}
            className="text-slate-300 stroke-[1.5]"
          />
        </div>

        <p className="text-base font-semibold text-slate-700 mt-4">
          No items found
        </p>

        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          We couldn't find anything matching{" "}
          <span className="font-medium text-slate-500">
            "{searchQuery}"
          </span>
          .
        </p>

        <p className="text-xs text-slate-400 mt-3">
          Try searching with a different product name.
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
          flex items-center justify-center
        "
      >
        <ShoppingBag
          size={29}
          className="text-orange-400 stroke-[1.5]"
        />
      </div>

      <p className="text-base font-semibold text-slate-700 mt-4">
        No items yet
      </p>

      <p className="text-sm text-slate-400 mt-1 max-w-sm">
        Your product catalog is empty. Add your first item
        to start managing products and pricing.
      </p>

      <Button
        onClick={onAddItem}
        className="
          mt-5
          bg-orange-500
          hover:bg-orange-600
          shadow-sm
        "
      >
        <Plus size={17} />
        Add Item
      </Button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Item Actions                                                               */
/* -------------------------------------------------------------------------- */

const ItemActions = ({
  singleItem,
  navigate,
  setDialogOpen,
  setItemName,
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
            navigate(
              `/user/edit-item/${singleItem?._id}`
            )
          }
        >
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => {
            setItemName(singleItem);
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
  setItemName,
}) => {
  const discount = discountCalculate(
    singleItem.MRP,
    singleItem.sellingPrice
  );

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
        navigate(
          `/user/edit-item/${singleItem._id}`
        );
      }}
    >
      {/* Product Image */}
      <TableCell className="py-4 px-4 text-center align-middle">
        <div className="flex justify-center">
          <ProductImage
            src={singleItem.image}
            alt={singleItem.name || "Product"}
          />
        </div>
      </TableCell>

      {/* Name */}
      <TableCell
        className="py-4 px-4 text-center align-middle"
        title={singleItem.name}
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
            {singleItem.name}
          </span>

          <span className="text-[10px] text-slate-400 mt-1">
            Product
          </span>
        </div>
      </TableCell>

      {/* MRP */}
      <TableCell className="py-4 px-4 text-center align-middle">
        <div className="flex flex-col items-center">
          <span className="font-medium text-slate-600 whitespace-nowrap">
            {formatCurrency(singleItem.MRP)}
          </span>

          <span className="text-[10px] text-slate-400 mt-0.5">
            MRP
          </span>
        </div>
      </TableCell>

      {/* Selling Price */}
      <TableCell className="py-4 px-4 text-center align-middle">
        <div className="flex flex-col items-center">
          <span className="font-semibold text-slate-800 whitespace-nowrap">
            {formatCurrency(
              singleItem.sellingPrice
            )}
          </span>

          <span className="text-[10px] text-emerald-500 mt-0.5">
            Selling price
          </span>
        </div>
      </TableCell>

      {/* Offer */}
      <TableCell className="py-4 px-4 text-center align-middle">
        {Number(discount) > 0 ? (
          <div className="flex flex-col items-center">
            <span
              className="
                inline-flex
                items-center
                justify-center
                px-2.5 py-1
                rounded-md
                bg-orange-50
                text-orange-600
                text-xs
                font-semibold
                whitespace-nowrap
              "
            >
              {discount}% Off
            </span>

            <span className="text-[10px] text-slate-400 mt-1">
              Special offer
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">
            No offer
          </span>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell
        onClick={(e) => e.stopPropagation()}
        className="py-4 px-3 text-center align-middle"
      >
        <ItemActions
          singleItem={singleItem}
          navigate={navigate}
          setDialogOpen={setDialogOpen}
          setItemName={setItemName}
        />
      </TableCell>
    </TableRow>
  );
};

/* -------------------------------------------------------------------------- */
/* Mobile Card                                                                */
/* -------------------------------------------------------------------------- */

const MobileItemCard = ({
  singleItem,
  navigate,
  setDialogOpen,
  setItemName,
}) => {
  const discount = discountCalculate(
    singleItem.MRP,
    singleItem.sellingPrice
  );

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
        navigate(
          `/user/edit-item/${singleItem._id}`
        );
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <ProductImage
            src={singleItem.image}
            alt={singleItem.name || "Product"}
            size="mobile"
          />

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
              {singleItem.name}
            </h3>

            <p className="text-[10px] text-slate-400 mt-1">
              Product
            </p>
          </div>
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
        >
          <ItemActions
            singleItem={singleItem}
            navigate={navigate}
            setDialogOpen={setDialogOpen}
            setItemName={setItemName}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
        {/* MRP */}
        <div className="rounded-lg bg-slate-50 px-2 py-2.5 text-center">
          <div className="text-[10px] text-slate-400 mb-1">
            MRP
          </div>

          <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">
            {formatCurrency(singleItem.MRP)}
          </p>
        </div>

        {/* Price */}
        <div className="rounded-lg bg-orange-50/70 px-2 py-2.5 text-center">
          <div className="text-[10px] text-orange-500 mb-1">
            Price
          </div>

          <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">
            {formatCurrency(
              singleItem.sellingPrice
            )}
          </p>
        </div>

        {/* Offer */}
        <div className="rounded-lg bg-emerald-50 px-2 py-2.5 text-center">
          <div className="text-[10px] text-emerald-500 mb-1">
            Offer
          </div>

          <p className="text-sm font-semibold text-emerald-600 whitespace-nowrap">
            {Number(discount) > 0
              ? `${discount}% Off`
              : "No offer"}
          </p>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function Items() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] =
    useState("");

  const [isDebouncing, setIsDebouncing] =
    useState(false);

  const [itemName, setItemName] =
    useState("");

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const initialFetchStarted =
    useRef(false);

  const {
    items,
    searchedItems,
    isEnd,
    searchLoading,
    nextCursor,
    itemLoading,
    searchIsEnd,
    deleteLoading,
    searchNextCursor,
  } = useSelector(
    (state) => state.item
  );

  /* ---------------------------------------------------------------------- */
  /* Fetch Items                                                            */
  /* ---------------------------------------------------------------------- */

  const fetchItems = async (
    limit = 10,
    cursor = undefined
  ) => {
    if (itemLoading) return;

    try {
      await dispatch(
        getAllItemReq({
          limit,
          lastCreatedAt: cursor,
        })
      ).unwrap();
    } catch (error) {
      toast.error(
        error?.message ||
          "Unable to load items"
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Delete Item                                                            */
  /* ---------------------------------------------------------------------- */

  const handleDeleting = async (
    e,
    id
  ) => {
    e.preventDefault();

    if (!id || deleteLoading) return;

    try {
      await dispatch(
        deleteItemReq(id)
      ).unwrap();

      toast.success(
        "Item deleted successfully"
      );

      setDialogOpen(false);
      setItemName("");
    } catch (error) {
      toast.error(
        error?.message ||
          `Failed to delete item ${
            itemName?.name || ""
          }`
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Initial Fetch                                                          */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (initialFetchStarted.current) {
      return;
    }

    initialFetchStarted.current = true;

    if (items.length === 0) {
      dispatch(clearSearchedItems());
      fetchItems(10);
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Search                                                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const trimmedQuery =
      searchQuery.trim();

    if (trimmedQuery.length < 2) {
      dispatch(clearSearchedItems());
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);

    let requestPromise = null;

    const timer = setTimeout(() => {
      setIsDebouncing(false);

      requestPromise = dispatch(
        itemSearchReq({
          search: trimmedQuery,
          limit: 10,
          cursor: null,
        })
      );

      requestPromise
        .unwrap()
        .catch((err) => {
          if (
            err?.name === "AbortError" ||
            err === "Request canceled"
          ) {
            return;
          }

          toast.error(
            err?.message ||
              "Unable to search items"
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
        itemSearchReq({
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
        error?.message ||
          "Unable to load more items"
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Derived State                                                          */
  /* ---------------------------------------------------------------------- */

  const isSearching =
    searchQuery.trim().length >= 2;

  const displayedItems = isSearching
    ? searchedItems
    : items;

  const isInitialLoading =
    !isSearching &&
    itemLoading &&
    items.length === 0;

  const isInitialSearchLoading =
    isSearching &&
    (
      isDebouncing ||
      (
        searchLoading &&
        searchedItems.length === 0
      )
    );

  const isLoading =
    isInitialLoading ||
    isInitialSearchLoading;

  const showEmptyState =
    !isLoading &&
    !itemLoading &&
    !searchLoading &&
    displayedItems.length === 0;

  const isSearchActive =
    isDebouncing ||
    searchLoading;

  /* ---------------------------------------------------------------------- */
  /* Clear Search                                                           */
  /* ---------------------------------------------------------------------- */

  const handleClearSearch = () => {
    setSearchQuery("");
    dispatch(clearSearchedItems());
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
            <ShoppingBag
              className="text-orange-500"
              size={28}
            />

            All Items
          </h1>

          <p className="text-sm text-gray-500">
            Browse, manage, and configure your
            products, pricing, and active catalog
            items.
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
            placeholder="Search items by product name..."
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
              setSearchQuery(
                e.target.value
              )
            }
          />

          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={
                handleClearSearch
              }
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

        {/* Add Item */}
        <Button
          onClick={() => {
            navigate(
              "/user/add-items"
            );
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
          Add Items
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
        <InfiniteScroll
          dataLength={
            displayedItems.length
          }
          next={() => {
            if (isSearching) {
              searchPagination(
                10,
                searchNextCursor
              );
            } else {
              fetchItems(
                10,
                nextCursor
              );
            }
          }}
          hasMore={
            isSearchActive
              ? false
              : isSearching
              ? !searchIsEnd
              : !isEnd
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
                  Loading more items...
                </span>
              </div>
            </div>
          }
          endMessage={
            displayedItems.length >
            0 ? (
              <div className="py-5 text-center">
                <span className="text-[11px] text-slate-400">
                  You've reached the end
                  of the item list
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
            /* Empty State                                                 */
            /* ---------------------------------------------------------- */

            <EmptyState
              isSearching={isSearching}
              searchQuery={searchQuery}
              onAddItem={() =>
                navigate(
                  "/user/add-items"
                )
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
                <Table className="min-w-[1000px] w-full table-auto">
                  <TableHeader>
                    <TableRow className="bg-muted/60 hover:bg-muted/60">
                      <TableHead className="text-center min-w-[90px] w-[90px] px-4 whitespace-nowrap">
                        Product
                      </TableHead>

                      <TableHead className="text-center min-w-[280px] w-[280px] px-4 whitespace-nowrap">
                        Name
                      </TableHead>

                      <TableHead className="text-center min-w-[140px] w-[140px] px-4 whitespace-nowrap">
                        MRP
                      </TableHead>

                      <TableHead className="text-center min-w-[140px] w-[140px] px-4 whitespace-nowrap">
                        Price
                      </TableHead>

                      <TableHead className="text-center min-w-[120px] w-[120px] px-4 whitespace-nowrap">
                        Offer
                      </TableHead>

                      <TableHead className="text-center min-w-[70px] w-[70px] px-3" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {displayedItems.map(
                      (singleItem) => (
                        <CustomTableRow
                          key={
                            singleItem._id
                          }
                          singleItem={
                            singleItem
                          }
                          navigate={
                            navigate
                          }
                          setDialogOpen={
                            setDialogOpen
                          }
                          setItemName={
                            setItemName
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
                {displayedItems.map(
                  (singleItem) => (
                    <MobileItemCard
                      key={
                        singleItem._id
                      }
                      singleItem={
                        singleItem
                      }
                      navigate={
                        navigate
                      }
                      setDialogOpen={
                        setDialogOpen
                      }
                      setItemName={
                        setItemName
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
              setItemName("");
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
                <DialogTitle className="text-base font-bold text-gray-900 break-words">
                  Delete Item{" "}
                  {itemName?.name}?
                </DialogTitle>

                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                  This action will permanently
                  delete this item from your
                  catalog.
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
                setItemName("");
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
                min-w-[125px]
                bg-red-600
                hover:bg-red-700
                text-white
              "
              onClick={(e) =>
                handleDeleting(
                  e,
                  itemName?._id
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