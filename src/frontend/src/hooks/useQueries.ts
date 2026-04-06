import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BlogPost, Testimonial } from "../backend.d.ts";
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

export function useSubmitContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fullName,
      phoneNumber,
      email,
      countryOfInterest,
      message,
    }: {
      fullName: string;
      phoneNumber: string;
      email: string;
      countryOfInterest: string;
      message: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitContact(
        fullName,
        phoneNumber,
        email,
        countryOfInterest,
        message,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
