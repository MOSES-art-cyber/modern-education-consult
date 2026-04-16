import {
  createActorWithConfig,
  useActor as useActorBase,
} from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";
import type { BlogPost, FileAttachment, Testimonial } from "../types/index";

export interface BackendActor {
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: bigint): Promise<BlogPost | null>;
  addBlogPost(
    title: string,
    summary: string,
    content: string,
    author: string,
    imageUrl: string,
    category: string,
  ): Promise<void>;
  editBlogPost(
    id: bigint,
    title: string,
    summary: string,
    content: string,
    author: string,
    imageUrl: string,
    category: string,
  ): Promise<void>;
  deleteBlogPost(id: bigint): Promise<void>;
  getAllTestimonials(): Promise<Testimonial[]>;
  getAllContacts(): Promise<
    Array<
      [
        bigint,
        {
          fullName: string;
          phoneNumber: string;
          email: string;
          countryOfInterest: string;
          serviceOfInterest?: string;
          message: string;
          timestamp: bigint;
          preferredContactMethod?: string;
          privacyConsent: boolean;
          attachedFiles: Array<{
            fileName: string;
            fileSize: bigint;
            fileType: string;
            fileUrl: string;
          }>;
        },
      ]
    >
  >;
  deleteContact(id: bigint): Promise<void>;
  submitContact(
    fullName: string,
    phoneNumber: string,
    email: string,
    countryOfInterest: string,
    serviceOfInterest: string | null,
    message: string,
    preferredContactMethod: string | null,
    privacyConsent: boolean,
    attachedFiles: Array<FileAttachment>,
  ): Promise<void>;
}

export function useActor(): {
  actor: BackendActor | null;
  isFetching: boolean;
} {
  const result = useActorBase(() => createActorWithConfig(createActor));
  return result as { actor: BackendActor | null; isFetching: boolean };
}
