
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export const useEvents = (userId: string | undefined) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      console.log("Fetching events...");
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("main_time", new Date().toISOString())
        .order("main_time", { ascending: true })
        .limit(2);

      if (error) {
        console.error("Error fetching events:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת האירועים",
          description: error.message,
        });
        throw error;
      }

      console.log("Events fetched successfully:", data);
      return data;
    },
    enabled: !!userId,
  });
};
