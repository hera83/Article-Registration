import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { data } from "@/data";
import type { Area } from "@/lib/types";

const KEY = ["areas"] as const;

export function useAreas() {
  return useQuery({
    queryKey: KEY,
    queryFn: (): Promise<Area[]> => data.areas.list(),
  });
}

export function useCreateArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => data.areas.create(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRenameArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; name: string }) =>
      data.areas.rename(vars.id, vars.name),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => data.areas.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
