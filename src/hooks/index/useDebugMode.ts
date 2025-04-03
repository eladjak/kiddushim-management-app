
import { useState } from "react";

export const useDebugMode = () => {
  const [debugMode, setDebugMode] = useState(false);
  
  const enterDebugMode = () => setDebugMode(true);
  const exitDebugMode = () => setDebugMode(false);
  
  return {
    debugMode,
    enterDebugMode,
    exitDebugMode
  };
};
