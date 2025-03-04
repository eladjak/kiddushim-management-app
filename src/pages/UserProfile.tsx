
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Image } from "@/components/ui/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { UserCog, Bell, Shield } from "lucide-react";

const UserProfile = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    language: profile?.language || "he",
    shabbatMode: profile?.shabbat_mode || false
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        language: profile.language || "he",
        shabbatMode: profile.shabbat_mode || false
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          phone: formData.phone,
          language: formData.language,
          shabbat_mode: formData.shabbatMode,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
        
      if (error) throw error;
      
      toast({
        description: "הפרופיל עודכן בהצלחה",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "אירעה שגיאה בעדכון הפרופיל",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12 text-center">
          <p>טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30" dir="rtl">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold mb-6 text-right">הפרופיל שלי</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                    {profile.avatar_url ? (
                      <Image 
                        src={profile.avatar_url} 
                        alt={profile.name} 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      <UserCog size={48} className="text-primary" />
                    )}
                  </div>
                </div>
                <CardTitle>{profile.name}</CardTitle>
                <p className="text-muted-foreground">{profile.email}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {profile.role === "admin" ? "מנהל" : 
                     profile.role === "coordinator" ? "רכז" : "מתנדב"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">טלפון:</h3>
                    <p>{profile.phone || "לא הוזן"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">הצטרף בתאריך:</h3>
                    <p>{new Date(profile.created_at).toLocaleDateString('he-IL')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal">
              <TabsList className="w-full">
                <TabsTrigger value="personal" className="flex-1">פרטים אישיים</TabsTrigger>
                <TabsTrigger value="notifications" className="flex-1">הגדרות התראות</TabsTrigger>
                <TabsTrigger value="security" className="flex-1">אבטחה</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>עדכון פרטים אישיים</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">שם מלא</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          value={formData.name} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">טלפון</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleInputChange} 
                          dir="ltr"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="language">שפה מועדפת</Label>
                        <select 
                          id="language" 
                          name="language" 
                          value={formData.language} 
                          onChange={(e) => setFormData({...formData, language: e.target.value})}
                          className="w-full p-2 border border-input rounded-md"
                        >
                          <option value="he">עברית</option>
                          <option value="en">אנגלית</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="shabbatMode" 
                          name="shabbatMode" 
                          checked={formData.shabbatMode} 
                          onChange={handleInputChange} 
                          className="h-4 w-4 text-primary"
                        />
                        <Label htmlFor="shabbatMode" className="mr-2">מצב שבת (הסתרת תוכן בין כניסת השבת ליציאתה)</Label>
                      </div>
                      
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "מעדכן..." : "עדכן פרטים"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="ml-2" size={20} />
                      הגדרות התראות
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">התראות על אירועים חדשים</h3>
                          <p className="text-sm text-muted-foreground">קבל התראות כאשר נוספים אירועים חדשים</p>
                        </div>
                        <input type="checkbox" className="h-5 w-5 text-primary" defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">התראות על שיבוצים</h3>
                          <p className="text-sm text-muted-foreground">קבל התראות כאשר אתה משובץ לאירוע</p>
                        </div>
                        <input type="checkbox" className="h-5 w-5 text-primary" defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">תזכורות לאירועים</h3>
                          <p className="text-sm text-muted-foreground">קבל תזכורות לפני אירועים שאתה משובץ אליהם</p>
                        </div>
                        <input type="checkbox" className="h-5 w-5 text-primary" defaultChecked />
                      </div>
                    </div>
                    
                    <Button className="mt-6">שמור הגדרות</Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="ml-2" size={20} />
                      אבטחה
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">שינוי סיסמה</h3>
                        <div className="space-y-2">
                          <Input type="password" placeholder="סיסמה נוכחית" />
                          <Input type="password" placeholder="סיסמה חדשה" />
                          <Input type="password" placeholder="אימות סיסמה חדשה" />
                        </div>
                        <Button className="mt-2">עדכן סיסמה</Button>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-2">אימות דו-שלבי</h3>
                        <p className="text-sm text-muted-foreground mb-2">הפעל אימות דו-שלבי לאבטחה מוגברת</p>
                        <Button variant="outline">הפעל אימות דו-שלבי</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
