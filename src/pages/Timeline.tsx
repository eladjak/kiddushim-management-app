
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/layout/Footer";
import { EventTimeline } from "@/components/events/EventTimeline";

const Timeline = () => {
  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col" dir="rtl">
      <Navigation />
      <main className="container mx-auto px-4 py-20 flex-grow">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">לוח זמנים שנתי</h1>
            <p className="text-lg text-gray-600">
              מחזור השנה של אירועי קידושישי במגדל העמק
            </p>
          </div>
          
          <EventTimeline />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Timeline;
