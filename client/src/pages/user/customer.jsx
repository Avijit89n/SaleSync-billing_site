import React, { useEffect, useState } from "react"
import { ArrowUpDown, MoreHorizontal, Plus, Users, Search } from "lucide-react"

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
import { clearSearchedCustomers, customerSearchReq, getAllCustomerReq } from "@/redux/features/customerSlice"
import { useDispatch, useSelector } from "react-redux"
import InfiniteScroll from "react-infinite-scroll-component"
import Loader2 from '@/components/loaders/loader2'
import { toast } from "sonner"

const CustomTableRow = ({ singleItem, navigate }) => {
  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => { navigate(`/home/${singleItem._id}`) }}>
      <TableCell className="text-center truncate max-w-0 font-medium" title={singleItem.displayName}>
        {singleItem.displayName}
      </TableCell>
      <TableCell className="font-semibold text-blue-600 text-center truncate max-w-0" title={singleItem.workingPhone}>
        {singleItem.workingPhone}
      </TableCell>
      <TableCell className="text-center truncate max-w-0 text-gray-600" title={singleItem.email || "NaN"}>
        {singleItem.email || "NaN"}
      </TableCell>
      <TableCell className="text-center">
        <Badge className={`${singleItem.customerType === 'Individual' ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"} pointer-events-none`}>
          {singleItem.customerType}
        </Badge>
      </TableCell>
      <TableCell className="text-center truncate max-w-0">
        {(() => {
          const amount = Number(singleItem.totalSales || 0);
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "INR",
          }).format(amount)

          return <div className="text-center font-medium truncate">{formatted}</div>
        })()}
      </TableCell>
      <TableCell className="text-center truncate max-w-0">
        {(() => {
          const amount = Number(singleItem.pendingAmount || 0);
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "INR",
          }).format(amount)

          return <div className="text-center font-medium truncate">{formatted}</div>
        })()}
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

export default function Customer() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDebouncing, setIsDebouncing] = useState(false)
  const navigate = useNavigate();
  const dispatch = useDispatch();



  const {
    customers,
    isEnd,
    nextCursor,
    searchedCustomers,
    customerLoading,
    searchLoading,
    searchIsEnd,
    searchNextCursor
  } = useSelector(state => state.customer)

  const fetchCustomers = async (limit = 10, cursor = undefined) => {
    // Prevent function from running if an API call is already in progress
    if (customerLoading) return;

    await dispatch(getAllCustomerReq({ limit, lastCreatedAt: cursor }))
      .unwrap()
      .catch((error) => {
        toast.error(error.message || "Something went wrong");
      });
  }

  useEffect(() => {
    if (customers.length === 0) {
      fetchCustomers(10);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      dispatch(clearSearchedCustomers())
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    let requestPromise = null;

    const timer = setTimeout(() => {
      setIsDebouncing(false);
      requestPromise = dispatch(customerSearchReq({
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
    if (searchQuery.length < 2 || searchLoading) {
      return;
    }
    await dispatch(customerSearchReq({
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
  const isSearchActive = isDebouncing || searchLoading;

  return (
    <div className='opacity-0 animate-fade-in-scale transition-all duration-500 px-6 py-4 md:px-12 md:py-6'>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-7 gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-orange-500" size={28} /> All Customers
          </h1>
          <p className="text-sm text-gray-500">View and configure client ledger indices, communication endpoints, and billing targets.</p>
        </div>
      </div>

      <div className="flex items-center py-4 justify-between flex-wrap sm:flex-nowrap gap-2">
        <div className="relative max-w-sm w-full">
          <Input
            placeholder="Search by customer name / number..."
            className="w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => { navigate("/user/add-customer") }} className={"bg-orange-500 hover:bg-orange-600"}><Plus />Add Customer</Button>
      </div>

      <InfiniteScroll
        dataLength={
          isSearching
            ? searchedCustomers.length
            : customers.length
        }
        next={() => {
          if (isSearching) {
            searchPagination(10, searchNextCursor);
          } else {
            fetchCustomers(10, nextCursor);
          }
        }}
        hasMore={
          isSearchActive
            ? false
            : (isSearching ? !searchIsEnd : !isEnd)
        }
        loader={
          <div className="py-4 flex items-center justify-center w-full">
            <Loader2 />
          </div>
        }
      >
        {/* ADDED table-fixed class to lock structural rendering columns */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <Table className="min-w-[1000px] table-fixed">
            <TableHeader>
              <TableRow className="bg-muted/60">

                <TableHead className="min-w-[220px] text-center">
                  Name
                </TableHead>

                <TableHead className="text-center min-w-[150px] w-[150px]">
                  Phone Number
                </TableHead>

                <TableHead className="min-w-[250px]">
                  Email
                </TableHead>

                <TableHead className="text-center min-w-[120px] w-[120px]">
                  Type
                </TableHead>

                <TableHead className="text-center min-w-[140px] w-[140px]">
                  Total Sales
                </TableHead>

                <TableHead className="text-center min-w-[140px] w-[140px]">
                  Pending
                </TableHead>

                <TableHead className="text-center min-w-[60px] w-[60px]" />

              </TableRow>
            </TableHeader>
            <TableBody>
              {isDebouncing ||
                (searchLoading && searchedCustomers.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex items-center justify-center w-full h-full">
                      <Loader2 />
                    </div>
                  </TableCell>
                </TableRow>
              ) : isSearching ? (
                searchedCustomers.length > 0 ? (
                  searchedCustomers.map((singleItem) => (
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
                          No customers found
                        </p>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto">
                          We couldn't find anything matching "{searchQuery}".
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              ) : (
                customers.map((singleItem) => (
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