import { Link } from "@tanstack/react-router";
import {
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Countries", to: "/countries" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="brand-dark-bg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <span className="font-display font-bold text-white text-base leading-tight">
                Modern Education
                <br />
                Consult
              </span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Your trusted partner for international education and career
              opportunities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-white text-base mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link, i) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    data-ocid={`footer.link.${i + 1}`}
                    className="text-white/70 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-display font-semibold text-white text-base mb-4">
              Our Services
            </h3>
            <ul className="space-y-2">
              {[
                "Study Abroad",
                "Scholarship Support",
                "Visa Processing",
                "Job Placement",
                "Document Preparation",
                "Language Programs",
              ].map((service) => (
                <li key={service}>
                  <Link
                    to="/services"
                    className="text-white/70 hover:text-white text-sm transition-colors duration-200"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-white text-base mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <Phone
                  size={15}
                  className="mt-0.5 flex-shrink-0 text-primary"
                />
                <span>+250 798979720</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <MessageCircle
                  size={15}
                  className="mt-0.5 flex-shrink-0 text-green-400"
                />
                <a
                  href="https://wa.me/250795780073"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  +250 795780073
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Mail size={15} className="mt-0.5 flex-shrink-0 text-primary" />
                <a
                  href="mailto:moderneducationconsult2025@gmail.com"
                  className="text-white/70 hover:text-white transition-colors break-all"
                >
                  moderneducationconsult2025@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <MapPin
                  size={15}
                  className="mt-0.5 flex-shrink-0 text-primary"
                />
                <span>Kigali, Musanze, RWANDA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>© {currentYear} Modern Education Consult. All rights reserved.</p>
          <p>
            Built with ♥ using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
