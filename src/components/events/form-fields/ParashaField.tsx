
import { Label } from "@/components/ui/label";

interface ParashaFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ParashaField = ({ value, onChange }: ParashaFieldProps) => {
  // List of parashas
  const parashas = [
    "בראשית", "נח", "לך לך", "וירא", "חיי שרה", "תולדות", "ויצא", "וישלח", "וישב",
    "מקץ", "ויגש", "ויחי", "שמות", "וארא", "בא", "בשלח", "יתרו", "משפטים",
    "תרומה", "תצוה", "כי תשא", "ויקהל", "פקודי", "ויקרא", "צו", "שמיני", "תזריע",
    "מצורע", "אחרי מות", "קדושים", "אמור", "בהר", "בחוקותי", "במדבר", "נשא",
    "בהעלותך", "שלח", "קרח", "חקת", "בלק", "פינחס", "מטות", "מסעי", "דברים",
    "ואתחנן", "עקב", "ראה", "שופטים", "כי תצא", "כי תבוא", "ניצבים", "וילך", "האזינו", "וזאת הברכה"
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="parasha">פרשת השבוע</Label>
      <div className="relative">
        <input
          id="parasha"
          name="parasha"
          value={value}
          onChange={onChange}
          list="parashas-list"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="בחר פרשת שבוע"
        />
        <datalist id="parashas-list">
          {parashas.map((parasha) => (
            <option key={parasha} value={parasha} />
          ))}
        </datalist>
      </div>
    </div>
  );
};
