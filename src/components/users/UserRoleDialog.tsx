
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

type RoleType = "admin" | "coordinator" | "youth_volunteer" | "service_girl";

import type { Tables } from "@/integrations/supabase/types";

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: Tables<"profiles"> | null;
  onSave: (userId: string, role: RoleType) => Promise<void>;
  loading: boolean;
}

export const UserRoleDialog = ({
  open,
  onOpenChange,
  selectedUser,
  onSave,
  loading
}: UserRoleDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);

  useEffect(() => {
    if (selectedUser) {
      setSelectedRole(selectedUser.role as RoleType);
    }
  }, [selectedUser]);

  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) return;
    await onSave(selectedUser.id, selectedRole);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>שינוי תפקיד משתמש</DialogTitle>
          <DialogDescription>
            {selectedUser?.name && `שינוי תפקיד עבור ${selectedUser.name}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Select
            value={selectedRole || undefined}
            onValueChange={(value: RoleType) => setSelectedRole(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="בחר תפקיד" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">מנהל</SelectItem>
              <SelectItem value="coordinator">רכז</SelectItem>
              <SelectItem value="youth_volunteer">מתנדב נוער</SelectItem>
              <SelectItem value="service_girl">בת שירות</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            בטל
          </Button>
          <Button 
            onClick={handleRoleChange} 
            disabled={loading || !selectedRole}
          >
            {loading ? "מעדכן..." : "שמור שינויים"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
