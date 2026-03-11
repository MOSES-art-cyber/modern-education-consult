import AdminDropZone from "@/components/AdminDropZone";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

const highlights = [
  {
    icon: TrendingUp,
    title: "Career Advancement",
    desc: "Courses designed to accelerate your career with in-demand professional skills.",
  },
  {
    icon: Users,
    title: "Industry Experts",
    desc: "Learn from experienced professionals with real-world international experience.",
  },
  {
    icon: BadgeCheck,
    title: "Certified Programs",
    desc: "Earn industry-recognized certificates that enhance your professional profile.",
  },
];

export default function OnlineProfessionalCoursesPage() {
  return (
    <main className="pt-16 lg:pt-20">
      {/* Hero */}
      <section className="brand-dark-bg py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at 70% 50%, oklch(0.58 0.2 258), transparent 60%)",
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
              data-ocid="online_professional.link"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft size={15} /> Back to Services
            </Link>
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
              <Briefcase size={32} className="text-white" />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3 block">
              Additional Programs
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">
              Online Professional Courses
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Enhance your professional skills with globally recognized online
              courses tailored to today's job market.
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
                Course links and materials for the Professional Courses program.
                Admin only.
              </p>
              <AdminDropZone
                label="Professional Course Materials"
                ocidPrefix="prof_courses_resources"
              />
            </div>
          </motion.div>

          <div className="text-center mt-10">
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-blue"
            >
              <Link
                to="/contact"
                data-ocid="online_professional.primary_button"
              >
                Enroll Now — Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
