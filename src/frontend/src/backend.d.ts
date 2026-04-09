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
export type Time = bigint;
export interface Comment {
    id: bigint;
    content: string;
    authorEmail: string;
    createdAt: bigint;
    authorName: string;
    approved: boolean;
    parentId?: bigint;
    postId: string;
}
export interface ContactSubmission {
    fullName: string;
    email: string;
    message: string;
    timestamp: Time;
    phoneNumber: string;
    countryOfInterest: string;
}
export interface Testimonial {
    country: string;
    clientName: string;
    quote: string;
    photoUrl: string;
}
export interface backendInterface {
    addBlogPost(title: string, summary: string, content: string, author: string, imageUrl: string, category: string): Promise<void>;
    approveComment(id: bigint): Promise<boolean>;
    deleteBlogPost(id: bigint): Promise<void>;
    deleteComment(id: bigint): Promise<boolean>;
    editBlogPost(id: bigint, title: string, summary: string, content: string, author: string, imageUrl: string, category: string): Promise<void>;
    editComment(id: bigint, content: string): Promise<boolean>;
    getAllBlogPosts(): Promise<Array<BlogPost>>;
    getAllContacts(): Promise<Array<ContactSubmission>>;
    getAllTestimonials(): Promise<Array<Testimonial>>;
    getApprovedComments(postId: string): Promise<Array<Comment>>;
    getBlogPostById(id: bigint): Promise<BlogPost>;
    getPendingCommentCount(): Promise<bigint>;
    getPendingComments(): Promise<Array<Comment>>;
    rejectComment(id: bigint): Promise<boolean>;
    submitComment(postId: string, parentId: bigint | null, authorName: string, authorEmail: string, content: string): Promise<bigint>;
    submitContact(fullName: string, phoneNumber: string, email: string, countryOfInterest: string, message: string): Promise<void>;
}
