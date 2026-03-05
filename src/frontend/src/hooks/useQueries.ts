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
