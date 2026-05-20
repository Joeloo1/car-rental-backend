import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Toast from "./components/ui/Toast";
import LandingPagePro from "./pages/LandingPagePro.tsx";
import Login from "./pages/auth/Login.tsx";
import Register from "./pages/auth/Register.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";
import AuthSuccess from "./pages/auth/AuthSuccess.tsx";
import BrowseCars from "./pages/BrowseCars.tsx";
import CarDetails from "./pages/CarDetails.tsx";
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import HowItWorks from "./pages/HowItWorks.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toast />
      <Router>
        <div className="min-h-screen flex flex-col bg-dark-600">
          <Navbar />
          <main className="flex-1 pt-20">
            <Routes>
              <Route path="/" element={<LandingPagePro />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth-success" element={<AuthSuccess />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />
              <Route path="/browse" element={<BrowseCars />} />
              <Route path="/car/:id" element={<CarDetails />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
