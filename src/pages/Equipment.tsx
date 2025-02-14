
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { EquipmentList } from "@/components/equipment/EquipmentList";
import { AddEquipmentDialog } from "@/components/equipment/AddEquipmentDialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Equipment = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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
      
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="ml-2" />
            הוסף ציוד
          </Button>
          <h1 className="text-3xl font-bold">ציוד</h1>
        </div>

        {isLoading ? (
          <div className="text-center">טוען...</div>
        ) : (
          <EquipmentList equipment={equipment || []} />
        )}

        <AddEquipmentDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />
      </main>
    </div>
  );
};

export default Equipment;
