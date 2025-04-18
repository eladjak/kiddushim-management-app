
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import type { Database } from "@/integrations/supabase/types";

interface AssignUsersDialogProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: string;
  title: string;
}

export function AssignUsersDialog({
  eventId,
  open,
  onOpenChange,
  role,
  title,
}: AssignUsersDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Fetch users with the specified role
  const { data: roleUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ["users", role],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("role", role);

      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  // Fetch current assignments for this event and role
  const { data: currentAssignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ["event_assignments", eventId, role],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_assignments")
        .select("user_id")
        .eq("event_id", eventId)
        .eq("role", role);

      if (error) throw error;
      return data || [];
    },
    enabled: open && !!eventId,
  });

  // Set initial selected users based on current assignments
  useEffect(() => {
    if (currentAssignments && currentAssignments.length > 0) {
      // Safe access with type checking
      const userIds = currentAssignments
        .filter(assignment => assignment && typeof assignment === 'object' && 'user_id' in assignment)
        .map(assignment => assignment.user_id as string);
      
      setSelectedUsers(userIds);
    } else {
      setSelectedUsers([]);
    }
  }, [currentAssignments]);

  const handleSave = async () => {
    try {
      // First, delete all existing assignments for this event and role
      const { error: deleteError } = await supabase
        .from("event_assignments")
        .delete()
        .match({
          event_id: eventId,
          role: role,
        });

      if (deleteError) throw deleteError;

      // Then, insert new assignments if there are any selected users
      if (selectedUsers.length > 0) {
        const assignments = selectedUsers.map((userId) => ({
          event_id: eventId,
          user_id: userId,
          role: role,
          status: "pending",
        }));

        const { error: insertError } = await supabase
          .from("event_assignments")
          .insert(assignments as any);

        if (insertError) throw insertError;
      }

      toast({
        description: "המשתמשים שויכו בהצלחה",
      });

      queryClient.invalidateQueries({ queryKey: ["event_assignments"] });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: "שגיאה בשיוך המשתמשים",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {loadingUsers || loadingAssignments ? (
            <div className="text-center">טוען...</div>
          ) : (
            <>
              {roleUsers && roleUsers.length > 0 ? (
                <div className="space-y-2">
                  {roleUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <Checkbox
                        id={user.id}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(
                              selectedUsers.filter((id) => id !== user.id)
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={user.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {user.name}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">אין משתמשים זמינים עם תפקיד זה</div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button onClick={handleSave}>שמור</Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
