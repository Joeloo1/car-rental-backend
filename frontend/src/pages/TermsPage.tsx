import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "@/lib/icons";

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    body: "By creating an account or using LuxeDrive, you agree to these Terms of Service. If you do not agree, you may not use our platform. We may update these terms from time to time — continued use after changes constitutes acceptance.",
  },
  {
    title: "User Accounts",
    body: "You must be at least 18 years old and hold a valid driver's licence to rent a vehicle. You are responsible for maintaining the security of your account credentials and for all activity under your account.",
  },
  {
    title: "Bookings and Payments",
    body: "All bookings are binding agreements between the renter and the host. Payments are processed securely at the time of booking. Prices are displayed in the local currency and include all platform fees unless otherwise stated.",
  },
  {
    title: "Cancellations and Refunds",
    body: "Cancellation policies vary by listing and are displayed on each car's detail page before booking. Refunds are processed within 5–10 business days depending on your payment provider.",
  },
  {
    title: "Host Responsibilities",
    body: "Hosts must ensure their vehicle is roadworthy, insured, and accurately described. Hosts must honour confirmed bookings. LuxeDrive reserves the right to suspend hosts who repeatedly cancel or misrepresent their vehicles.",
  },
  {
    title: "Renter Responsibilities",
    body: "Renters must return the vehicle in the same condition it was received, on time, and with the agreed fuel level. Damage caused during the rental period is the renter's financial responsibility up to the excess amount stated in the listing.",
  },
  {
    title: "Limitation of Liability",
    body: "LuxeDrive is a peer-to-peer marketplace and is not responsible for vehicle condition, accidents, or disputes between renters and hosts. Our liability is limited to the amount paid for the booking in question.",
  },
  {
    title: "Contact",
    body: "For legal enquiries, contact us at legal@luxedrive.io. For general support, use the in-app chat or email support@luxedrive.io.",
  },
];

const TermsPage: React.FC = () => (
  <div className="min-h-screen bg-[#0A0A0C] pt-24 pb-20">
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-ink-tertiary hover:text-ink-primary transition-colors mb-10"
      >
        <ArrowLeft size={14} /> Back home
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-amber/10 border border-amber/20 flex items-center justify-center">
          <FileText size={17} className="text-amber" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary">Legal</p>
      </div>

      <h1 className="text-3xl font-display font-bold text-ink-primary tracking-tight mb-2">
        Terms of Service
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
          <a href="mailto:legal@luxedrive.io" className="text-gold hover:underline">
            legal@luxedrive.io
          </a>
        </p>
      </div>
    </div>
  </div>
);

export default TermsPage;
