
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { FileText, ExternalLink } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export const WelcomeScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex flex-col">
      <main className="container mx-auto px-4 pt-16 md:pt-24 pb-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center mb-8 md:mb-10">
            <Image 
              src="/lovable-uploads/95344b3f-5084-447f-8d10-aa4f56fbb8f1.png" 
              alt="קידושישי" 
              className="h-32 md:h-40 w-auto mb-6 md:mb-8" 
              fallback="/placeholder.svg"
            />
            <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-center">ברוכים הבאים לקידושישי</h1>
            <p className="text-base md:text-lg mb-6 md:mb-8 text-center max-w-lg px-2">
              המערכת לניהול האירועים והמתנדבים של הקהילה
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
              <Image 
                src="/lovable-uploads/bed6aebb-e440-45d6-8d39-a58ed7b49c49.png" 
                alt="אורות יהודה" 
                className="h-16 md:h-20 w-auto mx-auto mb-3 md:mb-4" 
                fallback="/placeholder.svg"
              />
              <h2 className="text-lg md:text-xl font-bold mb-1 md:mb-2">גרעין תורני אורות יהודה</h2>
              <p className="text-gray-600 text-sm md:text-base">גרעין תורני מגדל העמק</p>
            </div>
            
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
              <Image 
                src="/lovable-uploads/a762c5ca-232e-44ef-a39c-d59a900550bd.png" 
                alt="ארגון רבני צהר" 
                className="h-16 md:h-20 w-auto mx-auto mb-3 md:mb-4" 
                fallback="/placeholder.svg"
              />
              <h2 className="text-lg md:text-xl font-bold mb-1 md:mb-2">ארגון רבני צהר</h2>
              <p className="text-gray-600 text-sm md:text-base">היהדות של כולנו</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto py-6 text-base">
              <Link to="/auth">התחבר למערכת</Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <a href="https://kidushishi.tzohar.org.il/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 ms-1" />
                למידע נוסף על פרויקט קידושישי
              </a>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
