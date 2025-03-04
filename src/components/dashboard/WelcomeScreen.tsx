
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Image } from "@/components/ui/image";

export const WelcomeScreen = () => {
  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">ברוכים הבאים לקידושישי</h1>
          <p className="text-lg mb-8">
            המערכת לניהול האירועים והמתנדבים של הקהילה
          </p>
          <Button asChild size="lg" className="w-full md:w-auto">
            <Link to="/auth">התחבר למערכת</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};
