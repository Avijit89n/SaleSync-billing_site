import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ArrowRight,
  Package,
  CreditCard,
  Clock,
  ShoppingBag,
  Calendar,
  DollarSign,
  Activity,
  FileCheck,
  Plus,
  Settings,
  CheckCircle2,
  AlertCircle,
  IndianRupeeIcon,
  Users
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "@/axios/interceptor";
import { toast } from 'sonner';

// Custom UI Component Imports matching your setup
import { Button } from "@/components/ui/button";

// Exact uppercase context tags from your AddCustomer / Quotes layouts
const sectionHeadingCls = "text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 mb-6 flex items-center gap-2";

const mockStats = [
  { id: 1, title: "Total Revenue", value: "₹NaN", change: "NaN", isPositive: true, icon: IndianRupeeIcon },
  { id: 2, title: "Unpaid Amount", value: "₹NaN", change: "NaN", isPositive: false, icon: IndianRupeeIcon },
  { id: 3, title: "Paid Invoices", value: "NaN Bills", change: "NaN", isPositive: true, icon: FileCheck },
  { id: 4, title: "Pending Bills", value: "NaN Bills", change: "NaN", isPositive: false, icon: Clock },
];


function Home() {
  // Application Data States
  const [statData, setStatData] = useState(mockStats);
  const [recentInvoices, setRecentInvoices] = useState(null);
  const [topItems, setTopItems] = useState(null);
  const [lifetimeInvoiceSummary, setLifetimeInvoiceSummary] = useState(null);
  const [topCustomers, setTopCustomers] = useState(null);
  const [salesChartData, setSalesChartData] = useState(null);
  const [recentActivities, setRecentActivities] = useState(null);
  
  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

  const getstacks = async () => {
    try {
      const res = await api.get("/home/home-data");
      const data = res.data?.data;

      setStatData((prev) => [
        {
          ...prev[0],
          value:
            data?.revenue?.current != null
              ? `₹${data.revenue.current.toLocaleString("en-IN")}`
              : prev[0].value,
          change:
            data?.revenue?.percentage ?? prev[0].change,
          isPositive:
            data?.revenue?.isPositive ?? prev[0].isPositive,
        },
        {
          ...prev[1],
          value:
            data?.unpaidAmount?.current != null
              ? `₹${data.unpaidAmount.current.toLocaleString("en-IN")}`
              : prev[1].value,
          change:
            data?.unpaidAmount?.percentage ?? prev[1].change,
          isPositive:
            data?.unpaidAmount?.isPositive ?? prev[1].isPositive,
        },
        {
          ...prev[2],
          value:
            data?.paidBills?.current != null
              ? `${data.paidBills.current} Bills`
              : prev[2].value,
          change:
            data?.paidBills?.percentage ?? prev[2].change,
          isPositive:
            data?.paidBills?.isPositive ?? prev[2].isPositive,
        },
        {
          ...prev[3],
          value:
            data?.unpaidBills?.current != null
              ? `${data.unpaidBills.current} Bills`
              : prev[3].value,
          change:
            data?.unpaidBills?.percentage ?? prev[3].change,
          isPositive:
            data?.unpaidBills?.isPositive ?? prev[3].isPositive,
        },
      ]);
    } catch (error) {
      console.error("Error fetching home data:", error.response?.data || error.message);
      toast.error("Failed to fetch home data. Please try again later.");
    }
  };

  const getRecentInvoices = async () => {
    try {
      const res = await api.get("/home/get-recent-invoices");
      const data = res.data?.data;

      if (Array.isArray(data)) {
        setRecentInvoices(
          data.map((invoice) => ({
            id: invoice.invoiceNumber,
            client: invoice.customerName,
            date: new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            amount: `₹${Number(invoice.grandTotal || 0).toLocaleString("en-IN")}`,
            balance: Number(invoice.balanceAmount || 0),
            status: invoice.status,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching recent invoices:", error.response?.data || error.message);
      toast.error("Failed to fetch recent invoices. Please try again later.");
    }
  };

  const topSellingItems = async () => {
    try {
      const res = await api.get("/home/get-top-items");
      const data = res.data?.data;

      setTopItems(
        Array.isArray(data)
          ? data.map((item) => ({
            id: item.itemID,
            name: item.itemName,
            sales: item.totalQuantitySold,
            timesBilled: item.timesBilled,
            revenue:
              item.revenue != null
                ? `₹${Number(item.revenue || 0).toLocaleString("en-IN")}`
                : "₹0",
          }))
          : []
      );
    } catch (error) {
      console.error("Error fetching top selling items:", error.response?.data || error.message);
      setTopItems([]);
      toast.error("Failed to fetch top selling items. Please try again later.");
    }
  };

  const getLifetimeInvoiceSummary = async () => {
    try {
      const res = await api.get("/home/get-invoice-summary");
      const data = res.data?.data;

      if (data) {
        setLifetimeInvoiceSummary(data);
      } else {
        setLifetimeInvoiceSummary(null);
      }
    } catch (error) {
      console.error("Error fetching lifetime invoice summary:", error.response?.data || error.message);
      setLifetimeInvoiceSummary(null);
      toast.error("Failed to fetch lifetime invoice summary. Please try again later.");
    }
  };

  const getTopCustomers = async () => {
    try {
      const res = await api.get("/home/get-top-customers");
      const data = res.data?.data;
      setTopCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching top customers:", error.response?.data || error.message);
      setTopCustomers([]);
      toast.error("Failed to fetch top customers. Please try again later.");
    }
  };

  const getSalesChartData = async () => {
    try {
      const res = await api.get("/home/get-chart");
      const data = res.data;
      setSalesChartData(data || null);
    } catch (error) {
      console.error("Error fetching sales chart data:", error.response?.data || error.message);
      setSalesChartData(null);
      toast.error("Failed to fetch sales chart data. Please try again later.");
    }
  };


  const getRecentActivities = async () => {
    try {
      const res = await api.get("/home/get-recent-activities");
      const data = res.data?.data;

      setRecentActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Error fetching recent activities:",
        error.response?.data || error.message
      );

      setRecentActivities([]);
      toast.error("Failed to fetch recent activities.");
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      
      // Load all endpoint data concurrently
      await Promise.allSettled([
        getstacks(),
        getRecentInvoices(),
        topSellingItems(),
        getLifetimeInvoiceSummary(),
        getTopCustomers(),
        getSalesChartData(),
        getRecentActivities()
      ]);
      
      setIsLoading(false);
    };

    fetchAllData();
  }, []);

  return (
    <div className="opacity-0 animate-fade-in-scale transition-all duration-500 bg-white min-h-screen text-slate-900 antialiased px-6 py-4 md:px-12 md:py-6 font-sans space-y-12">

      {/* ── High-Notice Highlighted Welcome Banner ── */}
      <div className="relative rounded-2xl bg-slate-900 p-6 md:p-8 text-white overflow-hidden shadow-sm border border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400 font-mono bg-white/10 px-2.5 py-1 rounded inline-block">
              Operational Management Console
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              {greeting}, Workspace Administrator
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed font-medium">
              Your distribution frameworks and billing endpoints are fully operational. All metrics sync directly with your system variables.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-end">
            <Button
              type="button"
              className="bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm h-11 px-6 rounded-xl transition-all shadow-md shadow-orange-600/10 flex items-center gap-2 group justify-center w-full sm:w-auto"
              onClick={() => navigate('/user/add-invoice')}
            >
              <Plus size={16} strokeWidth={2.5} /> Create Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* ── Statistics Grid Cards (Clean Flat Borders) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statData.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div key={stat.id} className="border border-slate-300 rounded-xl p-5 bg-white shadow-2xs flex flex-col justify-between hover:border-orange-500 transition-colors group">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {stat.title}
                </span>
                <div className="p-2 bg-slate-50 rounded-lg text-slate-700 border border-slate-200 group-hover:border-orange-500/20 group-hover:bg-orange-50/20 group-hover:text-orange-500 transition-all">
                  <StatIcon size={16} />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                {isLoading ? (
                  <div className="space-y-2 py-1">
                    <div className="h-7 w-1/2 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                      {stat.value}
                    </h3>
                    <div className="text-xs font-medium text-slate-400">
                      <span className={stat.isPositive ? "text-emerald-600 font-bold" : "text-orange-600 font-bold"}>
                        {stat.change}%
                      </span>{" "}
                      vs last month
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Mid Workspace Section Split Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* Simple Analytics Metrics Representation Container (Takes 8 Columns) */}
        <div className="lg:col-span-8 border border-slate-300 rounded-xl p-6 bg-white shadow-2xs flex flex-col justify-between">
          <div className="w-full">
            <h2 className={sectionHeadingCls}>
              <TrendingUp size={13} strokeWidth={2.5} className="text-orange-500" />
              Fiscal Sales Progression Volume
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Monthly revenue and collection performance for the current year.
            </p>
          </div>

          {isLoading ? (
            <div className="relative w-full h-64 bg-slate-50/50 rounded-xl border border-slate-200 p-4 flex items-center justify-center animate-pulse">
               <Activity size={32} className="text-slate-300 animate-pulse" />
            </div>
          ) : salesChartData === null ? (
            <div className="relative w-full h-56 bg-slate-50/50 rounded-xl border border-slate-200 flex items-center justify-center">
              <p className="text-sm text-slate-400">
                No data found
              </p>
            </div>
          ) : (
            <div className="relative w-full h-64 bg-slate-50/50 rounded-xl border border-slate-200 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={salesChartData.data}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="totalRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="collectedRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#475569" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => {
                      if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
                      if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
                      return `₹${value}`;
                    }}
                  />
                  <Tooltip
                    cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                    contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "12px" }}
                    formatter={(value, name) => [
                      `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
                      name === "totalRevenue" ? "Total Revenue" : "Collected Revenue",
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={30}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}
                    formatter={(value) => value === "totalRevenue" ? "Total Revenue" : "Collected" }
                  />
                  <Area type="monotone" dataKey="totalRevenue" stroke="#f97316" strokeWidth={2} fill="url(#totalRevenueGradient)" dot={{ r: 3, fill: "#f97316", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  <Area type="monotone" dataKey="collectedRevenue" stroke="#475569" strokeWidth={2} fill="url(#collectedRevenueGradient)" dot={{ r: 3, fill: "#475569", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Quick Shortcut Navigation Panel */}
        <div className="lg:col-span-4 border border-slate-300 rounded-xl p-6 bg-white shadow-2xs flex flex-col justify-between">
          <div className="w-full">
            <h2 className={sectionHeadingCls}>
              <Activity size={13} strokeWidth={2.5} className="text-orange-500" /> Operational Shortcuts
            </h2>
            <p className="text-sm text-slate-500 mb-4">Fast structural shortcuts to jump inside primary data registers.</p>
          </div>

          <div className="space-y-4 my-auto w-full">
            <button onClick={() => navigate('/user/all-items')} className="w-full text-left p-4 bg-white border border-slate-300 hover:border-orange-500 rounded-xl transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-orange-50/50 group-hover:text-orange-500 transition-colors border border-slate-200"><Package size={16} /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Launch Inventory System</h4>
                  <p className="text-xs text-slate-400 font-medium">Verify structural stock balances</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-orange-500 transform group-hover:translate-x-0.5 transition-all" />
            </button>

            <button onClick={() => navigate('/user/invoice-customizer')} className="w-full text-left p-4 bg-white border border-slate-300 hover:border-orange-500 rounded-xl transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-orange-50/50 group-hover:text-orange-500 transition-colors border border-slate-200"><Settings size={16} /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Configure Invoice Layouts</h4>
                  <p className="text-xs text-slate-400 font-medium">Alter default template blueprints</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-orange-500 transform group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          <div className="text-xs bg-slate-50 rounded-lg border lg:mt-0 mt-3 border-slate-200 p-3 text-slate-400 text-center font-semibold tracking-wide uppercase font-mono">
            SSL SECURE NODE: SYNCED
          </div>
        </div>
      </div>

      {/* ── Ledger Tables Split Interface ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recent Invoices Card */}
        <div className="border border-slate-300 rounded-xl p-6 bg-white shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <FileCheck size={13} className="text-orange-500" strokeWidth={2.5} /> Recent Invoices Distribution
            </h2>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
              View All Registry <ArrowRight size={12} />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/60 border-b border-slate-200">
                  <th className="py-3 px-3 rounded-l-md">Invoice ID</th>
                  <th className="py-3 px-2">Customer Name</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-3 rounded-r-md text-right">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {isLoading ? (
                  Array(4).fill(0).map((_, index) => (
                    <tr key={`skeleton-inv-${index}`}>
                      <td className="py-3.5 px-3"><div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div></td>
                      <td className="py-3.5 px-2"><div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div></td>
                      <td className="py-3.5 px-2"><div className="h-4 w-16 bg-slate-200 rounded animate-pulse"></div></td>
                      <td className="py-3.5 px-3 text-right"><div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse ml-auto"></div></td>
                    </tr>
                  ))
                ) : recentInvoices === null ? (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-slate-500 font-medium">No Invoices Found</td>
                  </tr>
                ) : (
                  recentInvoices?.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900 group-hover:text-orange-500 transition-colors">{inv.id}</td>
                      <td className="py-3.5 px-2 text-slate-600 font-sans">{inv.client}</td>
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-slate-900">{inv.amount}</div>
                        {inv.balance > 0 && <div className="text-[10px] font-medium text-slate-400 mt-0.5">Due: ₹{inv.balance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          inv.status === 'Paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          inv.status === 'Partially Paid' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                          inv.status === 'Unpaid' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                          'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers Table Card */}
        <div className="border border-slate-300 rounded-xl p-6 bg-white shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Users size={13} className="text-orange-500" strokeWidth={2.5} /> Top Customers
            </h2>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
              View All Customers <ArrowRight size={12} />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/60 border-b border-slate-200">
                  <th className="py-3 px-3 rounded-l-md">Customer</th>
                  <th className="py-3 px-2">Bills</th>
                  <th className="py-3 px-2">Total Amount</th>
                  <th className="py-3 px-3 rounded-r-md text-right">Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {isLoading ? (
                  Array(4).fill(0).map((_, index) => (
                    <tr key={`skeleton-cust-${index}`}>
                      <td className="py-3.5 px-3"><div className="h-4 w-28 bg-slate-200 rounded animate-pulse"></div></td>
                      <td className="py-3.5 px-2"><div className="h-4 w-10 bg-slate-200 rounded animate-pulse"></div></td>
                      <td className="py-3.5 px-2"><div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div></td>
                      <td className="py-3.5 px-3 text-right"><div className="h-5 w-12 bg-slate-200 rounded-md animate-pulse ml-auto"></div></td>
                    </tr>
                  ))
                ) : topCustomers === null || topCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-slate-500 font-medium">No data found</td>
                  </tr>
                ) : (
                  topCustomers.map((customer, index) => (
                    <tr key={customer.customerID} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-3 max-w-[180px]">
                        <div className="truncate font-bold text-slate-900" title={customer.customerName}>
                          {customer.customerName}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 font-bold text-slate-900">{customer.totalBills}</td>
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-slate-900">
                          ₹{Number(customer.totalAmount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </div>
                        {customer.totalBalance > 0 && (
                          <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                            Due: ₹{Number(customer.totalBalance || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-md border ${index === 0
                            ? "bg-orange-50 border-orange-200 text-orange-600"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}>
                          #{index + 1}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Bottom Analytics Tri-Split ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Invoice Clear Progress Bar Trackers */}
<div className="border border-slate-300 rounded-xl p-5 bg-white shadow-2xs space-y-4">
  <h2 className={sectionHeadingCls}>
    <CreditCard
      size={13}
      strokeWidth={2.5}
      className="text-orange-500"
    />
    Invoice Clear Progress
  </h2>
  {isLoading ? (
    <div className="space-y-5 pt-1">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <div
            key={`skeleton-prog-${i}`}
            className="space-y-2.5"
          >
            <div className="flex justify-between">
             <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
           <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-slate-200 animate-pulse rounded-full" />
            </div>
          </div>
        ))}
    </div>
  ) : lifetimeInvoiceSummary === null ? (
    <div className="py-8 text-center text-sm text-slate-400">
      No data found
    </div>
  ) : (
    <div className="space-y-5 pt-1">
<div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Lifetime Invoiced
          </p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">
            ₹{Number(
              lifetimeInvoiceSummary.totalLifetimeAmount || 0
            ).toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Cleared
          </p>
          <p className="text-sm font-bold text-emerald-600 mt-0.5">
            ₹{Number(
              lifetimeInvoiceSummary.totalClearedAmount || 0
            ).toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-slate-600">
              Fully Paid & Cleared
            </span>
          </div>
          <div className="text-right">
            <span className="font-mono text-slate-900">
              ₹{Number(
                lifetimeInvoiceSummary.fullyPaid?.amount || 0
              ).toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-slate-400 ml-1">
              (
              {Number(
                lifetimeInvoiceSummary.fullyPaid?.bills || 0
              )}
              {" "}
              {Number(
                lifetimeInvoiceSummary.fullyPaid?.bills || 0
              ) === 1
                ? "bill"
                : "bills"}
              )
            </span>
          </div>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(
                Math.max(
                  Number(
                    lifetimeInvoiceSummary.fullyPaid?.percentage || 0
                  ),
                  0
                ),
                100
              )}%`,
            }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-start text-xs font-bold gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
            <span className="text-slate-600">
              Partially Paid
            </span>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono text-slate-900">
              ₹{Number(
                lifetimeInvoiceSummary.partiallyPaid?.clearedAmount || 0
              ).toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
              <span className="text-slate-400">
                {" "}
                cleared
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              {Number(
                lifetimeInvoiceSummary.partiallyPaid?.bills || 0
              )}
              {" "}
              {Number(
                lifetimeInvoiceSummary.partiallyPaid?.bills || 0
              ) === 1
                ? "bill"
                : "bills"}
              {" · "}
              ₹{Number(
                lifetimeInvoiceSummary.partiallyPaid?.remainingAmount || 0
              ).toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
              {" "}
              remaining
            </div>
          </div>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(
                Math.max(
                  Number(
                    lifetimeInvoiceSummary.partiallyPaid?.clearedPercentage || 0
                  ),
                  0
                ),
                100
              )}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>
            Invoiced: ₹{Number(
              lifetimeInvoiceSummary.partiallyPaid?.invoicedAmount || 0
            ).toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </span>
          <span>
            {Number(
              lifetimeInvoiceSummary.partiallyPaid?.clearedPercentage || 0
            ).toFixed(1)}
            % cleared
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-700" />
            <span className="text-slate-600">
              Pending / Awaiting Payment
            </span>
          </div>
          <div className="text-right">
            <span className="font-mono text-slate-900">
              ₹{Number(
                lifetimeInvoiceSummary.pending?.amount || 0
              ).toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-slate-400 ml-1">
              (
              {Number(
                lifetimeInvoiceSummary.pending?.bills || 0
              )}
              {" "}
              {Number(
                lifetimeInvoiceSummary.pending?.bills || 0
              ) === 1
                ? "bill"
                : "bills"}
              )
            </span>
          </div>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <div
          className="h-full bg-slate-700 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(
                Math.max(
                  Number(
                    lifetimeInvoiceSummary.pending?.percentage || 0
                  ),
                  0
                ),
                100
              )}%`,
            }}
          />

        </div>

      </div>


      <div className="space-y-2">

        <div className="flex justify-between items-center text-xs font-bold">

          <div className="flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-rose-500" />

            <span className="text-slate-600">
              Overdue / Late Bills
            </span>

          </div>


          <div className="text-right">

            <span className="font-mono text-rose-600">

              ₹{Number(
                lifetimeInvoiceSummary.overdue?.amount || 0
              ).toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}

            </span>

            <span className="text-slate-400 ml-1">
              (
              {Number(
                lifetimeInvoiceSummary.overdue?.bills || 0
              )}
              {" "}
              {Number(
                lifetimeInvoiceSummary.overdue?.bills || 0
              ) === 1
                ? "bill"
                : "bills"}
              )
            </span>

          </div>

        </div>


        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">

          <div
            className="h-full bg-rose-500 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(
                Math.max(
                  Number(
                    lifetimeInvoiceSummary.overdue?.percentage || 0
                  ),
                  0
                ),
                100
              )}%`,
            }}
          />

        </div>

      </div>

      <div className="pt-3 border-t border-slate-100">

        <div className="flex justify-between items-center">

          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Outstanding
          </span>

          <span className="text-sm font-bold text-slate-900 font-mono">

            ₹{Number(
              lifetimeInvoiceSummary.totalRemainingAmount || 0
            ).toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}

          </span>

        </div>

      </div>

    </div>

  )}

</div>


        {/* Top Performing Asset Product Arrays */}
        <div className="border border-slate-300 rounded-xl p-5 bg-white shadow-2xs space-y-4">
          <h2 className={sectionHeadingCls}>
            <ShoppingBag size={13} strokeWidth={2.5} className="text-orange-500" /> Leaderboard Volume Generators
          </h2>

          {isLoading ? (
            <div className="space-y-1 divide-y divide-slate-100">
              {Array(6).fill(0).map((_, i) => (
                <div key={`skeleton-item-${i}`} className={`flex items-center justify-between py-3 ${i === 0 ? "pt-0" : ""}`}>
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-3 w-24 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-16 bg-slate-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : topItems === null || topItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">No data found</div>
          ) : (
            <div className="space-y-1 divide-y divide-slate-100">
              {topItems.map((prod, i) => (
                <div key={prod.id} className={`flex items-center justify-between text-xs py-3 ${i === 0 ? "pt-0" : ""}`}>
                  <div className="space-y-0.5 max-w-[200px] min-w-0">
                    <h4 className="font-bold text-slate-800 truncate text-sm" title={prod.name}>
                      {prod.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      {prod.sales} units sold · {prod.timesBilled} bills
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0 text-sm font-sans">
                    {prod.revenue}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operations Activity Logs Timeline Feed */}
        <div className="border border-slate-300 rounded-xl p-5 bg-white shadow-2xs space-y-4 md:col-span-2 xl:col-span-1">
          <h2 className={sectionHeadingCls}>
            <Activity size={13} strokeWidth={2.5} className="text-orange-500" />
            Recent Action History
          </h2>

          {isLoading ? (
            <div className="space-y-5 relative before:absolute before:inset-y-1 before:left-3 before:w-0.5 before:bg-slate-100 pl-1">
              {Array(4).fill(0).map((_, index) => (
                <div
                  key={`activity-skeleton-${index}`}
                  className="relative flex gap-4 pl-6"
                >
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white border-2 border-slate-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
                    <div className="h-2.5 w-20 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivities === null ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No activity data
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="py-8 text-center">
              <Activity size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-400">
                No recent activity
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Invoice and payment activity will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-5 relative before:absolute before:inset-y-1 before:left-3 before:w-0.5 before:bg-slate-100 pl-1">
              {recentActivities.map((act) => {
                const type = act.type || "activity";
                const isOverdue = type === "overdue";
                const isCompleted = type === "payment-complete";
                const isPartial = type === "partial";
                const isPayment = type === "payment";

                const dotColor = isOverdue
                  ? "border-rose-500"
                  : isCompleted
                  ? "border-emerald-500"
                  : isPartial
                  ? "border-amber-500"
                  : "border-orange-500";

                const innerDotColor = isOverdue
                  ? "bg-rose-500"
                  : isCompleted
                  ? "bg-emerald-500"
                  : isPartial
                  ? "bg-amber-500"
                  : "bg-orange-500";

                const titleColor = isOverdue
                  ? "text-rose-600"
                  : isCompleted
                  ? "text-emerald-600"
                  : isPartial
                  ? "text-amber-600"
                  : isPayment
                  ? "text-slate-800"
                  : "text-slate-700";

                return (
                  <div
                    key={act.id}
                    className="relative flex gap-4 pl-6 text-xs"
                  >
                    <div
                      className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white border-2 flex items-center justify-center shadow-2xs ${dotColor}`}
                    >
                      <div className={`h-1.5 w-1.5 rounded-full ${innerDotColor}`} />
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <p className={`font-bold leading-snug text-xs ${titleColor}`}>
                        {act.title || "Recent activity"}
                      </p>

                      <p className="text-slate-500 font-medium leading-relaxed break-words">
                        {act.description || ""}
                      </p>

                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar size={10} />
                        {act.time || "Just now"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;