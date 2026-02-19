
import { Image } from "@/components/ui/image";

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border shadow-sm py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-right">
            © {new Date().getFullYear()} כל הזכויות שמורות למערכת קידושישי
          </div>
          
          <div className="flex items-center justify-center gap-6">
            <a href="https://orot-yehuda.co.il" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
              <Image 
                src="/lovable-uploads/bed6aebb-e440-45d6-8d39-a58ed7b49c49.png" 
                alt="גרעין תורני אורות יהודה" 
                className="h-8 w-auto" 
                fallback="/placeholder.svg"
              />
            </a>
            
            <a href="https://tzohar.org.il" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
              <Image 
                src="/lovable-uploads/a762c5ca-232e-44ef-a39c-d59a900550bd.png" 
                alt="ארגון רבני צהר" 
                className="h-8 w-auto" 
                fallback="/placeholder.svg"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
