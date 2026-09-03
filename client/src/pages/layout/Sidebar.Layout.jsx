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

import { Outlet, useLocation, Link } from "react-router-dom";
import React, { useEffect } from "react";

const formatPathName = (path) => {
  if (path === "edit-customer") {
    return "Customer";
  } else if (path === "add-customer") {
    return "Add Customer";
  } else if (path === "customer") {
    return "Customer";
  } else if (path === "edit-item") {
    return "All Items";
  } else {
    return path
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
};

function SidebarContent() {
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();

  const pathNames = pathname.split("/").filter((path) => path);

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <>
      <AppSidebar />

      <SidebarInset className="min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />

            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
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
                  if (path === "edit-customer") {
                    routeTo = "/user/customer";
                  } else if (path === "edit-item") {
                    routeTo = "/user/all-items";
                  } else {
                    routeTo = `/${pathNames
                      .slice(0, index + 1)
                      .join("/")}`;
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
                              <Link to={routeTo}>
                                {formatPathName(path)}
                              </Link>
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage>
                              {formatPathName(path)}
                            </BreadcrumbPage>
                          )
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={routeTo}>
                              {formatPathName(path)}
                            </Link>
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
    <SidebarProvider className="opacity-0 animate-fade-in-scale transition-all duration-500">
      <SidebarContent />
    </SidebarProvider>
  );
}