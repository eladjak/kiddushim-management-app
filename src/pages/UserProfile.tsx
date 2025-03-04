
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Image } from "@/components/ui/image";
import { Footer } from "@/components/layout/Footer";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, Shield, Phone, Mail, AtSign } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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

type RoleType = "admin" | "coordinator" | "youth_volunteer" | "service_girl";

const UserProfile = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  
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

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        language: profile.language || "he",
        shabbat_mode: profile.shabbat_mode || false,
      });
    }
  }, [profile, form]);

  // Fetch users if the current user is an admin
  useEffect(() => {
    if (profile?.role === "admin") {
      fetchUsers();
    }
  }, [profile]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("name");

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `שגיאה בטעינת המשתמשים: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          name: values.name,
          phone: values.phone,
          language: values.language,
          shabbat_mode: values.shabbat_mode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;
      
      toast({
        description: "הפרופיל עודכן בהצלחה",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `שגיאה בעדכון הפרופיל: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: RoleType) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
      
      toast({
        description: "תפקיד המשתמש עודכן בהצלחה",
      });
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      setRoleDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `שגיאה בעדכון תפקיד המשתמש: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col" dir="rtl">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-right">פרופיל משתמש</h1>
        
        {user && profile ? (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                פרטים אישיים
              </TabsTrigger>
              
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                הגדרות
              </TabsTrigger>
              
              {isAdmin && (
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  ניהול משתמשים
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="profile">
              <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-1/4 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 overflow-hidden">
                      {profile.avatar_url ? (
                        <Image 
                          src={profile.avatar_url} 
                          alt={profile.name || "Avatar"} 
                          className="w-full h-full object-cover"
                          fallback="/placeholder.svg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                          <User size={48} />
                        </div>
                      )}
                    </div>
                    
                    <p className="text-lg font-medium">{profile.name}</p>
                    <p className="text-sm text-gray-500 mb-2">{profile.email}</p>
                    
                    <div className="py-2 px-3 bg-primary/10 rounded-md text-primary text-sm mb-4">
                      {profile.role === "admin" && "מנהל"}
                      {profile.role === "coordinator" && "רכז"}
                      {profile.role === "youth_volunteer" && "מתנדב נוער"}
                      {profile.role === "service_girl" && "נערת שירות"}
                    </div>
                  </div>
                  
                  <div className="w-full md:w-3/4">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            </TabsContent>
            
            <TabsContent value="settings">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">הגדרות מערכת</h2>
                
                <div className="space-y-6">
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
                  
                  <div className="pt-4 border-t">
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
                      {loading ? "מעדכן..." : "שמור הגדרות"}
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            {isAdmin && (
              <TabsContent value="admin">
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">ניהול משתמשים</h2>
                  
                  {loading && <p>טוען משתמשים...</p>}
                  
                  {!loading && users.length === 0 && (
                    <p>לא נמצאו משתמשים</p>
                  )}
                  
                  {!loading && users.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-right p-2">שם</th>
                            <th className="text-right p-2">אימייל</th>
                            <th className="text-right p-2">טלפון</th>
                            <th className="text-right p-2">תפקיד</th>
                            <th className="text-right p-2">פעולות</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                              <td className="p-2">{user.name}</td>
                              <td className="p-2">{user.email}</td>
                              <td className="p-2">{user.phone || "-"}</td>
                              <td className="p-2">
                                <span className="py-1 px-2 bg-primary/10 rounded text-primary text-sm">
                                  {user.role === "admin" && "מנהל"}
                                  {user.role === "coordinator" && "רכז"}
                                  {user.role === "youth_volunteer" && "מתנדב נוער"}
                                  {user.role === "service_girl" && "נערת שירות"}
                                </span>
                              </td>
                              <td className="p-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setRoleDialogOpen(true);
                                  }}
                                >
                                  שנה תפקיד
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg">יש להתחבר כדי לצפות בפרופיל</p>
          </div>
        )}
      </main>
      
      <Footer />
      
      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>שינוי תפקיד משתמש</DialogTitle>
            <DialogDescription>
              {selectedUser?.name && `שינוי תפקיד עבור ${selectedUser.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select
              defaultValue={selectedUser?.role}
              onValueChange={(value) => {
                if (selectedUser && value) {
                  handleRoleChange(selectedUser.id, value as RoleType);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="בחר תפקיד" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">מנהל</SelectItem>
                <SelectItem value="coordinator">רכז</SelectItem>
                <SelectItem value="youth_volunteer">מתנדב נוער</SelectItem>
                <SelectItem value="service_girl">נערת שירות</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              בטל
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;
