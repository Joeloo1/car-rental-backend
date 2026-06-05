import { Link } from "react-router-dom";
import { Car, Twitter, Instagram, Github } from "lucide-react";

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
      { label: "Sign up",   to: "/register" },
      { label: "Sign in",   to: "/login" },
      { label: "Dashboard", to: "/dashboard" },
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

const SOCIALS = [
  { icon: Twitter,   href: "https://twitter.com/luxedrive",   label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/luxedrive",  label: "Instagram" },
  { icon: Github,    href: "https://github.com/luxedrive",     label: "GitHub" },
];

const Footer: React.FC = () => (
  <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a]">
    <div className="container py-12">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-blue flex items-center justify-center flex-shrink-0">
              <Car size={13} className="text-white" />
            </div>
            <span className="font-semibold text-sm text-ink-primary">LuxeDrive</span>
          </Link>
          <p className="text-xs text-ink-tertiary leading-relaxed max-w-[180px] mb-4">
            Premium car rental across Nigeria. 1,200+ vehicles, 50+ cities.
          </p>
          {/* Social icons */}
          <div className="flex items-center gap-2.5">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-7 h-7 rounded-md bg-surface-2 border border-[#2a2a2a] flex items-center justify-center text-ink-tertiary hover:text-ink-primary hover:border-[#3a3a3a] transition-all"
              >
                <Icon size={13} />
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
        <p className="text-xs text-ink-tertiary">
          Made in Nigeria 🇳🇬
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
