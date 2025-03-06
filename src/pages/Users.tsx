
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/layout/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

type RoleType = "admin" | "coordinator" | "youth_volunteer" | "service_girl";

const Users = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);

  // Redirect non-admin users
  useEffect(() => {
    if (profile && profile.role !== "admin") {
      toast({
        variant: "destructive",
        description: "אין לך הרשאות לצפות בדף זה",
      });
      navigate("/");
    }
  }, [profile, navigate, toast]);

  // Fetch users
  useEffect(() => {
    if (profile?.role === "admin") {
      fetchUsers();
    }
  }, [profile]);

  // Filter users based on search term
  useEffect(() => {
    if (users.length > 0) {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

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
    } catch (error: any) {
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
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id ? { ...u, role: selectedRole } : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(
        updatedUsers.filter(
          (user) =>
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm)
        )
      );
      
      setRoleDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `שגיאה בעדכון תפקיד המשתמש: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col" dir="rtl">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-right">ניהול משתמשים</h1>
        
        {profile?.role !== "admin" ? (
          <div className="text-center py-12">
            <p className="text-lg">אין לך הרשאות לצפות בדף זה</p>
          </div>
        ) : (
          <Card className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="mb-6">
              <Input
                placeholder="חיפוש לפי שם, אימייל או טלפון..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            {loading && <p>טוען משתמשים...</p>}
            
            {!loading && filteredUsers.length === 0 && (
              <p>לא נמצאו משתמשים{searchTerm && ` עבור "${searchTerm}"`}</p>
            )}
            
            {!loading && filteredUsers.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-2">שם</th>
                      <th className="text-right p-2">אימייל</th>
                      <th className="text-right p-2">טלפון</th>
                      <th className="text-right p-2">תפקיד</th>
                      <th className="text-right p-2">פעילות אחרונה</th>
                      <th className="text-right p-2">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{user.name}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">{user.phone || "-"}</td>
                        <td className="p-2">
                          <span className="py-1 px-2 bg-primary/10 rounded text-primary text-sm">
                            {user.role === "admin" && "מנהל"}
                            {user.role === "coordinator" && "רכז"}
                            {user.role === "youth_volunteer" && "מתנדב נוער"}
                            {user.role === "service_girl" && "בת שירות"}
                          </span>
                        </td>
                        <td className="p-2">
                          {user.last_active ? (
                            new Date(user.last_active).toLocaleDateString("he-IL")
                          ) : (
                            "-"
                          )}
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
        )}
      </main>
      
      <Footer />
      
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
    </div>
  );
};

export default Users;
