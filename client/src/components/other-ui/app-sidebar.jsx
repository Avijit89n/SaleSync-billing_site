import { ChartColumnIncreasing, BookOpen, PieChart, HomeIcon, User2, ShoppingCart, Banknote, FileText } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { SideMain } from "./side-main.jsx"
import { SideHeader } from "./side-header.jsx"
import { SideFeatures } from "./side-features.jsx"
import { SideUser } from "./side-user.jsx"

const data = {
  user: {
    name: "avijit89n",
    email: "avijit89n@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "home",
      icon: HomeIcon,
    },
    {
      title: "Customers",
      url: "customer",
      icon: User2
    },
    {
      title: "Product Catelog",
      icon: BookOpen,
      items: [
        {
          title: "All Items",
          url: "all-items",
        },
        {
          title: "Add Items",
          url: "add-items",
        }
      ],
    },
    {
      title: "Invoice",
      icon: FileText,
      items: [
        {
          title: "All Invoices",
          url: "all-invoices",
        },
        {
          title: "Add Invoice",
          url: "add-invoice",
        },
        {
          title: "Customize Invoice",
          url: "invoice-customizer",
        },
        
      ],
    },
    {
      title: "Payments",
      icon: Banknote,
      items: [
        {
          title: "All Payments",
          url: "all-payment",
        },
        {
          title: "Payments Due",
          url: "due-payment",
        }
      ],
    },
  ],
  projects: [
    {
      name: "Reports",
      url: "reports",
      icon: ChartColumnIncreasing,
    },
    {
      name: "Expenses",
      url: "expenses",
      icon: PieChart,
    }
  ],
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" >
      <SidebarHeader>
        <SideHeader/>
      </SidebarHeader>
      <SidebarContent>
        <SideMain items={data.navMain}/>
        <SideFeatures projects={data.projects}/>
      </SidebarContent>
      <SidebarFooter>
        <SideUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}