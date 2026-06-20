import { AppSidebar } from "@/components/other-ui/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Outlet, useLocation, Link } from "react-router-dom"
import React from "react"

const formatPathName = (path) => {
  return path
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};


export default function SidebarLayout() {
  const { pathname } = useLocation();
  const pathNames = pathname.split("/").filter((path) => path);


  return (
    <SidebarProvider className={"opacity-0 animate-fade-in-scale transition-all duration-500"}>
      <AppSidebar />
      <SidebarInset className={"min-w-0"}>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/user/home">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {pathNames.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                {pathNames.map((path, index) => {
                  const routeTo = `/${pathNames.slice(0, index + 1).join("/")}`;
                  const isLast = index === pathNames.length - 1;
                  if (path === "user") return null;

                  return (
                    <React.Fragment key={path}>
                      <BreadcrumbItem className="hidden md:block">
                        {isLast ? (
                          <BreadcrumbPage>{formatPathName(path)}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={routeTo}>{formatPathName(path)}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
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
    </SidebarProvider>
  )
}