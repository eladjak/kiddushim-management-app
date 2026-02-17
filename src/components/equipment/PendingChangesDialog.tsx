
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
import type { Database, Json } from "@/integrations/supabase/types";

type ChangeStatus = Database["public"]["Enums"]["change_status"];

interface EquipmentChangeWithRelations {
  id: string;
  equipment_id: string | null;
  requested_by: string;
  change_type: Database["public"]["Enums"]["equipment_change_type"];
  changes: Json;
  notes: string | null;
  status: ChangeStatus;
  created_at: string;
  updated_at: string;
  approved_by: string | null;
  equipment: { name: string } | null;
  requested_by_profile: { name: string } | null;
}

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
        .eq("status", "pending" as ChangeStatus)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as EquipmentChangeWithRelations[];
    },
    enabled: open,
  });

  async function handleChangeStatus(changeItem: EquipmentChangeWithRelations, status: 'approved' | 'rejected') {
    try {
      if (status === 'approved' && changeItem.changes) {
        // First update the equipment
        const changesObj = typeof changeItem.changes === 'object' && changeItem.changes !== null
          ? changeItem.changes as Record<string, unknown>
          : {};
        const { error: equipmentError } = await supabase
          .from("equipment")
          .update(changesObj as Database["public"]["Tables"]["equipment"]["Update"])
          .eq("id", changeItem.equipment_id || "");

        if (equipmentError) throw equipmentError;
      }

      // Then update the change status
      const { error: statusError } = await supabase
        .from("equipment_changes")
        .update({
          status: status as ChangeStatus,
          approved_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", changeItem.id);

      if (statusError) throw statusError;

      toast({
        description: status === 'approved' ? "השינוי אושר בהצלחה" : "השינוי נדחה",
      });

      // Refresh both equipment and changes data
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["equipment_changes"] });
      queryClient.invalidateQueries({ queryKey: ["equipment_changes_count"] });
    } catch (error) {
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
                if (!change?.id) return null;

                const requestedByName = change.requested_by_profile?.name || 'משתמש לא ידוע';
                const equipmentName = change.equipment?.name || 'ציוד לא ידוע';
                const changeNotes = change.notes || '';
                const changeChanges = (typeof change.changes === 'object' && change.changes !== null
                  ? change.changes
                  : {}) as Record<string, unknown>;

                return (
                  <div
                    key={change.id}
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
                            handleChangeStatus(change, "rejected");
                          }}
                          aria-label="דחה שינוי"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            handleChangeStatus(change, "approved");
                          }}
                          aria-label="אשר שינוי"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted p-2 rounded text-sm space-y-1">
                      {Object.entries(changeChanges).map(([key, value]) => (
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
