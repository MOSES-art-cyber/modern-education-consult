import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BlogPost,
  ContactSubmission,
  FileAttachment,
  Testimonial,
} from "../types/index";
import { useActor } from "./useActor";

export function useGetAllBlogPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<BlogPost[]>({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBlogPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBlogPostById(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<BlogPost | null>({
    queryKey: ["blogPost", id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBlogPostById(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllTestimonials() {
  const { actor, isFetching } = useActor();
  return useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTestimonials();
    },
    enabled: !!actor && !isFetching,
  });
}

export function parseContactMeta(rawMessage: string): {
  cleanMessage: string;
  preferredContactMethod?: string;
  privacyConsent?: boolean;
  attachedFiles?: FileAttachment[];
} {
  const marker = "\n\n---[META]---\n";
  const idx = rawMessage.indexOf(marker);
  if (idx === -1) return { cleanMessage: rawMessage };
  try {
    const meta = JSON.parse(rawMessage.slice(idx + marker.length)) as {
      preferredContactMethod?: string;
      privacyConsent?: boolean;
      attachedFiles?: FileAttachment[];
    };
    return {
      cleanMessage: rawMessage.slice(0, idx),
      preferredContactMethod: meta.preferredContactMethod,
      privacyConsent: meta.privacyConsent,
      attachedFiles: meta.attachedFiles,
    };
  } catch {
    return { cleanMessage: rawMessage };
  }
}

export function useGetAllContacts() {
  const { actor, isFetching } = useActor();
  return useQuery<ContactSubmission[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getAllContacts();
      return raw.map(([id, c]) => ({
        id,
        fullName: c.fullName,
        phoneNumber: c.phoneNumber,
        email: c.email,
        countryOfInterest: c.countryOfInterest,
        serviceOfInterest: c.serviceOfInterest,
        message: c.message,
        timestamp: c.timestamp,
        preferredContactMethod: c.preferredContactMethod,
        privacyConsent: c.privacyConsent,
        attachedFiles: c.attachedFiles?.map((f) => ({
          fileName: f.fileName,
          fileSize: Number(f.fileSize),
          fileType: f.fileType,
          fileUrl: f.fileUrl,
        })),
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      summary,
      content,
      author,
      imageUrl,
      category,
    }: {
      title: string;
      summary: string;
      content: string;
      author: string;
      imageUrl: string;
      category: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addBlogPost(
        title,
        summary,
        content,
        author,
        imageUrl,
        category,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
    },
  });
}

export function useEditBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      summary,
      content,
      author,
      imageUrl,
      category,
    }: {
      id: bigint;
      title: string;
      summary: string;
      content: string;
      author: string;
      imageUrl: string;
      category: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.editBlogPost(
        id,
        title,
        summary,
        content,
        author,
        imageUrl,
        category,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
    },
  });
}

export function useDeleteBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteBlogPost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
    },
  });
}

export function useDeleteContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteContact(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useSubmitContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fullName,
      phoneNumber,
      email,
      serviceOfInterest,
      countryOfInterest,
      message,
      preferredContactMethod,
      privacyConsent,
      attachedFiles,
    }: {
      fullName: string;
      phoneNumber: string;
      email: string;
      serviceOfInterest: string;
      countryOfInterest: string;
      message: string;
      preferredContactMethod?: string;
      privacyConsent?: boolean;
      attachedFiles?: FileAttachment[];
    }) => {
      if (!actor) throw new Error("Not connected");
      const backendFiles = (attachedFiles ?? []).map((f) => ({
        fileName: f.fileName,
        fileSize: BigInt(f.fileSize),
        fileType: f.fileType,
        fileUrl: f.fileUrl,
      })) as unknown as Parameters<typeof actor.submitContact>[8];
      return actor.submitContact(
        fullName,
        phoneNumber,
        email,
        countryOfInterest,
        serviceOfInterest || null,
        message,
        preferredContactMethod || null,
        privacyConsent ?? false,
        backendFiles,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
