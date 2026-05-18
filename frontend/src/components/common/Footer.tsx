import { Car, Mail, Phone, MapPin, Globe, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";

const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Successfully subscribed to newsletter!");
    setEmail("");
    setIsSubmitting(false);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-dark-600 border-t border-white/10">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />

      <div className="relative container-custom">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white">
                Stay Updated with LuxeDrive
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Get exclusive deals, new car listings, and travel inspiration
                delivered to your inbox.
              </p>

              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-6"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-dark-500 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      Subscribe
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30"
              >
                <Car size={22} className="text-white" />
              </motion.div>
              <span className="text-2xl font-display font-bold text-white group-hover:text-primary-400 transition-colors">
                LuxeDrive
              </span>
            </Link>

            <p className="text-gray-400 leading-relaxed max-w-sm">
              Redefining the car rental experience with a curated fleet of
              premium vehicles and a seamless, mobile-first booking process.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { icon: Globe, href: "#", label: "Facebook" },
                { icon: Globe, href: "#", label: "Twitter" },
                { icon: Globe, href: "#", label: "Instagram" },
                { icon: Globe, href: "#", label: "LinkedIn" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/50 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary-400 transition-all"
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="text-white font-display font-bold text-lg">
              Company
            </h3>
            <nav className="flex flex-col gap-3">
              {["About Us", "Careers", "Blog", "Press"].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase().replace(" ", "-")}`}
                  className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-primary-500 transition-all" />
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          {/* Services Links */}
          <div className="space-y-4">
            <h3 className="text-white font-display font-bold text-lg">
              Services
            </h3>
            <nav className="flex flex-col gap-3">
              {[
                { label: "Rent a Car", path: "/browse" },
                { label: "Host a Car", path: "/list-car" },
                { label: "Enterprise", path: "/enterprise" },
                { label: "Insurance", path: "/insurance" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-primary-500 transition-all" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white font-display font-bold text-lg">
              Get in Touch
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:support@luxedrive.com"
                className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <Mail
                  size={18}
                  className="mt-0.5 text-primary-400 flex-shrink-0"
                />
                <span className="text-sm">support@luxedrive.com</span>
              </a>
              <a
                href="tel:+15551234567"
                className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <Phone
                  size={18}
                  className="mt-0.5 text-primary-400 flex-shrink-0"
                />
                <span className="text-sm">+1 (555) 123-4567</span>
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin
                  size={18}
                  className="mt-0.5 text-primary-400 flex-shrink-0"
                />
                <span className="text-sm">
                  123 Elite Ave
                  <br />
                  Beverly Hills, CA 90210
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {currentYear} LuxeDrive Rental Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (item, index) => (
                <Link
                  key={index}
                  to={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {item}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
