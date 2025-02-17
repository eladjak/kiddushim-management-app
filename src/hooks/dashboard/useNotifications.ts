
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

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
        .eq("read", false)
        .order("created_at", { ascending: false });

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
      return data as Notification[];
    },
    enabled: !!userId,
  });
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);

  if (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

