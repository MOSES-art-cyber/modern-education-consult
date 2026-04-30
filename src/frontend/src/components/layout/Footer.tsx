import { Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useGetGlobalConfig } from "../../hooks/useQueries";

const defaultFooterLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Countries", to: "/countries" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { data: globalConfig } = useGetGlobalConfig();

  const phone = globalConfig?.contactPhone || "+250 798979720";
  const email =
    globalConfig?.contactEmail || "moderneducationconsult2026@gmail.com";
  const address = globalConfig?.contactAddress || "Kigali, Musanze, RWANDA";
  const tagline =
    globalConfig?.footerContent ||
    "Your trusted partner for international education and career opportunities.";
  const siteTitle = globalConfig?.siteTitle || "Modern Education Consult";

  return (
    <footer className="brand-dark-bg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/assets/uploads/WhatsApp-Image-2026-03-11-at-4.44.17-PM-1.jpeg"
                alt={siteTitle}
                className="w-12 h-12 object-contain rounded-lg bg-black"
              />
              <span className="font-display font-bold text-white text-base leading-tight">
                {siteTitle.split(" ").slice(0, 2).join(" ")}
                <br />
                {siteTitle.split(" ").slice(2).join(" ") || "Consult"}
              </span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{tagline}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-white text-base mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {defaultFooterLinks.map((link, i) => (
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
                <span>{phone}</span>
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
                  href={`mailto:${email}`}
                  className="text-white/70 hover:text-white transition-colors break-all"
                >
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <MapPin
                  size={15}
                  className="mt-0.5 flex-shrink-0 text-primary"
                />
                <span>{address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>
            © {currentYear} {siteTitle}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <img
              src="/assets/uploads/WhatsApp-Image-2026-03-11-at-4.44.17-PM-1.jpeg"
              alt={siteTitle}
              className="w-7 h-7 object-contain rounded bg-black"
            />
            <span className="text-white/70">
              {siteTitle} &mdash; Where education meets opportunities
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
