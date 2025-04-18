
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
import { Check, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type EquipmentChange = Database["public"]["Tables"]["equipment_changes"]["Row"];
type ChangeStatus = Database["public"]["Enums"]["change_status"];

interface PendingChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PendingChangesDialog({
  open,
  onOpenChange,
}: PendingChangesDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingChanges, isLoading } = useQuery({
    queryKey: ["equipment_changes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_changes")
        .select(`
          *,
          equipment (
            name
          ),
          requested_by (
            name
          )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  async function handleChangeStatus(changeItem: any, status: 'approved' | 'rejected') {
    try {
      if (status === 'approved') {
        // First update the equipment
        const { error: equipmentError } = await supabase
          .from("equipment")
          .update(changeItem.changes as any)
          .eq("id", changeItem.equipment_id);

        if (equipmentError) throw equipmentError;
      }

      // Then update the change status
      const { error: statusError } = await supabase
        .from("equipment_changes")
        .update({
          status: status,
          approved_by: (await supabase.auth.getUser()).data.user?.id,
        } as any)
        .eq("id", changeItem.id);

      if (statusError) throw statusError;

      toast({
        description: status === 'approved' ? "השינוי אושר בהצלחה" : "השינוי נדחה",
      });

      // Refresh both equipment and changes data
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["equipment_changes"] });
      queryClient.invalidateQueries({ queryKey: ["equipment_changes_count"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: "שגיאה בעדכון הבקשה",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>בקשות שינוי ממתינות</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center">טוען...</div>
          ) : !pendingChanges?.length ? (
            <div className="text-center">אין בקשות ממתינות</div>
          ) : (
            <div className="space-y-4">
              {pendingChanges.map((change) => {
                // Type guard to ensure change is not null
                if (!change) return null;
                
                // Safely access nested properties
                const anyChange = change as any;
                const requestedByName = anyChange?.requested_by?.name || 'משתמש לא ידוע';
                const equipmentName = anyChange?.equipment?.name || 'ציוד לא ידוע';
                const changeId = change?.id || '';
                const changeNotes = change?.notes || '';
                const changeChanges = change?.changes || {};

                return (
                  <div
                    key={changeId}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          {requestedByName} מבקש לשנות את {equipmentName}
                        </h4>
                        <p className="text-sm text-gray-500">{changeNotes}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            handleChangeStatus(anyChange, "rejected");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            handleChangeStatus(anyChange, "approved");
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted p-2 rounded text-sm space-y-1">
                      {Object.entries(changeChanges as any).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span>{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
