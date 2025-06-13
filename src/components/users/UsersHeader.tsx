
import { AddUserDialog } from "./AddUserDialog";
import { InviteUserDialog } from "./InviteUserDialog";

interface UsersHeaderProps {
  onRefresh?: () => void;
}

export const UsersHeader = ({ onRefresh }: UsersHeaderProps) => {
  const handleUserChange = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">ניהול משתמשים</h1>
        <div className="flex gap-3">
          <InviteUserDialog onUserInvited={handleUserChange} />
          <AddUserDialog onUserAdded={handleUserChange} />
        </div>
      </div>
      <p className="text-gray-600">
        כאן תוכל לנהל את כל המשתמשים במערכת, להוסיף משתמשים חדשים ולהזמין אותם באימייל
      </p>
    </div>
  );
};
