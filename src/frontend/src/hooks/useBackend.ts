import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { Difficulty, PlanId, PoseId } from "../backend";

// ── Profile ─────────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor(createActor);

  const query = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (displayName: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(displayName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (displayName: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateProfile(displayName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ── Poses ────────────────────────────────────────────────────────────────────

export function usePoses() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["poses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPoses();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreatePose() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
      difficulty,
      tags,
    }: {
      name: string;
      description: string;
      difficulty: Difficulty;
      tags: string[];
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createPose(name, description, difficulty, tags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poses"] });
    },
  });
}

export function useUpdatePose() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      difficulty,
      tags,
    }: {
      id: PoseId;
      name: string;
      description: string;
      difficulty: Difficulty;
      tags: string[];
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updatePose(id, name, description, difficulty, tags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poses"] });
    },
  });
}

export function useDeletePose() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: PoseId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deletePose(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poses"] });
    },
  });
}

export function useFavoritePose() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: PoseId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.favoritePose(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poses"] });
    },
  });
}

export function useGeneratePoseIdeas() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({ theme, count }: { theme: string; count: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.generatePoseIdeas(theme, count);
    },
  });
}

// ── Shoot Plans ──────────────────────────────────────────────────────────────

export function useShootPlans() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["shootPlans"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShootPlans();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useShootPlan(id: PlanId) {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["shootPlan", id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getShootPlan(id);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateShootPlan() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      location,
      scheduledDate,
      poseIds,
      notes,
    }: {
      name: string;
      location: string;
      scheduledDate: string | null;
      poseIds: PoseId[];
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createShootPlan(
        name,
        location,
        scheduledDate,
        poseIds,
        notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shootPlans"] });
    },
  });
}

export function useUpdateShootPlan() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      location,
      scheduledDate,
      poseIds,
      shotList,
      notes,
    }: {
      id: PlanId;
      name: string;
      location: string;
      scheduledDate: string | null;
      poseIds: PoseId[];
      shotList: string[];
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateShootPlan(
        id,
        name,
        location,
        scheduledDate,
        poseIds,
        shotList,
        notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shootPlans"] });
    },
  });
}

export function useDeleteShootPlan() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: PlanId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteShootPlan(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shootPlans"] });
    },
  });
}

export function useDuplicateShootPlan() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, newName }: { id: PlanId; newName: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.duplicateShootPlan(id, newName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shootPlans"] });
    },
  });
}

export function useGenerateShootPlan() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      planName,
      location,
      poseNames,
    }: {
      planName: string;
      location: string;
      poseNames: string[];
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.generateShootPlan(planName, location, poseNames);
    },
  });
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export function useChatHistory() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatHistory();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAskAI() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      prompt,
      history,
    }: {
      prompt: string;
      history: Array<[string, string]>;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.askAI(prompt, history);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}

export function useClearChatHistory() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.clearChatHistory();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}

export function useSetOpenAIKey() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (apiKey: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setOpenAIKey(apiKey);
    },
  });
}
