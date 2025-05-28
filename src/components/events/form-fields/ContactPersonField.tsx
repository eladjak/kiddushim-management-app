
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContactPersonFieldProps {
  name: string;
  phone: string;
  hasWhatsApp: string;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onWhatsAppChange: (value: string) => void;
}

export const ContactPersonField = ({ 
  name, 
  phone, 
  hasWhatsApp, 
  onNameChange, 
  onPhoneChange, 
  onWhatsAppChange 
}: ContactPersonFieldProps) => {
  return (
    <div className="space-y-4 border border-gray-200 p-4 rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="contact-name">שם איש/אשת קשר לאירוע *</Label>
        <Input
          id="contact-name"
          name="contactName"
          value={name}
          onChange={onNameChange}
          placeholder="אלעד יעקובוביץ"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-phone">טלפון איש/אשת קשר לאירוע *</Label>
        <div className="flex gap-2">
          <Select defaultValue="israel">
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="israel">🇮🇱</SelectItem>
            </SelectContent>
          </Select>
          <Input
            id="contact-phone"
            name="contactPhone"
            value={phone}
            onChange={onPhoneChange}
            placeholder="+972 52 542 7474"
            className="flex-1"
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-medium">האם הוזמן לאירוע ספק צהר? *</Label>
        <div className="flex gap-6">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <input
              type="radio"
              id="supplier-yes"
              name="hasSupplier"
              value="yes"
              checked={hasWhatsApp === "yes"}
              onChange={(e) => onWhatsAppChange(e.target.value)}
              className="w-4 h-4"
            />
            <Label htmlFor="supplier-yes">כן</Label>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <input
              type="radio"
              id="supplier-no"
              name="hasSupplier"
              value="no"
              checked={hasWhatsApp === "no"}
              onChange={(e) => onWhatsAppChange(e.target.value)}
              className="w-4 h-4"
            />
            <Label htmlFor="supplier-no">לא</Label>
          </div>
        </div>
      </div>
    </div>
  );
};
