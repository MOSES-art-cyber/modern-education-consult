import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GripVertical, Images, Plus, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SliderRow {
  url: string;
  caption: string;
  uploadedName?: string;
}

export interface ImageSliderConfig {
  images: { url: string; caption?: string }[];
  autoplay: boolean;
}

export interface ImageSliderEditorProps {
  /** When true the dialog is open */
  open: boolean;
  /** Called when user clicks Insert / Update — passes the marker string */
  onInsert: (marker: string) => void;
  /** Called when user cancels or closes */
  onClose: () => void;
  /** Pre-existing config for edit mode */
  initialConfig?: ImageSliderConfig | null;
}

const emptyRow = (): SliderRow => ({ url: "", caption: "" });

function configToRows(config: ImageSliderConfig): SliderRow[] {
  return config.images.map((img) => ({
    url: img.url,
    caption: img.caption ?? "",
  }));
}

export default function ImageSliderEditor({
  open,
  onInsert,
  onClose,
  initialConfig,
}: ImageSliderEditorProps) {
  const [rows, setRows] = useState<SliderRow[]>([emptyRow(), emptyRow()]);
  const [autoplay, setAutoplay] = useState(true);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dragIndexRef = useRef<number | null>(null);

  // Reset or populate when dialog opens
  useEffect(() => {
    if (open) {
      if (initialConfig) {
        setRows(configToRows(initialConfig));
        setAutoplay(initialConfig.autoplay);
      } else {
        setRows([emptyRow(), emptyRow()]);
        setAutoplay(true);
      }
    }
  }, [open, initialConfig]);

  const filledCount = rows.filter((r) => r.url.trim()).length;
  const canInsert = filledCount >= 2;

  const updateRow = (i: number, field: keyof SliderRow, value: string) => {
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)),
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (i: number) => {
    if (rows.length <= 2) return;
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleFileUpload = (i: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setRows((prev) =>
        prev.map((r, idx) =>
          idx === i ? { ...r, url: result, uploadedName: file.name } : r,
        ),
      );
    };
    reader.readAsDataURL(file);
  };

  // Drag-to-reorder
  const handleDragStart = (i: number) => {
    dragIndexRef.current = i;
  };

  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === i) return;
    setRows((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(i, 0, moved);
      return next;
    });
    dragIndexRef.current = i;
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
  };

  const handleInsert = () => {
    const images = rows
      .filter((r) => r.url.trim())
      .map((r) => ({
        url: r.url.trim(),
        ...(r.caption.trim() ? { caption: r.caption.trim() } : {}),
      }));
    if (images.length < 2) return;
    const marker = `[SLIDER:${JSON.stringify({ images, autoplay })}]`;
    onInsert(marker);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1e3a5f]">
            <Images size={18} className="text-blue-600" />
            {initialConfig ? "Edit Image Slider" : "Insert Image Slider"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          <p className="text-xs text-gray-500">
            Add at least 2 images to create a carousel. Drag rows to reorder.
          </p>

          {/* Image rows */}
          <div className="space-y-3">
            {rows.map((row, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: stable editor row index
                key={i}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragEnd={handleDragEnd}
                className="flex gap-2 items-start bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-colors hover:border-blue-200"
                data-ocid={`slider_editor.row.${i + 1}`}
              >
                {/* Drag handle */}
                <div className="mt-2 text-gray-300 hover:text-gray-500 cursor-grab shrink-0">
                  <GripVertical size={16} />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Image source */}
                    <div className="space-y-1">
                      <Label className="text-xs text-[#1e3a5f] font-semibold">
                        Image {i + 1} {i < 2 ? "*" : ""}
                      </Label>
                      <div className="flex gap-1.5">
                        <Input
                          value={row.url.startsWith("data:") ? "" : row.url}
                          onChange={(e) => {
                            updateRow(i, "url", e.target.value);
                            updateRow(i, "uploadedName", "");
                          }}
                          placeholder="Paste image URL…"
                          className="border-gray-200 focus:border-blue-500 text-sm h-9 min-w-0"
                          data-ocid="slider_editor.url.input"
                        />
                        {/* Hidden file input */}
                        <input
                          ref={(el) => {
                            fileInputRefs.current[i] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(i, file);
                            e.target.value = "";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[i]?.click()}
                          title="Upload from computer"
                          className="flex items-center gap-1 px-2.5 h-9 text-xs font-medium text-blue-700 border border-blue-200 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0"
                          data-ocid="slider_editor.upload_button"
                        >
                          <Upload size={13} />
                          <span className="hidden sm:inline">Upload</span>
                        </button>
                      </div>
                      {row.uploadedName && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <Upload size={10} /> {row.uploadedName}
                        </p>
                      )}
                      {/* Preview thumbnail */}
                      {row.url && (
                        <img
                          src={row.url}
                          alt={`Preview ${i + 1}`}
                          className="h-16 w-full object-cover rounded border border-gray-200 mt-1"
                          onError={(e) => {
                            (
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none";
                          }}
                        />
                      )}
                    </div>

                    {/* Caption */}
                    <div className="space-y-1">
                      <Label className="text-xs text-[#1e3a5f] font-semibold">
                        Caption (optional)
                      </Label>
                      <Input
                        value={row.caption}
                        onChange={(e) =>
                          updateRow(i, "caption", e.target.value)
                        }
                        placeholder="Short caption…"
                        className="border-gray-200 focus:border-blue-500 text-sm h-9"
                        data-ocid="slider_editor.caption.input"
                      />
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={rows.length <= 2}
                  aria-label={`Remove image ${i + 1}`}
                  className="mt-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30 shrink-0"
                  data-ocid={`slider_editor.delete_button.${i + 1}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Add image */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            className="gap-1.5 text-blue-700 border-blue-200 hover:bg-blue-50"
            data-ocid="slider_editor.add_image.button"
          >
            <Plus size={14} /> Add Image
          </Button>

          {/* Autoplay toggle */}
          <div className="flex items-center gap-2 py-1 border-t border-gray-100">
            <input
              type="checkbox"
              id="slider-autoplay-modal"
              checked={autoplay}
              onChange={(e) => setAutoplay(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              data-ocid="slider_editor.autoplay.checkbox"
            />
            <Label
              htmlFor="slider-autoplay-modal"
              className="text-sm text-gray-600 cursor-pointer"
            >
              Autoplay — slides advance every 4 seconds, pause on hover
            </Label>
          </div>

          {/* Status + actions */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-gray-100">
            <span
              className={`text-xs font-medium ${canInsert ? "text-blue-600" : "text-gray-400"}`}
            >
              {filledCount < 2
                ? `Add ${2 - filledCount} more image${2 - filledCount !== 1 ? "s" : ""} to enable insert`
                : `${filledCount} image${filledCount !== 1 ? "s" : ""} ready`}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                data-ocid="slider_editor.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleInsert}
                disabled={!canInsert}
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold gap-2"
                data-ocid="slider_editor.submit_button"
              >
                <Images size={14} />
                {initialConfig ? "Update Slider" : "Insert Slider"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
