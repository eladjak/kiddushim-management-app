
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileType } from "@/types/profile";
import { AvatarUpload } from "../avatar/AvatarUpload";

interface ProfileTabProps {
  profile: ProfileType;
  loading: boolean;
  onSaveProfile: (values: any) => Promise<void>;
}

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "השם חייב להיות לפחות 2 תווים.",
  }),
  email: z.string().email({
    message: "כתובת האימייל אינה תקינה.",
  }),
  phone: z.string().optional(),
  language: z.string().default("he"),
  shabbat_mode: z.boolean().default(false),
});

export const ProfileTab = ({ profile, loading, onSaveProfile }: ProfileTabProps) => {
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      language: profile?.language || "he",
      shabbat_mode: profile?.shabbat_mode || false,
    },
  });

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/4 flex flex-col items-center">
          <AvatarUpload />
          
          <p className="text-lg font-medium mt-4">{profile.name}</p>
          <p className="text-sm text-gray-500 mb-2">{profile.email}</p>
          
          <div className="py-2 px-3 bg-primary/10 rounded-md text-primary text-sm mb-4">
            {profile.role === "admin" && "מנהל"}
            {profile.role === "coordinator" && "רכז"}
            {profile.role === "youth_volunteer" && "מתנדב נוער"}
            {profile.role === "service_girl" && "בת שירות"}
          </div>
        </div>
        
        <div className="w-full md:w-3/4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSaveProfile)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם מלא</FormLabel>
                    <FormControl>
                      <Input placeholder="שם מלא" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>אימייל</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        {...field} 
                        disabled 
                        className="bg-gray-100"
                      />
                    </FormControl>
                    <FormDescription>
                      לא ניתן לשנות את כתובת האימייל
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>טלפון</FormLabel>
                    <FormControl>
                      <Input placeholder="מספר טלפון" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שפה מועדפת</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="בחר שפה" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="he">עברית</SelectItem>
                        <SelectItem value="en">אנגלית</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={loading}>
                {loading ? "מעדכן..." : "שמור שינויים"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </Card>
  );
};
