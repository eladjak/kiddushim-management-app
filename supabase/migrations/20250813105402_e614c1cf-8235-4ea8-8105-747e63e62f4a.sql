-- תיקון בעיות אבטחה חמורות במערכת
-- 1. תיקון גישה למשובים (feedback) - רק המגיש וצוות מורשה
-- 2. תיקון גישה לבקשות שינוי ציוד - רק מבקש ומאשר
-- 3. הגבלת גישה נוספת לפרופילים

-- תיקון בעיה #1: משובים
-- הסרת המדיניות הבעייתית שמאפשרת לכולם לראות משובים
DROP POLICY IF EXISTS "Only authenticated users can view feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;

-- יצירת מדיניות מאובטחת למשובים
-- רק המגיש עצמו יכול לראות את המשוב שלו
CREATE POLICY "Users can view only their own feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (submitted_by = auth.uid());

-- אדמינים ורכזים יכולים לראות את כל המשובים לצרכי ניהול
CREATE POLICY "Admins and coordinators can view all feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'coordinator')
  )
);

-- תיקון בעיה #2: בקשות שינוי ציוד
-- הסרת המדיניות הבעייתית שמאפשרת לכולם לראות בקשות
DROP POLICY IF EXISTS "Only authenticated users can view changes" ON public.equipment_changes;

-- יצירת מדיניות מאובטחת לבקשות שינוי ציוד
-- רק המבקש יכול לראות את הבקשה שלו
CREATE POLICY "Users can view their own change requests"
ON public.equipment_changes
FOR SELECT
TO authenticated
USING (requested_by = auth.uid());

-- אדמינים יכולים לראות את כל הבקשות לצרכי אישור וניהול
CREATE POLICY "Admins can view all change requests"
ON public.equipment_changes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- מי שאישר הבקשה יכול לראות אותה (לצרכי מעקב)
CREATE POLICY "Approvers can view approved requests"
ON public.equipment_changes
FOR SELECT
TO authenticated
USING (
  approved_by = auth.uid() AND approved_by IS NOT NULL
);