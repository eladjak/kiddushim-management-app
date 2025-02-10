
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export const useAssignments = (userId: string | undefined) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["assignments", userId],
    queryFn: async () => {
      console.log("Fetching assignments...");
      const { data, error } = await supabase
        .from("event_assignments")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching assignments:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת השיבוצים",
          description: error.message,
        });
        throw error;
      }

      console.log("Assignments fetched successfully:", data);
      return data;
    },
    enabled: !!userId,
  });
};
