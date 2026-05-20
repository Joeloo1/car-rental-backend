import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Toast from "./components/ui/Toast";

// Lazy-load every page so only the current route's code downloads on first visit.
// Auth pages bundled together (small, always visited together).
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
      staleTime: 5 * 60 * 1000,   // 5 min default
      gcTime: 15 * 60 * 1000,     // keep cache 15 min so navigating back is instant
    },
  },
});

// Minimal full-screen fallback — no layout shift, no spinner flash
const PageSkeleton = () => (
  <div className="min-h-screen bg-[#0a0a0b]" />
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toast />
      <Router>
        <div className="min-h-screen flex flex-col bg-dark-600">
          <Navbar />
          <main className="flex-1 pt-20">
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/"                    element={<LandingPagePro />} />
                <Route path="/login"               element={<Login />} />
                <Route path="/register"            element={<Register />} />
                <Route path="/auth-success"        element={<AuthSuccess />} />
                <Route path="/forgot-password"     element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/browse"              element={<BrowseCars />} />
                <Route path="/car/:id"             element={<CarDetails />} />
                <Route path="/dashboard"           element={<Dashboard />} />
                <Route path="/lender"              element={<LenderDashboard />} />
                <Route path="/admin"               element={<AdminDashboard />} />
                <Route path="/how-it-works"        element={<HowItWorks />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
