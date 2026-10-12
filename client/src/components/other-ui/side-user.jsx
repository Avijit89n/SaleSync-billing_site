import {
  ChevronsUpDown,
  CircleCheck,
  LogOut,
  User,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { userLogoutReq } from "@/redux/features/authSlice";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function SideUser() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { isMobile } = useSidebar();
  const dispatch = useDispatch();
  const [logoutDialog, setLogoutDialog] = useState(false);

  const handleLogout = async () => {
    toast.promise(dispatch(userLogoutReq()).unwrap(), {
      loading: t("Sidebar.LoggingOut", "Logging out..."),
      success: (res) =>
        res?.message || t("Sidebar.LogoutSuccessful", "Logout successful"),
      error: (err) =>
        err?.message || t("Sidebar.SomethingWentWrong", "Something went wrong"),
    });
  };

  const fullName = user?.fullName || "";
  const email = user?.email || "";
  const avatar = user?.avatar || "";

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatar} alt={fullName} />
                  <AvatarFallback className="rounded-lg bg-orange-100 text-orange-600">
                    {fullName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullName}</span>
                  <span className="truncate text-xs">{email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={avatar} alt={fullName} />
                    <AvatarFallback className="rounded-lg bg-orange-100 text-orange-600">
                      {fullName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{fullName}</span>
                    <span className="truncate text-xs">{email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <NavLink to="account">
                    <User />
                    {t("Sidebar.Account", "Account")}
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="approvals">
                    <CircleCheck />
                    {t("Sidebar.Approvals", "Approvals")}
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="all-users">
                    <Users />
                    {t("Sidebar.AllUsers", "All Users")}
                  </NavLink>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setLogoutDialog(true);
                }}
                variant="destructive"
              >
                <LogOut />
                {t("Sidebar.LogOut", "Log out")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={logoutDialog} onOpenChange={setLogoutDialog}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-[26px] border border-slate-200 bg-white p-0 shadow-[0_25px_70px_rgba(15,23,42,0.20)] sm:rounded-[32px]">
          <div className="h-24 w-full bg-gradient-to-br from-orange-100/50 via-slate-50 to-slate-100/50" />

          <div className="px-6 pb-6 pt-0 sm:px-8 sm:pb-8">
            <div className="-mt-10 mb-4 flex justify-center">
              <div className="rounded-2xl border-4 border-white bg-white shadow-sm">
                <Avatar className="h-16 w-16 rounded-xl">
                  <AvatarImage src={avatar} alt={fullName} />
                  <AvatarFallback className="rounded-xl bg-orange-100 text-xl font-bold text-orange-600">
                    {fullName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="text-center text-slate-950">
              <h2 className="text-lg font-bold tracking-tight">
                {t("Sidebar.SignOutTitle", "Sign out of SaleSync?")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {t("Sidebar.SignedInAs", "You are currently signed in as")}{" "}
                <span className="font-medium text-slate-900">{email}</span>.{" "}
                {t("Sidebar.EndSession", "Are you sure you want to end your session?")}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLogoutDialog(false)}
                className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
              >
                {t("Sidebar.Cancel", "Cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogoutDialog(false);
                  handleLogout();
                }}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-[0.98]"
              >
                <LogOut size={16} />
                {t("Sidebar.SignOut", "Sign out")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
