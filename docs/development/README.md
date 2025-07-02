# מדריך פיתוח - קידושישי

מדריך מפורט למפתחים העובדים על פרויקט קידושישי.

## מבנה הפרויקט

### קבצי index לארגון יבוא מרוכז

הפרויקט כולל כעת קבצי `index.ts` שמספקים נקודת יבוא מרוכזת לכל מודול:

```typescript
// במקום:
import { useReportForm } from '../hooks/reports/useReportForm';
import { useReportFormState } from '../hooks/reports/useReportFormState';

// עכשיו תוכלו לכתוב:
import { useReportForm, useReportFormState } from '../hooks/reports';
```

### מודולים עיקריים

#### `/src/components/index.ts`
ייבוא מרוכז לכל הקומפוננטים העיקריים לפי קטגוריות:
- Layout, Auth, Dashboard, Events, Reports, Users, Onboarding

#### `/src/hooks/auth-callback/index.ts`
כל ה-hooks וה-utilities של auth callback במקום אחד

#### `/src/hooks/reports/index.ts`  
כל ה-hooks הקשורים לדיווחים

#### `/src/services/index.ts`
כל השירותים: entity services, API client, Supabase

#### `/src/utils/index.ts`
כל הפונקציות העזר: encoding, RTL, notifications

#### `/src/components/reports/forms/index.ts`
כל רכיבי הטפסים של דיווחים

#### `/src/components/reports/fields/index.ts`
כל שדות הטפסים של דיווחים

## עקרונות ארגון הקוד

### 1. הפרדת אחריות
- כל תיקיה אחראית על תחום ספציפי
- קבצי index מרכזים יבוא
- הימנעות מחזרות תלות

### 2. שמות קבצים עקביים
- קומפוננטים: PascalCase (UserProfile.tsx)
- Hooks: camelCase מתחיל ב-use (useReportForm.ts)
- Utils: camelCase (notificationUtils.ts)
- Types: camelCase עם סיומת Types (reportFormTypes.ts)

### 3. תיקיות לפי פונקציונליות
```
components/
  auth/          - רכיבי אימות
  dashboard/     - רכיבי דשבורד
  events/        - רכיבי אירועים
  reports/       - רכיבי דיווחים
    forms/       - טפסי דיווחים
    fields/      - שדות טפסים
    tzohar/      - דיווחים ספציפיים לצהר
```

## הנחיות לפיתוח

### יבוא קבצים
1. השתמשו בקבצי index למודולים גדולים
2. יבוא יחסי (`../`) למודולים קרובים
3. יבוא מוחלט (`@/`) לשורש הפרויקט

### הוספת קומפוננטים חדשים
1. צרו את הקומפוננט בתיקיה המתאימה
2. עדכנו את קובץ ה-index של התיקיה
3. הוסיפו TypeScript types במידת הצורך

### הוספת hooks חדשים
1. צרו בתיקיית hooks המתאימה
2. עדכנו את hooks/[category]/index.ts
3. הוסיפו documentation למעלה בקובץ

## מידע נוסף

עבור מידע נוסף על הפרויקט, ראו:
- [README.md](../README.md) - מידע כללי על הפרויקט
- [action_plan.md](../action_plan.md) - תכנית העבודה
- [ui_ux_improvements.md](../ui_ux_improvements.md) - שיפורי ממשק משתמש