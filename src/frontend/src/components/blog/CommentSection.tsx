import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MessageSquare, Reply, Send, User } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../../hooks/useActor";
import {
  useGetCommentsForPost,
  useSubmitComment,
} from "../../hooks/useQueries";
import type { Comment } from "../../types/index";

function formatCommentDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function generateMathChallenge(): { question: string; answer: number } {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { question: `${a} + ${b}`, answer: a + b };
}

interface CommentFormProps {
  postId: string;
  parentId?: string | null;
  onSuccess?: () => void;
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [mathAnswer, setMathAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [challenge] = useState(generateMathChallenge);

  const { actor, isFetching: actorFetching } = useActor();
  const isActorReady = !!actor && !actorFetching;
  const submitComment = useSubmitComment();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (Number.parseInt(mathAnswer, 10) !== challenge.answer) {
      toast.error("Incorrect answer to the spam check. Please try again.");
      return;
    }
    if (!isActorReady) {
      toast.error("Connection error — please refresh the page and try again.");
      return;
    }
    try {
      await submitComment.mutateAsync({
        postId,
        parentId,
        authorName: name.trim(),
        authorEmail: email.trim(),
        content: content.trim(),
      });
      setSubmitted(true);
      onSuccess?.();
    } catch (err: unknown) {
      console.error("[CommentForm] Failed to submit comment:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to submit comment. Please try again.";
      toast.error(message);
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm font-medium flex items-start gap-2">
        <span className="text-green-500 mt-0.5">✓</span>
        Your comment has been submitted and is awaiting approval.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={compact ? "space-y-3" : "space-y-4"}
    >
      <div
        className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}
      >
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="border-gray-200 focus:border-blue-500 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="border-gray-200 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-gray-700">
          Comment <span className="text-red-500">*</span>
        </Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            compact
              ? "Write your reply..."
              : "Share your thoughts, questions, or feedback..."
          }
          rows={compact ? 3 : 4}
          required
          className="border-gray-200 focus:border-blue-500 text-sm resize-none"
        />
      </div>

      {/* Spam protection */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-gray-700">
          Spam check: What is {challenge.question}?{" "}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          type="number"
          value={mathAnswer}
          onChange={(e) => setMathAnswer(e.target.value)}
          placeholder="Enter the answer"
          required
          className="border-gray-200 focus:border-blue-500 text-sm w-40"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          disabled={submitComment.isPending || !isActorReady}
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold gap-2"
          size={compact ? "sm" : "default"}
          data-ocid="comment.submit_button"
        >
          <Send size={14} />
          {submitComment.isPending
            ? "Posting..."
            : actorFetching
              ? "Connecting..."
              : "Post Comment"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-500"
            data-ocid="comment.cancel_button"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  postId: string;
}

function CommentItem({ comment, replies, postId }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <div className="space-y-3">
      {/* Main comment */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
              <span className="font-bold text-[#1e3a5f] text-sm">
                {comment.authorName}
              </span>
              {comment.edited && (
                <span className="text-xs text-gray-400 italic">(edited)</span>
              )}
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={11} />
                {formatCommentDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
            <button
              type="button"
              onClick={() => setShowReplyForm((v) => !v)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Reply size={12} /> Reply
            </button>
          </div>
        </div>

        {/* Inline reply form */}
        {showReplyForm && (
          <div className="mt-4 pl-12">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              compact
              onSuccess={() => setShowReplyForm(false)}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>

      {/* Replies — indented */}
      {replies.length > 0 && (
        <div className="pl-8 space-y-3">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="bg-blue-50 rounded-xl border border-blue-100 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                  <User size={13} className="text-blue-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                    <span className="font-bold text-[#1e3a5f] text-sm">
                      {reply.authorName}
                    </span>
                    {reply.edited && (
                      <span className="text-xs text-gray-400 italic">
                        (edited)
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={11} />
                      {formatCommentDate(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {reply.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { data: comments = [], isLoading } = useGetCommentsForPost(postId);

  // Separate top-level comments from replies
  const topLevelComments = useMemo(
    () =>
      comments.filter((c) => c.parentId === null || c.parentId === undefined),
    [comments],
  );

  const getReplies = (commentId: string) =>
    comments.filter((c) => c.parentId === commentId);

  return (
    <section className="mt-10" aria-label="Comments">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={20} className="text-blue-600" />
        <h2 className="text-xl font-bold text-[#1e3a5f]">
          Comments
          {comments.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({comments.length})
            </span>
          )}
        </h2>
      </div>

      {/* Approved comments list */}
      {isLoading ? (
        <div className="space-y-4 mb-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-24"
            />
          ))}
        </div>
      ) : topLevelComments.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center mb-8">
          <MessageSquare size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No comments yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              postId={postId}
            />
          ))}
        </div>
      )}

      {/* New comment form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-bold text-[#1e3a5f] mb-4">
          Leave a Comment
        </h3>
        <CommentForm postId={postId} />
      </div>
    </section>
  );
}
