import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  GraduationCap,
} from "lucide-react";
import { motion } from "motion/react";

const studyAbroadServices = [
  {
    title: "Course and University Selection",
    desc: "Expert guidance in choosing the right institution and program that aligns with your academic background and career goals.",
  },
  {
    title: "Scholarship Search and Application Support",
    desc: "Comprehensive assistance in finding and applying for scholarships and financial aid opportunities.",
  },
  {
    title: "Admission Documentation Preparation",
    desc: "Professional preparation and review of all required application documents to maximize success chances.",
  },
  {
    title: "Visa Application Guidance",
    desc: "Step-by-step support through the student visa application process for your destination country.",
  },
  {
    title: "Pre-Departure Preparation",
    desc: "Comprehensive briefings on accommodation, culture, banking, and everything you need before traveling.",
  },
];

const studyAbroadExtra = [
  "Online Degree Courses",
  "Online Professional Courses",
  "Professional Internships",
  "Language Proficiency Programs",
];

const jobPlacementServices = [
  {
    title: "Job Opportunity Guidance",
    desc: "Access to verified international job listings and guidance on identifying the best opportunities for your skills.",
  },
  {
    title: "Application Processing Support",
    desc: "Professional help crafting compelling CVs, cover letters, and job applications for international markets.",
  },
  {
    title: "Documentation Verification",
    desc: "Thorough review and preparation of all employment-related documentation for overseas applications.",
  },
  {
    title: "Visa Assistance",
    desc: "Expert guidance on work visa categories and requirements for your target country.",
  },
  {
    title: "Pre-Travel Guidance",
    desc: "Comprehensive preparation for your international work assignment, from contracts to cultural orientation.",
  },
];

export default function ServicesPage() {
  return (
    <main className="pt-16 lg:pt-20">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="brand-dark-bg py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, oklch(0.58 0.2 258), transparent 60%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3 block">
              What We Offer
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">
              Our Services
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Comprehensive guidance for your international education and career
              aspirations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Study Abroad ─────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={28} className="text-brand-blue" />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-brand-blue block">
                    Academic
                  </span>
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-dark">
                    Study Abroad
                  </h2>
                </div>
              </div>
              <p className="text-foreground/70 leading-relaxed mb-6">
                We assist students in gaining admission to reputable
                institutions abroad. Our comprehensive study abroad services
                cover every aspect of your journey from initial planning to
                successful enrollment.
              </p>
              <div className="space-y-4 mb-8">
                {studyAbroadServices.map((service, i) => (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-accent hover:bg-accent/80 transition-colors"
                  >
                    <CheckCircle
                      size={18}
                      className="text-brand-blue flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-semibold text-sm text-brand-dark">
                        {service.title}
                      </p>
                      <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
                        {service.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-5 rounded-xl border-2 border-primary/20 bg-primary/5 mb-6">
                <p className="font-semibold text-sm text-brand-dark mb-3">
                  Additional Programs
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {studyAbroadExtra.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-xs text-foreground/70"
                    >
                      <ArrowRight size={12} className="text-brand-blue" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Process steps */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:sticky lg:top-24"
            >
              <Card className="border-0 shadow-card-hover bg-accent overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="font-display font-bold text-xl text-brand-dark mb-6">
                    Study Abroad Process
                  </h3>
                  <div className="space-y-6">
                    {[
                      {
                        step: "01",
                        title: "Free Consultation",
                        desc: "Discuss your goals, budget, and preferred destination.",
                      },
                      {
                        step: "02",
                        title: "Program Selection",
                        desc: "We identify the best universities and programs for you.",
                      },
                      {
                        step: "03",
                        title: "Application Support",
                        desc: "We prepare and submit all required documents.",
                      },
                      {
                        step: "04",
                        title: "Visa Processing",
                        desc: "Complete guidance through the visa application process.",
                      },
                      {
                        step: "05",
                        title: "Pre-Departure Brief",
                        desc: "Final preparation and orientation before you travel.",
                      },
                    ].map((step) => (
                      <div key={step.step} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-blue">
                          {step.step}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-brand-dark">
                            {step.title}
                          </p>
                          <p className="text-xs text-foreground/60 mt-0.5">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    asChild
                    className="w-full mt-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-blue"
                  >
                    <Link to="/contact">Start Your Application</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Job Placement ────────────────────────────────── */}
      <section className="py-20 brand-white-blue-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            {/* Process steps */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1 lg:sticky lg:top-24"
            >
              <Card className="border-0 shadow-card-hover bg-white overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="font-display font-bold text-xl text-brand-dark mb-6">
                    Job Placement Process
                  </h3>
                  <div className="space-y-6">
                    {[
                      {
                        step: "01",
                        title: "Career Assessment",
                        desc: "Evaluate your skills, experience, and target markets.",
                      },
                      {
                        step: "02",
                        title: "Opportunity Matching",
                        desc: "Find verified job openings that match your profile.",
                      },
                      {
                        step: "03",
                        title: "Application Preparation",
                        desc: "Craft powerful CVs and cover letters for international employers.",
                      },
                      {
                        step: "04",
                        title: "Documentation Review",
                        desc: "Ensure all employment documents are complete and verified.",
                      },
                      {
                        step: "05",
                        title: "Visa & Travel Support",
                        desc: "Full assistance with work visa and pre-travel preparation.",
                      },
                    ].map((step) => (
                      <div key={step.step} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-blue">
                          {step.step}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-brand-dark">
                            {step.title}
                          </p>
                          <p className="text-xs text-foreground/60 mt-0.5">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    asChild
                    className="w-full mt-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-blue"
                  >
                    <Link to="/contact">Explore Opportunities</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="order-1 lg:order-2"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Briefcase size={28} className="text-brand-blue" />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-brand-blue block">
                    Career
                  </span>
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-dark">
                    International Job Placement
                  </h2>
                </div>
              </div>
              <p className="text-foreground/70 leading-relaxed mb-6">
                We help qualified candidates explore verified job opportunities
                overseas. Our international job placement services provide
                comprehensive support from job search to successful employment.
              </p>
              <div className="space-y-4">
                {jobPlacementServices.map((service, i) => (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white hover:bg-white/80 transition-colors shadow-xs"
                  >
                    <CheckCircle
                      size={18}
                      className="text-brand-blue flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-semibold text-sm text-brand-dark">
                        {service.title}
                      </p>
                      <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
                        {service.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────── */}
      <section className="py-20 brand-dark-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-3xl text-white mb-4">
              Ready to Take the Next Step?
            </h2>
            <p className="text-white/70 mb-8">
              Contact us for a free consultation and learn how we can help you
              achieve your international goals.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-bold px-10 shadow-blue"
            >
              <Link to="/contact">Get Free Consultation</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
