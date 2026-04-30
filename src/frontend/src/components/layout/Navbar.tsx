import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useGetGlobalConfig } from "../../hooks/useQueries";

const languageSubItems = [
  { label: "English", to: "/services/language-proficiency#english" },
  { label: "French", to: "/services/language-proficiency#french" },
];

const servicesDropdown = [
  { label: "Study Abroad", to: "/services" },
  { label: "International Job Placement", to: "/services" },
  { label: "Visa Assistance", to: "/contact" },
  { label: "Scholarship Guidance", to: "/services" },
  { label: "Online Degree Courses", to: "/services/online-degree-courses" },
  {
    label: "Online Professional Courses",
    to: "/services/online-professional-courses",
  },
  {
    label: "Professional Internships",
    to: "/services/professional-internships",
  },
  {
    label: "Language Proficiency Programs",
    to: "/services/language-proficiency",
    subItems: languageSubItems,
  },
];

const countriesDropdown = [
  { label: "USA", to: "/countries" },
  { label: "Canada", to: "/countries" },
  { label: "United Kingdom", to: "/countries" },
  { label: "United Arab Emirates", to: "/countries" },
  { label: "European Countries", to: "/countries" },
  { label: "China", to: "/countries" },
  { label: "Australia", to: "/countries" },
];

function DropdownMenu({
  items,
  isOpen,
}: {
  items: {
    label: string;
    to: string;
    subItems?: { label: string; to: string }[];
  }[];
  isOpen: boolean;
}) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const subCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubEnter = (label: string) => {
    if (subCloseTimer.current) clearTimeout(subCloseTimer.current);
    setHoveredItem(label);
  };

  const handleSubLeave = () => {
    subCloseTimer.current = setTimeout(() => setHoveredItem(null), 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-border/60 py-2 z-50 overflow-visible"
        >
          {items.map((item, i) =>
            item.subItems ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => handleSubEnter(item.label)}
                onMouseLeave={handleSubLeave}
              >
                <Link
                  to={item.to}
                  data-ocid={`nav.dropdown.link.${i + 1}`}
                  className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-foreground/80 hover:text-brand-blue hover:bg-blue-50 transition-colors duration-150 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue/40 flex-shrink-0" />
                    {item.label}
                  </span>
                  <ChevronRight
                    size={13}
                    className="text-brand-blue/60 flex-shrink-0"
                  />
                </Link>

                {/* Sub-dropdown */}
                <AnimatePresence>
                  {hoveredItem === item.label && (
                    <motion.div
                      initial={{ opacity: 0, x: -6, scale: 0.97 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -6, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      onMouseEnter={() => handleSubEnter(item.label)}
                      onMouseLeave={handleSubLeave}
                      className="absolute left-full top-0 ml-1 w-44 bg-white rounded-xl shadow-lg border border-border/60 py-2 z-50"
                    >
                      <p className="px-4 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-brand-blue/60">
                        Select Language
                      </p>
                      {item.subItems.map((sub, j) => (
                        <Link
                          key={sub.label}
                          to={sub.to}
                          data-ocid={`nav.dropdown.sublanguage.link.${j + 1}`}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/80 hover:text-brand-blue hover:bg-blue-50 transition-colors duration-150 font-medium"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue flex-shrink-0" />
                          {sub.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                data-ocid={`nav.dropdown.link.${i + 1}`}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/80 hover:text-brand-blue hover:bg-blue-50 transition-colors duration-150 font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue/40 flex-shrink-0" />
                {item.label}
              </Link>
            ),
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [mobileLanguageExpanded, setMobileLanguageExpanded] = useState(false);
  const location = useLocation();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: globalConfig } = useGetGlobalConfig();

  const logoUrl = "/assets/uploads/bd33db92-589d-4260-a870-59b5278d3b02-1.jpg";
  const siteTitle = globalConfig?.siteTitle || "Modern Education Consult";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleMouseEnter = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(key);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-card"
          : "bg-white shadow-sm"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Left side: Logo + Company Name */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0" data-ocid="nav.link.1">
              <img
                src={logoUrl}
                alt={siteTitle}
                className="h-20 w-auto object-contain"
              />
            </Link>

            {/* Company Name */}
            <div className="hidden lg:flex flex-col justify-center border-l border-brand-blue/20 pl-3">
              <div className="leading-tight">
                <p className="font-display font-bold text-lg text-brand-dark leading-snug">
                  {siteTitle.split(" ").slice(0, 2).join(" ")}
                </p>
                <p className="font-display font-bold text-lg text-brand-dark leading-snug">
                  {siteTitle.split(" ").slice(2).join(" ") || "Consult"}
                </p>
              </div>
              <p className="text-xs text-brand-blue/70 font-medium tracking-wide mt-0.5">
                Where Education Meets Opportunity
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {/* Home */}
            <Link
              to="/"
              data-ocid="nav.link.2"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-brand-dark ${
                location.pathname === "/"
                  ? "text-brand-blue font-semibold bg-accent"
                  : "text-foreground/80"
              }`}
            >
              Home
            </Link>

            {/* About */}
            <Link
              to="/about"
              data-ocid="nav.link.3"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-brand-dark ${
                location.pathname === "/about"
                  ? "text-brand-blue font-semibold bg-accent"
                  : "text-foreground/80"
              }`}
            >
              About
            </Link>

            {/* Services dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("services")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                data-ocid="nav.services.toggle"
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "services" ? null : "services",
                  )
                }
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-brand-dark ${
                  location.pathname.startsWith("/services")
                    ? "text-brand-blue font-semibold bg-accent"
                    : "text-foreground/80"
                }`}
              >
                Services
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    activeDropdown === "services" ? "rotate-180" : ""
                  }`}
                />
              </button>
              <DropdownMenu
                items={servicesDropdown}
                isOpen={activeDropdown === "services"}
              />
            </div>

            {/* Countries dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("countries")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                data-ocid="nav.countries.toggle"
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "countries" ? null : "countries",
                  )
                }
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-brand-dark ${
                  location.pathname === "/countries"
                    ? "text-brand-blue font-semibold bg-accent"
                    : "text-foreground/80"
                }`}
              >
                Countries
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    activeDropdown === "countries" ? "rotate-180" : ""
                  }`}
                />
              </button>
              <DropdownMenu
                items={countriesDropdown}
                isOpen={activeDropdown === "countries"}
              />
            </div>

            {/* Blog */}
            <Link
              to="/blog"
              data-ocid="nav.link.4"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-brand-dark ${
                location.pathname === "/blog"
                  ? "text-brand-blue font-semibold bg-accent"
                  : "text-foreground/80"
              }`}
            >
              Blog
            </Link>

            {/* Contact */}
            <Link
              to="/contact"
              data-ocid="nav.link.5"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-brand-dark ${
                location.pathname === "/contact"
                  ? "text-brand-blue font-semibold bg-accent"
                  : "text-foreground/80"
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              asChild
              data-ocid="nav.primary_button"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 shadow-blue transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
            >
              <Link to="/contact">Apply Now</Link>
            </Button>
          </div>

          {/* Mobile: Logo + hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              to="/"
              data-ocid="nav.link.1"
              className="flex items-center gap-2"
            >
              <img
                src={logoUrl}
                alt={siteTitle}
                className="h-12 w-auto object-contain"
              />
              <div className="flex flex-col justify-center">
                <p className="font-display font-bold text-sm text-brand-dark leading-tight">
                  {siteTitle.split(" ").slice(0, 2).join(" ")}
                </p>
                <p className="font-display font-bold text-sm text-brand-dark leading-tight">
                  {siteTitle.split(" ").slice(2).join(" ") || "Consult"}
                </p>
                <p className="text-[10px] text-brand-blue/70 font-medium leading-tight">
                  Where Education Meets Opportunity
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle menu"
              data-ocid="nav.toggle"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-t border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              <Link
                to="/"
                data-ocid="nav.mobile.link.1"
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent ${location.pathname === "/" ? "text-brand-blue font-semibold bg-accent" : "text-foreground/80"}`}
              >
                Home
              </Link>
              <Link
                to="/about"
                data-ocid="nav.mobile.link.2"
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent ${location.pathname === "/about" ? "text-brand-blue font-semibold bg-accent" : "text-foreground/80"}`}
              >
                About
              </Link>

              {/* Mobile Services accordion */}
              <div>
                <button
                  type="button"
                  data-ocid="nav.mobile.services.toggle"
                  onClick={() =>
                    setMobileExpanded(
                      mobileExpanded === "services" ? null : "services",
                    )
                  }
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-foreground/80 hover:bg-accent transition-colors"
                >
                  Services
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${mobileExpanded === "services" ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {mobileExpanded === "services" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden pl-4"
                    >
                      {servicesDropdown.map((item, i) =>
                        item.subItems ? (
                          <div key={item.label}>
                            <button
                              type="button"
                              data-ocid={`nav.mobile.services.link.${i + 1}`}
                              onClick={() =>
                                setMobileLanguageExpanded(
                                  !mobileLanguageExpanded,
                                )
                              }
                              className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-foreground/70 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors font-medium"
                            >
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue/40 flex-shrink-0" />
                                {item.label}
                              </span>
                              <ChevronDown
                                size={13}
                                className={`transition-transform duration-200 text-brand-blue/60 ${mobileLanguageExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                            <AnimatePresence>
                              {mobileLanguageExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="overflow-hidden pl-4"
                                >
                                  {item.subItems.map((sub, j) => (
                                    <Link
                                      key={sub.label}
                                      to={sub.to}
                                      data-ocid={`nav.mobile.language.link.${j + 1}`}
                                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/70 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-brand-blue flex-shrink-0" />
                                      {sub.label}
                                    </Link>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <Link
                            key={item.label}
                            to={item.to}
                            data-ocid={`nav.mobile.services.link.${i + 1}`}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/70 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue/40 flex-shrink-0" />
                            {item.label}
                          </Link>
                        ),
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Countries accordion */}
              <div>
                <button
                  type="button"
                  data-ocid="nav.mobile.countries.toggle"
                  onClick={() =>
                    setMobileExpanded(
                      mobileExpanded === "countries" ? null : "countries",
                    )
                  }
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-foreground/80 hover:bg-accent transition-colors"
                >
                  Countries
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${mobileExpanded === "countries" ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {mobileExpanded === "countries" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden pl-4"
                    >
                      {countriesDropdown.map((item, i) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          data-ocid={`nav.mobile.countries.link.${i + 1}`}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/70 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue/40 flex-shrink-0" />
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/blog"
                data-ocid="nav.mobile.link.3"
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent ${location.pathname === "/blog" ? "text-brand-blue font-semibold bg-accent" : "text-foreground/80"}`}
              >
                Blog
              </Link>
              <Link
                to="/contact"
                data-ocid="nav.mobile.link.4"
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent ${location.pathname === "/contact" ? "text-brand-blue font-semibold bg-accent" : "text-foreground/80"}`}
              >
                Contact
              </Link>

              <div className="pt-2">
                <Button
                  asChild
                  data-ocid="nav.primary_button"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <Link to="/contact">Apply Now</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
