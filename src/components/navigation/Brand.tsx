
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";

export const Brand = () => {
  return (
    <Link to="/" className="flex items-center">
      <Image 
        src="/lovable-uploads/d3702f47-5985-4b74-aea4-b1afd4a95588.png" 
        alt="קידושישי" 
        className="h-12 ml-2" 
        fallback="/placeholder.svg"
      />
      <span className="text-xl font-semibold text-primary">קידושישי</span>
    </Link>
  );
};
