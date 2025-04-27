
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { EquipmentList } from "@/components/equipment/EquipmentList";
import { AddEquipmentDialog } from "@/components/equipment/AddEquipmentDialog";
import { PendingChangesDialog } from "@/components/equipment/PendingChangesDialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/layout/Footer";
import type { Database } from "@/integrations/supabase/types";

// Define types explicitly to fix type errors
type EquipmentType = Database["public"]["Tables"]["equipment"]["Row"];
type EquipmentInsertType = Database["public"]["Tables"]["equipment"]["Insert"];
type EquipmentChangeStatus = Database["public"]["Enums"]["change_status"];

const Equipment = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPendingChangesOpen, setIsPendingChangesOpen] = useState(false);
  const queryClient = useQueryClient();
  const isAdmin = profile?.role === 'admin';

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["equipment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .order("name");
      
      if (error) {
        toast({
          variant: "destructive",
          description: "שגיאה בטעינת הציוד",
        });
        throw error;
      }
      
      return data as EquipmentType[];
    },
  });

  const { data: pendingChangesCount } = useQuery({
    queryKey: ["equipment_changes_count"],
    queryFn: async () => {
      if (!isAdmin) return 0;
      
      const { count, error } = await supabase
        .from("equipment_changes")
        .select("*", { count: 'exact', head: true })
        .eq("status", "pending" as EquipmentChangeStatus);
      
      if (error) {
        console.error("Error fetching pending changes count:", error);
        return 0;
      }
      
      return count || 0;
    },
    enabled: isAdmin,
  });

  const addEquipmentMutation = useMutation({
    mutationFn: async (newEquipment: EquipmentInsertType) => {
      const { data, error } = await supabase
        .from("equipment")
        .insert(newEquipment)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast({
        description: "הציוד נוסף בהצלחה",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        description: `שגיאה בהוספת הציוד: ${error.message}`,
      });
    }
  });

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col" dir="rtl">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">ציוד</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="ml-2" />
              הוסף ציוד
            </Button>
            {isAdmin && pendingChangesCount > 0 && (
              <Button 
                variant="outline"
                onClick={() => setIsPendingChangesOpen(true)}
              >
                בקשות לשינוי ({pendingChangesCount})
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">טוען...</div>
        ) : (
          <EquipmentList equipment={equipment || []} />
        )}

        <AddEquipmentDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={(formData) => addEquipmentMutation.mutate(formData)}
          isSubmitting={addEquipmentMutation.isPending}
        />

        {isAdmin && (
          <PendingChangesDialog
            open={isPendingChangesOpen}
            onOpenChange={setIsPendingChangesOpen}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Equipment;
