
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

// Define the equipment insert type based on the Database type
type EquipmentInsert = Database["public"]["Tables"]["equipment"]["Insert"];

const formSchema = z.object({
  name: z.string().min(1, "נדרש למלא שם"),
  description: z.string().optional(),
  quantity: z.number().min(0).default(1),
  location: z.string().optional(),
  status: z.enum(["available", "in_use", "maintenance", "lost"]).default("available"),
});

interface AddEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EquipmentInsert) => void;
  isSubmitting: boolean;
}

export function AddEquipmentDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isSubmitting 
}: AddEquipmentDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      quantity: 1,
      location: "",
      status: "available",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Ensure name is treated as a required field when submitting to match the database requirements
    const equipmentData: EquipmentInsert = {
      name: values.name, // This is always required
      description: values.description || null,
      quantity: values.quantity,
      location: values.location || null,
      status: values.status,
    };
    
    onSubmit(equipmentData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הוספת ציוד חדש</DialogTitle>
          <DialogDescription>
            הוסף פריט ציוד חדש למערכת
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
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
            <div className="flex justify-end gap-2">
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "מוסיף..." : "הוסף"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
