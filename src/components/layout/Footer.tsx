
import { Image } from "@/components/ui/image";

export const Footer = () => {
  return (
    <footer className="bg-white py-4 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-8">
          <a 
            href="https://tzohar.org.il/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <Image 
              src="/lovable-uploads/4da50744-935d-4fb8-9cf1-248d9f25c8c2.png" 
              alt="ארגון רבני צהר" 
              className="h-8 w-auto" 
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
              src="/lovable-uploads/fa1e284c-6133-4f56-bf31-95b40beae661.png" 
              alt="אורות יהודה" 
              className="h-8 w-auto" 
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
