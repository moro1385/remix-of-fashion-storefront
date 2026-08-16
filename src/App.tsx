import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCartSync } from "@/hooks/useCartSync";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import CoreCollection from "./pages/CoreCollection";
import SetsAndPairs from "./pages/SetsAndPairs";
import CollectionPage from "./pages/CollectionPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import OtpRequest from "./pages/OtpRequest";
import OtpVerify from "./pages/OtpVerify";
import PersonalInformation from "./pages/account/PersonalInformation";
import Addresses from "./pages/account/Addresses";
import Wallet from "./pages/account/Wallet";
import Orders from "./pages/account/Orders";
import RequireAuth from "./components/auth/RequireAuth";
import RedirectIfAuthenticated from "./components/auth/RedirectIfAuthenticated";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => {
  useCartSync();

  return (
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

              <Route path="/cart" element={<Cart />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/collections/core" element={<CoreCollection />} />
              <Route path="/collections/sets-and-pairs" element={<SetsAndPairs />} />
              <Route path="/collections/:handle" element={<CollectionPage />} />

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
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
