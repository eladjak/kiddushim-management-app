
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem
} from "@/components/ui/form";
import { ProfileType } from "@/types/profile";

interface SettingsTabProps {
  profile: ProfileType;
  loading: boolean;
  onSaveProfile: (values: any) => Promise<void>;
}

const settingsFormSchema = z.object({
  shabbat_mode: z.boolean().default(false),
});

export const SettingsTab = ({ profile, loading, onSaveProfile }: SettingsTabProps) => {
  const form = useForm<z.infer<typeof settingsFormSchema>>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      shabbat_mode: profile?.shabbat_mode || false,
    },
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">הגדרות מערכת</h2>
      
      <div className="space-y-6">
        <Form {...form}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">מצב שבת</h3>
              <p className="text-sm text-gray-500">
                מעבר למצב שבת יאפשר שימוש באפליקציה בשבת ללא חילול שבת
              </p>
            </div>
            <FormField
              control={form.control}
              name="shabbat_mode"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="pt-4 border-t mt-4">
            <Button onClick={form.handleSubmit(onSaveProfile)} disabled={loading}>
              {loading ? "מעדכן..." : "שמור הגדרות"}
            </Button>
          </div>
        </Form>
      </div>
    </Card>
  );
};
