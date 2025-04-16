
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
        .eq("status", "pending" as Database["public"]["Enums"]["change_status"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  async function handleChangeStatus(change: EquipmentChange, status: 'approved' | 'rejected') {
    try {
      if (status === 'approved') {
        // First update the equipment
        const { error: equipmentError } = await supabase
          .from("equipment")
          .update(change.changes as any)
          .eq("id", change.equipment_id as string);

        if (equipmentError) throw equipmentError;
      }

      // Then update the change status
      const { error: statusError } = await supabase
        .from("equipment_changes")
        .update({
          status: status as Database["public"]["Enums"]["change_status"],
          approved_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", change.id);

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
              {pendingChanges.map((change) => (
                <div
                  key={change.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {(change.requested_by as any)?.name} מבקש לשנות את{" "}
                        {(change.equipment as any)?.name}
                      </h4>
                      <p className="text-sm text-gray-500">{change.notes}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleChangeStatus(change, "rejected")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleChangeStatus(change, "approved")}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted p-2 rounded text-sm space-y-1">
                    {Object.entries(change.changes as any).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span>{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
