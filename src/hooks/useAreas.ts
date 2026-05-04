import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Area } from "@/lib/types";

const KEY = ["areas"] as const;

export function useAreas() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<Area[]> => {
      const { data, error } = await supabase.from("areas").select("id,name").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("areas").insert({ name: name.trim() });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRenameArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; name: string }) => {
      const { error } = await supabase.from("areas").update({ name: vars.name.trim() }).eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { count, error: cErr } = await supabase
        .from("articles")
        .select("id", { count: "exact", head: true })
        .eq("area_id", id);
      if (cErr) throw cErr;
      if ((count ?? 0) > 0) throw new Error("Area is in use by articles");
      const { error } = await supabase.from("areas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
