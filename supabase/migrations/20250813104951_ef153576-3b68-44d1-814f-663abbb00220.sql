-- תיקון בעיית אבטחה חמורה: הגבלת גישה לפרופילים פרטיים
-- הסרת המדיניות הבעייתיה שמאפשרת לכל משתמש לראות הכל

-- ראשית, נסיר את המדיניות הבעייתית שמאפשרת לכל מישהו לראות הכל
DROP POLICY IF EXISTS "Restricted profile access" ON public.profiles;

-- ניצור מדיניות מאובטחת שמאפשרת:
-- 1. למשתמשים לראות רק את הפרופיל שלהם
-- 2. לאדמינים ורכזים לראות את כל הפרופילים
CREATE POLICY "Users can view their own profile only"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- כבר יש לנו מדיניות נפרדת לאדמינים ורכזים:
-- "Admins and coordinators can view all profiles"
-- אז לא צריך ליצור אותה שוב

-- נוודא שהמדיניות לעדכון פרופיל נשארת בטוחה
-- (משתמשים יכולים לעדכן רק את הפרופיל שלהם)
-- זה כבר קיים: "Users can update own profile"