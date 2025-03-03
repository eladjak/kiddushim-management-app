
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TableCell, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, CheckCircle2 } from "lucide-react";

/**
 * Work processes component showing workflows and procedures
 */
export const WorkProcesses = () => {
  return (
    <div className="space-y-6 lg:space-y-8 py-4 lg:py-6">
      <h2 className="text-3xl font-bold text-right">תהליכי עבודה - קידושישי 2025</h2>
      
      <Alert variant="default" className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-right text-amber-800">הערה חשובה</AlertTitle>
        <AlertDescription className="text-right text-amber-700">
          יש לתכנן תזרים מזומנים בהתאם לעיכוב של חודש-חודשיים בקבלת התקציב מצהר.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">תהליך חודשי</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-3 bg-secondary/20">
                <h4 className="font-medium">שבוע ראשון</h4>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">יום</TableHead>
                    <TableHead className="text-right">משימה</TableHead>
                    <TableHead className="text-right">אחראי</TableHead>
                    <TableHead className="text-right">סטטוס</TableHead>
                  </TableRow>
                </TableHeader>
                <tbody>
                  <TableRow>
                    <TableCell>א</TableCell>
                    <TableCell className="text-right">תכנון חודשי</TableCell>
                    <TableCell>רכז</TableCell>
                    <TableCell>
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">דורש אישור</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ב</TableCell>
                    <TableCell className="text-right">פגישת צוות</TableCell>
                    <TableCell>כל הצוות</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">קבוע</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ג-ה</TableCell>
                    <TableCell className="text-right">תיאומים</TableCell>
                    <TableCell>רכזי משנה</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">שוטף</Badge>
                    </TableCell>
                  </TableRow>
                </tbody>
              </Table>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-3 bg-secondary/20">
                <h4 className="font-medium">שבוע שני</h4>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">יום</TableHead>
                    <TableHead className="text-right">משימה</TableHead>
                    <TableHead className="text-right">אחראי</TableHead>
                    <TableHead className="text-right">סטטוס</TableHead>
                  </TableRow>
                </TableHeader>
                <tbody>
                  <TableRow>
                    <TableCell>א</TableCell>
                    <TableCell className="text-right">אישורי צהר</TableCell>
                    <TableCell>רכז מול חן</TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">קריטי</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ג</TableCell>
                    <TableCell className="text-right">תכנון תקציבי</TableCell>
                    <TableCell>רכז + צוות</TableCell>
                    <TableCell>
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">חודשי</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ה</TableCell>
                    <TableCell className="text-right">עדכון שותפים</TableCell>
                    <TableCell>רכז</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">שוטף</Badge>
                    </TableCell>
                  </TableRow>
                </tbody>
              </Table>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">תהליך שבועי לאירוע</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-medium mb-3 text-center">שבועיים לפני</h4>
              <ul className="space-y-2 text-gray-600 text-right leading-relaxed text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-primary font-medium">1.</span>
                  <span>אישור סופי מצהר (חן/אביבה)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-medium">2.</span>
                  <span>תיאום מרצים/אמנים</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-medium">3.</span>
                  <span>הזמנת ציוד מיוחד</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-medium">4.</span>
                  <span>תחילת פרסום</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-medium mb-3 text-center">שבוע לפני</h4>
              <ul className="space-y-2 text-gray-600 text-right leading-relaxed text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-primary font-medium">1.</span>
                  <span>תזכורת לצוות</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-medium">2.</span>
                  <span>וידוא ציוד</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-medium">3.</span>
                  <span>תדריך בנות שירות (נדביה)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-medium">4.</span>
                  <span>תיאום מתנדבי נוער (מעוז)</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-medium mb-3 text-center">יומיים לפני</h4>
              <ul className="space-y-2 text-gray-600 text-right leading-relaxed text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-primary font-medium">1.</span>
                  <span>תזכורת למשתתפים</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-medium">2.</span>
                  <span>הכנת חומרים</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-medium">3.</span>
                  <span>בדיקת ציוד</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-medium">4.</span>
                  <span>תדריך סופי לצוות</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-muted p-4 rounded-lg mt-8">
        <h3 className="font-semibold text-right mb-2">גמישות תפעולית</h3>
        <ul className="list-disc list-inside rtl text-right space-y-1 text-gray-600">
          <li>אפשרות למעבר בין מודלים לפי תקציב</li>
          <li>שימוש בכוח אדם מתנדב/צעיר</li>
          <li>ניצול יעיל של משאבים קיימים</li>
          <li>גמישות במיקום ובאופי האירוע</li>
        </ul>
      </div>
    </div>
  );
};
