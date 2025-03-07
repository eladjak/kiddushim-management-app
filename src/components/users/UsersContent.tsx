
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUsersData } from "@/hooks/users/useUsersData";
import { UsersTable } from "./UsersTable";
import { UserRoleDialog } from "./UserRoleDialog";

export const UsersContent = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
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

  return (
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
        <UsersTable 
          users={filteredUsers}
          onChangeRole={(user) => {
            setSelectedUser(user);
            setRoleDialogOpen(true);
          }}
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
