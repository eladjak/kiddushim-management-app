
import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type Equipment = Database["public"]["Tables"]["equipment"]["Row"];
type EquipmentStatus = Database["public"]["Enums"]["equipment_status"];
type ChangeType = Database["public"]["Enums"]["equipment_change_type"];
type ChangeStatus = Database["public"]["Enums"]["change_status"];

const formSchema = z.object({
  name: z.string().min(1, "נדרש למלא שם"),
  description: z.string().optional(),
  quantity: z.number().min(0).default(1),
  location: z.string().optional(),
  status: z.enum(["available", "in_use", "maintenance", "lost"]).default("available"),
  notes: z.string().min(1, "נדרש לספק סיבה לשינוי"),
});

interface RequestEquipmentChangeFormProps {
  equipment: Equipment | null;
  onClose: () => void;
}

export function RequestEquipmentChangeForm({
  equipment,
  onClose,
}: RequestEquipmentChangeFormProps) {
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
      // Create a properly typed insert data object for Supabase
      const insertData = {
        equipment_id: equipment.id,
        requested_by: user.id,
        change_type: "update" as ChangeType,
        changes,
        notes,
        status: "pending" as ChangeStatus
      };

      const { error } = await supabase
        .from("equipment_changes")
        .insert(insertData as any);

      if (error) throw error;

      toast({
        description: "בקשת השינוי נשלחה בהצלחה",
      });
      
      queryClient.invalidateQueries({ queryKey: ["equipment_changes"] });
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        description: "שגיאה בשליחת בקשת השינוי",
      });
    }
  }

  return (
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
                <Input {...field} value={field.value || ""} />
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
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                <Input {...field} value={field.value || ""} />
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
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סטטוס" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="available">זמין</SelectItem>
                  <SelectItem value="in_use">בשימוש</SelectItem>
                  <SelectItem value="maintenance">בתחזוקה</SelectItem>
                  <SelectItem value="lost">אבד</SelectItem>
                </SelectContent>
              </Select>
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
  );
}
