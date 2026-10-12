import {
  ChartColumnIncreasing,
  BookOpen,
  PieChart,
  HomeIcon,
  User2,
  Banknote,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SideMain } from "./side-main.jsx";
import { SideHeader } from "./side-header.jsx";
import { SideFeatures } from "./side-features.jsx";
import { SideUser } from "./side-user.jsx";

export function AppSidebar() {
  const { t } = useTranslation();

  const data = {
    user: {
      name: "avijit89n",
      email: "avijit89n@gmail.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: t("Sidebar.Home", "Home"),
        url: "home",
        icon: HomeIcon,
      },
      {
        title: t("Sidebar.Customers", "Customers"),
        url: "customer",
        icon: User2,
      },
      {
        title: t("Sidebar.ProductCatalog", "Product Catalog"),
        icon: BookOpen,
        items: [
          {
            title: t("Sidebar.AllItems", "All Items"),
            url: "all-items",
          },
          {
            title: t("Sidebar.AddItems", "Add Items"),
            url: "add-items",
          },
        ],
      },
      {
        title: t("Sidebar.Chalan", "Invoices"),
        icon: FileText,
        items: [
          {
            title: t("Sidebar.AllChalans", "All Invoices"),
            url: "all-invoices",
          },
          {
            title: t("Sidebar.AddChalan", "Add Invoice"),
            url: "add-invoice",
          },
          {
            title: t("Sidebar.CustomizeChalan", "Customize Invoice"),
            url: "invoice-customizer",
          },
        ],
      },
      {
        title: t("Sidebar.Payments", "Payments"),
        icon: Banknote,
        items: [
          {
            title: t("Sidebar.AllPayments", "All Payments"),
            url: "all-payment",
          },
          {
            title: t("Sidebar.PaymentsDue", "Payments Due"),
            url: "due-payment",
          },
        ],
      },
    ],
    projects: [
      {
        name: t("Sidebar.Reports", "Reports"),
        url: "reports",
        icon: ChartColumnIncreasing,
      },
      {
        name: t("Sidebar.Expenses", "Expenses"),
        url: "expenses",
        icon: PieChart,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SideHeader />
      </SidebarHeader>
      <SidebarContent>
        <SideMain items={data.navMain} />
        <SideFeatures projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <SideUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
