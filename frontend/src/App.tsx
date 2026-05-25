import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Toast from "./components/ui/Toast";
import PageTransition from "./components/common/PageTransition";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import ProtectedRoute from "./components/common/ProtectedRoute";

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
        <Route path="/dashboard"           element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/lender"              element={<ProtectedRoute allowedRoles={["lender", "admin"]}><PageTransition><LenderDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/admin"               element={<ProtectedRoute allowedRoles={["admin"]}><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/how-it-works"        element={<PageTransition><HowItWorks /></PageTransition>} />
        <Route path="*"                    element={
          <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-4">
            <h1 className="text-7xl font-display font-black text-primary">404</h1>
            <h2 className="text-2xl font-bold text-foreground">Page not found</h2>
            <p className="text-muted-foreground max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
            <a href="/" className="mt-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold">Go Home</a>
          </div>
        } />
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
            <ErrorBoundary>
              <Suspense fallback={<PageSkeleton />}>
                <AnimatedRoutes />
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
