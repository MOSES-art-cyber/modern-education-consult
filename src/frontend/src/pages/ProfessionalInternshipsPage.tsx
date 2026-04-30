import AdminDropZone from "@/components/AdminDropZone";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Clock, MapPin, Star } from "lucide-react";
import { motion } from "motion/react";
import PageSectionRenderer from "../components/admin/PageSectionRenderer";
import { useGetAllWebsitePages } from "../hooks/useQueries";

const highlights = [
  {
    icon: MapPin,
    title: "Global Placements",
    desc: "Internship opportunities in top companies across USA, Canada, UK, and Europe.",
  },
  {
    icon: Clock,
    title: "Flexible Duration",
    desc: "Short-term and long-term internship programs tailored to your schedule.",
  },
  {
    icon: Star,
    title: "Hands-On Experience",
    desc: "Real-world professional exposure that boosts your career and resume.",
  },
];

export default function ProfessionalInternshipsPage() {
  const { data: pages } = useGetAllWebsitePages();
  const pageData = pages?.find((p) => p.slug === "professional-internships");
  const dynamicSections =
    pageData?.sections && pageData.sections.length > 0
      ? [...pageData.sections].sort((a, b) => Number(a.order) - Number(b.order))
      : null;

  if (dynamicSections) {
    return (
      <main className="pt-16 lg:pt-20">
        {dynamicSections.map((section) => (
          <PageSectionRenderer
            key={section.id.toString()}
            section={section}
            isEditing={false}
            onEditField={() => {}}
            onImagePick={() => {}}
          />
        ))}
      </main>
    );
  }

  return (
    <main className="pt-16 lg:pt-20">
      {/* Hero */}
      <section className="brand-dark-bg py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, oklch(0.58 0.2 258), transparent 60%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/services"
              data-ocid="internships.link"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft size={15} /> Back to Services
            </Link>
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
              <Building2 size={32} className="text-white" />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3 block">
              Additional Programs
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">
              Professional Internships
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Gain hands-on international work experience through our vetted
              internship placement program.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {highlights.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-accent/50 border border-border"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon size={22} className="text-primary" />
                </div>
                <h3 className="font-display font-bold text-brand-dark mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Admin-only Upload Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="p-8 rounded-3xl border-2 border-border bg-accent/30 shadow-card">
              <h2 className="font-display font-bold text-2xl text-brand-dark mb-2">
                Program Resources
              </h2>
              <p className="text-sm text-foreground/60 mb-6">
                Internship listings, guides, and links for the Internships
                program. Admin only.
              </p>
              <AdminDropZone
                label="Internship Program Materials"
                ocidPrefix="internships_resources"
              />
            </div>
          </motion.div>

          <div className="text-center mt-10">
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-blue"
            >
              <Link to="/contact" data-ocid="internships.primary_button">
                Apply Now — Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
