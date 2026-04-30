import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PageVersionSummary {
    version: bigint;
    timestamp: bigint;
    sectionCount: bigint;
}
export interface BlogPost {
    id: bigint;
    title: string;
    content: string;
    publishedDate: Time;
    author: string;
    summary: string;
    imageUrl: string;
    category: string;
}
export type Result_2 = {
    __kind__: "ok";
    ok: Array<PageVersionSummary>;
} | {
    __kind__: "err";
    err: string;
};
export type Time = bigint;
export interface NavMenuItem {
    id: bigint;
    url: string;
    order: bigint;
    text: string;
}
export interface Comment {
    id: string;
    content: string;
    authorEmail: string;
    edited: boolean;
    createdAt: bigint;
    authorName: string;
    approved: boolean;
    rejected: boolean;
    parentId?: string;
    postId: string;
}
export interface PageSection {
    id: bigint;
    order: bigint;
    sectionType: string;
    fields: Array<SectionField>;
}
export interface MediaItem {
    id: bigint;
    base64Data: string;
    mimeType: string;
    filename: string;
    uploadedAt: bigint;
}
export interface SectionField {
    key: string;
    value: string;
}
export type Result_1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface WebsitePage {
    id: bigint;
    title: string;
    createdAt: bigint;
    slug: string;
    updatedAt: bigint;
    isDefault: boolean;
    sections: Array<PageSection>;
}
export interface FileAttachment {
    fileName: string;
    fileSize: bigint;
    fileType: string;
    fileUrl: string;
}
export type Result = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: string;
};
export interface GlobalConfig {
    siteTitle: string;
    logoMediaId?: bigint;
    navigationMenu: Array<NavMenuItem>;
    updatedAt: bigint;
    contactEmail: string;
    footerContent: string;
    contactAddress: string;
    contactPhone: string;
}
export interface ContactSubmissionV3 {
    attachedFiles: Array<FileAttachment>;
    fullName: string;
    email: string;
    message: string;
    timestamp: Time;
    serviceOfInterest?: string;
    phoneNumber: string;
    preferredContactMethod?: string;
    countryOfInterest: string;
    privacyConsent: boolean;
}
export interface Testimonial {
    country: string;
    clientName: string;
    quote: string;
    photoUrl: string;
}
export interface backendInterface {
    addBlogPost(title: string, summary: string, content: string, author: string, imageUrl: string, category: string): Promise<void>;
    approveComment(commentId: string): Promise<boolean>;
    createWebsitePage(title: string, slug: string): Promise<Result>;
    deleteBlogPost(id: bigint): Promise<void>;
    deleteComment(commentId: string): Promise<boolean>;
    deleteContact(id: bigint): Promise<void>;
    deleteMediaItem(id: bigint): Promise<Result_1>;
    deleteWebsitePage(id: bigint): Promise<Result_1>;
    editBlogPost(id: bigint, title: string, summary: string, content: string, author: string, imageUrl: string, category: string): Promise<void>;
    editComment(commentId: string, newContent: string): Promise<boolean>;
    editWebsitePage(id: bigint, title: string, slug: string): Promise<Result_1>;
    getAllBlogPosts(): Promise<Array<BlogPost>>;
    getAllComments(): Promise<Array<Comment>>;
    getAllContacts(): Promise<Array<[bigint, ContactSubmissionV3]>>;
    getAllTestimonials(): Promise<Array<Testimonial>>;
    getAllWebsitePages(): Promise<Array<WebsitePage>>;
    getBlogPostById(id: bigint): Promise<BlogPost>;
    getCommentCount(): Promise<bigint>;
    getCommentsForPost(postId: string): Promise<Array<Comment>>;
    getGlobalConfig(): Promise<GlobalConfig | null>;
    getMediaLibrary(): Promise<Array<MediaItem>>;
    getPageVersions(slug: string): Promise<Result_2>;
    getPendingComments(): Promise<Array<Comment>>;
    getRejectedComments(): Promise<Array<Comment>>;
    getUnreadApplicationCount(): Promise<bigint>;
    getWebsitePageById(id: bigint): Promise<WebsitePage | null>;
    markApplicationsAsRead(): Promise<void>;
    rejectComment(commentId: string): Promise<boolean>;
    restorePageVersion(slug: string, version: bigint): Promise<Result_1>;
    savePageSections(pageId: bigint, sections: Array<PageSection>): Promise<Result_1>;
    submitComment(postId: string, parentId: string | null, authorName: string, authorEmail: string, content: string): Promise<string>;
    submitContact(fullName: string, phoneNumber: string, email: string, countryOfInterest: string, serviceOfInterest: string | null, message: string, preferredContactMethod: string | null, privacyConsent: boolean, attachedFiles: Array<FileAttachment>): Promise<void>;
    unapproveComment(commentId: string): Promise<boolean>;
    updateGlobalConfig(config: GlobalConfig): Promise<Result_1>;
    uploadMediaItem(filename: string, mimeType: string, base64Data: string): Promise<Result>;
}
