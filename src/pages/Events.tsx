
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { CreateEventForm } from "@/components/events/CreateEventForm";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Plus } from "lucide-react";
import { Image } from "@/components/ui/image";
import { Footer } from "@/components/layout/Footer";

const Events = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { profile } = useAuth();
  
  const isAdmin = profile?.role === "admin";
  const isCoordinator = profile?.role === "coordinator";
  const canCreateEvents = isAdmin || isCoordinator;
  
  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col" dir="rtl">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-primary ml-2" />
            <h1 className="text-3xl font-bold">אירועים</h1>
          </div>
          
          {canCreateEvents && !showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 ml-1" />
              אירוע חדש
            </Button>
          )}
          
          {showCreateForm && (
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              חזרה לרשימת האירועים
            </Button>
          )}
        </div>
        
        {showCreateForm ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <CreateEventForm />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col items-center py-12">
                <Image
                  src="/lovable-uploads/a0a5beb0-b56a-44ad-900e-7dccede43ce0.png"
                  alt="קידושישי"
                  className="h-24 w-auto mb-6"
                  fallback="/placeholder.svg"
                />
                <h2 className="text-2xl font-semibold mb-4">עדיין אין אירועים</h2>
                <p className="text-gray-600 mb-6 text-center max-w-lg">
                  {canCreateEvents 
                    ? "כרגע אין אירועים במערכת. התחל ליצור אירועים חדשים בלחיצה על כפתור 'אירוע חדש'" 
                    : "כרגע אין אירועים במערכת. אירועים חדשים יופיעו כאן כאשר יתווספו על ידי מנהל או רכז"}
                </p>
                
                {canCreateEvents && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 ml-1" />
                    צור אירוע ראשון
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Events;
