
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Image } from "@/components/ui/image";
import { FileText } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export const WelcomeScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex flex-col">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center mb-10">
            <Image 
              src="/lovable-uploads/a0a5beb0-b56a-44ad-900e-7dccede43ce0.png" 
              alt="קידושישי" 
              className="h-48 w-auto mb-8" 
              fallback="/placeholder.svg"
            />
            <h1 className="text-4xl font-bold mb-6 text-center">ברוכים הבאים לקידושישי</h1>
            <p className="text-lg mb-8 text-center">
              המערכת לניהול האירועים והמתנדבים של הקהילה
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Image 
                src="/lovable-uploads/fa1e284c-6133-4f56-bf31-95b40beae661.png" 
                alt="אורות יהודה" 
                className="h-24 w-auto mx-auto mb-4" 
                fallback="/placeholder.svg"
              />
              <h2 className="text-xl font-bold mb-2">גרעין תורני אורות יהודה</h2>
              <p className="text-gray-600">גרעין תורני מגדל העמק</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Image 
                src="/lovable-uploads/4da50744-935d-4fb8-9cf1-248d9f25c8c2.png" 
                alt="ארגון רבני צהר" 
                className="h-24 w-auto mx-auto mb-4" 
                fallback="/placeholder.svg"
              />
              <h2 className="text-xl font-bold mb-2">ארגון רבני צהר</h2>
              <p className="text-gray-600">היהדות של כולנו</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <Button asChild size="lg" className="w-full md:w-auto">
              <Link to="/auth">התחבר למערכת</Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full md:w-auto">
              <Link to="/documentation" className="flex items-center gap-2">
                <FileText className="h-4 w-4 ml-1" />
                לתיעוד הפרויקט
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
