# קידושישי - מערכת ניהול לארגון

<p align="center">
  <img src="docs/assets/kidushishi-logo.png" alt="לוגו קידושישי" width="200"/>
</p>

מערכת "קידושישי" היא פלטפורמה לניהול ארגון התנדבותי המאפשרת ניהול משתמשים, אירועים, ציוד, דיווחים ומשובים, עם תמיכה מלאה בעברית ו-RTL.

## 🌟 תכונות מרכזיות

- **ניהול אירועים** - יצירה, עריכה ומעקב אחר אירועים
- **ניהול משתמשים** - אימות, הרשאות, פרופילים ותפקידים שונים
- **ניהול ציוד** - מעקב אחר ציוד וסטטוס
- **דיווחים ומשובים** - מערכת לדיווחים ומשובים על אירועים
- **תמיכה מלאה בעברית** - ממשק מלא בעברית עם תמיכה בכיוון RTL

## 📋 פרויקטים

### פרויקט שדרוג האפליקציה הקיימת

הפרויקט עוסק בשדרוג מפיתוח מבוסס Lovable לפיתוח עצמאי.
המטרה היא להשיג שליטה טובה יותר בקוד, לשפר את יכולות האפליקציה ולשדרג את חוויית המשתמש.

#### 📂 תיעוד פרויקט השדרוג

- **[docs/project_documentation.md](docs/project_documentation.md)** - תיעוד מקיף של המערכת הנוכחית
- **[docs/improvement_plan.md](docs/improvement_plan.md)** - תכנית שדרוג מפורטת
- **[docs/directory_structure.md](docs/directory_structure.md)** - מבנה התיקיות המוצע
- **[docs/ui_ux_improvements.md](docs/ui_ux_improvements.md)** - תכנית שיפורי ממשק וחוויית משתמש
- **[docs/state_management.md](docs/state_management.md)** - ארכיטקטורת ניהול מצב מוצעת
- **[docs/auth_permissions.md](docs/auth_permissions.md)** - מערכת אימות והרשאות מוצעת
- **[docs/action_plan.md](docs/action_plan.md)** - תכנית פעולה מסכמת

### פרויקט קידושישי 2025 🆕

פרויקט "קידושישי 2025" הוא יוזמה חדשה ליצירת מסורת קהילתית של קבלות שבת במגדל העמק.
הפרויקט ישתמש במערכת המשודרגת ויוסיף מודולים ייעודיים לניהול הפעילות.

#### 📂 תיעוד פרויקט קידושישי 2025

- **[docs/kidushishi_2025/index.md](docs/kidushishi_2025/index.md)** - אינדקס ותקציר המסמכים
- **[docs/kidushishi_2025/general_plan.md](docs/kidushishi_2025/general_plan.md)** - תוכנית עבודה כללית
- **[docs/kidushishi_2025/service_girls_plan.md](docs/kidushishi_2025/service_girls_plan.md)** - תכנית בנות השירות
- **[docs/kidushishi_2025/yearly_schedule.md](docs/kidushishi_2025/yearly_schedule.md)** - לוח שנתי מפורט
- **[docs/kidushishi_2025/app_specification.md](docs/kidushishi_2025/app_specification.md)** - אפיון אפליקציית ניהול

(ועוד מסמכים נוספים בתיקייה docs/kidushishi_2025/)

## 🚀 שלבי פיתוח

1. **שדרוג האפליקציה** (13-18 שבועות)
   - הכנה וארגון מחדש של הקוד
   - שדרוג תשתיות ומערכת ניהול מצב
   - שדרוג ממשק משתמש וחוויית משתמש
   - פיתוח תכונות חדשות
   - בדיקות, תיעוד והטמעה

2. **פיתוח מודול קידושישי 2025** (במקביל לשלבי השדרוג)
   - אפיון ועיצוב UI/UX
   - פיתוח גרסת בטא בסיסית
   - בדיקות והטמעת משוב
   - פיתוח פונקציונליות מלאה
   - השקה ותמיכה 

## 💻 טכנולוגיות

הפרויקט ישתמש בטכנולוגיות הבאות:

- **Frontend**: React, TypeScript, Vite
- **UI**: TailwindCSS, shadcn-ui
- **ניהול מצב**: React Query
- **בסיס נתונים**: Supabase
- **אימות**: Supabase Auth
- **הרשאות**: RBAC (Role-Based Access Control)
- **פורמים**: React Hook Form, Zod

## 🛠️ התקנה והרצה מקומית

```bash
# שכפול המאגר
git clone https://github.com/eladjak/kidushishi-menegment-app.git

# מעבר לתיקיית הפרויקט
cd kidushishi-menegment-app

# התקנת תלויות
npm install

# הגדרת משתני סביבה
# העתק את קובץ .env.example ל-.env והגדר את המשתנים הדרושים

# הרצת סביבת פיתוח
npm run dev
```

## 🧪 בדיקות

```bash
# הרצת בדיקות
npm test

# הרצת בדיקות עם כיסוי
npm run test:coverage
```

## 📚 תיעוד

לתיעוד מפורט יותר:

1. ראה את התיקייה `docs/` עבור תיעוד מפורט
2. בדוק את הדף `/documentation` באפליקציה עצמה (דורש הרשאות)

## 🤝 תרומה לפרויקט

אנו מעריכים כל תרומה לפרויקט. אם ברצונך לתרום:

1. צור fork למאגר
2. צור ענף לתכונה (`git checkout -b feature/amazing-feature`)
3. בצע commit לשינויים שלך (`git commit -m 'הוספת תכונה מדהימה'`)
4. דחוף לענף (`git push origin feature/amazing-feature`)
5. פתח בקשת משיכה (Pull Request)

## 📝 מעקב אחר התקדמות

עקוב אחר התקדמות הפרויקט ב-GitHub Projects או ב-Issues. ניתן לראות את לוח הפרויקט עם המשימות הנוכחיות והמתוכננות.

## 📜 רישיון

פרויקט זה מופץ תחת רישיון MIT. ראה את קובץ `LICENSE` למידע נוסף.

## 🙏 תודות

- למתנדבי ארגון קידושישי על תרומתם ומשובם
- לקהילת הקוד הפתוח על הכלים והספריות הנפלאים

---

פותח עבור ארגון קידושישי ©️ 2024
