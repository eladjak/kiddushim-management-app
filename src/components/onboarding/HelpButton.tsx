
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, ExternalLink, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HelpButtonProps {
  onStartTour: () => void;
}

export const HelpButton = ({ onStartTour }: HelpButtonProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-6 left-6 rounded-full shadow-lg z-40 h-12 w-12 p-0"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>עזרה ותמיכה</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onStartTour}>
          <RotateCcw className="me-2 h-4 w-4" />
          <span>הדרכה מחדש</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <a href="https://kidushishi.tzohar.org.il/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="me-2 h-4 w-4" />
            <span>אתר קידושישי</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
