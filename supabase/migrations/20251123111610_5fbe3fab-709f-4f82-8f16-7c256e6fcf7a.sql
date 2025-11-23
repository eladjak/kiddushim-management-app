-- =====================================================
-- תיקון אבטחה קריטי: הפרדת טבלת תפקידים
-- Critical Security Fix: Separate roles table
-- =====================================================

-- 1. יצירת enum לתפקידים (אם לא קיים)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'coordinator', 'service_girl', 'youth_volunteer', 'volunteer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. יצירת טבלת user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- 3. הפעלת RLS על user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. יצירת פונקציית has_role בטוחה עם SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. פונקציה לקבלת התפקיד של המשתמש הנוכחי
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid DEFAULT auth.uid())
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 6. פונקציה לבדיקה אם משתמש הוא admin או coordinator
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'coordinator')
  )
$$;

-- 7. העברת תפקידים קיימים מ-profiles ל-user_roles
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT id, role::text::app_role, created_at
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 8. מדיניות RLS לטבלת user_roles
-- רק admins יכולים לנהל תפקידים
CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- משתמשים יכולים לראות את התפקיד שלהם
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- צוות יכול לראות את כל התפקידים
CREATE POLICY "Staff can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

-- 9. עדכון מדיניות RLS בטבלאות אחרות להשתמש ב-has_role

-- עדכון מדיניות audit_logs
DROP POLICY IF EXISTS "Only authenticated admins can read audit logs" ON public.audit_logs;
CREATE POLICY "Only admins can read audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- עדכון מדיניות equipment
DROP POLICY IF EXISTS "Only admins can manage equipment" ON public.equipment;
DROP POLICY IF EXISTS "Staff can manage equipment" ON public.equipment;

CREATE POLICY "Staff can manage equipment"
ON public.equipment
FOR ALL
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

-- עדכון מדיניות equipment_changes
DROP POLICY IF EXISTS "Admins can view all change requests" ON public.equipment_changes;
DROP POLICY IF EXISTS "Only admins can update change status" ON public.equipment_changes;

CREATE POLICY "Admins can view all change requests"
ON public.equipment_changes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update change status"
ON public.equipment_changes
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- עדכון מדיניות event_assignments
DROP POLICY IF EXISTS "Admins and coordinators can manage assignments" ON public.event_assignments;

CREATE POLICY "Staff can manage assignments"
ON public.event_assignments
FOR ALL
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

-- עדכון מדיניות event_equipment
DROP POLICY IF EXISTS "Admins and coordinators can manage event equipment" ON public.event_equipment;
DROP POLICY IF EXISTS "Only admins and coordinators can manage event equipment" ON public.event_equipment;
DROP POLICY IF EXISTS "Staff can manage event equipment" ON public.event_equipment;

CREATE POLICY "Staff can manage event equipment"
ON public.event_equipment
FOR ALL
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

-- עדכון מדיניות event_registrations
DROP POLICY IF EXISTS "Admins and coordinators can view registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Staff can view all registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins can update registrations" ON public.event_registrations;

CREATE POLICY "Staff can view all registrations"
ON public.event_registrations
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can update registrations"
ON public.event_registrations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- עדכון מדיניות events
DROP POLICY IF EXISTS "Admins and coordinators can create events" ON public.events;
DROP POLICY IF EXISTS "Admins and coordinators can update events" ON public.events;
DROP POLICY IF EXISTS "Admins and event creators can update events" ON public.events;

CREATE POLICY "Staff can create events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff and event creators can update events"
ON public.events
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()) OR created_by = auth.uid())
WITH CHECK (public.is_staff(auth.uid()) OR created_by = auth.uid());

-- עדכון מדיניות feedback
DROP POLICY IF EXISTS "Admins and coordinators can view all feedback" ON public.feedback;

CREATE POLICY "Staff can view all feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

-- עדכון מדיניות profiles
DROP POLICY IF EXISTS "Admins and coordinators can view all profiles" ON public.profiles;

CREATE POLICY "Staff can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

-- 10. הסרת עמודת role מ-profiles (לאחר שכל הקוד מעודכן)
-- נשמור את זה להמשך כי צריך לעדכן את הקוד תחילה
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- 11. עדכון פונקציות קיימות
DROP FUNCTION IF EXISTS public.get_current_user_role();
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_role(auth.uid());
$$;

-- 12. טריגר לעדכון updated_at
CREATE OR REPLACE FUNCTION public.update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_user_roles_updated_at();

-- 13. פונקציה לטיפול במשתמשים חדשים - הקצאת תפקיד ברירת מחדל
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'youth_volunteer')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- יצירת טריגר חדש על auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_role();