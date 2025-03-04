
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Image } from "@/components/ui/image";
import { FileText } from "lucide-react";

export const WelcomeScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center mb-10">
            <Image 
              src="/lovable-uploads/81519ba6-1d74-4d3b-a6d3-2f6230834296.png" 
              alt="קידושישי" 
              className="h-48 mb-8" 
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
                src="/lovable-uploads/447b26ab-24aa-4930-ba6d-481637ee4c07.png" 
                alt="אורות יהודה" 
                className="h-32 mx-auto mb-4" 
                fallback="/placeholder.svg"
              />
              <h2 className="text-xl font-bold mb-2">גרעין תורני אורות יהודה</h2>
              <p className="text-gray-600">גרעין תורני מגדל העמק</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Image 
                src="/lovable-uploads/03f0e255-6f4a-49b3-adc5-a4f51164af91.png" 
                alt="ארגון רבני צהר" 
                className="h-32 mx-auto mb-4" 
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
      
      <footer className="bg-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} קידושישי - חוויה ישראלית לקראת שבת</p>
        </div>
      </footer>
    </div>
  );
};
