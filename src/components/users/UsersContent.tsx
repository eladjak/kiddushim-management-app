
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUsersData } from "@/hooks/users/useUsersData";
import { UsersTable } from "./UsersTable";
import { UserRoleDialog } from "./UserRoleDialog";
import type { Tables } from "@/integrations/supabase/types";

export const UsersContent = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<Tables<"profiles"> | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const {
    users,
    filteredUsers,
    loading,
    fetchUsers,
    updateUserRole
  } = useUsersData(searchTerm, toast);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChangeRole = useCallback((user: Tables<"profiles">) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <Card className="p-6 max-h-[calc(100dvh-200px)] overflow-y-auto">
      <div className="mb-6">
        <Input
          placeholder="חיפוש לפי שם, אימייל או טלפון..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-md"
          aria-label="חיפוש משתמשים"
        />
      </div>

      {loading && (
        <p role="status" aria-live="polite">טוען משתמשים...</p>
      )}

      {!loading && filteredUsers.length === 0 && (
        <p>לא נמצאו משתמשים{searchTerm && ` עבור "${searchTerm}"`}</p>
      )}

      {!loading && filteredUsers.length > 0 && (
        <UsersTable
          users={filteredUsers}
          onChangeRole={handleChangeRole}
        />
      )}

      <UserRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        selectedUser={selectedUser}
        onSave={updateUserRole}
        loading={loading}
      />
    </Card>
  );
};
