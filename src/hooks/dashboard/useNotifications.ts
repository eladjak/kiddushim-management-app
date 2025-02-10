
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export const useNotifications = (userId: string | undefined) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      console.log("Fetching notifications...");
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .eq("read", false);

      if (error) {
        console.error("Error fetching notifications:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת ההתראות",
          description: error.message,
        });
        throw error;
      }

      console.log("Notifications fetched successfully:", data);
      return data;
    },
    enabled: !!userId,
  });
};
