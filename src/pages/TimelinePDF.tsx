
import React, { useRef } from 'react';
import { predefinedEvents } from '@/data/eventCalendar'; 
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const TimelinePDF = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // מיון האירועים לפי תאריך
  const sortedEvents = [...predefinedEvents].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // פונקציה ליצירת והורדת PDF
  const handleDownloadPDF = () => {
    // בדפדפן נפתח חלון הדפסה מובנה
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-right">לוח אירועי קידושישי 2025</h1>
          <div className="flex gap-4">
            <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              הורד PDF
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
              חזרה לדף הבית
            </Button>
          </div>
        </div>

        {/* דף בגודל A4 */}
        <div className="bg-white shadow-lg mx-auto rounded-lg overflow-hidden w-[210mm] min-h-[297mm] p-8 print:shadow-none print:p-0" ref={contentRef}>
          <div className="print:w-full">
            {/* כותרת הדף */}
            <div className="text-center mb-8 border-b pb-6">
              <h1 className="text-3xl font-bold mb-2">לוח אירועי קידושישי 2025</h1>
              <p className="text-xl text-gray-600">קבלות שבת קהילתיות במגדל העמק</p>
              <p className="text-lg font-medium text-indigo-600 mt-2">היהדות של כולנו</p>
            </div>

            {/* לוגו ומידע כללי */}
            <div className="flex justify-between items-center mb-8 print:mb-4">
              <div className="w-40">
                <AspectRatio ratio={1}>
                  <img src="/kidushishi-logo.png" alt="לוגו קידושישי" className="w-full h-full object-contain" />
                </AspectRatio>
              </div>
              <div className="text-left">
                <div className="flex items-center justify-end gap-2 text-gray-500 mb-1">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span>אירוע רגיל ביום שישי</span>
                </div>
                <div className="flex items-center justify-end gap-2 text-gray-500 mb-1">
                  <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  <span>אירוע ביום חמישי</span>
                </div>
                <div className="flex items-center justify-end gap-2 text-gray-500">
                  <div className="h-3 w-3 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>אירוע שהתקיים</span>
                </div>
              </div>
            </div>

            {/* ציר זמן */}
            <div className="relative print:mx-4">
              <div className="absolute h-full w-1 bg-gradient-to-b from-blue-200 via-blue-500 to-blue-800 left-[15px] md:left-[20px]"></div>

              <div className="space-y-10 relative z-10">
                {sortedEvents.map((event, index) => {
                  const eventDate = new Date(event.date);
                  const isCompleted = eventDate < new Date();
                  const isThursday = event.dayOfWeek?.includes("חמישי");
                  
                  return (
                    <div 
                      key={event.id}
                      className={`flex gap-8 relative`}
                    >
                      {/* נקודת זמן */}
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center relative z-20
                        ${isThursday ? 'bg-purple-500' : 'bg-blue-500'}
                        ${index === 0 ? 'ring-4 ring-blue-100' : ''}
                      `}>
                        {isCompleted && <span className="text-white text-sm">✓</span>}
                      </div>
                      
                      {/* תוכן האירוע */}
                      <div className="flex-1 bg-white rounded-lg shadow-md p-4 border border-gray-100">
                        <div className="flex justify-between items-start">
                          <div className="text-left">
                            <span className="text-gray-500 text-sm">
                              {format(eventDate, 'dd/MM/yyyy')}
                            </span>
                          </div>
                          <div className="text-right">
                            <h3 className="text-lg font-medium">{event.hebrewDate}</h3>
                            <p className="text-indigo-600 font-medium">פרשת {event.parasha}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-end mt-3">
                          <div className="text-xs text-gray-500">
                            {event.serviceLadiesAvailable ? 
                              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">בנות שירות זמינות</span> : 
                              <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">ללא בנות שירות</span>
                            }
                          </div>
                          <div className="text-left">
                            <span className={`font-medium ${isThursday ? 'text-purple-600' : 'text-blue-600'}`}>
                              {event.dayOfWeek} | {event.time}
                            </span>
                          </div>
                        </div>
                        
                        {event.notes && event.notes.length > 0 && (
                          <div className="mt-2 text-right text-gray-600 text-sm">
                            <p>{event.notes.join(' • ')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* מידע בתחתית הדף */}
            <div className="mt-16 print:mt-12 border-t pt-6">
              <div className="flex justify-between items-center flex-wrap">
                <div className="text-left text-sm text-gray-500">
                  <p>היכונו לאירועים קהילתיים מדהימים!</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-800 font-medium">סה"כ: {sortedEvents.length} אירועים</p>
                  <p className="text-gray-600 text-sm">רוב האירועים ביום שישי | מגוון פעילויות</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* סגנון להדפסה */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, header, footer, .no-print {
            display: none !important;
          }
          .container {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          button, .button, input[type="button"] {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};

export default TimelinePDF;
