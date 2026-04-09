import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  Linkedin,
  MessageCircle,
  MessageSquare,
  Reply,
  Share2,
  Tag,
  Twitter,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Comment } from "../backend.d.ts";
import ImageSlider from "../components/blog/ImageSlider";
import { parsePostContent } from "../components/blog/postMetaUtils";
import {
  useGetAllBlogPosts,
  useGetApprovedComments,
  useGetBlogPostById,
  useSubmitComment,
} from "../hooks/useQueries";

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function timeAgo(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? "s" : ""} ago`;
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

function processContent(rawContent: string): ContentSegment[] {
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

// ── Math CAPTCHA ──────────────────────────────────────────────────

function generateCaptcha(): { question: string; answer: number } {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const useAdd = Math.random() > 0.5;
  if (useAdd) {
    return { question: `${a} + ${b}`, answer: a + b };
  }
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return { question: `${hi} − ${lo}`, answer: hi - lo };
}

// ── Comment Form ──────────────────────────────────────────────────

interface CommentFormProps {
  postId: string;
  parentId?: bigint | null;
  onSuccess: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

function CommentForm({
  postId,
  parentId = null,
  onSuccess,
  onCancel,
  compact = false,
}: CommentFormProps) {
  const submitMutation = useSubmitComment();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const captcha = useRef(generateCaptcha());

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email";
    if (!content.trim()) e.content = "Comment is required";
    if (content.trim().length < 5) e.content = "Comment is too short";
    const ans = Number.parseInt(captchaInput, 10);
    if (Number.isNaN(ans) || ans !== captcha.current.answer)
      e.captcha = "Incorrect answer";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      await submitMutation.mutateAsync({
        postId,
        parentId,
        authorName: name.trim(),
        authorEmail: email.trim(),
        content: content.trim(),
      });
      setSubmitted(true);
      onSuccess();
    } catch {
      toast.error("Failed to submit comment. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <Check size={14} className="text-green-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800">
            Comment submitted!
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            Your comment is awaiting admin approval and will appear once
            reviewed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div
        className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}
      >
        <div>
          <input
            type="text"
            placeholder="Your name *"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((p) => ({ ...p, name: "" }));
            }}
            className={`w-full h-10 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4]/50 ${
              errors.name
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-white"
            }`}
            data-ocid="comment.name.input"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>
        <div>
          <input
            type="email"
            placeholder="Your email * (not displayed)"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((p) => ({ ...p, email: "" }));
            }}
            className={`w-full h-10 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4]/50 ${
              errors.email
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-white"
            }`}
            data-ocid="comment.email.input"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>
      </div>
      <div>
        <textarea
          placeholder={
            parentId
              ? "Write your reply..."
              : "Share your thoughts on this post..."
          }
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setErrors((p) => ({ ...p, content: "" }));
          }}
          rows={compact ? 3 : 4}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4]/50 resize-none ${
            errors.content
              ? "border-red-400 bg-red-50"
              : "border-gray-200 bg-white"
          }`}
          data-ocid="comment.content.textarea"
        />
        {errors.content && (
          <p className="text-xs text-red-500 mt-1">{errors.content}</p>
        )}
      </div>
      {/* CAPTCHA */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#1e3a5f] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg min-w-[80px] text-center select-none">
            {captcha.current.question} = ?
          </span>
          <input
            type="number"
            placeholder="Answer"
            value={captchaInput}
            onChange={(e) => {
              setCaptchaInput(e.target.value);
              setErrors((p) => ({ ...p, captcha: "" }));
            }}
            className={`w-20 h-9 rounded-lg border px-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#00bcd4]/50 ${
              errors.captcha
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-white"
            }`}
            data-ocid="comment.captcha.input"
          />
        </div>
        {errors.captcha && (
          <p className="text-xs text-red-500">{errors.captcha}</p>
        )}
        <div className="flex gap-2 ml-auto">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="text-sm font-semibold text-white bg-[#1e3a5f] hover:bg-[#152d4a] px-4 py-1.5 rounded-lg transition-colors disabled:opacity-60"
            data-ocid="comment.submit.button"
          >
            {submitMutation.isPending
              ? "Submitting..."
              : parentId
                ? "Post Reply"
                : "Post Comment"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Single Comment ─────────────────────────────────────────────────

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  postId: string;
  depth?: number;
}

function CommentItem({
  comment,
  replies,
  postId,
  depth = 0,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const initials = comment.authorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={depth > 0 ? "ml-8 sm:ml-12 mt-3" : ""}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#00bcd4] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-semibold text-sm text-[#1e3a5f]">
                {comment.authorName}
              </span>
              <span className="text-xs text-gray-400">
                {timeAgo(comment.createdAt)}
              </span>
              {depth > 0 && (
                <span className="text-xs text-[#00bcd4] font-medium flex items-center gap-1">
                  <Reply size={10} /> Reply
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {comment.content}
            </p>
          </div>
          {depth === 0 && (
            <button
              type="button"
              onClick={() => setShowReplyForm((v) => !v)}
              className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1e3a5f] transition-colors px-1"
              data-ocid="comment.reply.button"
            >
              <Reply size={12} /> Reply
            </button>
          )}
          {showReplyForm && (
            <div className="mt-2 bg-blue-50/60 rounded-xl p-3 border border-blue-100">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onSuccess={() => setShowReplyForm(false)}
                onCancel={() => setShowReplyForm(false)}
                compact
              />
            </div>
          )}
        </div>
      </div>
      {/* Nested replies */}
      {replies.map((reply) => (
        <CommentItem
          key={reply.id.toString()}
          comment={reply}
          replies={[]}
          postId={postId}
          depth={1}
        />
      ))}
    </div>
  );
}

// ── Comment Section ────────────────────────────────────────────────

function CommentSection({ postId }: { postId: string }) {
  const { data: comments = [], isLoading } = useGetApprovedComments(postId);
  const [formKey, setFormKey] = useState(0);

  const topLevel = useMemo(
    () =>
      comments.filter((c) => c.parentId === undefined || c.parentId === null),
    [comments],
  );
  const repliesByParent = useMemo(() => {
    const map = new Map<string, Comment[]>();
    for (const c of comments) {
      if (c.parentId !== undefined && c.parentId !== null) {
        const key = c.parentId.toString();
        const arr = map.get(key) ?? [];
        arr.push(c);
        map.set(key, arr);
      }
    }
    return map;
  }, [comments]);

  return (
    <section
      className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8"
      data-ocid="comments.section"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <MessageSquare size={20} className="text-[#00bcd4]" />
        <h2 className="text-lg font-bold text-[#1e3a5f]">
          Comments
          {comments.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({comments.length})
            </span>
          )}
        </h2>
      </div>

      {/* Comment list */}
      {isLoading ? (
        <div className="space-y-4 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <div
          className="text-center py-8 mb-8 bg-gray-50 rounded-xl border border-dashed border-gray-200"
          data-ocid="comments.empty.state"
        >
          <MessageSquare size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 font-medium">
            Be the first to share your thoughts on this post!
          </p>
        </div>
      ) : (
        <div className="space-y-5 mb-8" data-ocid="comments.list">
          {topLevel.map((c) => (
            <CommentItem
              key={c.id.toString()}
              comment={c}
              replies={repliesByParent.get(c.id.toString()) ?? []}
              postId={postId}
            />
          ))}
        </div>
      )}

      {/* New comment form */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wide mb-4">
          Leave a Comment
        </h3>
        <CommentForm
          key={formKey}
          postId={postId}
          onSuccess={() => setFormKey((k) => k + 1)}
        />
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
          <AlertCircle size={11} />
          Comments are reviewed before appearing publicly.
        </p>
      </div>
    </section>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function BlogPostPage() {
  const { id } = useParams({ from: "/blog/$id" });
  const postId = BigInt(id);
  const { data: post, isLoading, isError } = useGetBlogPostById(postId);
  const { data: allPosts } = useGetAllBlogPosts();
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState<"en" | "fr">("en");

  const { meta, content: parsedContent } = post
    ? parsePostContent(post.content)
    : { meta: null, content: "" };

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

              {meta?.bilingualEnabled && meta.frenchTitle ? (
                <>
                  <h1 className="font-bold text-3xl sm:text-4xl text-[#1e3a5f] mb-4 leading-tight md:hidden">
                    {activeLang === "en" ? post.title : meta.frenchTitle}
                  </h1>
                  <div
                    className="hidden md:grid gap-6 mb-4"
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

            {/* Comment Section */}
            <CommentSection postId={id} />

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div data-ocid="blog_post.related.panel" className="mt-10">
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
