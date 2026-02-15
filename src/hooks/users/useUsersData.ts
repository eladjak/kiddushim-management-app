
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type RoleType = "admin" | "coordinator" | "youth_volunteer" | "service_girl";

export const useUsersData = (searchTerm: string, toast: any) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("name");

      if (error) throw error;
      
      // Safe data access with type assertion
      const usersData = data as any[] || [];
      setUsers(usersData);

      // Apply initial filtering with safe property access
      const filtered = usersData.filter(
        (user) =>
          user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.phone?.includes(searchTerm)
      );
      
      setFilteredUsers(filtered);
    } catch (error) {
      toast({
        variant: "destructive",
        description: `שגיאה בטעינת המשתמשים: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, toast]);

  // Update user filtered users when search term changes
  useEffect(() => {
    if (users.length > 0) {
      const filtered = users.filter(
        (user) =>
          user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.phone?.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  // Handle role change
  const updateUserRole = async (userId: string, role: RoleType) => {
    try {
      setLoading(true);
      
      // Use type assertion for update data
      const updateData = {
        role: role,
        updated_at: new Date().toISOString(),
      } as any;
      
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId as any);

      if (error) throw error;
      
      toast({
        description: "תפקיד המשתמש עודכן בהצלחה",
      });
      
      // Update local state
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, role: role } : u
      );
      setUsers(updatedUsers);
      
      // Re-apply filtering
      const filtered = updatedUsers.filter(
        (user) =>
          user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.phone?.includes(searchTerm)
      );
      setFilteredUsers(filtered);
      
    } catch (error) {
      toast({
        variant: "destructive",
        description: `שגיאה בעדכון תפקיד המשתמש: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    users,
    filteredUsers,
    fetchUsers,
    updateUserRole
  };
};
