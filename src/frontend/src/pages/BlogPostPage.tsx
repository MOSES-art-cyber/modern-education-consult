import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  Linkedin,
  MessageCircle,
  Share2,
  Tag,
  Twitter,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ImageSlider from "../components/blog/ImageSlider";
import { parsePostContent } from "../components/blog/postMetaUtils";
import { useGetAllBlogPosts, useGetBlogPostById } from "../hooks/useQueries";

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getPostImage(imageUrl: string, category: string): string {
  if (imageUrl) return imageUrl;
  const cat = category?.toLowerCase() ?? "";
  if (cat.includes("study")) {
    return "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80";
  }
  if (cat.includes("visa") || cat.includes("immigration")) {
    return "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80";
  }
  return "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80";
}

interface SliderData {
  images: { url: string; caption?: string }[];
  autoplay?: boolean;
}

type ContentSegment =
  | { type: "html"; value: string }
  | { type: "slider"; data: SliderData };

/**
 * Replace [CTA:{...}] markers with button HTML, then parse [SLIDER:{...}] into segments
 */
function processContent(rawContent: string): ContentSegment[] {
  // First replace CTA markers with HTML
  const withCta = rawContent.replace(/\[CTA:(\{[^\]]+\})\]/g, (_, json) => {
    try {
      const { text, url, style } = JSON.parse(json) as {
        text: string;
        url: string;
        style: string;
      };
      const cls =
        style === "primary"
          ? "cta-btn cta-btn-primary"
          : style === "secondary"
            ? "cta-btn cta-btn-secondary"
            : "cta-btn cta-btn-outline";
      return `<a href="${url}" class="${cls}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    } catch {
      return "";
    }
  });

  // Then parse slider markers
  const segments: ContentSegment[] = [];
  const MARKER_PREFIX = "[SLIDER:";
  let remaining = withCta;

  while (remaining.length > 0) {
    const startIdx = remaining.indexOf(MARKER_PREFIX);
    if (startIdx === -1) {
      if (remaining) segments.push({ type: "html", value: remaining });
      break;
    }
    if (startIdx > 0) {
      segments.push({ type: "html", value: remaining.slice(0, startIdx) });
    }
    const jsonStart = startIdx + MARKER_PREFIX.length;
    const endIdx = remaining.indexOf("}]", jsonStart);
    if (endIdx === -1) {
      segments.push({ type: "html", value: remaining.slice(startIdx) });
      break;
    }
    const jsonStr = remaining.slice(jsonStart, endIdx + 1);
    try {
      const data = JSON.parse(jsonStr) as SliderData;
      if (
        data.images &&
        Array.isArray(data.images) &&
        data.images.length >= 2
      ) {
        segments.push({ type: "slider", data });
      }
    } catch {
      // skip
    }
    remaining = remaining.slice(endIdx + 2);
  }

  return segments;
}

export default function BlogPostPage() {
  const { id } = useParams({ from: "/blog/$id" });
  const postId = BigInt(id);
  const { data: post, isLoading, isError } = useGetBlogPostById(postId);
  const { data: allPosts } = useGetAllBlogPosts();
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState<"en" | "fr">("en");

  // Parse meta from content
  const { meta, content: parsedContent } = post
    ? parsePostContent(post.content)
    : { meta: null, content: "" };

  // SEO meta tags
  useEffect(() => {
    if (!post || !meta) return;

    document.title =
      meta.metaTitle || `${post.title} | Modern Education Consult`;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(
        `meta[${attr}="${name}"]`,
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const canonical = `${window.location.origin}/blog/${post.id}`;
    setMeta("description", meta.metaDesc || post.summary);
    if (meta.keywords) setMeta("keywords", meta.keywords);
    setMeta("og:title", post.title, true);
    setMeta("og:description", meta.metaDesc || post.summary, true);
    setMeta("og:type", "article", true);
    setMeta("og:url", canonical, true);
    if (post.imageUrl) setMeta("og:image", post.imageUrl, true);
    setMeta("twitter:card", post.imageUrl ? "summary_large_image" : "summary");
    setMeta("twitter:title", post.title);
    setMeta("twitter:description", meta.metaDesc || post.summary);

    let canonicalEl = document.querySelector(
      "link[rel='canonical']",
    ) as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", canonical);

    return () => {
      document.title = "Modern Education Consult";
    };
  }, [post, meta]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(post?.title ?? "");

  // Related posts
  const relatedPosts =
    allPosts
      ?.filter((p) => p.id !== post?.id && p.category === post?.category)
      .slice(0, 3) ?? [];

  return (
    <main className="pt-16 lg:pt-20 min-h-screen bg-gray-50">
      {/* Back nav */}
      <div className="bg-[#1e3a5f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <Button
            asChild
            variant="ghost"
            data-ocid="blog_post.button"
            className="text-white/70 hover:text-white hover:bg-white/10 -ml-2"
          >
            <Link to="/blog" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {isLoading ? (
          <div data-ocid="blog_post.loading_state" className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-72 w-full rounded-2xl" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ) : isError || !post ? (
          <div data-ocid="blog_post.error_state" className="text-center py-20">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="font-bold text-2xl text-[#1e3a5f] mb-2">
              Post Not Found
            </h2>
            <p className="text-gray-500 mb-6">
              The blog post you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </p>
            <Button
              asChild
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold"
            >
              <Link to="/blog">Return to Blog</Link>
            </Button>
          </div>
        ) : (
          <motion.article
            data-ocid="blog_post.panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Article header */}
            <header className="mb-6">
              {/* Language toggle — only shown when bilingual enabled */}
              {meta?.bilingualEnabled &&
                meta.frenchTitle &&
                meta.frenchContent && (
                  <div
                    className="flex gap-2 mb-5"
                    data-ocid="blog_post.lang.toggle"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveLang("en")}
                      className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${
                        activeLang === "en"
                          ? "bg-blue-700 text-white border-blue-700"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                      data-ocid="blog_post.lang_en.button"
                    >
                      🇬🇧 EN
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveLang("fr")}
                      className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${
                        activeLang === "fr"
                          ? "bg-blue-700 text-white border-blue-700"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                      data-ocid="blog_post.lang_fr.button"
                    >
                      🇫🇷 FR
                    </button>
                  </div>
                )}

              {/* Category + date */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {post.category && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {post.category}
                  </span>
                )}
                {(meta?.showDate ?? true) && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar size={13} className="text-blue-600" />
                    {formatDate(post.publishedDate)}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <User size={13} className="text-blue-600" />
                  {post.author}
                </span>
                {meta?.showUpdatedDate && meta.lastUpdated && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Clock size={13} />
                    Updated:{" "}
                    {new Date(meta.lastUpdated).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>

              {/* Title — bilingual or single */}
              {meta?.bilingualEnabled && meta.frenchTitle ? (
                <>
                  {/* Mobile: show active lang title */}
                  <h1 className="font-bold text-3xl sm:text-4xl text-[#1e3a5f] mb-4 leading-tight md:hidden">
                    {activeLang === "en" ? post.title : meta.frenchTitle}
                  </h1>
                  {/* Desktop: show both side by side */}
                  <div
                    className={`hidden md:grid gap-6 mb-4 ${
                      meta.langOrder === "en-fr" ? "" : ""
                    }`}
                    style={{ gridTemplateColumns: "1fr 1fr" }}
                  >
                    <h1 className="font-bold text-2xl text-[#1e3a5f] leading-tight">
                      {meta.langOrder === "en-fr"
                        ? post.title
                        : meta.frenchTitle}
                    </h1>
                    <h1 className="font-bold text-2xl text-[#1e3a5f] leading-tight">
                      {meta.langOrder === "en-fr"
                        ? meta.frenchTitle
                        : post.title}
                    </h1>
                  </div>
                </>
              ) : (
                <h1 className="font-bold text-3xl sm:text-4xl text-[#1e3a5f] mb-4 leading-tight">
                  {post.title}
                </h1>
              )}

              {/* Tags */}
              {meta?.tags && meta.tags.length > 0 && (
                <div
                  className="flex flex-wrap items-center gap-1.5 mb-4"
                  data-ocid="blog_post.tags.panel"
                >
                  <Tag size={13} className="text-gray-400" />
                  {meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Social sharing */}
              <div className="flex flex-wrap items-center gap-2 pb-5 border-b border-gray-200">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">
                  Share:
                </span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="blog_post.facebook.button"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Share2 size={13} /> Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="blog_post.twitter.button"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 border border-sky-200 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Twitter size={13} /> Twitter
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="blog_post.linkedin.button"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Linkedin size={13} /> LinkedIn
                </a>
                <button
                  onClick={handleCopyLink}
                  data-ocid="blog_post.copy_link.button"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                  type="button"
                >
                  <Copy size={13} /> {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </header>

            {/* Featured image — top */}
            {(!meta || meta.featuredImagePos === "top") && (
              <div className="mb-8 rounded-2xl overflow-hidden shadow-md">
                <img
                  src={getPostImage(post.imageUrl, post.category)}
                  alt={post.title}
                  className="w-full object-cover"
                  style={{ maxHeight: "450px" }}
                />
              </div>
            )}

            {/* Summary */}
            {post.summary && (
              <div className="p-5 rounded-xl bg-blue-50 border-l-4 border-blue-600 mb-8">
                <p className="text-[#1e3a5f] leading-relaxed font-medium italic">
                  {post.summary}
                </p>
              </div>
            )}

            {/* Article content */}
            <div className="mb-8">
              {meta?.bilingualEnabled &&
              meta.frenchTitle &&
              meta.frenchContent ? (
                <>
                  {/* Mobile: show active language */}
                  <div className="md:hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <ContentRenderer
                      content={
                        activeLang === "en" ? parsedContent : meta.frenchContent
                      }
                      featuredImagePos={meta.featuredImagePos}
                      postImage={getPostImage(post.imageUrl, post.category)}
                      postTitle={
                        activeLang === "en" ? post.title : meta.frenchTitle
                      }
                    />
                  </div>
                  {/* Desktop: side-by-side */}
                  <div
                    className="hidden md:grid gap-6"
                    style={{ gridTemplateColumns: "1fr 1fr" }}
                  >
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                          {meta.langOrder === "en-fr"
                            ? "🇬🇧 English"
                            : "🇫🇷 French"}
                        </span>
                      </div>
                      <ContentRenderer
                        content={
                          meta.langOrder === "en-fr"
                            ? parsedContent
                            : meta.frenchContent
                        }
                        featuredImagePos={meta.featuredImagePos}
                        postImage={getPostImage(post.imageUrl, post.category)}
                        postTitle={
                          meta.langOrder === "en-fr"
                            ? post.title
                            : meta.frenchTitle
                        }
                      />
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                          {meta.langOrder === "en-fr"
                            ? "🇫🇷 French"
                            : "🇬🇧 English"}
                        </span>
                      </div>
                      <ContentRenderer
                        content={
                          meta.langOrder === "en-fr"
                            ? meta.frenchContent
                            : parsedContent
                        }
                        featuredImagePos={meta.featuredImagePos}
                        postImage={getPostImage(post.imageUrl, post.category)}
                        postTitle={
                          meta.langOrder === "en-fr"
                            ? meta.frenchTitle
                            : post.title
                        }
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                  <ContentRenderer
                    content={parsedContent}
                    featuredImagePos={meta?.featuredImagePos ?? "top"}
                    postImage={getPostImage(post.imageUrl, post.category)}
                    postTitle={post.title}
                  />
                </div>
              )}
            </div>

            {/* WhatsApp + Consultation CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#1d4ed8] p-8 text-center text-white shadow-lg mb-8">
              <MessageCircle
                size={40}
                className="mx-auto mb-3 text-green-300"
              />
              <h3 className="font-bold text-xl mb-2">
                Interested? Let&apos;s Talk!
              </h3>
              <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto">
                Read something that sparked your interest? Our consultants are
                ready to help you take the next step.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href={`https://wa.me/250795780073?text=${encodeURIComponent(`Hi, I read your article "${post.title}" and would like to know more`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="blog_post.whatsapp.button"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full transition-colors shadow"
                >
                  <MessageCircle size={18} /> Chat on WhatsApp
                </a>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 font-bold rounded-full px-6"
                >
                  <Link to="/contact" data-ocid="blog_post.consultation.button">
                    Get Free Consultation
                  </Link>
                </Button>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div data-ocid="blog_post.related.panel">
                <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedPosts.map((rp, i) => (
                    <Link
                      key={rp.id.toString()}
                      to="/blog/$id"
                      params={{ id: rp.id.toString() }}
                      data-ocid={`blog_post.related.item.${i + 1}`}
                      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {rp.imageUrl && (
                        <img
                          src={rp.imageUrl}
                          alt={rp.title}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none";
                          }}
                        />
                      )}
                      <div className="p-3">
                        <span className="text-xs font-bold text-blue-600 uppercase">
                          {rp.category}
                        </span>
                        <h3 className="font-bold text-sm text-[#1e3a5f] mt-1 line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {rp.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.article>
        )}
      </div>
    </main>
  );
}

function ContentRenderer({
  content,
  featuredImagePos,
  postImage,
  postTitle,
}: {
  content: string;
  featuredImagePos: string;
  postImage: string;
  postTitle: string;
}) {
  if (!content) {
    return (
      <p className="text-gray-400 italic">Full article content coming soon.</p>
    );
  }

  const segments = processContent(content);
  const hasInlineImage = featuredImagePos === "inline";

  return (
    <div className="text-gray-700 leading-relaxed space-y-4">
      {hasInlineImage && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <img
            src={postImage}
            alt={postTitle}
            className="w-full object-cover"
            style={{ maxHeight: "300px" }}
          />
        </div>
      )}
      {segments.map((seg, i) => {
        if (seg.type === "slider") {
          return (
            <ImageSlider
              // biome-ignore lint/suspicious/noArrayIndexKey: stable segment index
              key={i}
              images={seg.data.images}
              autoplay={seg.data.autoplay}
            />
          );
        }
        // HTML segment
        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: stable index
            key={i}
            className="rich-content"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: admin-controlled content
            dangerouslySetInnerHTML={{ __html: seg.value }}
          />
        );
      })}
    </div>
  );
}
