
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

const log = logger.createLogger({ component: 'InviteUserDialog' });
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail } from "lucide-react";

interface InviteUserDialogProps {
  onUserInvited: () => void;
}

type RoleType = "admin" | "coordinator" | "youth_volunteer" | "service_girl";

export const InviteUserDialog = ({ onUserInvited }: InviteUserDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "youth_volunteer" as RoleType,
    message: "הוזמנת להצטרף למערכת ניהול קידושישי. לחץ על הלינק כדי להשלים את ההרשמה."
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast({
        variant: "destructive",
        description: "אימייל חובה",
      });
      return;
    }

    setLoading(true);
    
    try {
      // שליחת הזמנה באימייל
      const { error } = await supabase.auth.admin.inviteUserByEmail(formData.email, {
        data: {
          role: formData.role,
          invited_by: (await supabase.auth.getUser()).data.user?.email,
          custom_message: formData.message
        },
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) throw error;

      toast({
        description: `הזמנה נשלחה לכתובת ${formData.email}`,
      });

      // איפוס הטופס וסגירת החלון
      setFormData({
        email: "",
        role: "youth_volunteer",
        message: "הוזמנת להצטרף למערכת ניהול קידושישי. לחץ על הלינק כדי להשלים את ההרשמה."
      });
      setOpen(false);
      onUserInvited();

    } catch (error: any) {
      log.error('Error inviting user', { error });
      toast({
        variant: "destructive",
        description: `שגיאה בשליחת הזמנה: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          הזמנת משתמש באימייל
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>הזמנת משתמש חדש</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="role">תפקיד מוגדר מראש</Label>
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
          
          <div>
            <Label htmlFor="message">הודעה אישית</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="הודעה שתישלח יחד עם ההזמנה"
              rows={3}
            />
          </div>
          
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "שולח..." : "שליחת הזמנה"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
