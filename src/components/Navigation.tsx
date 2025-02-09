
import { Menu } from "lucide-react";
import { useState } from "react";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-primary">קידושישי</h1>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors">
                דף הבית
              </button>
              <button className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors">
                אירועים
              </button>
              <button className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors">
                מתנדבים
              </button>
              <button className="px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors">
                דיווחים
              </button>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-secondary transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden animate-slide-in">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
            <button className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors">
              דף הבית
            </button>
            <button className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors">
              אירועים
            </button>
            <button className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors">
              מתנדבים
            </button>
            <button className="block w-full px-4 py-2 text-right text-sm rounded-md hover:bg-secondary transition-colors">
              דיווחים
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
