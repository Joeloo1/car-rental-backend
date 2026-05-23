import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Toast from "./components/ui/Toast";
import PageTransition from "./components/common/PageTransition";

// Lazy-load pages
const LandingPagePro = lazy(() => import("./pages/LandingPagePro.tsx"));
const BrowseCars     = lazy(() => import("./pages/BrowseCars.tsx"));
const CarDetails     = lazy(() => import("./pages/CarDetails.tsx"));
const Dashboard      = lazy(() => import("./pages/dashboard/Dashboard.tsx"));
const HowItWorks     = lazy(() => import("./pages/HowItWorks.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const LenderDashboard = lazy(() => import("./pages/lender/LenderDashboard.tsx"));
const Login          = lazy(() => import("./pages/auth/Login.tsx"));
const Register       = lazy(() => import("./pages/auth/Register.tsx"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword.tsx"));
const ResetPassword  = lazy(() => import("./pages/auth/ResetPassword.tsx"));
const AuthSuccess    = lazy(() => import("./pages/auth/AuthSuccess.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
    },
  },
});

const PageSkeleton = () => (
  <div className="min-h-screen bg-background" />
);

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"                    element={<PageTransition><LandingPagePro /></PageTransition>} />
        <Route path="/login"               element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register"            element={<PageTransition><Register /></PageTransition>} />
        <Route path="/auth-success"        element={<PageTransition><AuthSuccess /></PageTransition>} />
        <Route path="/forgot-password"     element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password/:token" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/browse"              element={<PageTransition><BrowseCars /></PageTransition>} />
        <Route path="/car/:id"             element={<PageTransition><CarDetails /></PageTransition>} />
        <Route path="/dashboard"           element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/lender"              element={<PageTransition><LenderDashboard /></PageTransition>} />
        <Route path="/admin"               element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/how-it-works"        element={<PageTransition><HowItWorks /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toast />
      <Router>
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30 selection:text-primary">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<PageSkeleton />}>
              <AnimatedRoutes />
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
