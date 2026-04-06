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
