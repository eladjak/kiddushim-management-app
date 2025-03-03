
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CircleDashed, Info } from "lucide-react";

/**
 * Budget and logistics component displaying financial and equipment information
 */
export const BudgetAndLogistics = () => {
  return (
    <div className="space-y-6 lg:space-y-8 py-4 lg:py-6">
      <h2 className="text-3xl font-bold text-right">תקציב ולוגיסטיקה - קידושישי 2025</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-right">מבנה תקציבי</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-primary font-medium mb-2 text-right">הכנסות</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">מקור</TableHead>
                  <TableHead className="text-right">סכום</TableHead>
                  <TableHead className="text-right">הערות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">תקציב צהר</TableCell>
                  <TableCell>1,000 ₪ לאירוע</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                      <Info className="h-3 w-3 mr-1" />
                      התשלום מגיע חודש-חודשיים אחרי האירוע
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div>
            <h4 className="text-primary font-medium mb-2 text-right">מודל עלויות</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">מודל מלא</Badge>
                  <span className="text-sm text-gray-500">כשיש תקציב/שותפים</span>
                </div>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-right">מרצה/אמן</TableCell>
                      <TableCell>עד 700 ₪</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-right">ציוד וחומרים</TableCell>
                      <TableCell>200 ₪</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-right">תגמול צוות</TableCell>
                      <TableCell>100 ₪</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">מודל חסכוני</Badge>
                  <span className="text-sm text-gray-500">כשאין תקציב מיידי</span>
                </div>
                <ul className="space-y-2 text-gray-600 text-right text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>שימוש בציוד אישי קיים</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>תגמול סמלי לנוער</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>חומרים מצהר בלבד</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-right">ציוד בסיסי (קיים)</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-primary font-medium mb-2 text-right">ציוד אישי</h4>
              <ul className="space-y-2 text-gray-600 text-right">
                <li className="flex items-center justify-end gap-2">
                  <span>בידורית ניידת</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>כלי נגינה</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>שולחן מתקפל</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>מחצלות</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-primary font-medium mb-2 text-right">מתכלים בסיסיים</h4>
              <ul className="space-y-2 text-gray-600 text-right">
                <li className="flex items-center justify-end gap-2">
                  <span>מפות אלבד</span>
                  <CircleDashed className="h-4 w-4 text-amber-600" />
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>נרות שבת</span>
                  <CircleDashed className="h-4 w-4 text-amber-600" />
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>כיבוד קל</span>
                  <CircleDashed className="h-4 w-4 text-amber-600" />
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-right">שותפים וחומרים</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-primary font-medium mb-2 text-right">חומרים מצהר</h4>
              <ul className="space-y-2 text-gray-600 text-right">
                <li className="flex items-center justify-end gap-2">
                  <span>שירונים</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>פליירים</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>מדבקות</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>בלונים</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>חומרי הדרכה</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-primary font-medium mb-2 text-right">שותפים פוטנציאליים</h4>
              <ul className="space-y-2 text-gray-600 text-right">
                <li>גרעין תורני מגדל העמק</li>
                <li>החברה למתנ"סים</li>
                <li>עיריית מגדל העמק</li>
                <li>האגודה להתנדבות</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
