import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Images, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useGetMediaLibrary, useUploadMediaItem } from "../../hooks/useQueries";

type MediaTab = "library" | "upload" | "url";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
}

export default function MediaPickerModal({
  open,
  onClose,
  onSelect,
  title = "Select Image",
}: Props) {
  const [activeTab, setActiveTab] = useState<MediaTab>("library");
  const [urlInput, setUrlInput] = useState("");
  const { data: media = [], isLoading } = useGetMediaLibrary();
  const uploadMedia = useUploadMediaItem();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Data = ev.target?.result;
      if (typeof base64Data !== "string") return;
      try {
        await uploadMedia.mutateAsync({
          filename: file.name,
          mimeType: file.type,
          base64Data,
        });
        toast.success(`"${file.name}" uploaded.`);
        setActiveTab("library");
      } catch (err) {
        toast.error(
          `Upload failed: ${err instanceof Error ? err.message : "Unknown"}`,
        );
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleUrlSelect = () => {
    if (!urlInput.trim()) return;
    onSelect(urlInput.trim());
    setUrlInput("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[80vh] flex flex-col"
        data-ocid="we.media_picker.dialog"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 -mx-6 px-6">
          {(["library", "upload", "url"] as MediaTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              data-ocid={`we.media_picker.${tab}.tab`}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "library"
                ? "Media Library"
                : tab === "upload"
                  ? "Upload New"
                  : "Paste URL"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pt-2">
          {activeTab === "library" && (
            <div>
              {isLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : media.length === 0 ? (
                <div
                  className="text-center py-12 text-gray-400"
                  data-ocid="we.media_picker.empty_state"
                >
                  <Images size={32} className="mx-auto mb-2" />
                  <p className="text-sm">No media uploaded yet.</p>
                  <p className="text-xs mt-1">
                    Switch to the Upload tab to add images.
                  </p>
                </div>
              ) : (
                <div
                  className="grid grid-cols-3 sm:grid-cols-4 gap-3"
                  data-ocid="we.media_picker.grid"
                >
                  {media.map((item, idx) => (
                    <button
                      key={item.id.toString()}
                      type="button"
                      data-ocid={`we.media_picker.item.${idx + 1}`}
                      onClick={() => {
                        onSelect(item.base64Data);
                        onClose();
                      }}
                      className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
                      title={item.filename}
                    >
                      <img
                        src={item.base64Data}
                        alt={item.filename}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-blue-700/0 group-hover:bg-blue-700/20 transition-colors flex items-end">
                        <span className="w-full text-xs text-white bg-black/50 px-1.5 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.filename}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "upload" && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
              <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Upload size={28} className="text-blue-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700 mb-1">
                  Upload an image
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF, WEBP accepted
                </p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMedia.isPending}
                className="bg-blue-700 text-white"
                data-ocid="we.media_picker.upload.button"
              >
                <Upload size={15} className="mr-2" />
                {uploadMedia.isPending ? "Uploading..." : "Choose File"}
              </Button>
            </div>
          )}

          {activeTab === "url" && (
            <div className="py-6 space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="media-url"
                  className="text-sm font-semibold text-gray-700"
                >
                  Image URL
                </label>
                <Input
                  id="media-url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="border-gray-200"
                  data-ocid="we.media_picker.url.input"
                  onKeyDown={(e) => e.key === "Enter" && handleUrlSelect()}
                />
              </div>
              {urlInput && (
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-h-40 flex items-center justify-center">
                  <img
                    src={urlInput}
                    alt="Preview"
                    className="max-h-40 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                </div>
              )}
              <Button
                onClick={handleUrlSelect}
                disabled={!urlInput.trim()}
                className="w-full bg-blue-700 text-white"
                data-ocid="we.media_picker.url.submit_button"
              >
                Use This Image
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
