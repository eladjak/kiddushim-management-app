
/**
 * קישור "דלג לתוכן הראשי" לנגישות
 *
 * מאפשר למשתמשי מקלדת ותוכנות קורא מסך לדלג ישירות לתוכן הראשי
 * הקישור מוסתר ויזואלית אך נראה בעת פוקוס מהמקלדת
 */
export const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      דלג לתוכן הראשי
    </a>
  );
};
