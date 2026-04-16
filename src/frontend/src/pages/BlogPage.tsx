import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Flame,
  MessageCircle,
  Pencil,
  Search,
  Settings,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetAllBlogPosts } from "../hooks/useQueries";
import type { BlogPost } from "../types/index";

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getPostImage(post: BlogPost, index: number): string {
  if (post.imageUrl) return post.imageUrl;
  const cat = post.category?.toLowerCase() ?? "";
  if (cat.includes("study")) {
    return "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80";
  }
  if (
    cat.includes("visa") ||
    cat.includes("visa assistance") ||
    cat.includes("immigration") ||
    cat.includes("international jobs")
  ) {
    return "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80";
  }
  const fallbacks = [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
  ];
  return fallbacks[index % fallbacks.length];
}

const CATEGORIES = [
  "All Posts",
  "Study Abroad",
  "International Jobs",
  "Visa Assistance",
  "Scholarships",
  "Application Guides",
  "Online Courses",
  "Internships",
  "Language Programs",
  "Success Stories",
  "Updates",
];

function isRecentPost(post: BlogPost): boolean {
  const ms = Number(post.publishedDate) / 1_000_000;
  const ageMs = Date.now() - ms;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return ageDays <= 21;
}

function EditButton({ postId }: { postId: bigint }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = `/admin?editId=${postId.toString()}`;
      }}
      className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 hover:bg-white text-blue-700 text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-md border border-blue-200 hover:border-blue-400 transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 duration-300"
      data-ocid="blog.edit.button"
    >
      <Pencil size={12} />
      Edit
    </button>
  );
}

export default function BlogPage() {
  const { data: posts, isLoading } = useGetAllBlogPosts();
  const { identity } = useInternetIdentity();
  const isAdmin = !!identity && !identity.getPrincipal().isAnonymous();
  const displayPosts = posts ?? [];

  const [activeCategory, setActiveCategory] = useState("All Posts");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (activeCategory === "Updates") {
      document.title =
        "Latest Study Abroad & Visa Updates | Modern Education Consult";
    } else {
      document.title = "Blog | Modern Education Consult";
    }
    return () => {
      document.title = "Modern Education Consult";
    };
  }, [activeCategory]);

  const filteredPosts = displayPosts.filter((post) => {
    const matchesCategory =
      activeCategory === "All Posts" || post.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.summary.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts[0];
  const listPosts = filteredPosts.slice(1);
  const trendingPosts = displayPosts.slice(0, 4);

  return (
    <main className="pt-16 lg:pt-20 min-h-screen bg-gray-50">
      {/* ── Admin Banner ───────────────────────────────── */}
      {isAdmin && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-amber-800">
              You are logged in as Admin. Hover over any post image to reveal
              the <strong>Edit</strong> button.
            </p>
            <Button
              asChild
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              <a href="/admin" data-ocid="blog.admin.link">
                Open Admin Panel
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* ── Top Bar: Title + Search ─────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">
              Blog &amp; Insights
            </h1>
            <p className="text-sm text-gray-500">
              Expert guidance on study abroad, visas &amp; more
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative max-w-xs w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <Input
                data-ocid="blog.search_input"
                type="search"
                placeholder="Search articles…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-50 border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Button
              asChild
              size="sm"
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold whitespace-nowrap flex-shrink-0"
              data-ocid="blog.admin_panel.button"
            >
              <a href="/admin" className="flex items-center gap-1.5">
                <Settings size={14} />
                Admin Panel
              </a>
            </Button>
          </div>
        </div>

        {/* ── Category Tabs ──────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex gap-2 overflow-x-auto pb-0 scrollbar-none"
            style={{ scrollbarWidth: "none" }}
          >
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                data-ocid={`blog.${cat.toLowerCase().replace(/\s+/g, "_")}.tab`}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${
                  activeCategory === cat
                    ? "text-blue-700 border-blue-600 bg-blue-50"
                    : "text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div data-ocid="blog.loading_state" className="space-y-8">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden border">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-28 mt-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div data-ocid="blog.empty_state" className="text-center py-20">
            <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-xl text-[#1e3a5f] mb-2">
              No posts found
            </h3>
            <p className="text-gray-500">
              {displayPosts.length === 0
                ? "No blog posts yet. Log in as admin to add your first post."
                : "Try a different category or search term."}
            </p>
            {isAdmin && displayPosts.length === 0 && (
              <Button
                asChild
                className="mt-6 bg-blue-700 hover:bg-blue-800 text-white font-bold"
              >
                <a href="/admin">Add First Blog Post</a>
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* ── Featured Post ─────────────────────────── */}
            {featuredPost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10"
                data-ocid="blog.item.1"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-lg group bg-[#1e3a5f]">
                  <div className="relative h-72 md:h-[420px]">
                    <img
                      src={getPostImage(featuredPost, 0)}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f2140]/90 via-[#0f2140]/30 to-transparent" />
                    {isAdmin && <EditButton postId={featuredPost.id} />}
                  </div>

                  <div className="absolute top-5 left-5">
                    <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {featuredPost.category || "General"}
                    </span>
                    {featuredPost.category === "Updates" &&
                      isRecentPost(featuredPost) && (
                        <span className="bg-orange-400 text-white text-xs font-bold px-2.5 py-0.5 rounded-full ml-2">
                          UPDATE
                        </span>
                      )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <p className="text-white/60 text-xs mb-2">
                      {formatDate(featuredPost.publishedDate)}
                    </p>
                    <h2 className="text-white font-bold text-2xl sm:text-3xl leading-snug mb-3 max-w-2xl">
                      {featuredPost.title}
                    </h2>
                    <p className="text-white/75 text-sm mb-5 max-w-xl line-clamp-2">
                      {featuredPost.summary}
                    </p>
                    <Link
                      to="/blog/$id"
                      params={{ id: featuredPost.id.toString() }}
                      data-ocid="blog.featured.button"
                      className="inline-flex items-center gap-2 bg-white text-[#1e3a5f] font-bold text-sm px-5 py-2.5 rounded-full hover:bg-blue-50 transition-colors shadow"
                    >
                      Read Article <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Main + Sidebar ──────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* ── Blog List ─────────────────────────────── */}
              <div className="lg:col-span-2">
                {listPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {listPosts.map((post, i) => (
                      <motion.div
                        key={post.id.toString()}
                        data-ocid={`blog.item.${i + 2}`}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: (i % 4) * 0.08 }}
                        className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col"
                      >
                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#1e3a5f] to-[#1d4ed8]">
                          <img
                            src={getPostImage(post, i + 1)}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          {isAdmin && <EditButton postId={post.id} />}
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                              {post.category || "General"}
                            </span>
                            {post.category === "Updates" &&
                              isRecentPost(post) && (
                                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full border border-orange-200 animate-pulse">
                                  UPDATE
                                </span>
                              )}
                            <span className="text-xs text-gray-400">
                              {formatDate(post.publishedDate)}
                            </span>
                          </div>

                          <h3 className="font-bold text-[#1e3a5f] text-base mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3 flex-1">
                            {post.summary}
                          </p>

                          <Link
                            to="/blog/$id"
                            params={{ id: post.id.toString() }}
                            data-ocid={`blog.read_more.button.${i + 2}`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900 border border-blue-200 hover:border-blue-400 rounded-lg px-3 py-1.5 transition-all w-fit"
                          >
                            Read More <ArrowRight size={13} />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-sm">
                      Only the featured post matches your filter.
                    </p>
                  </div>
                )}
              </div>

              {/* ── Sidebar ─────────────────────────────────── */}
              <aside className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-[#1e3a5f] px-5 py-4 flex items-center gap-2">
                    <Flame size={18} className="text-orange-400" />
                    <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                      Trending Posts
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {trendingPosts.map((post, i) => (
                      <Link
                        key={post.id.toString()}
                        to="/blog/$id"
                        params={{ id: post.id.toString() }}
                        data-ocid={`blog.trending.item.${i + 1}`}
                        className="flex items-start gap-3 px-5 py-3.5 hover:bg-blue-50/50 transition-colors group"
                      >
                        <div className="flex-shrink-0 w-16 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-[#1e3a5f] to-[#1d4ed8]">
                          <img
                            src={getPostImage(post, i)}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#1e3a5f] mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors leading-snug">
                            {post.title}
                          </p>
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                            {post.category || "General"}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1d4ed8] rounded-2xl p-6 text-white text-center shadow">
                  <MessageCircle
                    size={32}
                    className="mx-auto mb-3 text-green-300"
                  />
                  <h4 className="font-bold text-base mb-1">Need Help?</h4>
                  <p className="text-white/70 text-xs mb-4">
                    Chat with our consultants directly on WhatsApp
                  </p>
                  <a
                    href="https://wa.me/250795780073"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-ocid="blog.whatsapp.button"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-5 py-2.5 rounded-full transition-colors shadow"
                  >
                    <MessageCircle size={16} />
                    Chat on WhatsApp
                  </a>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>

      {/* ── CTA Section ──────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-gray-100 mt-8">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <BookOpen size={36} className="text-blue-600 mx-auto mb-4" />
            <h2 className="font-bold text-2xl sm:text-3xl text-[#1e3a5f] mb-3">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-500 mb-6">
              Our consultants are ready to guide you through every step of your
              international education or career path.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 shadow"
            >
              <Link to="/contact" data-ocid="blog.cta.button">
                Talk to a Consultant
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
