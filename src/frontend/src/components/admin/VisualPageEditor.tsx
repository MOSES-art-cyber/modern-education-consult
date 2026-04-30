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
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Layout,
  Plus,
  Redo2,
  Save,
  Trash2,
  Undo2,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSavePageSections } from "../../hooks/useQueries";
import type { PageSection, WebsitePage } from "../../types/index";
import MediaPickerModal from "./MediaPickerModal";
import PageSectionRenderer from "./PageSectionRenderer";
import SectionTypePicker from "./SectionTypePicker";

interface Props {
  page: WebsitePage;
  previewMode: "desktop" | "mobile";
}

function normalizeOrders(sections: PageSection[]): PageSection[] {
  return sections.map((s, i) => ({ ...s, order: BigInt(i) }));
}

export default function VisualPageEditor({ page, previewMode }: Props) {
  const [localSections, setLocalSections] = useState<PageSection[]>(() =>
    [...page.sections].sort((a, b) => Number(a.order) - Number(b.order)),
  );
  const [savedSections, setSavedSections] =
    useState<PageSection[]>(localSections);
  const [history, setHistory] = useState<PageSection[][]>([localSections]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState<bigint | null>(null);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [insertAfterIdx, setInsertAfterIdx] = useState<number | null>(null);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showMediaFor, setShowMediaFor] = useState<{
    sectionId: bigint;
    fieldKey: string;
  } | null>(null);
  const [autoSaveMsg, setAutoSaveMsg] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);
  const saveSections = useSavePageSections();
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when page changes from outside
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only sync on page.id change
  useEffect(() => {
    const sorted = [...page.sections].sort(
      (a, b) => Number(a.order) - Number(b.order),
    );
    setLocalSections(sorted);
    setSavedSections(sorted);
    setHistory([sorted]);
    setHistoryIdx(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  const isDirty =
    JSON.stringify(
      localSections.map((s) => ({
        ...s,
        id: s.id.toString(),
        order: s.order.toString(),
      })),
    ) !==
    JSON.stringify(
      savedSections.map((s) => ({
        ...s,
        id: s.id.toString(),
        order: s.order.toString(),
      })),
    );

  const pushHistory = useCallback(
    (sections: PageSection[]) => {
      setHistory((prev) => {
        const slice = prev.slice(0, historyIdx + 1);
        const next = [...slice, sections].slice(-20);
        setHistoryIdx(next.length - 1);
        return next;
      });
    },
    [historyIdx],
  );

  const updateSections = useCallback(
    (sections: PageSection[]) => {
      const normalized = normalizeOrders(sections);
      setLocalSections(normalized);
      pushHistory(normalized);
    },
    [pushHistory],
  );

  const handleUndo = () => {
    if (historyIdx <= 0) return;
    const newIdx = historyIdx - 1;
    setHistoryIdx(newIdx);
    setLocalSections(history[newIdx]);
  };

  const handleRedo = () => {
    if (historyIdx >= history.length - 1) return;
    const newIdx = historyIdx + 1;
    setHistoryIdx(newIdx);
    setLocalSections(history[newIdx]);
  };

  const doSave = useCallback(
    async (silent = false) => {
      try {
        await saveSections.mutateAsync({
          pageId: page.id,
          sections: localSections,
        });
        setSavedSections([...localSections]);
        if (!silent) toast.success("Page saved!");
        else {
          setAutoSaveMsg("Auto-saved");
          setTimeout(() => setAutoSaveMsg(""), 2000);
        }
      } catch (e) {
        if (!silent)
          toast.error(
            `Save failed: ${e instanceof Error ? e.message : "Unknown"}`,
          );
      }
    },
    [saveSections, page.id, localSections],
  );

  // Auto-save
  useEffect(() => {
    if (!isDirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(true), 5000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [isDirty, doSave]);

  const handleEditField = (sectionId: bigint, key: string, value: string) => {
    const updated = localSections.map((s) =>
      s.id === sectionId
        ? {
            ...s,
            fields: s.fields.some((f) => f.key === key)
              ? s.fields.map((f) => (f.key === key ? { ...f, value } : f))
              : [...s.fields, { key, value }],
          }
        : s,
    );
    setLocalSections(updated);
    pushHistory(updated);
  };

  const handleImagePick = (sectionId: bigint, fieldKey: string) => {
    setShowMediaFor({ sectionId, fieldKey });
  };

  const handleMediaSelected = (url: string) => {
    if (!showMediaFor) return;
    handleEditField(showMediaFor.sectionId, showMediaFor.fieldKey, url);
    setShowMediaFor(null);
  };

  const handleAddSection = (sectionType: string) => {
    const newSection: PageSection = {
      id: BigInt(Date.now()),
      sectionType,
      fields: getDefaultFields(sectionType),
      order: BigInt(
        insertAfterIdx !== null ? insertAfterIdx + 1 : localSections.length,
      ),
    };
    const insertAt =
      insertAfterIdx !== null ? insertAfterIdx + 1 : localSections.length;
    const updated = [
      ...localSections.slice(0, insertAt),
      newSection,
      ...localSections.slice(insertAt),
    ];
    updateSections(updated);
    setShowSectionPicker(false);
    setInsertAfterIdx(null);
  };

  const handleDeleteSection = (idx: number) => {
    updateSections(localSections.filter((_, i) => i !== idx));
    if (activeSectionId === localSections[idx].id) setActiveSectionId(null);
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...localSections];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    updateSections(updated);
  };

  const handleMoveDown = (idx: number) => {
    if (idx >= localSections.length - 1) return;
    const updated = [...localSections];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    updateSections(updated);
  };

  // Drag and drop
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDropIdx(idx);
  };
  const handleDrop = () => {
    if (dragIdx === null || dropIdx === null || dragIdx === dropIdx) {
      setDragIdx(null);
      setDropIdx(null);
      return;
    }
    const updated = [...localSections];
    const [removed] = updated.splice(dragIdx, 1);
    updated.splice(dropIdx, 0, removed);
    updateSections(updated);
    setDragIdx(null);
    setDropIdx(null);
  };
  const handleDragEnd = () => {
    setDragIdx(null);
    setDropIdx(null);
  };

  return (
    <div className="flex flex-col gap-0" data-ocid="we.visual_editor">
      {/* Editor top bar */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-t-xl px-4 py-2.5 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          {isDirty && (
            <span
              className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"
              title="Unsaved changes"
            />
          )}
          <span className="text-xs text-gray-500 font-medium">
            {isDirty ? "Unsaved changes" : autoSaveMsg || "All changes saved"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIdx <= 0}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-colors"
            title="Undo"
            data-ocid="we.editor.undo.button"
          >
            <Undo2 size={14} />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIdx >= history.length - 1}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-colors"
            title="Redo"
            data-ocid="we.editor.redo.button"
          >
            <Redo2 size={14} />
          </button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => doSave(false)}
            disabled={saveSections.isPending || !isDirty}
            className="gap-1.5 text-gray-700 h-7 text-xs"
            data-ocid="we.editor.save.button"
          >
            <Save size={12} />
            {saveSections.isPending ? "Saving..." : "Save Draft"}
          </Button>

          <Button
            size="sm"
            onClick={() => setShowPublishConfirm(true)}
            disabled={saveSections.isPending}
            className="gap-1.5 bg-blue-700 hover:bg-blue-800 text-white h-7 text-xs"
            data-ocid="we.editor.publish.button"
          >
            <Zap size={12} />
            Publish
          </Button>
        </div>
      </div>

      {/* Page preview area */}
      <div
        className={`bg-white border-x border-b border-gray-200 rounded-b-xl overflow-hidden ${
          previewMode === "mobile" ? "border rounded-xl mt-1" : ""
        }`}
      >
        {localSections.length === 0 ? (
          <div
            className="text-center py-20 text-gray-400"
            data-ocid="we.editor.empty_state"
          >
            <Layout size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">No sections yet</p>
            <p className="text-xs mt-1 mb-4">
              Click below to add your first section
            </p>
            <button
              type="button"
              onClick={() => {
                setInsertAfterIdx(null);
                setShowSectionPicker(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              data-ocid="we.editor.add_first_section.button"
            >
              <Plus size={15} />
              Add Section
            </button>
          </div>
        ) : (
          <div>
            {localSections.map((section, idx) => (
              <div
                key={section.id.toString()}
                className={`relative group ${dragIdx === idx ? "opacity-50" : ""} ${
                  dropIdx === idx && dragIdx !== idx
                    ? "ring-2 ring-cyan-400 ring-offset-0"
                    : ""
                }`}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
              >
                {/* Section control bar — appears on hover or when active */}
                <div
                  className={`absolute top-0 left-0 right-0 z-20 flex items-center gap-1 px-2 py-1 transition-opacity ${
                    activeSectionId === section.id
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)",
                  }}
                >
                  <div
                    className="drag-handle cursor-grab p-1 text-white/70 hover:text-white"
                    title="Drag to reorder"
                  >
                    <GripVertical size={14} />
                  </div>
                  <span className="text-[10px] font-semibold text-white/80 uppercase tracking-widest flex-1">
                    {section.sectionType}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 rounded text-white/70 hover:text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
                    title="Move up"
                    data-ocid={`we.section.up.button.${idx + 1}`}
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === localSections.length - 1}
                    className="p-1 rounded text-white/70 hover:text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
                    title="Move down"
                    data-ocid={`we.section.down.button.${idx + 1}`}
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInsertAfterIdx(idx);
                      setShowSectionPicker(true);
                    }}
                    className="p-1 rounded text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                    title="Add section below"
                    data-ocid={`we.section.add_below.button.${idx + 1}`}
                  >
                    <Plus size={12} />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className="p-1 rounded text-white/70 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Delete section"
                        data-ocid={`we.section.delete.button.${idx + 1}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete this section?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This cannot be undone (but you can use Undo to restore
                          it).
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          data-ocid={`we.section.cancel_delete.${idx + 1}`}
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleDeleteSection(idx)}
                          data-ocid={`we.section.confirm_delete.${idx + 1}`}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Editable section wrapper */}
                <button
                  type="button"
                  className={`editable-section w-full text-left transition-all ${
                    activeSectionId === section.id
                      ? "ring-2 ring-cyan-400 ring-inset"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveSectionId(
                      activeSectionId === section.id ? null : section.id,
                    )
                  }
                  aria-label={`Select ${section.sectionType} section`}
                >
                  <PageSectionRenderer
                    section={section}
                    isEditing={activeSectionId === section.id}
                    onEditField={(key, value) =>
                      handleEditField(section.id, key, value)
                    }
                    onImagePick={(fieldKey) =>
                      handleImagePick(section.id, fieldKey)
                    }
                  />
                </button>

                {/* Add section between divider */}
                <div className="relative h-0 group/add">
                  <div className="absolute inset-x-0 top-0 flex items-center justify-center opacity-0 group-hover/add:opacity-100 transition-opacity z-10 -translate-y-1/2">
                    <button
                      type="button"
                      onClick={() => {
                        setInsertAfterIdx(idx);
                        setShowSectionPicker(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-lg transition-colors"
                      data-ocid={`we.section.insert_after.button.${idx + 1}`}
                    >
                      <Plus size={11} />
                      Add section here
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add section at end */}
            <div className="py-4 flex justify-center border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setInsertAfterIdx(localSections.length - 1);
                  setShowSectionPicker(true);
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-600 text-sm font-medium transition-colors"
                data-ocid="we.editor.add_section.button"
              >
                <Plus size={15} />
                Add Section
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section type picker */}
      <SectionTypePicker
        open={showSectionPicker}
        onClose={() => setShowSectionPicker(false)}
        onSelect={handleAddSection}
      />

      {/* Media picker for field replacement */}
      <MediaPickerModal
        open={!!showMediaFor}
        onClose={() => setShowMediaFor(null)}
        onSelect={handleMediaSelected}
        title="Replace Image"
      />

      {/* Publish confirm */}
      <AlertDialog
        open={showPublishConfirm}
        onOpenChange={setShowPublishConfirm}
      >
        <AlertDialogContent data-ocid="we.editor.publish.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              These changes will update the live website. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowPublishConfirm(false)}
              data-ocid="we.editor.publish.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-700 hover:bg-blue-800 text-white"
              data-ocid="we.editor.publish.confirm_button"
              onClick={async () => {
                setShowPublishConfirm(false);
                await doSave(false);
                toast.success("Published! Changes are now live.");
              }}
            >
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function getDefaultFields(sectionType: string) {
  const defaults: Record<string, { key: string; value: string }[]> = {
    hero: [
      { key: "heading", value: "Your Headline Here" },
      {
        key: "subheading",
        value: "A compelling subtitle that describes your offer.",
      },
      { key: "ctaText", value: "Get Started" },
      { key: "ctaLink", value: "/contact" },
      { key: "heroImage", value: "" },
    ],
    "text-block": [
      { key: "title", value: "Section Title" },
      { key: "content", value: "Add your content here." },
    ],
    "image-block": [
      { key: "src", value: "" },
      { key: "alt", value: "" },
      { key: "caption", value: "" },
    ],
    "two-column": [
      { key: "heading", value: "Two Column Section" },
      { key: "text", value: "Describe your content here." },
      { key: "image", value: "" },
      { key: "imageAlt", value: "" },
      { key: "imagePosition", value: "right" },
    ],
    "cta-section": [
      { key: "heading", value: "Ready to Get Started?" },
      { key: "text", value: "Join our clients and start your journey today." },
      { key: "ctaText", value: "Apply Now" },
      { key: "ctaLink", value: "/contact" },
      { key: "cta2Text", value: "Learn More" },
      { key: "cta2Link", value: "/about" },
    ],
    "services-grid": [
      { key: "heading", value: "Our Services" },
      {
        key: "subheading",
        value: "Comprehensive solutions for your international journey.",
      },
    ],
    "countries-grid": [{ key: "heading", value: "Countries We Serve" }],
    "team-section": [
      { key: "heading", value: "Meet Our Team" },
      {
        key: "image",
        value: "/assets/uploads/WhatsApp-Image-2026-03-05-at-12.08.05-1.jpeg",
      },
    ],
    "button-block": [
      { key: "text", value: "Click Here" },
      { key: "link", value: "/contact" },
    ],
    "contact-info": [
      { key: "phone", value: "+250 798979720" },
      { key: "whatsapp", value: "+250 795780073" },
      { key: "email", value: "moderneducationconsult2026@gmail.com" },
      { key: "address", value: "Kigali, Musanze, Rwanda" },
    ],
  };
  return defaults[sectionType] ?? [{ key: "content", value: "" }];
}
