
import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { VirtualList } from "@/components/virtual/VirtualList";
import type { Tables } from "@/integrations/supabase/types";

type ProfileRow = Tables<"profiles">;

interface UsersTableProps {
  users: ProfileRow[];
  onChangeRole: (user: ProfileRow) => void;
}

const roleLabels: Record<string, string> = {
  admin: "מנהל",
  coordinator: "רכז",
  youth_volunteer: "מתנדב נוער",
  service_girl: "בת שירות",
  volunteer: "מתנדב",
};

/** Single user row -- memoized to avoid re-renders in virtual list */
const UserRow = memo(({ user, onChangeRole }: { user: ProfileRow; onChangeRole: (user: ProfileRow) => void }) => (
  <div
    className="grid grid-cols-6 items-center gap-2 border-b py-3 px-2 hover:bg-gray-50 text-sm"
    role="row"
    aria-label={`משתמש ${user.name}`}
  >
    <div className="truncate" role="cell">{user.name}</div>
    <div className="truncate" role="cell">{user.email || "-"}</div>
    <div className="truncate" role="cell">{user.phone || "-"}</div>
    <div role="cell">
      <span className="py-1 px-2 bg-primary/10 rounded text-primary text-sm">
        {roleLabels[user.role] || user.role}
      </span>
    </div>
    <div role="cell">
      {user.last_active
        ? new Date(user.last_active).toLocaleDateString("he-IL")
        : "-"}
    </div>
    <div role="cell">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChangeRole(user)}
        aria-label={`שנה תפקיד עבור ${user.name}`}
      >
        שנה תפקיד
      </Button>
    </div>
  </div>
));

UserRow.displayName = "UserRow";

export const UsersTable = memo(({ users, onChangeRole }: UsersTableProps) => {
  const getItemKey = useCallback((user: ProfileRow) => user.id, []);

  const renderUser = useCallback(
    (user: ProfileRow) => <UserRow user={user} onChangeRole={onChangeRole} />,
    [onChangeRole]
  );

  return (
    <div className="overflow-x-auto" role="table" aria-label="טבלת משתמשים">
      {/* Header row */}
      <div
        className="grid grid-cols-6 gap-2 border-b-2 py-2 px-2 font-medium text-sm text-right"
        role="row"
      >
        <div role="columnheader">שם</div>
        <div role="columnheader">אימייל</div>
        <div role="columnheader">טלפון</div>
        <div role="columnheader">תפקיד</div>
        <div role="columnheader">פעילות אחרונה</div>
        <div role="columnheader">פעולות</div>
      </div>

      {/* Virtualized body */}
      <VirtualList
        items={users}
        estimateSize={52}
        threshold={30}
        maxHeight={600}
        overscan={10}
        getItemKey={getItemKey}
        renderItem={renderUser}
      />
    </div>
  );
});

UsersTable.displayName = "UsersTable";
