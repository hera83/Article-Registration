import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tag } from "@/lib/types";

const KEY = ["tags"] as const;

export function useTags() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<Tag[]> => {
      const { data, error } = await supabase.from("tags").select("id,name").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useRenameTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; name: string }) => {
      const { error } = await supabase.from("tags").update({ name: vars.name.trim() }).eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
