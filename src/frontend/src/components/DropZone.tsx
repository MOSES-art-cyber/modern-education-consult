import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, FileText, Link2, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface DroppedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface AddedLink {
  id: string;
  url: string;
}

interface DropZoneProps {
  label?: string;
  ocidPrefix?: string;
}

export default function DropZone({
  label = "Documents & Files",
  ocidPrefix = "program",
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<DroppedFile[]>([]);
  const [links, setLinks] = useState<AddedLink[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFiles = useCallback((newFiles: FileList) => {
    const added: DroppedFile[] = Array.from(newFiles).map((f) => ({
      id: `${Date.now()}-${f.name}`,
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    setFiles((prev) => [...prev, ...added]);
    toast.success(`${added.length} file${added.length > 1 ? "s" : ""} added`);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleAddLink = () => {
    const trimmed = linkInput.trim();
    if (!trimmed) return;
    const urlToAdd = trimmed.startsWith("http")
      ? trimmed
      : `https://${trimmed}`;
    try {
      new URL(urlToAdd);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }
    setLinks((prev) => [...prev, { id: `${Date.now()}-link`, url: urlToAdd }]);
    setLinkInput("");
    toast.success("Link added");
  };

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));
  const removeLink = (id: string) =>
    setLinks((prev) => prev.filter((l) => l.id !== id));

  return (
    <div data-ocid={`${ocidPrefix}.panel`} className="space-y-4">
      <p className="text-sm font-semibold text-brand-dark">{label}</p>

      {/* Drop area */}
      <button
        type="button"
        data-ocid={`${ocidPrefix}.dropzone`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Drag and drop files here or click to upload"
        className={[
          "relative w-full cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8 text-center select-none",
          isDragOver
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-border hover:border-primary/60 hover:bg-primary/5 bg-accent/40",
        ].join(" ")}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
          data-ocid={`${ocidPrefix}.upload_button`}
        />
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div
            className={[
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200",
              isDragOver
                ? "bg-primary text-white"
                : "bg-primary/10 text-primary",
            ].join(" ")}
          >
            <Upload size={26} />
          </div>
          <div>
            <p className="font-semibold text-sm text-brand-dark">
              {isDragOver
                ? "Release to upload"
                : "Drag files here or click to upload"}
            </p>
            <p className="text-xs text-foreground/50 mt-1">
              Supports PDF, DOC, DOCX, JPG, PNG and more
            </p>
          </div>
        </div>
      </button>

      {/* Link input */}
      <div className="flex gap-2">
        <Input
          data-ocid={`${ocidPrefix}.input`}
          type="url"
          placeholder="Paste a link (e.g. https://example.com)"
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
          className="flex-1 text-sm border-border focus:border-primary"
        />
        <Button
          type="button"
          onClick={handleAddLink}
          data-ocid={`${ocidPrefix}.button`}
          className="bg-primary hover:bg-primary/90 text-white font-semibold gap-2 shrink-0"
        >
          <Link2 size={15} />
          Add Link
        </Button>
      </div>

      {/* Files list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest">
              Files ({files.length})
            </p>
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-border shadow-xs group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-dark truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {formatSize(file.size)}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                </Badge>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  aria-label={`Remove ${file.name}`}
                  className="w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center text-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Links list */}
      <AnimatePresence>
        {links.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest">
              Links ({links.length})
            </p>
            {links.map((link) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-border shadow-xs group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Link2 size={16} className="text-primary" />
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0 text-sm font-medium text-brand-blue hover:underline truncate flex items-center gap-1"
                >
                  {link.url}
                  <ExternalLink size={12} className="shrink-0" />
                </a>
                <button
                  type="button"
                  onClick={() => removeLink(link.id)}
                  aria-label="Remove link"
                  className="w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center text-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {files.length === 0 && links.length === 0 && (
        <p
          data-ocid={`${ocidPrefix}.empty_state`}
          className="text-xs text-foreground/40 text-center py-1"
        >
          No files or links added yet
        </p>
      )}
    </div>
  );
}
