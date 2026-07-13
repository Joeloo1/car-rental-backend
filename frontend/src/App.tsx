import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import VerificationBanner from "./components/common/VerificationBanner";
import Toast from "./components/ui/Toast";
import PageTransition from "./components/common/PageTransition";
import RouteProgressBar from "./components/ui/RouteProgressBar";
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
const PrivacyPage     = lazy(() => import("./pages/PrivacyPage.tsx"));
const TermsPage       = lazy(() => import("./pages/TermsPage.tsx"));
const NotFoundPage            = lazy(() => import("./pages/NotFoundPage.tsx"));
const BookingConfirmation     = lazy(() => import("./pages/BookingConfirmation.tsx"));
const PaymentVerification     = lazy(() => import("./pages/PaymentVerification.tsx"));
const MessagesPage            = lazy(() => import("./pages/MessagesPage.tsx"));
const ComparePage             = lazy(() => import("./pages/ComparePage.tsx"));
const LenderProfilePage       = lazy(() => import("./pages/lender/LenderProfilePage.tsx"));

// Routes where the main navbar + footer should be hidden (full-screen auth experience)
const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth-success",
  "/verify-email",
  "/verify-email-confirm",
];

const PageSkeleton = () => <div className="min-h-screen bg-[#0A0A0C]" />;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"                      element={<PageTransition><LandingPagePro /></PageTransition>} />
        <Route path="/login"                 element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register"              element={<PageTransition><Register /></PageTransition>} />
        <Route path="/auth-success"          element={<PageTransition><AuthSuccess /></PageTransition>} />
        <Route path="/verify-email"          element={<PageTransition><VerifyEmailPage /></PageTransition>} />
        <Route path="/verify-email-confirm"  element={<PageTransition><VerifyEmailConfirmPage /></PageTransition>} />
        <Route path="/forgot-password"       element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password/:token" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/browse"                element={<PageTransition><BrowseCars /></PageTransition>} />
        <Route path="/car/:id"               element={<PageTransition><CarDetails /></PageTransition>} />
        <Route path="/dashboard"             element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/lender"                element={<ProtectedRoute allowedRoles={["lender", "admin"]}><PageTransition><LenderDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/admin"                 element={<ProtectedRoute allowedRoles={["admin"]}><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/how-it-works"          element={<PageTransition><HowItWorks /></PageTransition>} />
        <Route path="/about"                 element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/privacy"              element={<PageTransition><PrivacyPage /></PageTransition>} />
        <Route path="/terms"                element={<PageTransition><TermsPage /></PageTransition>} />
        <Route path="/profile"              element={<ProtectedRoute><PageTransition><ProfilePage /></PageTransition></ProtectedRoute>} />
        <Route path="/bookings"             element={<ProtectedRoute><PageTransition><MyBookings /></PageTransition></ProtectedRoute>} />
        <Route path="/favorites"             element={<ProtectedRoute><PageTransition><FavoritesPage /></PageTransition></ProtectedRoute>} />
        <Route path="/booking/:id"                    element={<ProtectedRoute><PageTransition><BookingConfirmation /></PageTransition></ProtectedRoute>} />
        <Route path="/bookings/:id/payment/verify"  element={<ProtectedRoute><PageTransition><PaymentVerification /></PageTransition></ProtectedRoute>} />
        <Route path="/messages"                     element={<ProtectedRoute><PageTransition><MessagesPage /></PageTransition></ProtectedRoute>} />
        <Route path="/compare"                      element={<PageTransition><ComparePage /></PageTransition>} />
        <Route path="/host/:lenderId"               element={<PageTransition><LenderProfilePage /></PageTransition>} />
        <Route path="*"                             element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

// Separate shell component so it can read location (must be inside Router)
const AppShell: React.FC = () => {
  const location = useLocation();
  const isAuth = AUTH_PATHS.some(
    p => location.pathname === p || location.pathname.startsWith(p + "/"),
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
      {!isAuth && <Navbar />}
      {!isAuth && <VerificationBanner />}
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <AnimatedRoutes />
          </Suspense>
        </ErrorBoundary>
      </main>
      {!isAuth && <Footer />}
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toast />
      <Router>
        <RouteProgressBar />
        <ScrollToTop />
        <AppShell />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
