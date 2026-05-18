import { Toaster as HotToaster } from "react-hot-toast";

const Toast = () => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "rgba(17, 17, 21, 0.95)",
          color: "#f8fafc",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          borderRadius: "12px",
          padding: "16px",
          fontSize: "0.95rem",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
          maxWidth: "500px",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: "#f8fafc",
          },
          style: {
            border: "1px solid rgba(16, 185, 129, 0.3)",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#f8fafc",
          },
          duration: 5000,
          style: {
            border: "1px solid rgba(239, 68, 68, 0.3)",
          },
        },
        loading: {
          iconTheme: {
            primary: "#3b82f6",
            secondary: "#f8fafc",
          },
          style: {
            border: "1px solid rgba(59, 130, 246, 0.3)",
          },
        },
      }}
    />
  );
};

export default Toast;
