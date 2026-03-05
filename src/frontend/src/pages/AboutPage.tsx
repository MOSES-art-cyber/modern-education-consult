import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { CheckCircle, Eye, Globe, Heart, Target } from "lucide-react";
import { motion } from "motion/react";

const values = [
  "Integrity and transparency in all client interactions",
  "Commitment to client success and satisfaction",
  "Professional excellence in service delivery",
  "Ethical guidance and honest advice",
  "Continuous improvement and learning",
];

export default function AboutPage() {
  return (
    <main className="pt-16 lg:pt-20">
      {/* ── Hero Banner ─────────────────────────────────── */}
      <section className="brand-dark-bg py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, oklch(0.58 0.2 258), transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3 block">
              Our Story
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">
              About Us
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Learn about our mission, vision, and commitment to transforming
              lives through international education and career opportunities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Who We Are ──────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-bold tracking-widest uppercase text-brand-blue mb-3 block">
                Who We Are
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-dark mb-6 leading-tight">
                A Trusted Partner in Your Global Journey
              </h2>
              <p className="text-foreground/70 text-base leading-relaxed mb-4">
                Modern Education Consult is an international education and
                career consultancy committed to connecting individuals with
                global opportunities. We are based in Rwanda with a deep
                understanding of the challenges faced by African students and
                professionals seeking international advancement.
              </p>
              <p className="text-foreground/70 text-base leading-relaxed mb-6">
                Our mission is to provide reliable, transparent, and
                professional services that help clients achieve their academic
                and career goals abroad. With years of experience in the field,
                we have helped hundreds of students and professionals realize
                their international dreams.
              </p>
              <ul className="space-y-2 mb-8">
                {values.map((value) => (
                  <li
                    key={value}
                    className="flex items-start gap-2.5 text-sm text-foreground/70"
                  >
                    <CheckCircle
                      size={16}
                      className="text-brand-blue flex-shrink-0 mt-0.5"
                    />
                    {value}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <img
                src="/assets/generated/about-team.dim_800x500.jpg"
                alt="Modern Education Consult team"
                className="rounded-2xl w-full object-cover shadow-card-hover"
                style={{ aspectRatio: "8/5" }}
              />
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl p-5 shadow-card border border-border">
                <p className="font-display font-bold text-3xl text-brand-blue">
                  500+
                </p>
                <p className="text-sm text-foreground/60 mt-1">
                  Successful Placements
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Vision & Mission ────────────────────────────── */}
      <section className="py-20 brand-white-blue-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold tracking-widest uppercase text-brand-blue mb-3 block">
              Purpose & Direction
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-dark">
              Our Vision & Mission
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Eye,
                title: "Our Vision",
                text: "To become a leading consultancy recognized for excellence in international education and global job placement services — a beacon of opportunity for African students and professionals.",
              },
              {
                icon: Target,
                title: "Our Mission",
                text: "To empower individuals by providing accurate information, professional guidance, and structured support throughout the application and placement process for international education and careers.",
              },
              {
                icon: Heart,
                title: "Our Values",
                text: "We believe in transparency, integrity, and personalized support. Every client deserves honest guidance and dedicated assistance on their journey to global opportunities.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="h-full border-0 bg-white shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-8">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                        <Icon size={28} className="text-brand-blue" />
                      </div>
                      <h3 className="font-display font-bold text-xl text-brand-dark mb-3">
                        {item.title}
                      </h3>
                      <p className="text-foreground/70 text-sm leading-relaxed">
                        {item.text}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="py-20 brand-dark-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Globe size={40} className="text-white/30 mx-auto mb-5" />
            <h2 className="font-display font-bold text-3xl text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-white/70 mb-8">
              Join hundreds of students and professionals who have achieved
              their international goals with our support.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-bold px-10 shadow-blue"
            >
              <Link to="/contact">Contact Us Today</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
