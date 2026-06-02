import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import VerificationBanner from "./components/common/VerificationBanner";
import Toast from "./components/ui/Toast";
import PageTransition from "./components/common/PageTransition";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Lazy-load pages
const LandingPagePro  = lazy(() => import("./pages/LandingPagePro.tsx"));
const BrowseCars      = lazy(() => import("./pages/BrowseCars.tsx"));
const CarDetails      = lazy(() => import("./pages/CarDetails.tsx"));
const Dashboard       = lazy(() => import("./pages/dashboard/Dashboard.tsx"));
const HowItWorks      = lazy(() => import("./pages/HowItWorks.tsx"));
const AdminDashboard  = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const LenderDashboard = lazy(() => import("./pages/lender/LenderDashboard.tsx"));
const Login           = lazy(() => import("./pages/auth/Login.tsx"));
const Register        = lazy(() => import("./pages/auth/Register.tsx"));
const ForgotPassword  = lazy(() => import("./pages/auth/ForgotPassword.tsx"));
const ResetPassword   = lazy(() => import("./pages/auth/ResetPassword.tsx"));
const AuthSuccess     = lazy(() => import("./pages/auth/AuthSuccess.tsx"));
const VerifyEmailPage        = lazy(() => import("./pages/auth/VerifyEmailPage.tsx"));
const VerifyEmailConfirmPage = lazy(() => import("./pages/auth/VerifyEmailConfirmPage.tsx"));
const ProfilePage     = lazy(() => import("./pages/ProfilePage.tsx"));
const MyBookings      = lazy(() => import("./pages/MyBookings.tsx"));
const FavoritesPage   = lazy(() => import("./pages/FavoritesPage.tsx"));
const AboutPage       = lazy(() => import("./pages/AboutPage.tsx"));
const NotFoundPage    = lazy(() => import("./pages/NotFoundPage.tsx"));

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
        <Route path="/verify-email"         element={<PageTransition><VerifyEmailPage /></PageTransition>} />
        <Route path="/verify-email-confirm" element={<PageTransition><VerifyEmailConfirmPage /></PageTransition>} />
        <Route path="/forgot-password"     element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password/:token" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/browse"              element={<PageTransition><BrowseCars /></PageTransition>} />
        <Route path="/car/:id"             element={<PageTransition><CarDetails /></PageTransition>} />
        <Route path="/dashboard"           element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/lender"              element={<ProtectedRoute allowedRoles={["lender", "admin"]}><PageTransition><LenderDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/admin"               element={<ProtectedRoute allowedRoles={["admin"]}><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/how-it-works"        element={<PageTransition><HowItWorks /></PageTransition>} />
        <Route path="/about"               element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/profile"             element={<ProtectedRoute><PageTransition><ProfilePage /></PageTransition></ProtectedRoute>} />
        <Route path="/bookings"            element={<ProtectedRoute><PageTransition><MyBookings /></PageTransition></ProtectedRoute>} />
        <Route path="/favorites"           element={<ProtectedRoute><PageTransition><FavoritesPage /></PageTransition></ProtectedRoute>} />
        <Route path="*"                    element={<PageTransition><NotFoundPage /></PageTransition>} />
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
          <VerificationBanner />
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
