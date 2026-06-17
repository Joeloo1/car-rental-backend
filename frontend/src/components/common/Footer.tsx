import { Link } from "react-router-dom";
import { Car, Shield, MapPin } from "@/lib/icons";

const COLS = [
  {
    heading: "Platform",
    links: [
      { label: "Browse cars",   to: "/browse" },
      { label: "How it works",  to: "/how-it-works" },
      { label: "Become a host", to: "/register?role=lender" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign up",    to: "/register" },
      { label: "Sign in",    to: "/login" },
      { label: "Dashboard",  to: "/dashboard" },
      { label: "My bookings",to: "/bookings" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About",   to: "/about" },
      { label: "Privacy", to: "/privacy" },
      { label: "Terms",   to: "/terms" },
    ],
  },
];

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const SOCIALS = [
  { icon: XIcon,         href: "https://x.com/luxedrive",        label: "X (Twitter)" },
  { icon: InstagramIcon, href: "https://instagram.com/luxedrive", label: "Instagram"   },
];

const Footer: React.FC = () => (
  <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a]">
    <div className="container py-12">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
              style={{ background: "linear-gradient(135deg, rgba(212,151,42,0.20), rgba(184,121,30,0.10))", border: "1px solid rgba(212,151,42,0.35)" }}>
              <Car size={12} className="text-gold" />
            </div>
            <span className="font-heading font-bold text-sm tracking-tight text-ink-primary">LuxeDrive</span>
          </Link>
          <p className="text-xs text-ink-tertiary leading-relaxed max-w-[180px] mb-4">
            Premium car rental across Nigeria. 1,200+ vehicles, 50+ cities.
          </p>

          {/* Trust badges */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
              <Shield size={11} className="text-gold flex-shrink-0" />
              Fully insured trips
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
              <MapPin size={11} className="text-teal flex-shrink-0" />
              Serving 50+ Nigerian cities
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-2.5">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-7 h-7 rounded-md bg-surface-2 border border-[#2a2a2a] flex items-center justify-center text-ink-tertiary hover:text-ink-primary hover:border-[#3a3a3a] hover:bg-surface-3 transition-all"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {COLS.map(col => (
          <div key={col.heading}>
            <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-ink-tertiary mb-3">
              {col.heading}
            </p>
            <ul className="space-y-2.5">
              {col.links.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-ink-tertiary hover:text-ink-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#1a1a1a]">
        <p className="text-xs text-ink-tertiary">
          © {new Date().getFullYear()} LuxeDrive. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="text-xs text-ink-tertiary hover:text-ink-secondary transition-colors">
            Privacy
          </Link>
          <Link to="/terms" className="text-xs text-ink-tertiary hover:text-ink-secondary transition-colors">
            Terms
          </Link>
          <span className="text-xs text-ink-tertiary">Made in Nigeria 🇳🇬</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
