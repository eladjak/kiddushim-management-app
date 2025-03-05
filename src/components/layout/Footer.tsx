
import { Image } from "@/components/ui/image";

export const Footer = () => {
  return (
    <footer className="bg-white py-4 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
          <a 
            href="https://tzohar.org.il/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <Image 
              src="/lovable-uploads/a762c5ca-232e-44ef-a39c-d59a900550bd.png" 
              alt="ארגון רבני צהר" 
              className="h-8 w-auto md:h-10" 
              fallback="/placeholder.svg"
            />
          </a>
          
          <a 
            href="https://orotyehuda.org.il" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <Image 
              src="/lovable-uploads/bed6aebb-e440-45d6-8d39-a58ed7b49c49.png" 
              alt="אורות יהודה" 
              className="h-8 w-auto md:h-10" 
              fallback="/placeholder.svg"
            />
          </a>
        </div>
        
        <div className="text-center mt-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} קידושישי - חוויה ישראלית לקראת שבת</p>
        </div>
      </div>
    </footer>
  );
};
