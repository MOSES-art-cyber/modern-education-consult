import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Image,
  Images,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  MousePointerClick,
  Quote,
  RemoveFormatting,
  Table,
  Underline,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageSliderConfig } from "./ImageSliderEditor";
import ImageSliderEditor from "./ImageSliderEditor";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  onInsertCta?: () => void;
}

function ToolbarButton({
  onClick,
  title,
  active,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`p-1.5 rounded text-sm transition-colors hover:bg-gray-200 ${
        active ? "bg-blue-100 text-blue-700" : "text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5" />;
}

/** Serialize a slider config into the text marker stored in content */
function buildSliderMarker(config: ImageSliderConfig): string {
  return `[SLIDER:${JSON.stringify({ images: config.images, autoplay: config.autoplay })}]`;
}

/** Parse an existing slider marker string → config (or null on failure) */
function parseSliderMarker(marker: string): ImageSliderConfig | null {
  try {
    const prefix = "[SLIDER:";
    if (!marker.startsWith(prefix)) return null;
    const json = marker.slice(prefix.length, -1);
    return JSON.parse(json) as ImageSliderConfig;
  } catch {
    return null;
  }
}

/** Build the visual placeholder HTML block that appears in the editor */
function buildSliderPlaceholder(config: ImageSliderConfig): string {
  const marker = buildSliderMarker(config);
  const escaped = marker.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const previews = config.images
    .slice(0, 3)
    .map(
      (img) =>
        `<img src="${img.url}" alt="" style="width:${Math.floor(
          100 / Math.min(3, config.images.length),
        )}%;height:64px;object-fit:cover;display:inline-block;margin-right:2px;border-radius:4px;" />`,
    )
    .join("");

  return `<div
    contenteditable="false"
    data-type="slider"
    data-marker="${escaped}"
    style="
      border:2px solid #3b82f6;
      border-radius:10px;
      padding:12px;
      margin:12px 0;
      background:#eff6ff;
      user-select:none;
      -webkit-user-select:none;
      cursor:default;
      position:relative;
    "
  >
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="m8 21 4-4 4 4"/><path d="M3 7h18"/></svg>
      <span style="font-size:13px;font-weight:700;color:#1e3a5f;">Image Slider</span>
      <span style="font-size:11px;background:#dbeafe;color:#1d4ed8;border-radius:9999px;padding:2px 8px;font-weight:600;">${config.images.length} slides${config.autoplay ? " · Autoplay" : ""}</span>
    </div>
    <div style="display:flex;gap:2px;overflow:hidden;border-radius:6px;margin-bottom:8px;">${previews}</div>
    <div style="display:flex;gap:6px;">
      <button
        type="button"
        data-action="edit-slider"
        data-marker="${escaped}"
        style="font-size:11px;font-weight:600;padding:4px 10px;border-radius:6px;background:#2563eb;color:#fff;border:none;cursor:pointer;"
      >Edit</button>
      <button
        type="button"
        data-action="delete-slider"
        style="font-size:11px;font-weight:600;padding:4px 10px;border-radius:6px;background:#fee2e2;color:#dc2626;border:none;cursor:pointer;"
      >Remove</button>
    </div>
  </div><p></p>`;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = "250px",
  onInsertCta,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInit, setIsInit] = useState(false);
  const isComposing = useRef(false);
  const savedRangeRef = useRef<Range | null>(null);

  // Slider modal state
  const [sliderModalOpen, setSliderModalOpen] = useState(false);
  const [editingSliderConfig, setEditingSliderConfig] =
    useState<ImageSliderConfig | null>(null);
  const editingSliderNodeRef = useRef<HTMLElement | null>(null);

  // Initialize with value
  useEffect(() => {
    if (editorRef.current && !isInit) {
      editorRef.current.innerHTML = value || "";
      setIsInit(true);
    }
  }, [value, isInit]);

  // When value changes externally (e.g. language tab switch)
  const prevValueRef = useRef(value);
  useEffect(() => {
    if (!isInit) return;
    if (value !== prevValueRef.current && editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      if (value !== currentHtml) {
        editorRef.current.innerHTML = value || "";
      }
    }
    prevValueRef.current = value;
  }, [value, isInit]);

  const exec = useCallback(
    (command: string, val?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, val);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    },
    [onChange],
  );

  const handleInput = () => {
    if (!isComposing.current && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = window.prompt("Enter URL:", "https://");
    if (url) exec("createLink", url);
  };

  const insertImage = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        if (src) {
          const caption = window.prompt("Caption (optional):", "");
          const html = `<figure class="content-figure"><img src="${src}" alt="${caption || ""}" class="content-img content-img-center"/>${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
          editorRef.current?.focus();
          document.execCommand("insertHTML", false, html);
          if (editorRef.current) onChange(editorRef.current.innerHTML);
        }
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  };

  const insertTable = () => {
    const html = `<table class="content-table"><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td><td>Cell 4</td></tr></tbody></table><p></p>`;
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const insertHr = () => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, "<hr/><p></p>");
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const insertBlockquote = () => {
    exec("formatBlock", "blockquote");
  };

  const setFontSize = (size: string) => {
    exec("fontSize", "7");
    const spans = editorRef.current?.querySelectorAll('[size="7"]');
    if (spans) {
      for (const el of spans) {
        (el as HTMLElement).removeAttribute("size");
        (el as HTMLElement).style.fontSize = size;
      }
    }
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  /** Save current cursor position before opening a modal */
  const saveCursor = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    } else {
      savedRangeRef.current = null;
    }
  };

  /** Restore saved cursor position */
  const restoreCursor = () => {
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  /** Insert HTML at saved cursor position (or end) */
  const insertHtmlAtSavedCursor = (html: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    restoreCursor();
    document.execCommand("insertHTML", false, html);
    onChange(editor.innerHTML);
  };

  // Open slider modal: save cursor, open dialog
  const openSliderModal = () => {
    saveCursor();
    setEditingSliderConfig(null);
    editingSliderNodeRef.current = null;
    setSliderModalOpen(true);
  };

  // Handle clicks inside the editor for Edit/Delete slider buttons
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    handleSliderAction(target);
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      const target = e.target as HTMLElement;
      handleSliderAction(target);
    }
  };

  const handleSliderAction = (target: HTMLElement) => {
    const action = target.getAttribute("data-action");

    if (action === "edit-slider") {
      const marker = target.getAttribute("data-marker") ?? "";
      const config = parseSliderMarker(
        marker.replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
      );
      const block = target.closest(
        '[data-type="slider"]',
      ) as HTMLElement | null;
      editingSliderNodeRef.current = block;
      setEditingSliderConfig(config);
      setSliderModalOpen(true);
    } else if (action === "delete-slider") {
      const block = target.closest(
        '[data-type="slider"]',
      ) as HTMLElement | null;
      if (block) {
        // Remove the placeholder block and any following empty <p>
        const next = block.nextSibling;
        block.remove();
        if (
          next &&
          next.nodeName === "P" &&
          (next as HTMLElement).innerHTML === ""
        ) {
          next.remove();
        }
        if (editorRef.current) onChange(editorRef.current.innerHTML);
      }
    }
  };

  // Handle slider insert/update from modal
  const handleSliderModalInsert = (marker: string) => {
    const config = parseSliderMarker(marker);
    if (!config) return;
    const html = buildSliderPlaceholder(config);

    if (editingSliderNodeRef.current) {
      // Edit mode: replace the existing block
      editingSliderNodeRef.current.outerHTML = html;
      if (editorRef.current) onChange(editorRef.current.innerHTML);
      editingSliderNodeRef.current = null;
    } else {
      // Insert mode: put at saved cursor position
      insertHtmlAtSavedCursor(html);
    }

    setSliderModalOpen(false);
    setEditingSliderConfig(null);
  };

  // When reading back the HTML to serialize, convert placeholder divs → text markers
  // This is done externally: AdminPage reads editorRef HTML through onChange.
  // The onChange already emits the live innerHTML which contains data-type="slider" blocks.
  // serializeContent() in AdminPage needs to strip the placeholder HTML and emit text markers.
  // We expose a stable utility for that below — see note in AdminPage.

  return (
    <>
      <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 bg-white">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 p-1.5 flex flex-wrap gap-0.5 items-center">
          {/* Text formatting */}
          <ToolbarButton onClick={() => exec("bold")} title="Bold">
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => exec("italic")} title="Italic">
            <Italic size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => exec("underline")} title="Underline">
            <Underline size={14} />
          </ToolbarButton>

          <Divider />

          {/* Font size */}
          <select
            title="Font size"
            className="h-7 px-1 text-xs border border-gray-200 rounded bg-white text-gray-600 cursor-pointer"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) setFontSize(e.target.value);
              e.target.value = "";
            }}
          >
            <option value="" disabled>
              Size
            </option>
            {[
              "12px",
              "14px",
              "16px",
              "18px",
              "20px",
              "24px",
              "28px",
              "32px",
              "36px",
            ].map((s) => (
              <option key={s} value={s}>
                {s.replace("px", "")}
              </option>
            ))}
          </select>

          {/* Text color */}
          <label
            className="flex items-center gap-0.5 cursor-pointer p-1 rounded hover:bg-gray-200 text-gray-600"
            title="Text color"
          >
            <span
              className="text-xs font-bold"
              style={{ textDecoration: "underline 2px" }}
            >
              A
            </span>
            <input
              type="color"
              className="w-4 h-4 border-0 p-0 cursor-pointer"
              title="Text color"
              onChange={(e) => exec("foreColor", e.target.value)}
            />
          </label>

          {/* Highlight */}
          <label
            className="flex items-center gap-0.5 cursor-pointer p-1 rounded hover:bg-gray-200 text-gray-600"
            title="Highlight color"
          >
            <span
              className="text-xs"
              style={{ background: "yellow", padding: "0 2px" }}
            >
              H
            </span>
            <input
              type="color"
              className="w-4 h-4 border-0 p-0 cursor-pointer"
              title="Highlight"
              defaultValue="#ffff00"
              onChange={(e) => exec("hiliteColor", e.target.value)}
            />
          </label>

          <Divider />

          {/* Alignment */}
          <ToolbarButton onClick={() => exec("justifyLeft")} title="Align left">
            <AlignLeft size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => exec("justifyCenter")}
            title="Align center"
          >
            <AlignCenter size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => exec("justifyRight")}
            title="Align right"
          >
            <AlignRight size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => exec("justifyFull")} title="Justify">
            <AlignJustify size={14} />
          </ToolbarButton>

          <Divider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => exec("insertUnorderedList")}
            title="Bullet list"
          >
            <List size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => exec("insertOrderedList")}
            title="Numbered list"
          >
            <ListOrdered size={14} />
          </ToolbarButton>

          <Divider />

          {/* Insert tools */}
          <ToolbarButton onClick={insertLink} title="Insert link">
            <Link2 size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={insertBlockquote} title="Blockquote">
            <Quote size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={insertHr} title="Divider line">
            <Minus size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={insertTable} title="Insert table">
            <Table size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={insertImage} title="Insert image">
            <Image size={14} />
          </ToolbarButton>

          {/* Insert Slider */}
          <ToolbarButton onClick={openSliderModal} title="Insert image slider">
            <Images size={14} />
          </ToolbarButton>

          {onInsertCta && (
            <ToolbarButton onClick={onInsertCta} title="Add CTA button">
              <MousePointerClick size={14} />
            </ToolbarButton>
          )}

          <Divider />

          {/* Clear formatting */}
          <ToolbarButton
            onClick={() => exec("removeFormat")}
            title="Clear formatting"
          >
            <RemoveFormatting size={14} />
          </ToolbarButton>
        </div>

        {/* Editable area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onClick={handleEditorClick}
          onKeyDown={handleEditorKeyDown}
          onCompositionStart={() => {
            isComposing.current = true;
          }}
          onCompositionEnd={() => {
            isComposing.current = false;
            if (editorRef.current) onChange(editorRef.current.innerHTML);
          }}
          className="prose prose-sm max-w-none p-4 outline-none rich-editor"
          style={{ minHeight }}
          data-placeholder={placeholder}
        />
      </div>

      {/* Slider modal — rendered outside the editor box */}
      <ImageSliderEditor
        open={sliderModalOpen}
        onInsert={handleSliderModalInsert}
        onClose={() => {
          setSliderModalOpen(false);
          setEditingSliderConfig(null);
          editingSliderNodeRef.current = null;
        }}
        initialConfig={editingSliderConfig}
      />
    </>
  );
}
