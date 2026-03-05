import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Calendar, User } from "lucide-react";
import { motion } from "motion/react";
import type { BlogPost } from "../backend.d.ts";
import { useGetAllBlogPosts } from "../hooks/useQueries";

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const samplePosts: BlogPost[] = [
  {
    id: 1n,
    title: "How to Apply for a Canadian Study Permit in 2025",
    summary:
      "A comprehensive guide to navigating the Canadian study permit application process, including tips for strong applications and common mistakes to avoid.",
    content: "",
    author: "Modern Education Consult",
    publishedDate: BigInt(Date.now() * 1_000_000),
    imageUrl: "",
  },
  {
    id: 2n,
    title: "Top 5 Scholarships for African Students Studying Abroad",
    summary:
      "Discover the most lucrative scholarship opportunities available for African students looking to pursue higher education in the UK, USA, Canada, and Europe.",
    content: "",
    author: "Modern Education Consult",
    publishedDate: BigInt((Date.now() - 7 * 24 * 3600 * 1000) * 1_000_000),
    imageUrl: "",
  },
  {
    id: 3n,
    title: "Working in the UAE: What Rwandan Professionals Need to Know",
    summary:
      "Essential information for Rwandan professionals considering employment opportunities in the United Arab Emirates, including visa requirements and cultural considerations.",
    content: "",
    author: "Modern Education Consult",
    publishedDate: BigInt((Date.now() - 14 * 24 * 3600 * 1000) * 1_000_000),
    imageUrl: "",
  },
  {
    id: 4n,
    title: "The Complete Guide to Chinese Government Scholarships (CSC)",
    summary:
      "Everything you need to know about applying for the Chinese Government Scholarship through the China Scholarship Council — one of the most generous scholarships for African students.",
    content: "",
    author: "Modern Education Consult",
    publishedDate: BigInt((Date.now() - 21 * 24 * 3600 * 1000) * 1_000_000),
    imageUrl: "",
  },
  {
    id: 5n,
    title: "IELTS vs TOEFL: Which English Test Should You Choose?",
    summary:
      "A detailed comparison of IELTS and TOEFL language proficiency tests to help you decide which is best for your target institution and country.",
    content: "",
    author: "Modern Education Consult",
    publishedDate: BigInt((Date.now() - 28 * 24 * 3600 * 1000) * 1_000_000),
    imageUrl: "",
  },
  {
    id: 6n,
    title: "Understanding the UK Graduate Route Visa",
    summary:
      "The UK's Graduate Route visa allows international graduates to stay and work in the UK for up to 2 years after completing their studies. Here's everything you need to know.",
    content: "",
    author: "Modern Education Consult",
    publishedDate: BigInt((Date.now() - 35 * 24 * 3600 * 1000) * 1_000_000),
    imageUrl: "",
  },
];

const categoryColors = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
];
const categories = [
  "Study Abroad",
  "Job Placement",
  "Scholarships",
  "Visa Guides",
  "Career Tips",
];

export default function BlogPage() {
  const { data: posts, isLoading } = useGetAllBlogPosts();
  const displayPosts = posts && posts.length > 0 ? posts : samplePosts;

  return (
    <main className="pt-16 lg:pt-20">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="brand-dark-bg py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at 40% 50%, oklch(0.58 0.2 258), transparent 60%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3 block">
              Knowledge Hub
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">
              Our Blog
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Expert insights, guides, and news on international education and
              career opportunities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Blog Grid ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div
              data-ocid="blog.loading_state"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden border border-border"
                >
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-28 mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayPosts.length === 0 ? (
            <div data-ocid="blog.empty_state" className="text-center py-20">
              <BookOpen
                size={48}
                className="text-muted-foreground mx-auto mb-4"
              />
              <h3 className="font-display font-bold text-xl text-brand-dark mb-2">
                No Posts Yet
              </h3>
              <p className="text-foreground/60">
                Check back soon for expert articles and guides.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayPosts.map((post, i) => (
                <motion.div
                  key={post.id.toString()}
                  data-ocid={`blog.item.${i + 1}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* Header image or gradient */}
                      <div
                        className="h-44 flex items-end relative overflow-hidden"
                        style={{
                          background: post.imageUrl
                            ? `url(${post.imageUrl}) center/cover no-repeat`
                            : "linear-gradient(135deg, oklch(0.32 0.11 262), oklch(0.58 0.2 258))",
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="relative px-4 pb-3">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${categoryColors[i % categoryColors.length]}`}
                          >
                            {categories[i % categories.length]}
                          </span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-display font-bold text-base text-brand-dark mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-foreground/60 leading-relaxed mb-4 line-clamp-3 flex-1">
                          {post.summary}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-foreground/50 mb-4">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {post.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(post.publishedDate)}
                          </span>
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-primary text-brand-blue hover:bg-primary hover:text-white font-semibold text-xs transition-all"
                        >
                          <Link
                            to="/blog/$id"
                            params={{ id: post.id.toString() }}
                            className="flex items-center gap-1.5"
                          >
                            Read More <ArrowRight size={13} />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Newsletter / CTA ─────────────────────────────── */}
      <section className="py-20 brand-white-blue-bg">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <BookOpen size={36} className="text-brand-blue mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-dark mb-3">
              Ready to Start Your Journey?
            </h2>
            <p className="text-foreground/60 mb-6">
              Our consultants are ready to guide you through every step of your
              international education or career path.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-blue"
            >
              <Link to="/contact">Talk to a Consultant</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
