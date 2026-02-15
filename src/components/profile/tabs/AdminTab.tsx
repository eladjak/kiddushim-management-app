
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { InviteUserDialog } from "@/components/users/InviteUserDialog";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";

interface AdminTabProps {
  userId: string;
}

type RoleType = "admin" | "coordinator" | "youth_volunteer" | "service_girl";

interface AdminUser {
  id: string;
  name: string;
  email: string | null;
  role: RoleType | null;
}

export const AdminTab = ({ userId }: AdminTabProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("name")
        .limit(5); // מגביל ל-5 המשתמשים האחרונים

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        description: `שגיאה בטעינת המשתמשים: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          role: selectedRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedUser.id);

      if (error) throw error;
      
      toast({
        description: "תפקיד המשתמש עודכן בהצלחה",
      });
      
      // Update local state
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, role: selectedRole } : u
      ));
      
      setRoleDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        description: `שגיאה בעדכון תפקיד המשתמש: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserAdded = () => {
    fetchUsers();
    toast({
      description: "משתמש חדש נוסף בהצלחה",
    });
  };

  return (
    <>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">פעולות ניהול מהירות</h2>
            <Link to="/users">
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                עבור לניהול מלא
              </Button>
            </Link>
          </div>
          
          <div className="flex gap-3 mb-4">
            <AddUserDialog onUserAdded={handleUserAdded} />
            <InviteUserDialog onUserInvited={handleUserAdded} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">משתמשים אחרונים</h2>
          
          {loading && <p>טוען משתמשים...</p>}
          
          {!loading && users.length === 0 && (
            <p>לא נמצאו משתמשים</p>
          )}
          
          {!loading && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">שם</th>
                    <th className="text-right p-2">אימייל</th>
                    <th className="text-right p-2">תפקיד</th>
                    <th className="text-right p-2">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{user.name}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">
                        <span className="py-1 px-2 bg-primary/10 rounded text-primary text-sm">
                          {user.role === "admin" && "מנהל"}
                          {user.role === "coordinator" && "רכז"}
                          {user.role === "youth_volunteer" && "מתנדב נוער"}
                          {user.role === "service_girl" && "בת שירות"}
                        </span>
                      </td>
                      <td className="p-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setSelectedRole(user.role);
                            setRoleDialogOpen(true);
                          }}
                        >
                          שנה תפקיד
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
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
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
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
    </>
  );
};
