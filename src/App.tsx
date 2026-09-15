import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import SizeGuide from "./pages/SizeGuide";
import ReturnPolicy from "./pages/ReturnPolicy";
import Wholesale from "./pages/Wholesale";
import StoreAddress from "./pages/StoreAddress";
import FAQ from "./pages/FAQ";
import OrderTracking from "./pages/OrderTracking";

import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import CoreCollection from "./pages/CoreCollection";
import SetsAndPairs from "./pages/SetsAndPairs";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import OtpRequest from "./pages/OtpRequest";
import OtpVerify from "./pages/OtpVerify";
import PersonalInformation from "./pages/account/PersonalInformation";
import Addresses from "./pages/account/Addresses";
import Wallet from "./pages/account/Wallet";
import Orders from "./pages/account/Orders";
import Messages from "./pages/account/Messages";
import CheckoutAddress from "./pages/checkout/CheckoutAddress";
import CheckoutPayment from "./pages/checkout/CheckoutPayment";
import ReturnRequest from "./pages/account/ReturnRequest";
import RequireAuth from "./components/auth/RequireAuth";
import RedirectIfAuthenticated from "./components/auth/RedirectIfAuthenticated";
import RequireAdmin from "./components/auth/RequireAdmin";
import NotFound from "./pages/NotFound";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminReturnRequests from "./pages/admin/AdminReturnRequests";

const queryClient = new QueryClient();

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/size-guide" element={<SizeGuide />} />
              <Route path="/return-policy" element={<ReturnPolicy />} />
              <Route path="/wholesale" element={<Wholesale />} />
              <Route path="/address" element={<StoreAddress />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/order-tracking" element={<OrderTracking />} />

              <Route path="/cart" element={<Cart />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/collections/core" element={<CoreCollection />} />
              <Route path="/collections/sets-and-pairs" element={<SetsAndPairs />} />

              <Route element={<RedirectIfAuthenticated />}>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signin/otp" element={<OtpRequest />} />
                <Route path="/signin/otp/verify" element={<OtpVerify />} />
                <Route path="/signup" element={<SignUp />} />
              </Route>

              <Route element={<RequireAuth />}>
                <Route path="/account" element={<PersonalInformation />} />
                <Route path="/account/addresses" element={<Addresses />} />
                <Route path="/account/wallet" element={<Wallet />} />
                <Route path="/account/orders" element={<Orders />} />
                <Route path="/account/messages" element={<Messages />} />
                <Route path="/account/returns/new" element={<ReturnRequest />} />
                <Route path="/checkout" element={<CheckoutAddress />} />
                <Route path="/checkout/payment" element={<CheckoutPayment />} />
              </Route>
            </Route>

            <Route element={<RequireAdmin />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/tickets" element={<AdminTickets />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/return-requests" element={<AdminReturnRequests />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
