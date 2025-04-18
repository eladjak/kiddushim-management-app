
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, UserRound, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface AssignUsersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export function AssignUsersDialog({ isOpen, onClose, eventId }: AssignUsersDialogProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, role, avatar_url')
          .order('name');
          
        if (error) throw error;
        setUsers(data || []);
      } catch (error: any) {
        console.error("Error fetching users:", error.message);
        toast({
          variant: "destructive",
          description: `שגיאה בטעינת המשתמשים: ${error.message}`,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch event assignments
    const fetchAssignments = async () => {
      if (!isOpen || !eventId) return;
      
      try {
        const { data, error } = await supabase
          .from('event_assignments')
          .select('user_id')
          .eq('event_id', eventId as any);
          
        if (error) throw error;
        
        if (data) {
          // Apply type safety when extracting user_id values
          const userIds = data
            .map(assignment => assignment?.user_id)
            .filter((userId): userId is string => Boolean(userId));
          setSelectedUsers(userIds);
        }
      } catch (error: any) {
        console.error("Error fetching assignments:", error.message);
      }
    };

    fetchUsers();
    fetchAssignments();
  }, [isOpen, eventId, toast]);

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    if (!eventId) return;
    
    setIsSaving(true);
    try {
      // First, remove all existing assignments
      const { error: deleteError } = await supabase
        .from('event_assignments')
        .delete()
        .eq('event_id', eventId as any);
        
      if (deleteError) throw deleteError;
      
      // Then add new assignments
      if (selectedUsers.length > 0) {
        for (const userId of selectedUsers) {
          const assignmentData = {
            event_id: eventId,
            user_id: userId,
            role: 'volunteer',
            status: 'assigned'
          };
          
          const { error: insertError } = await supabase
            .from('event_assignments')
            .insert(assignmentData as any);
            
          if (insertError) throw insertError;
        }
      }
      
      toast({
        description: "המשתמשים הוקצו לאירוע בהצלחה",
      });
      
      onClose();
    } catch (error: any) {
      console.error("Error saving assignments:", error.message);
      toast({
        variant: "destructive",
        description: `שגיאה בשמירת השיוכים: ${error.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'מנהל';
      case 'coordinator': return 'רכז';
      case 'service_girl': return 'בת שירות';
      case 'youth_volunteer': return 'מתנדב נוער';
      case 'content_provider': return 'ספק תוכן';
      default: return role;
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    if (!name) return "?";
    
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`;
    }
    return nameParts[0].substring(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">צוות משתמשים לאירוע</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  בחר משתמשים לצוות לאירוע זה
                </p>
                <div className="text-sm text-muted-foreground">
                  {selectedUsers.length} נבחרו
                </div>
              </div>
              
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                {users.map((user) => (
                  <div 
                    key={user.id}
                    className={`p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-secondary/50 ${
                      selectedUsers.includes(user.id) ? 'bg-secondary/50' : ''
                    }`}
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar_url || ""} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <Badge variant="outline" className="mt-1">
                          {getRoleName(user.role)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      {selectedUsers.includes(user.id) ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <UserRound className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 ml-1" />
            ביטול
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
            שמור שינויים
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
