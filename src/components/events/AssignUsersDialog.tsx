
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ProfileType } from "@/types/profile";

interface AssignUsersDialogProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssignUsersDialog = ({
  eventId,
  open,
  onOpenChange,
}: AssignUsersDialogProps) => {
  const [users, setUsers] = useState<ProfileType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ProfileType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchEventAssignments();
    }
  }, [open, eventId]);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchEventAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) throw error;

      // Use the assigned_users field if it exists, otherwise initialize empty array
      if (data && data.assigned_users) {
        setSelectedUsers(data.assigned_users);
      } else {
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error("Error fetching event assignments:", error);
      setSelectedUsers([]);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("name");

      if (error) throw error;

      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        description: "שגיאה בטעינת משתמשים. אנא נסה שנית מאוחר יותר.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const saveAssignments = async () => {
    try {
      setLoading(true);
      
      // Update the event with assigned users
      const { error } = await supabase
        .from("events")
        .update({ assigned_users: selectedUsers })
        .eq("id", eventId);

      if (error) throw error;

      toast({
        description: "השיוך נשמר בהצלחה",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving assignments:", error);
      toast({
        variant: "destructive",
        description: `שגיאה בשמירת השיוך: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`;
    }
    return nameParts[0].substring(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>שיוך משתמשים לאירוע</DialogTitle>
          <DialogDescription>
            בחר משתמשים לשיוך לאירוע זה
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input
            placeholder="חיפוש לפי שם או אימייל..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />

          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>שם</TableHead>
                  <TableHead>תפקיד</TableHead>
                  <TableHead>אימייל</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleUserSelect(user.id)}
                      />
                    </TableCell>
                    <TableCell
                      className="flex items-center gap-2"
                      onClick={() => handleUserSelect(user.id)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      {user.name}
                    </TableCell>
                    <TableCell onClick={() => handleUserSelect(user.id)}>
                      {user.role === "admin" && "מנהל"}
                      {user.role === "coordinator" && "רכז"}
                      {user.role === "youth_volunteer" && "מתנדב נוער"}
                      {user.role === "service_girl" && "בת שירות"}
                    </TableCell>
                    <TableCell onClick={() => handleUserSelect(user.id)}>
                      {user.email}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button onClick={saveAssignments} disabled={loading}>
            {loading ? "שומר..." : "שמור"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
