export interface PostMeta {
  tags: string[];
  metaTitle: string;
  metaDesc: string;
  keywords: string;
  slug: string;
  frenchTitle: string;
  frenchContent: string;
  bilingualEnabled: boolean;
  langOrder: "en-fr" | "fr-en";
  featuredImagePos: "top" | "inline" | "hidden";
  status: "published" | "draft" | "scheduled";
  scheduledDate: string;
  showDate: boolean;
  showUpdatedDate: boolean;
  lastUpdated: string;
  ctaAuthorName: string;
}

export const DEFAULT_META: PostMeta = {
  tags: [],
  metaTitle: "",
  metaDesc: "",
  keywords: "",
  slug: "",
  frenchTitle: "",
  frenchContent: "",
  bilingualEnabled: false,
  langOrder: "en-fr",
  featuredImagePos: "top",
  status: "published",
  scheduledDate: "",
  showDate: true,
  showUpdatedDate: false,
  lastUpdated: "",
  ctaAuthorName: "",
};

export function parsePostContent(rawContent: string): {
  meta: PostMeta;
  content: string;
} {
  const prefix = "[POSTMETA:";
  if (!rawContent.startsWith(prefix))
    return { meta: { ...DEFAULT_META }, content: rawContent };
  const endIdx = rawContent.indexOf("}]");
  if (endIdx === -1) return { meta: { ...DEFAULT_META }, content: rawContent };
  try {
    const jsonStr = rawContent.slice(prefix.length, endIdx + 1);
    const meta = { ...DEFAULT_META, ...JSON.parse(jsonStr) };
    const content = rawContent.slice(endIdx + 2).trimStart();
    return { meta, content };
  } catch {
    return { meta: { ...DEFAULT_META }, content: rawContent };
  }
}

export function serializePostContent(meta: PostMeta, content: string): string {
  return `[POSTMETA:${JSON.stringify(meta)}]\n${content}`;
}

/**
 * Convert editor HTML (which may contain data-type="slider" visual blocks)
 * back into clean content with [SLIDER:{...}] text markers for storage.
 */
export function editorHtmlToContent(html: string): string {
  if (!html) return html;
  // Use a temporary DOM element to parse and transform
  const div = document.createElement("div");
  div.innerHTML = html;
  const sliderBlocks = div.querySelectorAll('[data-type="slider"]');
  for (const block of sliderBlocks) {
    const rawMarker = block.getAttribute("data-marker") ?? "";
    // Unescape HTML entities in the marker attribute
    const marker = rawMarker
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    // Replace the block with a text node of the marker
    const text = document.createTextNode(marker);
    block.replaceWith(text);
  }
  // Remove any empty trailing <p> tags that were inserted after sliders
  return div.innerHTML;
}

/**
 * Convert clean content with [SLIDER:{...}] text markers into HTML
 * with visual placeholder blocks for display in the editor.
 */
export function contentToEditorHtml(content: string): string {
  if (!content) return content;
  const MARKER_PREFIX = "[SLIDER:";
  let result = "";
  let remaining = content;
  while (remaining.length > 0) {
    const startIdx = remaining.indexOf(MARKER_PREFIX);
    if (startIdx === -1) {
      result += remaining;
      break;
    }
    // Text before marker
    result += remaining.slice(0, startIdx);
    const jsonStart = startIdx + MARKER_PREFIX.length;
    const endIdx = remaining.indexOf("}]", jsonStart);
    if (endIdx === -1) {
      result += remaining.slice(startIdx);
      break;
    }
    const markerStr = remaining.slice(startIdx, endIdx + 2);
    const jsonStr = remaining.slice(jsonStart, endIdx + 1);
    try {
      const config = JSON.parse(jsonStr) as {
        images: { url: string; caption?: string }[];
        autoplay: boolean;
      };
      const escaped = markerStr.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      const previews = config.images
        .slice(0, 3)
        .map(
          (img) =>
            `<img src="${img.url}" alt="" style="width:${Math.floor(
              100 / Math.min(3, config.images.length),
            )}%;height:64px;object-fit:cover;display:inline-block;margin-right:2px;border-radius:4px;" />`,
        )
        .join("");
      result += `<div contenteditable="false" data-type="slider" data-marker="${escaped}" style="border:2px solid #3b82f6;border-radius:10px;padding:12px;margin:12px 0;background:#eff6ff;user-select:none;-webkit-user-select:none;cursor:default;position:relative;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="m8 21 4-4 4 4"/><path d="M3 7h18"/></svg><span style="font-size:13px;font-weight:700;color:#1e3a5f;">Image Slider</span><span style="font-size:11px;background:#dbeafe;color:#1d4ed8;border-radius:9999px;padding:2px 8px;font-weight:600;">${config.images.length} slides${config.autoplay ? " · Autoplay" : ""}</span></div><div style="display:flex;gap:2px;overflow:hidden;border-radius:6px;margin-bottom:8px;">${previews}</div><div style="display:flex;gap:6px;"><button type="button" data-action="edit-slider" data-marker="${escaped}" style="font-size:11px;font-weight:600;padding:4px 10px;border-radius:6px;background:#2563eb;color:#fff;border:none;cursor:pointer;">Edit</button><button type="button" data-action="delete-slider" style="font-size:11px;font-weight:600;padding:4px 10px;border-radius:6px;background:#fee2e2;color:#dc2626;border:none;cursor:pointer;">Remove</button></div></div><p></p>`;
    } catch {
      result += markerStr;
    }
    remaining = remaining.slice(endIdx + 2);
  }
  return result;
}
