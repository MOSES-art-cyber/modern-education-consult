import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface FileAttachment {
    fileName: string;
    fileSize: bigint;
    fileType: string;
    fileUrl: string;
}
export type Time = bigint;
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
    deleteBlogPost(id: bigint): Promise<void>;
    deleteContact(id: bigint): Promise<void>;
    editBlogPost(id: bigint, title: string, summary: string, content: string, author: string, imageUrl: string, category: string): Promise<void>;
    getAllBlogPosts(): Promise<Array<BlogPost>>;
    getAllContacts(): Promise<Array<[bigint, ContactSubmissionV3]>>;
    getAllTestimonials(): Promise<Array<Testimonial>>;
    getBlogPostById(id: bigint): Promise<BlogPost>;
    submitContact(fullName: string, phoneNumber: string, email: string, countryOfInterest: string, serviceOfInterest: string | null, message: string, preferredContactMethod: string | null, privacyConsent: boolean, attachedFiles: Array<FileAttachment>): Promise<void>;
}
