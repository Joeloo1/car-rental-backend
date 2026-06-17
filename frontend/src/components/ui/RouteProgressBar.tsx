import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const RouteProgressBar: React.FC = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [width,   setWidth]   = useState(0);

  useEffect(() => {
    setVisible(true);
    setWidth(0);

    // Fast initial jump
    const t1 = setTimeout(() => setWidth(72), 60);
    // Slower crawl to near-complete
    const t2 = setTimeout(() => setWidth(92), 300);
    // Complete + hide
    const t3 = setTimeout(() => setWidth(100), 650);
    const t4 = setTimeout(() => { setVisible(false); setWidth(0); }, 900);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        zIndex: 9999,
        background: "transparent",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: "linear-gradient(to right, #D4972A, #B8791E, #E0AC3C)",
          transition: width === 0 ? "none" : "width 280ms cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 0 8px rgba(212,151,42,0.6)",
        }}
      />
    </div>
  );
};

export default RouteProgressBar;
