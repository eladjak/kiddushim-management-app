
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

type RoleType = "admin" | "coordinator" | "youth_volunteer" | "service_girl";

type ProfileRow = Tables<"profiles">;

interface ToastFn {
  (props: { variant?: "destructive"; description: string }): void;
}

export const useUsersData = (searchTerm: string, toast: ToastFn) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ProfileRow[]>([]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("name");

      if (error) throw error;

      const usersData = data || [];
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
      const message = error instanceof Error ? error.message : "שגיאה לא ידועה";
      toast({
        variant: "destructive",
        description: `שגיאה בטעינת המשתמשים: ${message}`,
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

      const updateData: TablesUpdate<"profiles"> = {
        role: role,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (error) throw error;

      toast({
        description: "תפקיד המשתמש עודכן בהצלחה",
      });

      // Update local state
      const updatedUsers = users.map(u =>
        u.id === userId ? { ...u, role: role } : u
      );
      setUsers(updatedUsers as ProfileRow[]);

      // Re-apply filtering
      const filtered = updatedUsers.filter(
        (user) =>
          user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.phone?.includes(searchTerm)
      );
      setFilteredUsers(filtered as ProfileRow[]);

    } catch (error) {
      const message = error instanceof Error ? error.message : "שגיאה לא ידועה";
      toast({
        variant: "destructive",
        description: `שגיאה בעדכון תפקיד המשתמש: ${message}`,
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
