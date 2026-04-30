import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BlogPost,
  Comment,
  ContactSubmission,
  FileAttachment,
  GlobalConfig,
  MediaItem,
  NavMenuItem,
  PageSection,
  Testimonial,
  WebsitePage,
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

// ─── Comment hooks ────────────────────────────────────────────────────────────

function normalizeComment(raw: {
  id: string;
  postId: string;
  parentId?: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: bigint;
  approved: boolean;
  edited: boolean;
  rejected?: boolean;
}): Comment {
  return {
    id: raw.id,
    postId: raw.postId,
    parentId: raw.parentId ?? null,
    authorName: raw.authorName,
    authorEmail: raw.authorEmail,
    content: raw.content,
    createdAt: raw.createdAt,
    approved: raw.approved,
    edited: raw.edited,
    rejected: raw.rejected ?? false,
  };
}

export function useGetCommentsForPost(postId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getCommentsForPost(postId);
      return raw.map(normalizeComment);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useGetAllComments(options?: { refetchInterval?: number }) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["allComments"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getAllComments();
      return raw.map(normalizeComment);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: options?.refetchInterval,
  });
}

export function useGetCommentCount() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["commentCount"],
    queryFn: async () => {
      if (!actor) return 0;
      const count = await actor.getCommentCount();
      return Number(count);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useSubmitComment() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      parentId,
      authorName,
      authorEmail,
      content,
    }: {
      postId: string;
      parentId?: string | null;
      authorName: string;
      authorEmail: string;
      content: string;
    }) => {
      if (isFetching) {
        throw new Error(
          "Still connecting to the server — please wait a moment and try again.",
        );
      }
      if (!actor) {
        throw new Error(
          "Connection error — please refresh the page and try again.",
        );
      }
      return actor.submitComment(
        postId,
        parentId ?? null,
        authorName,
        authorEmail,
        content,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
      queryClient.invalidateQueries({ queryKey: ["commentCount"] });
      queryClient.invalidateQueries({ queryKey: ["allComments"] });
    },
    onError: (error: unknown) => {
      console.error("[useSubmitComment] Comment submission failed:", error);
    },
  });
}

export function useApproveComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.approveComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allComments"] });
      queryClient.invalidateQueries({ queryKey: ["commentCount"] });
      // Invalidate all post comment queries
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useRejectComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allComments"] });
      queryClient.invalidateQueries({ queryKey: ["commentCount"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useEditComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      commentId,
      newContent,
    }: {
      commentId: string;
      newContent: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.editComment(commentId, newContent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allComments"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allComments"] });
      queryClient.invalidateQueries({ queryKey: ["commentCount"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["rejectedComments"] });
    },
  });
}

export function useUnapproveComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.unapproveComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allComments"] });
      queryClient.invalidateQueries({ queryKey: ["commentCount"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["rejectedComments"] });
    },
  });
}

export function useGetRejectedComments(options?: { refetchInterval?: number }) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["rejectedComments"],
    queryFn: async () => {
      if (!actor) return [];
      // getAllComments includes all statuses; filter locally for rejected ones
      const raw = await actor.getAllComments();
      return raw.map(normalizeComment).filter((c) => c.rejected);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: options?.refetchInterval ?? 30_000,
  });
}

export function useGetUnreadApplicationCount() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["unreadApplicationCount"],
    queryFn: async () => {
      if (!actor) return 0;
      const count = await actor.getUnreadApplicationCount();
      return Number(count);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useMarkApplicationsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.markApplicationsAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unreadApplicationCount"] });
    },
  });
}

// ─── Page version hooks ───────────────────────────────────────────────────────

export function useGetPageVersions(slug: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pageVersions", slug],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPageVersions(slug);
    },
    enabled: !!actor && !isFetching && !!slug,
  });
}

export function useRestorePageVersion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slug,
      version,
    }: { slug: string; version: bigint }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.restorePageVersion(slug, version);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websitePages"] });
    },
  });
}

// ─── Website Editor hooks ─────────────────────────────────────────────────────

function normalizeWebsitePage(raw: WebsitePage): WebsitePage {
  return {
    ...raw,
    sections: [...raw.sections].sort(
      (a, b) => Number(a.order) - Number(b.order),
    ),
  };
}

export function useGetAllWebsitePages() {
  const { actor, isFetching } = useActor();
  return useQuery<WebsitePage[]>({
    queryKey: ["websitePages"],
    queryFn: async () => {
      if (!actor) return [];
      const pages = await actor.getAllWebsitePages();
      return pages.map(normalizeWebsitePage);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetWebsitePageById(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<WebsitePage | null>({
    queryKey: ["websitePage", id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      const page = await actor.getWebsitePageById(id);
      return page ? normalizeWebsitePage(page) : null;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMediaLibrary() {
  const { actor, isFetching } = useActor();
  return useQuery<MediaItem[]>({
    queryKey: ["mediaLibrary"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMediaLibrary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetGlobalConfig() {
  const { actor, isFetching } = useActor();
  return useQuery<GlobalConfig | null>({
    queryKey: ["globalConfig"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getGlobalConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateWebsitePage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, slug }: { title: string; slug: string }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.createWebsitePage(title, slug);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websitePages"] });
    },
  });
}

export function useEditWebsitePage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      slug,
    }: { id: bigint; title: string; slug: string }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.editWebsitePage(id, title, slug);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websitePages"] });
    },
  });
}

export function useDeleteWebsitePage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.deleteWebsitePage(id);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websitePages"] });
    },
  });
}

export function useSavePageSections() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pageId,
      sections,
    }: { pageId: bigint; sections: PageSection[] }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.savePageSections(pageId, sections);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["websitePages"] });
      queryClient.invalidateQueries({
        queryKey: ["websitePage", variables.pageId.toString()],
      });
    },
  });
}

export function useUploadMediaItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      filename,
      mimeType,
      base64Data,
    }: { filename: string; mimeType: string; base64Data: string }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.uploadMediaItem(
        filename,
        mimeType,
        base64Data,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mediaLibrary"] });
    },
  });
}

export function useDeleteMediaItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.deleteMediaItem(id);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mediaLibrary"] });
    },
  });
}

export function useUpdateGlobalConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: GlobalConfig) => {
      if (!actor) throw new Error("Not connected");
      // Ensure navigationMenu items have correct bigint types
      const normalized: GlobalConfig = {
        ...config,
        navigationMenu: config.navigationMenu.map((item, idx) => ({
          ...item,
          order: BigInt(idx),
        })) as NavMenuItem[],
      };
      const result = await actor.updateGlobalConfig(normalized);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["globalConfig"] });
    },
  });
}
