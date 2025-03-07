
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AssignUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
}

export const AssignUsersDialog = ({ open, onOpenChange, eventId }: AssignUsersDialogProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch users when the dialog opens
  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchAssignedUsers();
    }
  }, [open, eventId]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `שגיאה בטעינת משתמשים: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('assigned_users')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      
      if (data && data.assigned_users) {
        setAssignedUsers(data.assigned_users);
        setSelectedUsers(data.assigned_users);
      }
    } catch (error: any) {
      console.error('Error fetching assigned users:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({ assigned_users: selectedUsers })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        description: "המשתמשים הוקצו בהצלחה",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `שגיאה בהקצאת משתמשים: ${error.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getRoleDisplay = (role: string) => {
    switch(role) {
      case 'admin': return 'מנהל';
      case 'coordinator': return 'רכז';
      case 'service_girl': return 'בת שירות';
      case 'youth_volunteer': return 'מתנדב נוער';
      case 'content_provider': return 'ספק תוכן';
      default: return role;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>הקצאת משתמשים לאירוע</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Label className="mb-3 block">בחר משתמשים להקצאה</Label>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="max-h-60 overflow-auto space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-2 rtl:space-x-reverse py-1">
                  <Checkbox 
                    id={`user-${user.id}`}
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => toggleUser(user.id)}
                  />
                  <Label 
                    htmlFor={`user-${user.id}`}
                    className="flex flex-col text-sm font-normal cursor-pointer"
                  >
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{getRoleDisplay(user.role)}</span>
                  </Label>
                </div>
              ))}
              
              {users.length === 0 && (
                <p className="text-center text-muted-foreground py-2">
                  לא נמצאו משתמשים
                </p>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            ביטול
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                שומר...
              </>
            ) : (
              "שמור"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
