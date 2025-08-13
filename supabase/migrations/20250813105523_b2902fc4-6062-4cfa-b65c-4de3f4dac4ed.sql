-- ננסה לעדכן תחילה לגרסה הזמינה הבאה
-- אם אין נתיב ישיר, ננסה להתקין מחדש

-- ראשית נבדוק אילו גרסאות זמינות בפועל
SELECT version 
FROM pg_available_extension_versions 
WHERE name = 'pg_graphql' 
ORDER BY version;