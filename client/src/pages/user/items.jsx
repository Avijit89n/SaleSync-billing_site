import React, { useEffect, useState } from "react"
import { ArrowUpDown, MoreHorizontal, Plus, Search, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { clearSearchedItems, getAllItemReq, itemSearchReq } from "@/redux/features/itemSlice.js"
import InfiniteScroll from "react-infinite-scroll-component"
import Loader2 from '@/components/loaders/loader2'
import { toast } from "sonner"

const discountCalculate = (MRP, sellingPrice) => {
  if (!MRP || !sellingPrice) return 0;
  const discount = ((MRP - sellingPrice) / MRP) * 100
  return discount.toFixed(0);
}

const CustomTableRow = ({ singleItem, navigate }) => {
  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => { navigate(`/home/item-info?id=${singleItem._id}`) }}>
      <TableCell className="flex justify-center items-center">
        <div className="h-10 w-10 justify-center flex items-center rounded-lg bg-gray-200 shrink-0">
          <img loading="lazy" className="h-8 w-8 rounded-md object-cover" src={singleItem.image} alt="" />
        </div>
      </TableCell>

      <TableCell className="text-center truncate max-w-0 font-medium" title={singleItem.name}>
        {singleItem.name}
      </TableCell>

      <TableCell className={`${singleItem.stock > 40 ? "text-green-500" : singleItem.stock > 10 ? "text-amber-500" : "text-red-500"} font-semibold text-center truncate max-w-0`}>
        {singleItem.stock}
      </TableCell>

      <TableCell className="text-center truncate max-w-0">
        {(() => {
          const amount = Number(singleItem.sellingPrice || 0);
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "INR",
          }).format(amount)

          return <div className="text-center font-medium truncate">{formatted}</div>
        })()}
      </TableCell>

      <TableCell className="text-center">
        <Badge className={`capitalize pointer-events-none ${singleItem.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {singleItem.status}
        </Badge>
      </TableCell>

      <TableCell className="text-center text-xs font-semibold text-orange-600 truncate max-w-0">
        {discountCalculate(singleItem.MRP, singleItem.sellingPrice)}% Off
      </TableCell>

      <TableCell onClick={(e) => e.stopPropagation()} className="text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-200">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Change Status</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export default function Items() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("")
  const [isDebouncing, setIsDebouncing] = useState(false)

  const {
    items,
    searchedItems,
    isEnd,
    searchLoading,
    nextCursor,
    itemLoading,
    searchIsEnd,
    searchNextCursor
  } = useSelector(state => state.item)

  const fetchItems = async (limit = 10, cursor = undefined) => {
    // Prevent duplicate API calls if already loading
    if (itemLoading) return;

    console.log("Fetching items with cursor:", cursor);
    await dispatch(getAllItemReq({ limit, lastCreatedAt: cursor }))
      .unwrap()
      .catch((error) => {
        console.log(error)
        toast.error(error.message || "Something went wrong");
      });
  }

  useEffect(() => {
    if (items.length === 0) {
      dispatch(clearSearchedItems())
      fetchItems(10);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      dispatch(clearSearchedItems())
      setIsDebouncing(false)
      return;
    }

    setIsDebouncing(true)
    let requestPromise = null;

    const timer = setTimeout(() => {
      setIsDebouncing(false)
      requestPromise = dispatch(itemSearchReq({
        search: searchQuery,
        limit: 10,
        cursor: null
      }));

      requestPromise
        .unwrap()
        .catch((err) => {
          if (err.name === 'AbortError' || err === "Request canceled") {
            return;
          }
          toast.error(err.message || "Something went wrong");
        });

    }, 300);

    return () => {
      clearTimeout(timer);
      if (requestPromise) {
        requestPromise.abort();
      }
    };
  }, [searchQuery]);

  const searchPagination = async (limit = 10, cursor) => {
    // Check searchLoading to prevent overlapping pagination
    if (searchQuery.length < 2 || searchLoading) {
      return;
    }

    await dispatch(itemSearchReq({
      search: searchQuery,
      limit,
      cursor
    }))
      .unwrap()
      .catch((error) => {
        toast.error(error.message || "Something went wrong");
      });
  }

  const isSearching = searchQuery.length >= 2;

  // FIX: This flag monitors if any type of search initialization is ongoing
  const isSearchActive = isDebouncing || searchLoading;

  return (
    <div className="opacity-0 animate-fade-in-scale transition-all duration-500 px-6 py-4 md:px-12 md:py-6">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-7 gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="text-orange-500" size={28} /> All Items
          </h1>
          <p className="text-sm text-gray-500">Browse, manage, and configure client product definitions, physical ledger stock indices, and active catalog targets.</p>
        </div>
      </div>

      <div className="flex items-center py-4 justify-between flex-wrap sm:flex-nowrap gap-2">
        <div className="relative max-w-sm w-full">
          <Input
            placeholder="Search items by product name..."
            className="w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => { navigate("/user/add-items") }} className={"bg-orange-500 hover:bg-orange-600"}><Plus />Add Items</Button>
      </div>

      <InfiniteScroll
        dataLength={isSearching ? searchedItems.length : items.length}
        next={() => {
          if (isSearching) {
            searchPagination(10, searchNextCursor);
          } else {
            fetchItems(10, nextCursor);
          }
        }}
        // FIX: If search is active, force hasMore to false so the bottom loader turns off
        hasMore={
          isSearchActive
            ? false
            : (isSearching ? !searchIsEnd : !isEnd)
        }
        loader={
          <Table className="table-fixed w-full border-t border-transparent">
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center">
                  <div className="flex items-center justify-center w-full">
                    <Loader2 />
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <Table className="min-w-[900px] table-fixed">
            <TableHeader>
              <TableRow className="bg-muted/60">

                <TableHead className="text-center min-w-[80px] w-[80px]">
                  Product
                </TableHead>

                <TableHead className="min-w-[250px] text-center">
                  Name
                </TableHead>

                <TableHead className="text-center min-w-[100px] w-[100px]">
                  Stock
                </TableHead>

                <TableHead className="text-center min-w-[120px] w-[120px]">
                  Price
                </TableHead>

                <TableHead className="text-center min-w-[120px] w-[120px]">
                  Status
                </TableHead>

                <TableHead className="text-center min-w-[100px] w-[100px]">
                  Offer
                </TableHead>

                <TableHead className="text-center min-w-[60px] w-[60px]" />

              </TableRow>
            </TableHeader>
            <TableBody>
              {isSearchActive ? (
                /* The single primary loader inside the table grid */
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex items-center justify-center w-full h-full">
                      <Loader2 />
                    </div>
                  </TableCell>
                </TableRow>
              ) : isSearching ? (
                searchedItems.length > 0 ? (
                  searchedItems.map((singleItem) => (
                    <CustomTableRow
                      key={singleItem._id}
                      singleItem={singleItem}
                      navigate={navigate}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 text-gray-400">
                        <Search size={36} className="text-gray-300 stroke-[1.5]" />
                        <p className="text-base font-medium text-gray-600">
                          No items found
                        </p>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto">
                          We couldn't find anything matching "{searchQuery}".
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              ) : (
                items.map((singleItem) => (
                  <CustomTableRow
                    key={singleItem._id}
                    singleItem={singleItem}
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