import { Routes, Route, useLocation } from "react-router-dom"
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
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { checkUserAuthReq } from "./redux/features/authSlice.js"
import { toast } from "sonner"
import AddCustomer from "./pages/user/addCustomer.jsx"
import InvoiceCustomizer from "./pages/user/invoiceCustomizer.jsx"



function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkUserAuthReq())
      .unwrap()
      .catch((err) => {
        if (err.code === "UNAUTHENTICATED" && err.statusCode === 401) return;
        toast.error(err.message || "Something went wrong")
      })
  }, [dispatch])

  return (
    <Routes>
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
