import React from 'react';
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
  AlertCircle
} from 'lucide-react';

// Custom UI Component Imports matching your setup
import { Button } from "@/components/ui/button";

// Exact uppercase context tags from your AddCustomer / Quotes layouts
const sectionHeadingCls = "text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 mb-6 flex items-center gap-2";

const mockStats = [
  { id: 1, title: "Total Revenue", value: "₹2,48,900", change: "+12.4%", isPositive: true, icon: DollarSign },
  { id: 2, title: "Paid Invoices", value: "114 Bills", change: "+8.2%", isPositive: true, icon: FileCheck },
  { id: 3, title: "Pending Bills", value: "28 Bills", change: "Awaiting", isPositive: false, icon: Clock },
  { id: 4, title: "Low Stock Items", value: "8 Products", change: "Critical", isPositive: false, icon: Package },
];

const mockInvoices = [
  { id: "INV-2026-001", client: "Acme Corporate Labs", date: "12 June 2026", amount: "₹45,000", status: "Paid" },
  { id: "INV-2026-002", client: "Globex Holdings", date: "14 June 2026", amount: "₹18,200", status: "Pending" },
  { id: "INV-2026-003", client: "Sora Tech Venture", date: "15 June 2026", amount: "₹8,900", status: "Overdue" },
];

const mockInventory = [
  { id: "ITEM-091", name: "Premium Enterprise Server Rack", sku: "SR-109-X", stock: 2, unit: "Pcs", status: "Critical" },
  { id: "ITEM-042", name: "Fiber Optic Terminals v4", sku: "FO-TERM-4", stock: 14, unit: "Boxes", status: "Healthy" },
  { id: "ITEM-112", name: "Gigabit Ethernet Switch 24P", sku: "SW-GIG-24", stock: 0, unit: "Pcs", status: "Out of Stock" },
];

const mockInvoiceSummaryGraph = [
  { label: "Fully Paid & Cleared", amount: "₹1,91,750", percentage: "77%", colorClass: "bg-orange-500" },
  { label: "Pending (Awaiting Payment)", amount: "₹42,150", percentage: "17%", colorClass: "bg-slate-700" },
  { label: "Overdue (Late Bills)", amount: "₹15,000", percentage: "6%", colorClass: "bg-rose-500" },
];

const mockProducts = [
  { name: "Cloud Architecture Audit Suite", sales: 84, revenue: "₹1,26,000" },
  { name: "Hardware Secure Hardware Token", sales: 62, revenue: "₹49,600" },
  { name: "Automated Compliance Ledger Module", sales: 31, revenue: "₹38,500" },
];

const mockActivities = [
  { id: 1, text: "Invoice INV-2026-003 sent out using Classic Blueprint template.", time: "12 mins ago" },
  { id: 2, text: "Received ₹18,200 cash payment from Globex Holdings.", time: "1 hour ago" },
  { id: 3, text: "Product stock for 'Gigabit Ethernet Switch' hit zero.", time: "3 hours ago" },
];

function Home() {
  const navigate = useNavigate();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="opacity-0 animate-fade-in-scale transition-all duration-500 bg-white min-h-screen text-slate-900 antialiased px-6 py-4 md:px-12 md:py-6 font-sans space-y-12">
      
      {/* ── High-Notice Highlighted Welcome Banner ── */}
      <div className="relative rounded-2xl bg-slate-900 p-6 md:p-8 text-white overflow-hidden shadow-sm border border-slate-900">
        {/* Subtle background matrix mesh matching your custom branding style */}
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
        {mockStats.map((stat) => {
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
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </h3>
                <div className="text-xs font-medium text-slate-400">
                  <span className={stat.isPositive ? "text-emerald-600 font-bold" : "text-orange-600 font-bold"}>
                    {stat.change}
                  </span>{" "}
                  vs last month
                </div>
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
              <TrendingUp size={13} strokeWidth={2.5} className="text-orange-500" /> Fiscal Sales Progression Volume
            </h2>
            <p className="text-sm text-slate-500 mb-6">Real-time status tracking of outbound revenue metrics collections across distribution timelines.</p>
          </div>

          <div className="relative w-full h-56 bg-slate-50/50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_2rem] opacity-40" />
            
            <svg className="absolute inset-x-0 bottom-0 w-full h-40 overflow-visible text-orange-500/5 drop-shadow-xs" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,80 Q15,40 30,60 T60,20 T90,35 T100,10 L100,100 L0,100 Z" fill="currentColor" />
              <path d="M0,80 Q15,40 30,60 T60,20 T90,35 T100,10" fill="none" stroke="#f97316" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            </svg>

            <div className="relative z-10 flex justify-between text-xs font-mono text-slate-400 font-bold">
              <span>Active Balance Collection Stream</span>
              <span>₹3,00,000 Max Cap</span>
            </div>
            
            <div className="relative z-10 flex justify-between items-center text-xs font-mono text-slate-600 font-bold border-t border-slate-200 pt-2 bg-white/90 backdrop-blur-xs px-1">
              <span>Q1 Init</span>
              <span>Q2 Progression</span>
              <span>Q3 Matrix Pipeline</span>
              <span>Q4 Boundary</span>
            </div>
          </div>
        </div>

        {/* Quick Shortcut Navigation Panel (Takes 4 Columns) */}
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

            <button onClick={() => navigate('/user/settings')} className="w-full text-left p-4 bg-white border border-slate-300 hover:border-orange-500 rounded-xl transition-all flex items-center justify-between group">
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

          <div className="text-xs bg-slate-50 rounded-lg border border-slate-200 p-3 text-slate-400 text-center font-semibold tracking-wide uppercase font-mono">
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
                  <th className="py-3 px-2">Counterparty Target</th>
                  <th className="py-3 px-2">Volume</th>
                  <th className="py-3 px-3 rounded-r-md text-right">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {mockInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900 group-hover:text-orange-500 transition-colors">{inv.id}</td>
                    <td className="py-3.5 px-2 text-slate-600 font-sans">{inv.client}</td>
                    <td className="py-3.5 px-2 font-bold text-slate-900">{inv.amount}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        inv.status === 'Paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                        inv.status === 'Pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                        'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Stock Table Card */}
        <div className="border border-slate-300 rounded-xl p-6 bg-white shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Package size={13} className="text-orange-500" strokeWidth={2.5} /> Asset Inventory Profile
            </h2>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
              Manage Warehouse <ArrowRight size={12} />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/60 border-b border-slate-200">
                  <th className="py-3 px-3 rounded-l-md">Asset Definition</th>
                  <th className="py-3 px-2">SKU Core</th>
                  <th className="py-3 px-2">Bal Metric</th>
                  <th className="py-3 px-3 rounded-r-md text-right">Risk Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {mockInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3 max-w-[160px] truncate font-bold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-2 font-mono text-slate-400 text-xs">{item.sku}</td>
                    <td className="py-3.5 px-2 font-bold text-slate-900">{item.stock} {item.unit}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                        item.status === 'Healthy' ? 'bg-slate-50 border-slate-200 text-slate-700' :
                        item.status === 'Critical' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                        'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
            <CreditCard size={13} strokeWidth={2.5} className="text-orange-500" /> Invoice Clear Progress
          </h2>
          <div className="space-y-4 pt-1">
            {mockInvoiceSummaryGraph.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span>{item.label}</span>
                  <span className="font-mono font-bold text-slate-900">{item.amount} ({item.percentage})</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${item.colorClass}`} 
                    style={{ width: item.percentage }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Asset Product Arrays */}
        <div className="border border-slate-300 rounded-xl p-5 bg-white shadow-2xs space-y-4">
          <h2 className={sectionHeadingCls}>
            <ShoppingBag size={13} strokeWidth={2.5} className="text-orange-500" /> Leaderboard Volume Generators
          </h2>
          <div className="space-y-1 divide-y divide-slate-100">
            {mockProducts.map((prod, i) => (
              <div key={i} className={`flex items-center justify-between text-xs py-3 ${i === 0 ? 'pt-0' : ''}`}>
                <div className="space-y-0.5 max-w-[200px]">
                  <h4 className="font-bold text-slate-800 truncate text-sm">{prod.name}</h4>
                  <p className="text-xs text-slate-400 font-medium">{prod.sales} Settlements Dispatched</p>
                </div>
                <span className="font-bold text-slate-900 shrink-0 text-sm font-sans">{prod.revenue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Operations Activity Logs Timeline Feed */}
        <div className="border border-slate-300 rounded-xl p-5 bg-white shadow-2xs space-y-4 md:col-span-2 xl:col-span-1">
          <h2 className={sectionHeadingCls}>
            <Activity size={13} strokeWidth={2.5} className="text-orange-500" /> Recent Action History
          </h2>
          <div className="space-y-4 relative before:absolute before:inset-y-1 before:left-3 before:w-0.5 before:bg-slate-100 pl-1">
            {mockActivities.map((act) => (
              <div key={act.id} className="relative flex gap-4 pl-6 text-xs">
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center shadow-2xs">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-slate-600 font-medium leading-relaxed text-xs">{act.text}</p>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Calendar size={11} /> {act.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

export default Home;