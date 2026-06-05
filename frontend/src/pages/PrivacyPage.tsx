import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const SECTIONS = [
  {
    title: "Information We Collect",
    body: "We collect information you provide directly, such as your name, email address, phone number, and payment details when you register or make a booking. We also collect usage data including pages visited, search queries, and booking history to improve our platform.",
  },
  {
    title: "How We Use Your Information",
    body: "Your information is used to process bookings, communicate with you about your trips, prevent fraud, and improve our service. We never sell your personal data to third parties. We may share data with hosts and insurance partners strictly as needed to fulfil your booking.",
  },
  {
    title: "Data Security",
    body: "All data is encrypted in transit using TLS. Passwords are hashed using bcrypt and are never stored in plain text. Payment information is handled by PCI-compliant processors and is never stored on our servers.",
  },
  {
    title: "Cookies",
    body: "We use cookies to maintain your session, remember your preferences, and analyse usage patterns. You can disable cookies in your browser settings, though some features may not function correctly without them.",
  },
  {
    title: "Your Rights",
    body: "You have the right to access, correct, or delete your personal data at any time. You can manage your profile from the Dashboard, or contact us at privacy@luxedrive.io to request data export or account deletion.",
  },
  {
    title: "Contact",
    body: "For any privacy-related questions or concerns, reach us at privacy@luxedrive.io. We aim to respond within 48 hours.",
  },
];

const PrivacyPage: React.FC = () => (
  <div className="min-h-screen bg-[#080808] pt-24 pb-20">
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-ink-tertiary hover:text-ink-primary transition-colors mb-10"
      >
        <ArrowLeft size={14} /> Back home
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-blue/10 border border-blue/20 flex items-center justify-center">
          <Shield size={17} className="text-blue" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Legal</p>
      </div>

      <h1 className="text-3xl font-display font-bold text-ink-primary tracking-tight mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-ink-tertiary mb-10">
        Last updated: June 2025 · Applies to all LuxeDrive services.
      </p>

      <div className="space-y-8">
        {SECTIONS.map(({ title, body }) => (
          <section key={title}>
            <h2 className="text-base font-semibold text-ink-primary mb-2">{title}</h2>
            <p className="text-sm text-ink-tertiary leading-relaxed">{body}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-[#1c1c1c]">
        <p className="text-xs text-ink-disabled">
          Questions?{" "}
          <a href="mailto:privacy@luxedrive.io" className="text-blue-light hover:underline">
            privacy@luxedrive.io
          </a>
        </p>
      </div>
    </div>
  </div>
);

export default PrivacyPage;
