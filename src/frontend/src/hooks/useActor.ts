import {
  createActorWithConfig,
  useActor as useActorBase,
} from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";
import type { backendInterface } from "../backend.d";

export type BackendActor = backendInterface;

export function useActor(): {
  actor: BackendActor | null;
  isFetching: boolean;
} {
  const result = useActorBase(() => createActorWithConfig(createActor));
  return result as { actor: BackendActor | null; isFetching: boolean };
}
