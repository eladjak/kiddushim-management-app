
/**
 * RTL (Right-to-Left) utilities for better Hebrew text handling
 */

// Detect if the current environment supports RTL
export const isRtlLanguage = (lang: string = 'he'): boolean => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(lang.toLowerCase());
};

// Apply RTL-specific CSS classes
export const rtlClass = (baseClass: string, rtlClass: string, lang: string = 'he'): string => {
  return isRtlLanguage(lang) ? `${baseClass} ${rtlClass}` : baseClass;
};

// Format input placeholder for RTL
export const rtlPlaceholder = (placeholder: string, lang: string = 'he'): string => {
  if (!isRtlLanguage(lang)) return placeholder;
  
  // Add Unicode RTL mark to ensure proper text display
  return '\u200F' + placeholder + '\u200F';
};

// Get appropriate flex direction based on language
export const getFlexDirection = (lang: string = 'he'): string => {
  return isRtlLanguage(lang) ? 'flex-row-reverse' : 'flex-row';
};

// Get appropriate text alignment based on language
export const getTextAlignment = (lang: string = 'he'): string => {
  return isRtlLanguage(lang) ? 'text-right' : 'text-left';
};

// Apply RTL to an entire layout section
export const rtlLayout = (lang: string = 'he'): Record<string, string> => {
  if (!isRtlLanguage(lang)) return {};
  
  return {
    direction: 'rtl',
    textAlign: 'right',
  };
};

// Helper to fix CSS margin/padding in RTL contexts
export const fixRtlSpacing = (
  cssProp: string, 
  ltrValue: string, 
  rtlValue: string,
  lang: string = 'he'
): Record<string, string> => {
  const value = isRtlLanguage(lang) ? rtlValue : ltrValue;
  return { [cssProp]: value };
};

export default {
  isRtlLanguage,
  rtlClass,
  rtlPlaceholder,
  getFlexDirection,
  getTextAlignment,
  rtlLayout,
  fixRtlSpacing
};
