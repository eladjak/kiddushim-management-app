
import React from "react";

interface DebugModeToggleProps {
  onEnterDebugMode: () => void;
}

export const DebugModeToggle: React.FC<DebugModeToggleProps> = ({ onEnterDebugMode }) => {
  return (
    <div className="text-center p-4">
      <button 
        onClick={onEnterDebugMode}
        className="text-xs text-gray-400 hover:underline"
      >
        מצב דיאגנוסטיקה
      </button>
    </div>
  );
};
