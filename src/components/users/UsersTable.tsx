
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  last_active?: string;
}

interface UsersTableProps {
  users: User[];
  onChangeRole: (user: User) => void;
}

export const UsersTable = ({ users, onChangeRole }: UsersTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right p-2">שם</TableHead>
            <TableHead className="text-right p-2">אימייל</TableHead>
            <TableHead className="text-right p-2">טלפון</TableHead>
            <TableHead className="text-right p-2">תפקיד</TableHead>
            <TableHead className="text-right p-2">פעילות אחרונה</TableHead>
            <TableHead className="text-right p-2">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="border-b hover:bg-gray-50">
              <TableCell className="p-2">{user.name}</TableCell>
              <TableCell className="p-2">{user.email}</TableCell>
              <TableCell className="p-2">{user.phone || "-"}</TableCell>
              <TableCell className="p-2">
                <span className="py-1 px-2 bg-primary/10 rounded text-primary text-sm">
                  {user.role === "admin" && "מנהל"}
                  {user.role === "coordinator" && "רכז"}
                  {user.role === "youth_volunteer" && "מתנדב נוער"}
                  {user.role === "service_girl" && "בת שירות"}
                </span>
              </TableCell>
              <TableCell className="p-2">
                {user.last_active ? (
                  new Date(user.last_active).toLocaleDateString("he-IL")
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="p-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onChangeRole(user)}
                >
                  שנה תפקיד
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
