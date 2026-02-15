
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

const log = logger.createLogger({ component: 'AddUserDialog' });
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";

interface AddUserDialogProps {
  onUserAdded: () => void;
}

type RoleType = "admin" | "coordinator" | "youth_volunteer" | "service_girl";

export const AddUserDialog = ({ onUserAdded }: AddUserDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "youth_volunteer" as RoleType
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        variant: "destructive",
        description: "שם ואימייל חובה",
      });
      return;
    }

    setLoading(true);
    
    try {
      // יצירת משתמש באותנטיקציה של Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: Math.random().toString(36).slice(-8), // סיסמה זמנית
        email_confirm: true,
        user_metadata: {
          name: formData.name,
        },
      });

      if (authError) throw authError;

      // יצירת פרופיל
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          role: formData.role,
        });

      if (profileError) throw profileError;

      toast({
        description: `משתמש ${formData.name} נוצר בהצלחה`,
      });

      // איפוס הטופס וסגירת החלון
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "youth_volunteer"
      });
      setOpen(false);
      onUserAdded();

    } catch (error) {
      log.error('Error creating user', { error });
      toast({
        variant: "destructive",
        description: `שגיאה ביצירת משתמש: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          הוספת משתמש חדש
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>הוספת משתמש חדש</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">שם מלא *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="הכנס שם מלא"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">אימייל *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="הכנס כתובת אימייל"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">טלפון</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="הכנס מספר טלפון"
            />
          </div>
          
          <div>
            <Label htmlFor="role">תפקיד</Label>
            <Select
              value={formData.role}
              onValueChange={(value: RoleType) => setFormData({...formData, role: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">מנהל</SelectItem>
                <SelectItem value="coordinator">רכז</SelectItem>
                <SelectItem value="youth_volunteer">מתנדב נוער</SelectItem>
                <SelectItem value="service_girl">בת שירות</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "יוצר..." : "יצירת משתמש"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
