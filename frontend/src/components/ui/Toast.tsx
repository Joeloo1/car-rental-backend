import { Toaster as HotToaster } from "react-hot-toast";

const Toast = () => (
  <HotToaster
    position="top-right"
    toastOptions={{
      duration: 4000,
      style: {
        background: "rgba(17, 17, 20, 0.96)",
        color: "#F2F0EC",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        borderRadius: "12px",
        padding: "14px 16px",
        fontSize: "0.875rem",
        boxShadow: "0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)",
        maxWidth: "420px",
        fontFamily: '"Inter", system-ui, sans-serif',
      },
      success: {
        iconTheme: { primary: "#00C9B1", secondary: "#0A0A0C" },
        style: { border: "1px solid rgba(0,201,177,0.25)" },
      },
      error: {
        iconTheme: { primary: "#FF4D4D", secondary: "#0A0A0C" },
        duration: 5000,
        style: { border: "1px solid rgba(255,77,77,0.25)" },
      },
      loading: {
        iconTheme: { primary: "#F5A623", secondary: "#0A0A0C" },
        style: { border: "1px solid rgba(245,166,35,0.25)" },
      },
    }}
  />
);

export default Toast;
