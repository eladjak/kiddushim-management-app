
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RequestEquipmentChangeForm } from "./forms/RequestEquipmentChangeForm";
import type { Database } from "@/integrations/supabase/types";

type Equipment = Database["public"]["Tables"]["equipment"]["Row"];

interface RequestEquipmentChangeDialogProps {
  equipment: Equipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestEquipmentChangeDialog({
  equipment,
  open,
  onOpenChange,
}: RequestEquipmentChangeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>בקשת שינוי בציוד</DialogTitle>
        </DialogHeader>
        <RequestEquipmentChangeForm 
          equipment={equipment} 
          onClose={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
