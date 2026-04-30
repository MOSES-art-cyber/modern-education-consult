export interface BlogPost {
  id: bigint;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishedDate: bigint;
  imageUrl: string;
  category: string;
}

export interface Testimonial {
  clientName: string;
  quote: string;
  country: string;
  photoUrl: string;
}

export interface FileAttachment {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
}

export interface ContactSubmission {
  id: bigint;
  fullName: string;
  phoneNumber: string;
  email: string;
  serviceOfInterest?: string;
  countryOfInterest: string;
  message: string;
  timestamp: bigint;
  preferredContactMethod?: string;
  privacyConsent?: boolean;
  attachedFiles?: FileAttachment[];
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: bigint;
  approved: boolean;
  edited: boolean;
  rejected: boolean;
}

// ─── Website Editor types ────────────────────────────────────────────────────

export interface SectionField {
  key: string;
  value: string;
}

export interface PageSection {
  id: bigint;
  sectionType: string;
  fields: SectionField[];
  order: bigint;
}

export interface WebsitePage {
  id: bigint;
  title: string;
  slug: string;
  sections: PageSection[];
  isDefault: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface MediaItem {
  id: bigint;
  filename: string;
  mimeType: string;
  base64Data: string;
  uploadedAt: bigint;
}

export interface NavMenuItem {
  id: bigint;
  text: string;
  url: string;
  order: bigint;
}

export interface GlobalConfig {
  siteTitle: string;
  logoMediaId?: bigint;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  footerContent: string;
  navigationMenu: NavMenuItem[];
  updatedAt: bigint;
}

export interface PageVersionSummary {
  version: bigint;
  timestamp: bigint;
  sectionCount: bigint;
}
