
import { Navigation } from "@/components/Navigation";
import { Calendar, Users, FileText, Bell } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Quick Action Cards */}
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-fade-in">
            <div className="flex items-center space-x-4 justify-end text-right">
              <div>
                <h3 className="text-lg font-semibold mb-1">אירועים קרובים</h3>
                <p className="text-sm text-gray-600">3 אירועים השבוע</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-fade-in">
            <div className="flex items-center space-x-4 justify-end text-right">
              <div>
                <h3 className="text-lg font-semibold mb-1">מתנדבים פעילים</h3>
                <p className="text-sm text-gray-600">12 מתנדבים</p>
              </div>
              <div className="bg-accent/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-fade-in">
            <div className="flex items-center space-x-4 justify-end text-right">
              <div>
                <h3 className="text-lg font-semibold mb-1">דיווחים</h3>
                <p className="text-sm text-gray-600">2 דיווחים חדשים</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-fade-in">
            <div className="flex items-center space-x-4 justify-end text-right">
              <div>
                <h3 className="text-lg font-semibold mb-1">התראות</h3>
                <p className="text-sm text-gray-600">5 התראות חדשות</p>
              </div>
              <div className="bg-accent/10 p-3 rounded-full">
                <Bell className="h-6 w-6 text-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-right">אירועים קרובים</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((event) => (
              <div key={event} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-fade-in">
                <div className="text-right">
                  <div className="text-sm text-accent font-medium mb-2">יום חמישי, 15 במרץ</div>
                  <h3 className="text-lg font-semibold mb-2">פעילות קידושישי #{event}</h3>
                  <p className="text-sm text-gray-600 mb-4">מרכז קהילתי רמת אביב</p>
                  <div className="flex justify-end space-x-4">
                    <button className="px-4 py-2 text-sm rounded-md bg-secondary hover:bg-secondary-hover transition-colors">
                      פרטים נוספים
                    </button>
                    <button className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-hover transition-colors">
                      הרשמה לאירוע
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
