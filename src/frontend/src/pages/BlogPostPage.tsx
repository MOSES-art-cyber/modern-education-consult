import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Calendar, User } from "lucide-react";
import { motion } from "motion/react";
import { useGetBlogPostById } from "../hooks/useQueries";

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPostPage() {
  const { id } = useParams({ from: "/blog/$id" });
  const postId = BigInt(id);
  const { data: post, isLoading, isError } = useGetBlogPostById(postId);

  return (
    <main className="pt-16 lg:pt-20 min-h-screen bg-white">
      {/* Back navigation */}
      <div className="brand-dark-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {isLoading ? (
          <div data-ocid="blog_post.loading_state" className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ) : isError || !post ? (
          <div className="text-center py-20">
            <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl text-brand-dark mb-2">
              Post Not Found
            </h2>
            <p className="text-foreground/60 mb-6">
              The blog post you're looking for doesn't exist or has been
              removed.
            </p>
            <Button asChild className="bg-primary text-white font-semibold">
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
            <header className="mb-8">
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-brand-dark mb-4 leading-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-5 text-sm text-foreground/60 pb-6 border-b border-border">
                <span className="flex items-center gap-1.5">
                  <User size={14} className="text-brand-blue" />
                  {post.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-brand-blue" />
                  {formatDate(post.publishedDate)}
                </span>
              </div>
            </header>

            {/* Featured image */}
            {post.imageUrl && (
              <div className="mb-8 rounded-2xl overflow-hidden shadow-card">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full object-cover"
                  style={{ maxHeight: "400px" }}
                />
              </div>
            )}

            {/* Article summary */}
            {post.summary && (
              <div className="p-5 rounded-xl bg-accent border-l-4 border-primary mb-8">
                <p className="text-foreground/80 leading-relaxed font-medium italic">
                  {post.summary}
                </p>
              </div>
            )}

            {/* Article content */}
            <div className="prose prose-blue max-w-none">
              {post.content ? (
                <div className="text-foreground/75 leading-relaxed space-y-4">
                  {post.content.split("\n").map((para, i) =>
                    para.trim() ? (
                      // biome-ignore lint/suspicious/noArrayIndexKey: paragraph index is stable for split content
                      <p key={i} className="text-base leading-7">
                        {para}
                      </p>
                    ) : null,
                  )}
                </div>
              ) : (
                <p className="text-foreground/60 italic">
                  Full article content coming soon.
                </p>
              )}
            </div>

            {/* Footer CTA */}
            <div className="mt-12 p-8 rounded-2xl brand-white-blue-bg text-center">
              <h3 className="font-display font-bold text-xl text-brand-dark mb-2">
                Ready to Take Action?
              </h3>
              <p className="text-foreground/60 mb-5 text-sm">
                Contact our team for personalized guidance on your international
                education or career journey.
              </p>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-white font-bold shadow-blue"
              >
                <Link to="/contact">Get Free Consultation</Link>
              </Button>
            </div>
          </motion.article>
        )}
      </div>
    </main>
  );
}
