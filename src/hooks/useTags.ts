import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { data } from "@/data";
import type { Tag } from "@/lib/types";

const KEY = ["tags"] as const;

export function useTags() {
  return useQuery({
    queryKey: KEY,
    queryFn: (): Promise<Tag[]> => data.tags.list(),
  });
}

export function useRenameTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; name: string }) =>
      data.tags.rename(vars.id, vars.name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => data.tags.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
