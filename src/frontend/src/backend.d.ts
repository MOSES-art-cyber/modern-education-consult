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
}
export type Time = bigint;
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
    addBlogPost(title: string, summary: string, content: string, author: string, imageUrl: string): Promise<void>;
    getAllBlogPosts(): Promise<Array<BlogPost>>;
    getAllContacts(): Promise<Array<ContactSubmission>>;
    getAllTestimonials(): Promise<Array<Testimonial>>;
    getBlogPostById(id: bigint): Promise<BlogPost>;
    submitContact(fullName: string, phoneNumber: string, email: string, countryOfInterest: string, message: string): Promise<void>;
}
