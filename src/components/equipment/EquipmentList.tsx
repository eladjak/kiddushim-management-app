
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useState } from "react";
import { EditEquipmentDialog } from "./EditEquipmentDialog";
import { RequestEquipmentChangeDialog } from "./RequestEquipmentChangeDialog";
import { useAuth } from "@/context/AuthContext";
import type { Database } from "@/integrations/supabase/types";

// Define Equipment type explicitly to fix type errors
type Equipment = Database["public"]["Tables"]["equipment"]["Row"];

interface EquipmentListProps {
  equipment: Equipment[];
}

export function EquipmentList({ equipment }: EquipmentListProps) {
  const { profile } = useAuth();
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [requestChangeEquipment, setRequestChangeEquipment] = useState<Equipment | null>(null);

  const isAdmin = profile?.role === 'admin';

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">שם</TableHead>
              <TableHead className="text-right">תיאור</TableHead>
              <TableHead className="text-right">כמות</TableHead>
              <TableHead className="text-right">מיקום</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => 
                      isAdmin 
                        ? setEditingEquipment(item)
                        : setRequestChangeEquipment(item)
                    }
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isAdmin ? (
        <EditEquipmentDialog
          equipment={editingEquipment}
          open={!!editingEquipment}
          onOpenChange={(open) => !open && setEditingEquipment(null)}
        />
      ) : (
        <RequestEquipmentChangeDialog
          equipment={requestChangeEquipment}
          open={!!requestChangeEquipment}
          onOpenChange={(open) => !open && setRequestChangeEquipment(null)}
        />
      )}
    </>
  );
}
