import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Image,
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

  // Initialize with value
  useEffect(() => {
    if (editorRef.current && !isInit) {
      editorRef.current.innerHTML = value || "";
      setIsInit(true);
    }
  }, [value, isInit]);

  // When value changes externally (e.g. language tab switch) and we've already initialized
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
    // Apply real size via span
    const spans = editorRef.current?.querySelectorAll('[size="7"]');
    if (spans) {
      for (const el of spans) {
        (el as HTMLElement).removeAttribute("size");
        (el as HTMLElement).style.fontSize = size;
      }
    }
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  return (
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
        <ToolbarButton onClick={() => exec("justifyRight")} title="Align right">
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
  );
}
