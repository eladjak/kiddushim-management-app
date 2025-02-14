
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type Equipment = Database["public"]["Tables"]["equipment"]["Row"];

const formSchema = z.object({
  name: z.string().min(1, "נדרש למלא שם"),
  description: z.string().optional(),
  quantity: z.number().min(0).default(1),
  location: z.string().optional(),
  status: z.enum(["available", "in_use", "maintenance", "lost"]).default("available"),
});

interface EditEquipmentDialogProps {
  equipment: Equipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEquipmentDialog({
  equipment,
  open,
  onOpenChange,
}: EditEquipmentDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: equipment
      ? {
          name: equipment.name,
          description: equipment.description ?? "",
          quantity: equipment.quantity ?? 1,
          location: equipment.location ?? "",
          status: equipment.status ?? "available",
        }
      : undefined,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!equipment) return;

    try {
      const { error } = await supabase
        .from("equipment")
        .update(values)
        .eq("id", equipment.id);

      if (error) throw error;

      toast({
        description: "הציוד עודכן בהצלחה",
      });
      
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: "שגיאה בעדכון הציוד",
      });
    }
  }

  async function onDelete() {
    if (!equipment) return;

    try {
      const { error } = await supabase
        .from("equipment")
        .delete()
        .eq("id", equipment.id);

      if (error) throw error;

      toast({
        description: "הציוד נמחק בהצלחה",
      });
      
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: "שגיאה במחיקת הציוד",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>עריכת ציוד</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>שם</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תיאור</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>כמות</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>מיקום</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>סטטוס</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="available">זמין</option>
                      <option value="in_use">בשימוש</option>
                      <option value="maintenance">בתחזוקה</option>
                      <option value="lost">אבד</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button type="button" variant="destructive" onClick={onDelete}>
                מחק
              </Button>
              <Button type="submit">שמור</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
