import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Images, Plus, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface SliderRow {
  url: string;
  caption: string;
  uploadedName?: string;
}

export interface ImageSliderEditorProps {
  onInsert: (marker: string) => void;
}

const emptyRow = (): SliderRow => ({ url: "", caption: "" });

export default function ImageSliderEditor({
  onInsert,
}: ImageSliderEditorProps) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<SliderRow[]>([emptyRow(), emptyRow()]);
  const [autoplay, setAutoplay] = useState(true);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    setOpen(false);
    setRows([emptyRow(), emptyRow()]);
    setAutoplay(true);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mt-2">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
        data-ocid="slider_editor.toggle"
      >
        <span className="flex items-center gap-2 font-semibold text-[#1e3a5f] text-sm">
          <Images size={16} className="text-blue-600" />
          Image Slider
          {filledCount >= 2 && !open && (
            <span className="text-xs font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
              {filledCount} images ready
            </span>
          )}
        </span>
        {open ? (
          <ChevronUp size={16} className="text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-500" />
        )}
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="p-4 space-y-4 bg-white">
          <p className="text-xs text-gray-500">
            Enter at least 2 image URLs or upload images from your computer to
            create a carousel slider inside your post.
          </p>

          {/* Image rows */}
          <div className="space-y-4">
            {rows.map((row, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: stable row index for editor
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-[#1e3a5f] font-medium">
                        Image {i + 1} *
                      </Label>
                      {/* URL input + upload button */}
                      <div className="flex gap-1.5">
                        <Input
                          value={row.url.startsWith("data:") ? "" : row.url}
                          onChange={(e) => {
                            updateRow(i, "url", e.target.value);
                            updateRow(i, "uploadedName", "");
                          }}
                          placeholder="Paste URL or upload →"
                          className="border-gray-200 focus:border-blue-500 text-sm h-9 min-w-0"
                          data-ocid="slider_editor.input"
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
                        >
                          <Upload size={13} />
                          <span className="hidden sm:inline">Upload</span>
                        </button>
                      </div>
                      {/* Uploaded file name */}
                      {row.uploadedName && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <Upload size={10} />
                          {row.uploadedName}
                        </p>
                      )}
                      {/* Mini preview */}
                      {row.url && (
                        <img
                          src={row.url}
                          alt={`Slider preview ${i + 1}`}
                          className="h-16 w-full object-cover rounded border border-gray-200 mt-1"
                          onError={(e) => {
                            (
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none";
                          }}
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-[#1e3a5f] font-medium">
                        Caption (optional)
                      </Label>
                      <Input
                        value={row.caption}
                        onChange={(e) =>
                          updateRow(i, "caption", e.target.value)
                        }
                        placeholder="Short caption..."
                        className="border-gray-200 focus:border-blue-500 text-sm h-9"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={rows.length <= 2}
                  aria-label="Remove image"
                  className="mt-6 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Add image row */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            className="gap-1.5 text-blue-700 border-blue-200 hover:bg-blue-50"
            data-ocid="slider_editor.secondary_button"
          >
            <Plus size={14} /> Add Image
          </Button>

          {/* Autoplay toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="slider-autoplay"
              checked={autoplay}
              onChange={(e) => setAutoplay(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label
              htmlFor="slider-autoplay"
              className="text-sm text-gray-600 cursor-pointer"
            >
              Autoplay (slides every 4 seconds)
            </Label>
          </div>

          {/* Insert button */}
          <div className="pt-1 flex items-center gap-3">
            <Button
              type="button"
              onClick={handleInsert}
              disabled={!canInsert}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold gap-2"
              data-ocid="slider_editor.submit_button"
            >
              <Images size={15} /> Insert Slider
            </Button>
            {filledCount >= 2 && (
              <span className="text-xs text-blue-600 font-medium">
                {filledCount} images ready
              </span>
            )}
            {filledCount < 2 && (
              <span className="text-xs text-gray-400">
                Add at least 2 images
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
