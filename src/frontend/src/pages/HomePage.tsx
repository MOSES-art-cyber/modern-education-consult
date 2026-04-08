import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle,
  Globe,
  GraduationCap,
  Network,
  Quote,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { SiWhatsapp } from "react-icons/si";
import type { BlogPost } from "../backend.d.ts";
import { useGetAllBlogPosts, useGetAllTestimonials } from "../hooks/useQueries";

const studyAbroadServices = [
  "University Admissions Assistance",
  "Scholarship Application Support",
  "Course Selection Guidance",
  "Visa Processing Assistance",
  "Online Degree Courses",
  "Online Professional Courses",
  "Professional Internships",
  "Language Proficiency",
];

const jobPlacementServices = [
  "Overseas Employment Opportunities",
  "Job Application Support",
  "Document Preparation",
  "Visa Guidance",
];

const countries = [
  { name: "USA", flag: "🇺🇸" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "UK", flag: "🇬🇧" },
  { name: "UAE", flag: "🇦🇪" },
  { name: "European Countries", flag: "🇪🇺" },
  { name: "China", flag: "🇨🇳" },
  { name: "Australia", flag: "🇦🇺" },
];

const whyChooseUs = [
  {
    icon: Shield,
    title: "Professional and Ethical Services",
    desc: "We uphold the highest standards of professionalism and ethics in all our consultations.",
  },
  {
    icon: CheckCircle,
    title: "Transparent Process",
    desc: "Clear, step-by-step guidance with no hidden fees or surprises along the way.",
  },
  {
    icon: Users,
    title: "Personalized Client Support",
    desc: "Tailored advice and dedicated support designed specifically for your goals.",
  },
  {
    icon: Network,
    title: "Reliable International Network",
    desc: "Strong partnerships with universities and employers across the globe.",
  },
  {
    icon: BookOpen,
    title: "Step-by-Step Guidance",
    desc: "Comprehensive support from initial consultation through successful placement.",
  },
];

const fallbackTestimonials = [
  {
    clientName: "Amina Uwase",
    country: "Now studying in Canada",
    quote:
      "Modern Education Consult made my dream of studying in Canada a reality. Their guidance was professional and thorough from start to finish.",
    photoUrl: "/assets/generated/testimonial-1.dim_200x200.jpg",
  },
  {
    clientName: "Jean-Pierre Niyonzima",
    country: "Working in UAE",
    quote:
      "Thanks to their job placement services, I secured a position in Dubai within three months. Exceptional support throughout the entire process.",
    photoUrl: "/assets/generated/testimonial-2.dim_200x200.jpg",
  },
  {
    clientName: "Claudine Mukamana",
    country: "Studying in UK",
    quote:
      "The scholarship support they provided saved me thousands. I couldn't have navigated the UK university application process without them.",
    photoUrl: "/assets/generated/testimonial-3.dim_200x200.jpg",
  },
  {
    clientName: "Nsengiyumva Ibasumba Alain Aristide",
    country: "Now working in Germany",
    quote:
      "Modern Education Consult guided me through every step — from credential recognition and German B2 preparation to landing my engineering job in Stuttgart. They made my German dream a reality.",
    photoUrl: "/assets/generated/testimonial-4.dim_200x200.jpg",
  },
];

const localPhotos = [
  "/assets/generated/testimonial-1.dim_200x200.jpg",
  "/assets/generated/testimonial-2.dim_200x200.jpg",
  "/assets/generated/testimonial-3.dim_200x200.jpg",
  "/assets/generated/testimonial-4.dim_200x200.jpg",
];

function isRecentPost(post: BlogPost): boolean {
  const ms = Number(post.publishedDate) / 1_000_000;
  return (Date.now() - ms) / (1000 * 60 * 60 * 24) <= 21;
}

function UpdatesSection() {
  const { data: allPosts } = useGetAllBlogPosts();
  const updatesPosts = (allPosts ?? [])
    .filter((p) => p.category === "Updates")
    .sort((a, b) => Number(b.publishedDate - a.publishedDate))
    .slice(0, 4);

  if (updatesPosts.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white border-t border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1e3a5f]">
              Latest Updates
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Immigration news, policy changes &amp; scholarship deadlines
            </p>
          </div>
          <Link
            to="/blog"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900 border border-blue-200 hover:border-blue-400 rounded-lg px-4 py-2 transition-all"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {updatesPosts.map((post, i) => (
            <Link
              key={post.id.toString()}
              to="/blog/$id"
              params={{ id: post.id.toString() }}
              data-ocid={`updates.item.${i + 1}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#1e3a5f] to-[#1d4ed8]">
                <img
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80"
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                {isRecentPost(post) && (
                  <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    NEW
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <p className="text-xs text-gray-400 mb-1">
                  {new Date(
                    Number(post.publishedDate) / 1_000_000,
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <h3 className="font-bold text-[#1e3a5f] text-sm line-clamp-2 group-hover:text-blue-700 transition-colors flex-1">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
        <div className="sm:hidden mt-6 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900 border border-blue-200 rounded-lg px-4 py-2"
          >
            View All Updates <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
export default function HomePage() {
  const { data: testimonials, isLoading: testimonialsLoading } =
    useGetAllTestimonials();

  const displayTestimonials =
    testimonials && testimonials.length > 0
      ? testimonials.slice(0, 4).map((t, i) => ({
          ...t,
          photoUrl: t.photoUrl || localPhotos[i] || "",
        }))
      : fallbackTestimonials;

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-start justify-center overflow-hidden pt-24 lg:pt-28"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.08 262) 0%, oklch(0.35 0.12 262) 50%, oklch(0.28 0.1 258) 100%)",
        }}
      >
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-banner.dim_1600x700.jpg')",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.08 262 / 0.88) 0%, oklch(0.35 0.12 262 / 0.82) 50%, oklch(0.28 0.1 258 / 0.9) 100%)",
          }}
        />

        {/* Decorative shapes */}
        <div
          className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.7 0.15 252) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-10 left-10 w-48 h-48 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.18 258) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6 text-white/80"
              style={{
                background: "oklch(0.58 0.2 258 / 0.3)",
                border: "1px solid oklch(0.7 0.15 252 / 0.3)",
              }}
            >
              International Education & Career Consultancy
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-display font-bold text-white text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6"
          >
            Your Gateway to Global
            <br />
            <span style={{ color: "oklch(0.75 0.15 252)" }}>
              Education and Career
            </span>
            <br />
            Opportunities
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            We provide professional guidance for studying and working abroad
            with reliable support at every stage of your journey.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              asChild
              size="lg"
              data-ocid="hero.primary_button"
              className="bg-white hover:bg-white/90 text-brand-dark font-bold px-8 py-4 text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <Link to="/contact">Apply Now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              data-ocid="hero.secondary_button"
              className="font-bold px-8 py-4 text-base text-white border-2 transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: "#25D366", borderColor: "#25D366" }}
            >
              <a
                href="https://wa.me/250795780073"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <SiWhatsapp size={20} />
                Chat with Us on WhatsApp
              </a>
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto"
          >
            {[
              { num: "500+", label: "Students Placed" },
              { num: "7+", label: "Countries" },
              { num: "98%", label: "Success Rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display font-bold text-2xl sm:text-3xl text-white">
                  {stat.num}
                </p>
                <p className="text-white/60 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            aria-hidden="true"
          >
            <title>Wave divider</title>
            <path
              d="M0,60 C360,20 1080,20 1440,60 L1440,60 L0,60 Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ── About Preview ─────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-bold tracking-widest uppercase text-brand-blue mb-3 block">
                About Us
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-dark mb-6 leading-tight">
                About Modern Education Consult
              </h2>
              <p className="text-foreground/70 text-base leading-relaxed mb-4">
                Modern Education Consult is a trusted consultancy dedicated to
                helping students and professionals access international
                education and employment opportunities.
              </p>
              <p className="text-foreground/70 text-base leading-relaxed mb-8">
                We provide transparent, step-by-step assistance to ensure a
                smooth and successful application process for every client we
                serve.
              </p>
              <Button
                asChild
                variant="outline"
                data-ocid="about_preview.secondary_button"
                className="border-2 border-primary text-brand-blue hover:bg-primary hover:text-white font-semibold transition-all duration-200"
              >
                <Link to="/about">Learn More About Us</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div
                className="absolute -inset-4 rounded-2xl opacity-10"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.58 0.2 258), oklch(0.35 0.12 262))",
                }}
              />
              <img
                src="/assets/uploads/WhatsApp-Image-2026-03-05-at-12.08.05-1.jpeg"
                alt="Modern Education Consult team"
                className="relative rounded-2xl w-full object-cover shadow-card-hover"
                style={{ aspectRatio: "8/5" }}
              />
              <div className="absolute -bottom-4 -right-4 bg-primary text-white rounded-xl p-4 shadow-blue">
                <p className="font-display font-bold text-2xl">5+</p>
                <p className="text-xs text-white/80">Years of Excellence</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────── */}
      <section className="py-20 brand-white-blue-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold tracking-widest uppercase text-brand-blue mb-3 block">
              What We Offer
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-dark">
              Our Services
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Study Abroad Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              data-ocid="services.item.1"
            >
              <Card className="h-full shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border-0 bg-white">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <GraduationCap size={28} className="text-brand-blue" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-brand-dark mb-4">
                    Study Abroad Services
                  </h3>
                  <ul className="space-y-2.5 mb-8">
                    {studyAbroadServices.map((service) => (
                      <li
                        key={service}
                        className="flex items-center gap-2.5 text-sm text-foreground/70"
                      >
                        <CheckCircle
                          size={15}
                          className="text-brand-blue flex-shrink-0"
                        />
                        {service}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    data-ocid="services.button.1"
                    className="bg-primary hover:bg-primary/90 text-white font-semibold w-full shadow-blue"
                  >
                    <Link to="/services">Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Job Placement Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              data-ocid="services.item.2"
            >
              <Card className="h-full shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border-0 bg-white">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <Briefcase size={28} className="text-brand-blue" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-brand-dark mb-4">
                    International Job Placement
                  </h3>
                  <ul className="space-y-2.5 mb-8">
                    {jobPlacementServices.map((service) => (
                      <li
                        key={service}
                        className="flex items-center gap-2.5 text-sm text-foreground/70"
                      >
                        <CheckCircle
                          size={15}
                          className="text-brand-blue flex-shrink-0"
                        />
                        {service}
                      </li>
                    ))}
                  </ul>
                  <div className="p-4 rounded-xl bg-accent mb-6">
                    <p className="text-xs text-foreground/60 italic">
                      We connect qualified candidates with verified
                      international job opportunities, providing comprehensive
                      support from application to placement.
                    </p>
                  </div>
                  <Button
                    asChild
                    data-ocid="services.button.2"
                    className="bg-primary hover:bg-primary/90 text-white font-semibold w-full shadow-blue"
                  >
                    <Link to="/services">Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Countries ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold tracking-widest uppercase text-brand-blue mb-3 block">
              Our Reach
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-dark">
              Countries We Serve
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            {countries.map((country, i) => (
              <motion.div
                key={country.name}
                data-ocid={`countries.item.${i + 1}`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
                whileHover={{ scale: 1.05, y: -3 }}
                className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-accent border border-border shadow-xs hover:shadow-card hover:border-primary/30 transition-all duration-200 cursor-default"
              >
                <span className="text-2xl">{country.flag}</span>
                <span className="font-semibold text-sm text-brand-dark">
                  {country.name}
                </span>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-10">
            <Button
              asChild
              variant="outline"
              className="border-2 border-primary text-brand-blue hover:bg-primary hover:text-white font-semibold"
            >
              <Link to="/countries">View All Countries</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="py-20 brand-dark-bg relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute top-10 left-10 w-96 h-96 rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.7 0.15 252), transparent)",
            }}
          />
          <div
            className="absolute bottom-10 right-10 w-72 h-72 rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.65 0.18 258), transparent)",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3 block">
              What Our Clients Say
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
              Client Success Stories
            </h2>
          </motion.div>

          {testimonialsLoading ? (
            <div
              data-ocid="testimonials.loading_state"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="w-12 h-12 rounded-full bg-white/20" />
                    <div>
                      <Skeleton className="h-4 w-24 bg-white/20 mb-1" />
                      <Skeleton className="h-3 w-16 bg-white/20" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full bg-white/20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayTestimonials.map((testimonial, i) => (
                <motion.div
                  key={testimonial.clientName}
                  data-ocid={`testimonials.item.${i + 1}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="h-full bg-white border-0 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <Quote size={28} className="text-primary/30 mb-3" />
                      <p className="text-foreground/70 text-sm leading-relaxed mb-5 italic">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 border-2 border-primary/20">
                          <AvatarImage
                            src={testimonial.photoUrl}
                            alt={testimonial.clientName}
                          />
                          <AvatarFallback className="bg-primary text-white text-sm font-bold">
                            {testimonial.clientName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm text-brand-dark">
                            {testimonial.clientName}
                          </p>
                          <p className="text-xs text-brand-blue">
                            {testimonial.country}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────── */}
      <section className="py-20 brand-white-blue-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold tracking-widest uppercase text-brand-blue mb-3 block">
              Our Difference
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-dark">
              Why Choose Us
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  data-ocid={`why_choose.item.${i + 1}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Card className="h-full border-0 bg-white shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Icon size={22} className="text-brand-blue" />
                      </div>
                      <h3 className="font-display font-bold text-base text-brand-dark mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-foreground/60 leading-relaxed">
                        {item.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* Sixth card CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="h-full border-0 shadow-card bg-primary hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div>
                    <Globe size={28} className="text-white/70 mb-4" />
                    <h3 className="font-display font-bold text-base text-white mb-2">
                      Ready to Start?
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      Take the first step towards your international education
                      or career journey today.
                    </p>
                  </div>
                  <Button
                    asChild
                    className="mt-5 bg-white hover:bg-white/90 text-brand-blue font-bold"
                  >
                    <Link to="/contact">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Updates Section ─────────────────────────────── */}
      <UpdatesSection />
      {/* ── Bottom CTA ────────────────────────────────────── */}
      <section className="py-20 brand-dark-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Start your international journey today.
            </h2>
            <p className="text-white/70 text-lg mb-10">
              Contact our team for professional guidance and consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                data-ocid="cta.primary_button"
                className="bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-blue hover:-translate-y-0.5 transition-all"
              >
                <Link to="/contact">Apply Now</Link>
              </Button>
              <Button
                asChild
                size="lg"
                data-ocid="cta.secondary_button"
                className="font-bold px-8 text-white hover:-translate-y-0.5 transition-all"
                style={{ backgroundColor: "#25D366" }}
              >
                <a
                  href="https://wa.me/250795780073"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <SiWhatsapp size={20} />
                  WhatsApp Us
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
