import React, { useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { AppSidebar } from "@/components/other-ui/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const formatPathName = (path) => {
  if (path === "edit-customer") {
    return "Customer";
  } else if (path === "add-customer") {
    return "Add Customer";
  } else if (path === "customer") {
    return "Customer";
  } else if (path === "edit-item") {
    return "All Items";
  } else if (path === "customer-information") {
    return "Customer";
  } else if (path === "check-invoice") {
    return "All Invoices";
  } else {
    return path
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
};

function SidebarContent() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();

  const pathNames = pathname.split("/").filter((path) => path);

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <>
      <AppSidebar />

      <SidebarInset className="min-w-0">
        <header className="flex h-16 items-center justify-between px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            
            <SidebarTrigger className="-ml-1" />

            <Separator
              orientation="vertical"
              className="h-4 data-[orientation=vertical]:h-4"
            />
            <Button
              variant="ghost"
              size="icon"
              className={"size-7"}
              onClick={() => navigate(-1)}
              >
              <ArrowLeft />
            </Button>

            <Separator
              orientation="vertical"
              className="mr-2 h-4 data-[orientation=vertical]:h-4"
            />

            <Breadcrumb>
              <BreadcrumbList>
                {/* Dashboard */}
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/user/home">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {pathNames.length > 0 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}

                {pathNames.map((path, index) => {
                  if (path === "user") return null;

                  const isLast = index === pathNames.length - 1;
                  let routeTo;

                  // Manually set routes
                  if (path === "edit-customer" || path === "customer-information") {
                    routeTo = "/user/customer";
                  } else if (path === "edit-item") {
                    routeTo = "/user/all-items";
                  } else if (path === "check-invoice") {
                    routeTo = "/user/all-invoices";
                  } else {
                    routeTo = `/${pathNames.slice(0, index + 1).join("/")}`;
                  }

                  return (
                    <React.Fragment key={`${path}-${index}`}>
                      <BreadcrumbItem className="hidden md:block">
                        {isLast ? (
                          path === "edit-customer" ||
                            path === "add-customer" ||
                            path === "edit-product" ||
                            path === "add-product" ? (
                            <BreadcrumbLink asChild>
                              <Link to={routeTo}>{formatPathName(path)}</Link>
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage>{formatPathName(path)}</BreadcrumbPage>
                          )
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={routeTo}>{formatPathName(path)}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>

                      {!isLast && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

        </header>

        <div className="flex flex-1 flex-col gap-4">
          <Outlet />
        </div>
      </SidebarInset>
    </>
  );
}

export default function SidebarLayout() {
  return (
    <SidebarProvider className="animate-fade-in-scale opacity-0 transition-all duration-500">
      <SidebarContent />
    </SidebarProvider>
  );
}