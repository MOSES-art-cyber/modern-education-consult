import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Globe,
  Images,
  Layout,
  Monitor,
  Plus,
  Settings,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateWebsitePage,
  useDeleteWebsitePage,
  useEditWebsitePage,
  useGetAllWebsitePages,
} from "../../hooks/useQueries";
import type { WebsitePage } from "../../types/index";
import GlobalControlsPanel from "./GlobalControlsPanel";
import MediaPickerModal from "./MediaPickerModal";
import VisualPageEditor from "./VisualPageEditor";

type SidebarTab = "pages" | "global";

export default function WebsiteEditorPanel() {
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("pages");
  const [selectedPageId, setSelectedPageId] = useState<bigint | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const { data: pages = [], isLoading } = useGetAllWebsitePages();
  const createPage = useCreateWebsitePage();
  const editPage = useEditWebsitePage();
  const deletePage = useDeleteWebsitePage();

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");

  const selectedPage = pages.find((p) => p.id === selectedPageId) ?? null;

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      const id = await createPage.mutateAsync({
        title: newTitle.trim(),
        slug:
          newSlug.trim() || newTitle.trim().toLowerCase().replace(/\s+/g, "-"),
      });
      toast.success(`Page "${newTitle}" created.`);
      setSelectedPageId(id);
      setShowNewDialog(false);
      setNewTitle("");
      setNewSlug("");
    } catch (e) {
      toast.error(
        `Failed: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div
      className="flex h-[calc(100vh-200px)] min-h-[600px] bg-[#0f172a] rounded-xl overflow-hidden border border-slate-700"
      data-ocid="we.panel"
    >
      {/* ── Sidebar ── */}
      <aside className="w-72 flex-shrink-0 bg-[#1e293b] border-r border-slate-700 flex flex-col">
        {/* Sidebar header */}
        <div className="px-4 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Globe size={16} className="text-cyan-400" />
            <span className="font-bold text-white text-sm">Website Editor</span>
          </div>
          <p className="text-xs text-slate-400">Visual page builder</p>
        </div>

        {/* Sidebar tabs */}
        <div
          className="flex border-b border-slate-700"
          role="tablist"
          data-ocid="we.sidebar.tabs"
        >
          {(["pages", "global"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={sidebarTab === tab}
              onClick={() => setSidebarTab(tab)}
              data-ocid={`we.sidebar.${tab}.tab`}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                sidebarTab === tab
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab === "pages" ? "Pages" : "Global Controls"}
            </button>
          ))}
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto p-3">
          {sidebarTab === "pages" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Pages
                </span>
                <button
                  type="button"
                  onClick={() => setShowMediaLibrary(true)}
                  className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Media Library"
                  data-ocid="we.sidebar.media.button"
                >
                  <Images size={13} />
                </button>
              </div>

              {isLoading ? (
                <div className="space-y-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 rounded-lg bg-slate-700/50 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-1" data-ocid="we.pages.list">
                  {pages.map((page, idx) => (
                    <PageListItem
                      key={page.id.toString()}
                      page={page}
                      index={idx}
                      isActive={selectedPageId === page.id}
                      onSelect={() => setSelectedPageId(page.id)}
                      onDelete={async () => {
                        if (selectedPageId === page.id) setSelectedPageId(null);
                        try {
                          await deletePage.mutateAsync(page.id);
                          toast.success(`"${page.title}" deleted.`);
                        } catch (e) {
                          toast.error(
                            `Failed: ${e instanceof Error ? e.message : "Unknown error"}`,
                          );
                        }
                      }}
                      onRename={async (title, slug) => {
                        try {
                          await editPage.mutateAsync({
                            id: page.id,
                            title,
                            slug,
                          });
                          toast.success("Page renamed.");
                        } catch (e) {
                          toast.error(
                            `Failed: ${e instanceof Error ? e.message : "Unknown error"}`,
                          );
                        }
                      }}
                    />
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowNewDialog(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:text-cyan-400 hover:border-cyan-500 text-xs font-medium transition-colors mt-2"
                data-ocid="we.pages.new_page.button"
              >
                <Plus size={13} />
                Add New Page
              </button>
            </div>
          ) : (
            <GlobalControlsPanel />
          )}
        </div>
      </aside>

      {/* ── Main canvas ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Canvas toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1e293b] border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Layout size={14} className="text-slate-400" />
            {selectedPage ? (
              <span className="text-sm font-medium text-white">
                {selectedPage.title}
              </span>
            ) : (
              <span className="text-sm text-slate-500">No page selected</span>
            )}
          </div>

          {selectedPage && (
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-800 rounded-lg p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  className={`p-1.5 rounded transition-colors ${previewMode === "desktop" ? "bg-slate-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                  title="Desktop preview"
                  data-ocid="we.canvas.desktop.toggle"
                >
                  <Monitor size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile")}
                  className={`p-1.5 rounded transition-colors ${previewMode === "mobile" ? "bg-slate-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                  title="Mobile preview"
                  data-ocid="we.canvas.mobile.toggle"
                >
                  <Smartphone size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Canvas content */}
        <div className="flex-1 overflow-auto bg-slate-900 p-4">
          {selectedPage ? (
            <div
              className={`mx-auto transition-all duration-300 ${
                previewMode === "mobile" ? "max-w-[375px]" : "max-w-full"
              }`}
            >
              <VisualPageEditor page={selectedPage} previewMode={previewMode} />
            </div>
          ) : (
            <div
              className="h-full flex flex-col items-center justify-center text-center"
              data-ocid="we.canvas.empty_state"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                <Settings size={28} className="text-slate-600" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Select a page to start editing
              </h3>
              <p className="text-slate-400 text-sm max-w-xs">
                Choose a page from the left sidebar to open the visual editor,
                or create a new page to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Page Dialog */}
      <Dialog
        open={showNewDialog}
        onOpenChange={(v) => !v && setShowNewDialog(false)}
      >
        <DialogContent
          className="max-w-md"
          data-ocid="we.pages.new_page.dialog"
        >
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Page Title *</Label>
              <Input
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
                placeholder="e.g. Our Team"
                data-ocid="we.pages.new_title.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">URL Slug</Label>
              <Input
                value={newSlug}
                onChange={(e) =>
                  setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                }
                placeholder="e.g. our-team"
                data-ocid="we.pages.new_slug.input"
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button
                variant="ghost"
                onClick={() => setShowNewDialog(false)}
                data-ocid="we.pages.new_page.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createPage.isPending || !newTitle.trim()}
                className="bg-blue-700 text-white"
                data-ocid="we.pages.new_page.submit_button"
              >
                {createPage.isPending ? "Creating..." : "Create Page"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Library Modal */}
      <MediaPickerModal
        open={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={() => setShowMediaLibrary(false)}
        title="Media Library"
      />
    </div>
  );
}

// ─── Page list item ────────────────────────────────────────────────────────────

function PageListItem({
  page,
  index,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: {
  page: WebsitePage;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string, slug: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [titleVal, setTitleVal] = useState(page.title);
  const [slugVal, setSlugVal] = useState(page.slug);

  if (editing) {
    return (
      <div className="bg-slate-700/50 rounded-lg p-2 space-y-1.5">
        <Input
          value={titleVal}
          onChange={(e) => setTitleVal(e.target.value)}
          className="h-7 text-xs bg-slate-800 border-slate-600 text-white"
          placeholder="Page title"
        />
        <Input
          value={slugVal}
          onChange={(e) =>
            setSlugVal(e.target.value.toLowerCase().replace(/\s+/g, "-"))
          }
          className="h-7 text-xs bg-slate-800 border-slate-600 text-white"
          placeholder="url-slug"
        />
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              onRename(titleVal, slugVal);
              setEditing(false);
            }}
            className="flex-1 text-xs py-1 rounded bg-cyan-600 hover:bg-cyan-700 text-white transition-colors"
            data-ocid={`we.pages.save_button.${index + 1}`}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="flex-1 text-xs py-1 rounded bg-slate-600 hover:bg-slate-500 text-white transition-colors"
            data-ocid={`we.pages.cancel_button.${index + 1}`}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      data-ocid={`we.pages.item.${index + 1}`}
      className={`group w-full flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-left ${
        isActive
          ? "bg-cyan-500/20 border border-cyan-500/40"
          : "hover:bg-slate-700/50 border border-transparent"
      }`}
      onClick={onSelect}
      aria-label={`Edit ${page.title}`}
    >
      <Layout
        size={13}
        className={isActive ? "text-cyan-400" : "text-slate-500"}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs font-medium truncate ${isActive ? "text-cyan-300" : "text-slate-200"}`}
        >
          {page.title}
        </p>
        <p className="text-[10px] text-slate-500 truncate">/{page.slug}</p>
      </div>
      {page.isDefault && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 shrink-0">
          Default
        </span>
      )}
      <div
        className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="p-1 rounded hover:bg-slate-600 text-slate-400 hover:text-slate-200 transition-colors"
          title="Rename"
          data-ocid={`we.pages.rename_button.${index + 1}`}
        >
          <Settings size={11} />
        </button>
        {!page.isDefault && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            title="Delete"
            data-ocid={`we.pages.delete_button.${index + 1}`}
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>
    </button>
  );
}
