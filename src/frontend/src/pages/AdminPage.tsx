import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Edit2,
  Eye,
  Images,
  Info,
  LogIn,
  LogOut,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { BlogPost } from "../backend.d.ts";
import ImageSliderEditor from "../components/blog/ImageSliderEditor";
import RichTextEditor from "../components/blog/RichTextEditor";
import {
  DEFAULT_META,
  type PostMeta,
  parsePostContent,
  serializePostContent,
} from "../components/blog/postMetaUtils";
import {
  useAddBlogPost,
  useDeleteBlogPost,
  useEditBlogPost,
  useGetAllBlogPosts,
} from "../hooks/useQueries";

const CATEGORIES = [
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

const AUTOSAVE_KEY = (id: string) => `blog-autosave-${id}`;

interface FormData {
  title: string;
  summary: string;
  content: string;
  enContent: string;
  author: string;
  imageUrl: string;
  category: string;
  meta: PostMeta;
}

const emptyForm: FormData = {
  title: "",
  summary: "",
  content: "",
  enContent: "",
  author: "Modern Education Consult",
  imageUrl: "",
  category: "Study Abroad",
  meta: { ...DEFAULT_META },
};

function BlogForm({
  initial,
  postId,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  initial: FormData;
  postId: string;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<FormData>(initial);
  const [tagInput, setTagInput] = useState("");
  const [showSliderEditor, setShowSliderEditor] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [seoOpen, setSeoOpen] = useState(false);
  const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [ctaStyle, setCtaStyle] = useState<"primary" | "secondary" | "outline">(
    "primary",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirtyRef = useRef(false);

  const setMeta = (updates: Partial<PostMeta>) => {
    setForm((f) => ({ ...f, meta: { ...f.meta, ...updates } }));
  };

  const set = (field: keyof Omit<FormData, "meta">, value: string) => {
    if (field === "imageUrl") setImgError(false);
    setForm((f) => ({ ...f, [field]: value }));
  };

  // Restore from autosave for any postId
  useEffect(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY(postId));
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as FormData;
        const restore = window.confirm("Auto-saved draft found. Restore it?");
        if (restore) {
          setForm(parsed);
          isDirtyRef.current = true;
        }
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // Debounced auto-save on form changes (2s debounce)
  useEffect(() => {
    isDirtyRef.current = true;
    setIsSaving(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      localStorage.setItem(AUTOSAVE_KEY(postId), JSON.stringify(form));
      const t = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setAutoSavedAt(t);
      setIsSaving(false);
    }, 2000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form, postId]);

  // Interval auto-save every 5 seconds as backup
  useEffect(() => {
    const id = setInterval(() => {
      localStorage.setItem(AUTOSAVE_KEY(postId), JSON.stringify(form));
      const t = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setAutoSavedAt(t);
      setIsSaving(false);
    }, 5000);
    return () => clearInterval(id);
  }, [form, postId]);

  // Beforeunload warning when form is dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes";
        return "You have unsaved changes";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") set("imageUrl", result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSliderInsert = (marker: string) => {
    if (form.meta.bilingualEnabled) {
      setForm((f) => ({
        ...f,
        enContent: f.enContent ? `${f.enContent}\n\n${marker}` : marker,
      }));
    } else {
      setForm((f) => ({
        ...f,
        content: f.content ? `${f.content}\n\n${marker}` : marker,
      }));
    }
    setShowSliderEditor(false);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,$/, "");
      if (tag && !form.meta.tags.includes(tag)) {
        setMeta({ tags: [...form.meta.tags, tag] });
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setMeta({ tags: form.meta.tags.filter((t) => t !== tag) });
  };

  const handleInsertCta = () => {
    if (!ctaText) return;
    const marker = `[CTA:${JSON.stringify({ text: ctaText, url: ctaUrl, style: ctaStyle })}]`;
    if (form.meta.bilingualEnabled) {
      setForm((f) => ({ ...f, enContent: `${f.enContent}\n${marker}` }));
    } else {
      setForm((f) => ({ ...f, content: `${f.content}\n${marker}` }));
    }
    setShowCta(false);
    setCtaText("");
    setCtaUrl("");
  };

  const handleSubmit = () => {
    const finalMeta: PostMeta = {
      ...form.meta,
      lastUpdated: new Date().toISOString(),
    };
    // If bilingual, merge en content into main content with meta
    const rawContent = form.meta.bilingualEnabled
      ? form.enContent
      : form.content;
    const serialized = serializePostContent(finalMeta, rawContent);
    onSubmit({ ...form, content: serialized });
    localStorage.removeItem(AUTOSAVE_KEY(postId));
    isDirtyRef.current = false;
    window.onbeforeunload = null;
  };

  const handleCancel = () => {
    isDirtyRef.current = false;
    window.onbeforeunload = null;
    onCancel();
  };

  const bilingualEnabled = form.meta.bilingualEnabled;
  const langLeft = form.meta.langOrder === "en-fr" ? "EN" : "FR";
  const langRight = form.meta.langOrder === "en-fr" ? "FR" : "EN";

  return (
    <div className="space-y-6">
      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="Preview"
                className="w-full h-52 object-cover rounded-xl"
              />
            )}
            <h2 className="text-2xl font-bold text-[#1e3a5f]">
              {form.title || "(No title)"}
            </h2>
            {form.meta.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-gray-600 italic">{form.summary}</p>
            <div
              className="prose prose-sm max-w-none"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: admin preview
              dangerouslySetInnerHTML={{
                __html: form.meta.bilingualEnabled
                  ? form.enContent
                  : form.content,
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* CTA Builder Dialog */}
      <Dialog open={showCta} onOpenChange={setShowCta}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add CTA Button</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Button Text</Label>
              <Input
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Apply Now"
                className="mt-1"
              />
            </div>
            <div>
              <Label>URL</Label>
              <Input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Style</Label>
              <div className="flex gap-2 mt-1">
                {(["primary", "secondary", "outline"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCtaStyle(s)}
                    className={`px-3 py-1.5 text-sm rounded-md border font-medium capitalize transition-colors ${
                      ctaStyle === s
                        ? "bg-blue-700 text-white border-blue-700"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowCta(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleInsertCta}
                disabled={!ctaText}
                className="bg-blue-700 text-white"
              >
                Insert
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* ─── Left column: content ─── */}
        <div className="xl:col-span-3 space-y-5">
          {/* Title(s) */}
          {bilingualEnabled ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#1e3a5f]">
                  {langLeft === "EN" ? "🇬🇧 English Title" : "🇫🇷 French Title"} *
                </Label>
                <Input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="English headline"
                  className="border-gray-200 focus:border-blue-500"
                  data-ocid="admin.title.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#1e3a5f]">
                  {langRight === "FR" ? "🇫🇷 French Title" : "🇬🇧 English Title"}
                </Label>
                <Input
                  value={form.meta.frenchTitle}
                  onChange={(e) => setMeta({ frenchTitle: e.target.value })}
                  placeholder="Titre français"
                  className="border-gray-200 focus:border-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1e3a5f]">
                Title *
              </Label>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Blog post title"
                className="border-gray-200 focus:border-blue-500"
                data-ocid="admin.title.input"
              />
            </div>
          )}

          {/* Summary */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-[#1e3a5f]">
              Summary *
            </Label>
            <Textarea
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="Short description shown in the blog list"
              rows={2}
              className="border-gray-200 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Content Editor(s) */}
          {bilingualEnabled ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1e3a5f] border-b pb-2">
                <span>Content Editors — side by side on publish</span>
                <span className="ml-auto text-xs text-gray-400">
                  Left: {langLeft} · Right: {langRight}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                    {langLeft === "EN"
                      ? "🇬🇧 English Content"
                      : "🇫🇷 French Content"}
                  </Label>
                  <RichTextEditor
                    value={form.enContent}
                    onChange={(html) =>
                      setForm((f) => ({ ...f, enContent: html }))
                    }
                    placeholder="Write English content..."
                    minHeight="300px"
                    onInsertCta={() => setShowCta(true)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                    {langRight === "FR"
                      ? "🇫🇷 French Content"
                      : "🇬🇧 English Content"}
                  </Label>
                  <RichTextEditor
                    value={form.meta.frenchContent}
                    onChange={(html) => setMeta({ frenchContent: html })}
                    placeholder="Rédigez le contenu en français..."
                    minHeight="300px"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1e3a5f]">
                Full Content *
              </Label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => set("content", html)}
                placeholder="Write the full article content here..."
                minHeight="350px"
                onInsertCta={() => setShowCta(true)}
              />
            </div>
          )}

          {/* Image Slider */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSliderEditor((v) => !v)}
              className="gap-2 text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold"
              data-ocid="admin.slider.open_modal_button"
            >
              <Images size={15} /> Add Image Slider
            </Button>
            {showSliderEditor && (
              <ImageSliderEditor onInsert={handleSliderInsert} />
            )}
          </div>
        </div>

        {/* ─── Right column: settings ─── */}
        <div className="xl:col-span-2 space-y-4">
          {/* Category */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wide">
              Post Settings
            </h3>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1e3a5f]">
                Category
              </Label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-ocid="admin.category.select"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1e3a5f]">
                Tags
              </Label>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {form.meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-100"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type tag + Enter"
                className="border-gray-200 text-sm"
                data-ocid="admin.tags.input"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wide">
              Featured Image
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex gap-2">
              <Input
                value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl}
                onChange={(e) => {
                  setUploadedFileName(null);
                  set("imageUrl", e.target.value);
                }}
                placeholder="Paste image URL..."
                className="border-gray-200 flex-1 text-sm"
                data-ocid="admin.imageurl.input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 gap-1.5 text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold"
                data-ocid="admin.image.upload_button"
              >
                <Upload size={14} />
                <span className="hidden sm:inline text-xs">Upload</span>
              </Button>
            </div>
            {uploadedFileName && (
              <p className="text-xs text-blue-600 flex items-center gap-1">
                <Upload size={11} /> {uploadedFileName}
              </p>
            )}
            {form.imageUrl && !imgError && (
              <img
                src={form.imageUrl}
                alt="Preview"
                className="h-28 w-full object-cover rounded-lg border border-gray-200"
                onError={() => setImgError(true)}
              />
            )}

            {/* Image position */}
            <div>
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Position
              </Label>
              <div className="flex gap-2 mt-1.5">
                {(["top", "inline", "hidden"] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setMeta({ featuredImagePos: pos })}
                    className={`px-3 py-1 text-xs rounded-md border font-medium capitalize transition-colors ${
                      form.meta.featuredImagePos === pos
                        ? "bg-blue-700 text-white border-blue-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bilingual */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wide">
                Bilingual Layout
              </h3>
              <Switch
                checked={form.meta.bilingualEnabled}
                onCheckedChange={(v) => setMeta({ bilingualEnabled: v })}
                data-ocid="admin.bilingual.switch"
              />
            </div>
            {bilingualEnabled && (
              <div>
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Language Order
                </Label>
                <div className="flex gap-2 mt-1.5">
                  {(["en-fr", "fr-en"] as const).map((order) => (
                    <button
                      key={order}
                      type="button"
                      onClick={() => setMeta({ langOrder: order })}
                      className={`px-3 py-1 text-xs rounded-md border font-medium transition-colors ${
                        form.meta.langOrder === order
                          ? "bg-blue-700 text-white border-blue-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {order === "en-fr"
                        ? "EN left · FR right"
                        : "FR left · EN right"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Author & Display */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wide">
              Author & Display
            </h3>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1e3a5f]">
                Author
              </Label>
              <Input
                value={form.author}
                onChange={(e) => set("author", e.target.value)}
                placeholder="Author name"
                className="border-gray-200 text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-600">Show publish date</Label>
              <Switch
                checked={form.meta.showDate}
                onCheckedChange={(v) => setMeta({ showDate: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-600">Show last updated</Label>
              <Switch
                checked={form.meta.showUpdatedDate}
                onCheckedChange={(v) => setMeta({ showUpdatedDate: v })}
              />
            </div>
          </div>

          {/* Publish Controls */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wide">
              Publish Controls
            </h3>
            <div>
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Status
              </Label>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {(["published", "draft", "scheduled"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setMeta({ status: s })}
                    data-ocid={`admin.status.${s}.button`}
                    className={`px-3 py-1 text-xs rounded-md border font-medium capitalize transition-colors ${
                      form.meta.status === s
                        ? s === "published"
                          ? "bg-green-600 text-white border-green-600"
                          : s === "draft"
                            ? "bg-gray-500 text-white border-gray-500"
                            : "bg-orange-500 text-white border-orange-500"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {form.meta.status === "scheduled" && (
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#1e3a5f]">
                  Schedule Date & Time
                </Label>
                <Input
                  type="datetime-local"
                  value={form.meta.scheduledDate}
                  onChange={(e) => setMeta({ scheduledDate: e.target.value })}
                  className="border-gray-200 text-sm"
                />
              </div>
            )}
            {/* Auto-save status indicator */}
            <div className="flex items-center gap-2 min-h-[20px]">
              {isSaving ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-xs text-yellow-600 font-medium">
                    Saving...
                  </span>
                </>
              ) : autoSavedAt ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <Save size={11} /> Auto-saved {autoSavedAt}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          {/* SEO Section */}
          <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 text-sm font-bold text-[#1e3a5f] uppercase tracking-wide hover:bg-gray-50 transition-colors"
                  data-ocid="admin.seo.toggle"
                >
                  SEO Settings
                  {seoOpen ? (
                    <ChevronUp size={15} />
                  ) : (
                    <ChevronDown size={15} />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                  <div className="space-y-1.5 pt-3">
                    <Label className="text-xs font-semibold text-gray-600">
                      Meta Title
                    </Label>
                    <Input
                      value={form.meta.metaTitle}
                      onChange={(e) => setMeta({ metaTitle: e.target.value })}
                      placeholder="SEO page title"
                      className="text-sm border-gray-200"
                      data-ocid="admin.seo.metatitle.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600">
                      Meta Description
                    </Label>
                    <Textarea
                      value={form.meta.metaDesc}
                      onChange={(e) => setMeta({ metaDesc: e.target.value })}
                      placeholder="Short description for search engines (max 160 chars)"
                      rows={2}
                      className="text-sm border-gray-200 resize-none"
                      data-ocid="admin.seo.metadesc.textarea"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600">
                      Keywords
                    </Label>
                    <Input
                      value={form.meta.keywords}
                      onChange={(e) => setMeta({ keywords: e.target.value })}
                      placeholder="keyword1, keyword2, keyword3"
                      className="text-sm border-gray-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600">
                      URL Slug
                    </Label>
                    <Input
                      value={form.meta.slug}
                      onChange={(e) =>
                        setMeta({
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-"),
                        })
                      }
                      placeholder="my-blog-post-title"
                      className="text-sm border-gray-200"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100 flex-wrap">
        <Button
          onClick={handleSubmit}
          disabled={
            isPending ||
            !form.title.trim() ||
            (form.meta.bilingualEnabled
              ? !form.enContent.trim()
              : !form.content.trim())
          }
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6"
          data-ocid="admin.submit_button"
        >
          {isPending ? "Saving..." : submitLabel}
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowPreview(true)}
          className="gap-2 text-gray-700 border-gray-300"
          data-ocid="admin.preview.button"
        >
          <Eye size={14} /> Preview
        </Button>
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700"
          data-ocid="admin.cancel_button"
        >
          <X size={16} className="mr-1" /> Cancel
        </Button>
        <div className="ml-auto flex items-center gap-2">
          {isSaving ? (
            <>
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-xs text-yellow-600 font-medium">
                Saving...
              </span>
            </>
          ) : autoSavedAt ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <Save size={11} /> Auto-saved {autoSavedAt}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { identity, login, clear, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const isAdmin = !!identity && !identity.getPrincipal().isAnonymous();

  const {
    data: posts,
    isLoading,
    refetch: refetchPosts,
  } = useGetAllBlogPosts();
  const addMutation = useAddBlogPost();
  const editMutation = useEditBlogPost();
  const deleteMutation = useDeleteBlogPost();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showDataBanner, setShowDataBanner] = useState(true);
  const editFormRef = useRef<HTMLDivElement>(null);
  const autoEditApplied = useRef(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoEditApplied.current || !posts || posts.length === 0) return;
    const editId = new URLSearchParams(window.location.search).get("editId");
    if (!editId) return;
    const target = posts.find((p) => p.id.toString() === editId);
    if (target) {
      autoEditApplied.current = true;
      setEditingPost(target);
      setShowAddForm(false);
      setTimeout(() => {
        editFormRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [posts]);

  async function handleAdd(form: FormData) {
    try {
      await addMutation.mutateAsync(form);
      toast.success("Blog post published successfully!");
      setShowAddForm(false);
    } catch {
      toast.error("Failed to publish blog post.");
    }
  }

  async function handleEdit(form: FormData) {
    if (!editingPost) return;
    try {
      await editMutation.mutateAsync({ id: editingPost.id, ...form });
      toast.success("Blog post updated successfully!");
      setEditingPost(null);
    } catch {
      toast.error("Failed to update blog post.");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Blog post deleted.");
    } catch {
      toast.error("Failed to delete blog post.");
    }
  }

  function handleExportPosts() {
    if (!posts || posts.length === 0) {
      toast.error("No posts to export.");
      return;
    }
    const exportData = posts.map((p) => ({
      title: p.title,
      summary: p.summary,
      content: p.content,
      author: p.author,
      imageUrl: p.imageUrl,
      category: p.category,
      publishedDate: p.publishedDate.toString(),
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `blog-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${posts.length} posts to blog-backup-${date}.json`);
  }

  async function handleImportPosts(file: File) {
    try {
      const text = await file.text();
      const imported = JSON.parse(text) as Array<{
        title: string;
        summary: string;
        content: string;
        author: string;
        imageUrl: string;
        category: string;
      }>;

      if (!Array.isArray(imported)) {
        toast.error("Invalid backup file format.");
        return;
      }

      const existingTitles = new Set(
        (posts ?? []).map((p) => p.title.trim().toLowerCase()),
      );
      const newPosts = imported.filter(
        (p) => !existingTitles.has(p.title.trim().toLowerCase()),
      );

      if (newPosts.length === 0) {
        toast.info("All posts already exist — nothing imported.");
        return;
      }

      for (const p of newPosts) {
        await addMutation.mutateAsync({
          title: p.title,
          summary: p.summary,
          content: p.content,
          author: p.author || "Modern Education Consult",
          imageUrl: p.imageUrl || "",
          category: p.category || "Study Abroad",
        });
      }

      await refetchPosts();
      toast.success(
        `Imported ${newPosts.length} new post${newPosts.length > 1 ? "s" : ""} successfully!`,
      );
    } catch {
      toast.error(
        "Failed to import backup file. Make sure it is a valid JSON backup.",
      );
    }
  }

  function getInitialFormFromPost(post: BlogPost): FormData {
    const { meta, content } = parsePostContent(post.content);
    return {
      title: post.title,
      summary: post.summary,
      content: meta.bilingualEnabled ? "" : content,
      enContent: meta.bilingualEnabled ? content : "",
      author: post.author,
      imageUrl: post.imageUrl,
      category: post.category,
      meta,
    };
  }

  if (!isAdmin) {
    return (
      <main className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <LogIn size={28} className="text-blue-700" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Log in with Internet Identity to manage blog posts.
          </p>
          <Button
            onClick={login}
            disabled={isInitializing || isLoggingIn}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-2.5"
            data-ocid="admin.login.button"
          >
            {isLoggingIn ? "Opening login..." : "Log in with Internet Identity"}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-16 lg:pt-20 min-h-screen bg-gray-50 pb-16">
      {/* Hidden file input for import */}
      <input
        ref={importFileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportPosts(file);
          e.target.value = "";
        }}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">
              Blog Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Add, edit, or delete blog posts that appear on the Blog page.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => {
                setShowAddForm(true);
                setEditingPost(null);
              }}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold gap-2"
              data-ocid="admin.new_post.button"
            >
              <Plus size={16} /> New Post
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPosts}
              title="Download all blog posts as a JSON backup file"
              className="gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
              data-ocid="admin.export.button"
            >
              <Download size={15} /> Export Backup
            </Button>
            <Button
              variant="outline"
              onClick={() => importFileRef.current?.click()}
              title="Import blog posts from a JSON backup file"
              className="gap-2 text-blue-700 border-blue-200 hover:bg-blue-50"
              data-ocid="admin.import.button"
            >
              <Upload size={15} /> Import Backup
            </Button>
            <Button
              variant="outline"
              onClick={clear}
              className="gap-2 text-gray-600 border-gray-300 hover:bg-gray-50"
              data-ocid="admin.logout.button"
            >
              <LogOut size={15} /> Log out
            </Button>
          </div>
        </div>
      </div>

      {/* Data Protection Banner */}
      {showDataBanner && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-700"
            data-ocid="admin.data_protection.panel"
          >
            <Info size={16} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <p className="text-sm flex-1">
              Your blog posts are stored in the cloud database.{" "}
              <strong>Use "Export Backup" regularly</strong> to keep a local
              copy in case of unexpected issues.
            </p>
            <button
              type="button"
              onClick={() => setShowDataBanner(false)}
              className="text-blue-400 hover:text-blue-600 transition-colors flex-shrink-0"
              aria-label="Dismiss"
              data-ocid="admin.data_protection.close_button"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Add form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#1e3a5f] mb-5">
              New Blog Post
            </h2>
            <BlogForm
              key="new"
              initial={emptyForm}
              postId="new"
              onSubmit={handleAdd}
              onCancel={() => setShowAddForm(false)}
              isPending={addMutation.isPending}
              submitLabel="Publish Post"
            />
          </div>
        )}

        {/* Edit form */}
        {editingPost && (
          <div
            ref={editFormRef}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <h2 className="text-lg font-bold text-[#1e3a5f] mb-5">
              Edit Post:{" "}
              <span className="text-blue-700">{editingPost.title}</span>
            </h2>
            <BlogForm
              key={editingPost.id.toString()}
              initial={getInitialFormFromPost(editingPost)}
              postId={editingPost.id.toString()}
              onSubmit={handleEdit}
              onCancel={() => setEditingPost(null)}
              isPending={editMutation.isPending}
              submitLabel="Save Changes"
            />
          </div>
        )}

        {/* Posts list */}
        <div>
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-4">
            {isLoading
              ? "Loading posts..."
              : `All Posts (${posts?.length ?? 0})`}
          </h2>

          {!isLoading && (!posts || posts.length === 0) && (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <p className="font-semibold">No blog posts yet.</p>
              <p className="text-sm mt-1">
                Click "New Post" above to create your first one.
              </p>
            </div>
          )}

          <div className="space-y-3" data-ocid="admin.posts.list">
            {posts?.map((post, idx) => (
              <div
                key={post.id.toString()}
                data-ocid={`admin.posts.item.${idx + 1}`}
                className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-100"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                      {post.category || "General"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(
                        Number(post.publishedDate) / 1_000_000,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {(() => {
                      const { meta } = parsePostContent(post.content);
                      return (
                        <>
                          {meta.bilingualEnabled && (
                            <Badge
                              variant="outline"
                              className="text-xs text-purple-700 border-purple-200 bg-purple-50"
                            >
                              Bilingual
                            </Badge>
                          )}
                          {meta.status === "draft" && (
                            <Badge
                              variant="outline"
                              className="text-xs text-gray-500 border-gray-200"
                            >
                              Draft
                            </Badge>
                          )}
                          {meta.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </>
                      );
                    })()}
                  </div>
                  <h3 className="font-bold text-[#1e3a5f] text-base truncate">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                    {post.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-400"
                    data-ocid={`admin.posts.edit_button.${idx + 1}`}
                    onClick={() => {
                      setEditingPost(post);
                      setShowAddForm(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <Edit2 size={13} /> Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-400"
                        disabled={deleteMutation.isPending}
                        data-ocid={`admin.posts.delete_button.${idx + 1}`}
                      >
                        <Trash2 size={13} /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{post.title}" will be permanently removed. This
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-ocid="admin.delete.cancel_button">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleDelete(post.id)}
                          data-ocid="admin.delete.confirm_button"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
