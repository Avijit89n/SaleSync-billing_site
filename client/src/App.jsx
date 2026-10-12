import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

import SidebarLayout from "./pages/layout/Sidebar.Layout.jsx";
import Home from "./pages/user/home.jsx";
import Customer from "./pages/user/customer.jsx";
import Items from "./pages/user/items.jsx";
import AddItems from "./pages/user/addItems.jsx";
import Invoices from "./pages/user/invoices.jsx";
import AllPayment from "./pages/user/allPayment.jsx";
import DuePayment from "./pages/user/duePayment.jsx";
import PageNotFound from "./pages/errors/pageNotFound.jsx";
import Reports from "./pages/user/reports.jsx";
import Expenses from "./pages/user/expenses.jsx";
import Account from "./pages/profile/account.jsx";
import Approval from "./pages/profile/approval.jsx";
import AuthLayout from "./pages/layout/Auth.Layout.jsx";
import AddInvoice from "./pages/user/addInvoice.jsx";
import Direction from "./pages/layout/direction.Layout.jsx";
import { checkUserAuthReq } from "./redux/features/authSlice.js";
import AddCustomer from "./pages/user/addCustomer.jsx";
import InvoiceCustomizer from "./pages/user/invoiceCustomizer.jsx";
import Loader1 from "./components/loaders/loader1.jsx";
import EditCustomer from "./pages/user/editCustomer.jsx";
import EditItem from "./pages/user/editItem.jsx";
import CheckInvoice from "./pages/user/checkInvoice.jsx";
import CustomerInformation from "./pages/user/customerInformation.jsx";
import { Login } from "./pages/authentication/login.jsx";
import { Register } from "./pages/authentication/register.jsx";
import OTP from "./pages/authentication/otp.jsx";
import AllUsers from "./pages/profile/allUsers.jsx";

function RootAuthCheck() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    dispatch(checkUserAuthReq())
      .unwrap()
      .catch((err) => {
        if (err?.code === "UNAUTHENTICATED" && err?.statusCode === 401) return;
        toast.error(err?.message || "Something went wrong");
      })
      .finally(() => setIsCheckingAuth(false));
  }, [dispatch]);

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader1 />
      </div>
    );
  }

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <RootAuthCheck />,
    children: [
      { path: "/", element: <Navigate to="/auth/login" replace /> },
      {
        path: "/auth",
        element: (
          <Direction>
            <AuthLayout />
          </Direction>
        ),
        children: [
          { path: "login", element: <Login /> },
          { path: "register", element: <Register /> },
          { path: "verification", element: <OTP /> },
        ],
      },
      {
        path: "/user",
        element: (
          <Direction>
            <SidebarLayout />
          </Direction>
        ),
        children: [
          { path: "home", element: <Home /> },
          { path: "customer", element: <Customer /> },
          { path: "add-customer", element: <AddCustomer /> },
          { path: "edit-customer/:id", element: <EditCustomer /> },
          { path: "customer-information/:id", element: <CustomerInformation /> },
          { path: "check-invoice/:id", element: <CheckInvoice /> },
          { path: "edit-item/:id", element: <EditItem /> },
          { path: "all-items", element: <Items /> },
          { path: "add-items", element: <AddItems /> },
          { path: "add-invoice", element: <AddInvoice /> },
          { path: "all-invoices", element: <Invoices /> },
          { path: "invoice-customizer", element: <InvoiceCustomizer /> },
          { path: "all-payment", element: <AllPayment /> },
          { path: "due-payment", element: <DuePayment /> },
          { path: "reports", element: <Reports /> },
          { path: "expenses", element: <Expenses /> },
          { path: "account", element: <Account /> },
          { path: "all-users", element: <AllUsers /> },
          { path: "approvals", element: <Approval /> },
        ],
      },
      { path: "*", element: <PageNotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
