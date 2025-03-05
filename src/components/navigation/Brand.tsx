
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";

export const Brand = () => {
  return (
    <Link to="/" className="flex items-center">
      <Image 
        src="/lovable-uploads/95344b3f-5084-447f-8d10-aa4f56fbb8f1.png" 
        alt="קידושישי" 
        className="h-12 w-auto" 
        fallback="/placeholder.svg"
      />
    </Link>
  );
};
