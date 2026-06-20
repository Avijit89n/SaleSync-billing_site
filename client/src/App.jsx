import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import SidebarLayout from "./pages/layout/Sidebar.Layout.jsx"
import Home from "./pages/user/home.jsx"
import Customer from "./pages/user/customer.jsx"
import Items from "./pages/user/items.jsx"
import AddItems from "./pages/user/addItems.jsx"
import Invoices from "./pages/user/invoices.jsx"
import AllPayment from "./pages/user/allPayment.jsx"
import DuePayment from "./pages/user/duePayment.jsx"
import PageNotFound from "./pages/errors/pageNotFound.jsx"
import DeliveryChallan from "./pages/user/deliveryChallan.jsx"
import Reports from "./pages/user/reports.jsx"
import Expenses from "./pages/user/expenses.jsx"
import Account from "./pages/profile/account.jsx"
import Billing from "./pages/profile/billing.jsx"
import Notification from "./pages/profile/notification.jsx"
import AuthLayout from "./pages/layout/Auth.Layout.jsx"
import { LoginForm } from "./components/other-ui/login-form.jsx"
import { RegisterForm } from "./components/other-ui/register-form.jsx"
import OTPForm from "./components/other-ui/otp-form.jsx"
import AddInvoice from "./pages/user/addInvoice.jsx"
import EmailVerified from "./components/other-ui/email-verified.jsx"
import Direction from "./pages/layout/direction.Layout.jsx"
import { useEffect, useState } from "react" // <-- Imported useState
import { useDispatch } from "react-redux"
import { checkUserAuthReq } from "./redux/features/authSlice.js"
import { toast } from "sonner"
import AddCustomer from "./pages/user/addCustomer.jsx"
import InvoiceCustomizer from "./pages/user/invoiceCustomizer.jsx"
import Loader2 from "@/components/loaders/loader2" // <-- Import your loader

function App() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  
  // 1. Create a state to track the initial auth check
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    dispatch(checkUserAuthReq())
      .unwrap()
      .catch((err) => {
        if (err.code === "UNAUTHENTICATED" && err.statusCode === 401) return;
        toast.error(err.message || "Something went wrong")
      })
      .finally(() => {
        // 2. Turn off the loading state whether auth succeeds or fails
        setIsCheckingAuth(false);
      });
  }, [dispatch]);

  // 3. Pause the entire router until the backend responds
  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader2 />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route
        path="/auth/"
        element={
          <Direction>
            <AuthLayout />
          </Direction>
        }
      >
        <Route path="login" element={<LoginForm />} />
        <Route path="register" element={<RegisterForm />} />
        <Route path="verification" element={<OTPForm />} />
        <Route path="email-verify" element={<EmailVerified />} />
      </Route>
      <Route
        path="/user/"
        element={
          <Direction>
            <SidebarLayout />
          </Direction>
        }
      >
        <Route path="home" element={<Home />} />
        <Route path="customer" element={<Customer />} />
        <Route path="add-customer" element={<AddCustomer />} />
        <Route path="all-items" element={<Items />} />
        <Route path="add-items" element={<AddItems />} />
        <Route path="add-invoice" element={<AddInvoice />} />
        <Route path="all-invoices" element={<Invoices />} />
        <Route path="invoice-customizer" element={<InvoiceCustomizer />} />
        <Route path="all-payment" element={<AllPayment />} />
        <Route path="due-payment" element={<DuePayment />} />
        <Route path="reports" element={<Reports />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="account" element={<Account />} />
        <Route path="billing" element={<Billing />} />
        <Route path="notifications" element={<Notification />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

export default App