
import React, { useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const supportedLanguages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  // { code: "bn", label: "বাংলা" },
];

function LanguageSelector() {
  const { t, i18n } = useTranslation();

  const currentLang = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "en"
  ).split("-")[0];

  const selectedLanguage = supportedLanguages.some(
    (language) => language.code === currentLang
  )
    ? currentLang
    : "en";

  const handleLanguageChange = async (language) => {
    try {
      await i18n.changeLanguage(language);
    } catch (error) {
      console.error("Unable to change language:", error);
    }
  };

  return (
    <Select
      value={selectedLanguage}
      onValueChange={handleLanguageChange}
    >
      <SelectTrigger
        aria-label={t("sidebarLayout.selectLanguage")}
        className="h-10 w-auto min-w-[120px] max-w-[150px] gap-2 rounded-full border border-border/70 bg-background px-3 text-sm font-medium shadow-sm transition-all duration-200 hover:border-orange-500/40 hover:bg-orange-500/5 focus:ring-2 focus:ring-orange-500/20 sm:min-w-[145px]"
      >
        <Languages className="h-4 w-4 shrink-0 text-orange-500" />
        <SelectValue />
      </SelectTrigger>

      <SelectContent
        align="end"
        position="popper"
        className="min-w-[150px] rounded-xl border-border/70 p-1.5 shadow-lg"
      >
        {supportedLanguages.map((language) => (
          <SelectItem
            key={language.code}
            value={language.code}
            className="cursor-pointer rounded-lg py-2.5 focus:bg-orange-500/10 focus:text-orange-600"
          >
            {language.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function LayoutContent() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();
  const { t } = useTranslation();

  const pathNames = pathname.split("/").filter(Boolean);

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  const getRouteLabel = (path) => {
    const formattedPath = path
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return t(`sidebarLayout.routes.${path}`, {
      defaultValue: formattedPath,
    });
  };

  return (
    <>
      <AppSidebar />

      <SidebarInset className="min-w-0">
        <header className="flex h-16 items-center justify-between gap-2 px-3 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:px-4">
          <div className="flex min-w-0 items-center gap-2 overflow-hidden">
            <SidebarTrigger className="-ml-1 shrink-0" />

            <Separator
              orientation="vertical"
              className="h-4 shrink-0"
            />

            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={() => navigate(-1)}
              aria-label={t("sidebarLayout.goBack")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <Separator
              orientation="vertical"
              className="mr-1 h-4 shrink-0 sm:mr-2"
            />

            <Breadcrumb className="min-w-0 overflow-hidden">
              <BreadcrumbList className="flex-nowrap overflow-hidden">
                <BreadcrumbItem className="hidden shrink-0 md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/user/home">
                      {t("sidebarLayout.dashboard")}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {pathNames.length > 0 && (
                  <BreadcrumbSeparator className="hidden shrink-0 md:block" />
                )}

                {pathNames.map((path, index) => {
                  if (path === "user") return null;

                  const isLast = index === pathNames.length - 1;
                  let routeTo;

                  if (
                    ["edit-customer", "customer-information"].includes(path)
                  ) {
                    routeTo = "/user/customer";
                  } else if (path === "edit-item") {
                    routeTo = "/user/all-items";
                  } else if (path === "check-invoice") {
                    routeTo = "/user/all-invoices";
                  } else {
                    routeTo = `/${pathNames
                      .slice(0, index + 1)
                      .join("/")}`;
                  }

                  const isEditableRoute = [
                    "edit-customer",
                    "add-customer",
                    "edit-product",
                    "add-product",
                  ].includes(path);

                  const label = getRouteLabel(path);

                  return (
                    <React.Fragment key={`${path}-${index}`}>
                      <BreadcrumbItem className="hidden shrink-0 md:block">
                        {isLast && !isEditableRoute ? (
                          <BreadcrumbPage>{label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={routeTo}>{label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>

                      {!isLast && (
                        <BreadcrumbSeparator className="hidden shrink-0 md:block" />
                      )}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="ml-auto shrink-0">
            <LanguageSelector />
          </div>
        </header>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Outlet />
        </div>
      </SidebarInset>
    </>
  );
}

export default function SidebarLayout() {
  return (
    <SidebarProvider className="animate-fade-in-scale opacity-0 transition-all duration-500">
      <LayoutContent />
    </SidebarProvider>
  );
}
