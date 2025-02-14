
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type Equipment = Database["public"]["Tables"]["equipment"]["Row"];

const formSchema = z.object({
  name: z.string().min(1, "נדרש למלא שם"),
  description: z.string().optional(),
  quantity: z.number().min(0).default(1),
  location: z.string().optional(),
  status: z.enum(["available", "in_use", "maintenance", "lost"]).default("available"),
  notes: z.string().min(1, "נדרש לספק סיבה לשינוי"),
});

interface RequestEquipmentChangeDialogProps {
  equipment: Equipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestEquipmentChangeDialog({
  equipment,
  open,
  onOpenChange,
}: RequestEquipmentChangeDialogProps) {
  const { user } = useAuth();
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
          notes: "",
        }
      : undefined,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!equipment || !user) return;

    const { notes, ...changes } = values;
    
    try {
      const { error } = await supabase
        .from("equipment_changes")
        .insert({
          equipment_id: equipment.id,
          requested_by: user.id,
          change_type: "update",
          changes,
          notes,
        });

      if (error) throw error;

      toast({
        description: "בקשת השינוי נשלחה בהצלחה",
      });
      
      queryClient.invalidateQueries({ queryKey: ["equipment_changes"] });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: "שגיאה בשליחת בקשת השינוי",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>בקשת שינוי בציוד</DialogTitle>
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
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>סיבת השינוי</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="תאר את הסיבה לשינוי המבוקש"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="submit">שלח בקשה</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
