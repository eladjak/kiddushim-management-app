
# מדריך אבטחה לפרויקט קידושישי
# Security Guidelines for Kidushishi Project

## תוכן עניינים / Table of Contents
1. [הנחיות OWASP / OWASP Guidelines](#owasp-guidelines)
2. [הרשאות משתמשים / User Access Control](#user-access-control)
3. [הגבלת פניות לבסיס הנתונים / Database Rate Limiting](#database-rate-limiting)
4. [Prepared Statements](#prepared-statements)
5. [הטמעת Captcha / CAPTCHA Implementation](#captcha-implementation)
6. [הגנת WAF / WAF Protection](#waf-protection)
7. [דרישות ספקים / Vendor Requirements](#vendor-requirements)
8. [אבטחת LLM / LLM Security](#llm-security)

<a name="owasp-guidelines"></a>
## 1. הנחיות OWASP / OWASP Guidelines

### עברית
פרויקט קידושישי יאמץ את הנחיות האבטחה של OWASP (פרויקט אבטחת יישומי אינטרנט פתוחים), בדגש על אמצעי הגנה מפני 10 פרצות האבטחה המובילות:

1. **הזרקת קוד (Injection)**: שימוש ב-Prepared Statements בכל תקשורת עם בסיס הנתונים Supabase.
2. **אימות שבור (Broken Authentication)**: יישום מערכת אימות חזקה עם תמיכה ב-2FA ומדיניות סיסמאות חזקה.
3. **חשיפת מידע רגיש (Sensitive Data Exposure)**: הצפנת כל המידע הרגיש בשכבת ה-Database.
4. **XXE (XML External Entities)**: מניעת עיבוד XML חיצוני בכל רכיבי המערכת.
5. **בקרת גישה שבורה (Broken Access Control)**: יישום מערכת הרשאות רב-שכבתית ואכיפת RLS (Row Level Security) בבסיס הנתונים.
6. **תצורת אבטחה שגויה (Security Misconfiguration)**: סקירה תקופתית של הגדרות אבטחה, שימוש בסריקות אוטומטיות.
7. **XSS (Cross-Site Scripting)**: סניטציה של כל קלט משתמש, שימוש ב-Content Security Policy.
8. **Deserialisation לא בטוח (Insecure Deserialisation)**: יישום בדיקות סדרה הפוכה בטוחה בכל מקום שנדרש.
9. **שימוש ברכיבים עם פגיעויות ידועות (Using Components with Known Vulnerabilities)**: סריקה תקופתית של תלויות וספקים.
10. **רישום ובקרה לא מספקים (Insufficient Logging & Monitoring)**: יישום רישום מקיף ומערכת ניטור אבטחה.

### English
The Kidushishi project will adopt OWASP (Open Web Application Security Project) security guidelines, focusing on mitigating the top 10 security vulnerabilities:

1. **Injection**: Using Prepared Statements for all Supabase database communications.
2. **Broken Authentication**: Implementing robust authentication with 2FA support and strong password policies.
3. **Sensitive Data Exposure**: Encrypting all sensitive information at the database layer.
4. **XML External Entities (XXE)**: Preventing external XML processing in all system components.
5. **Broken Access Control**: Implementing multi-layered permission system and enforcing Row Level Security (RLS) in the database.
6. **Security Misconfiguration**: Regular security configuration reviews and automated scanning.
7. **Cross-Site Scripting (XSS)**: Sanitizing all user input and implementing Content Security Policy.
8. **Insecure Deserialisation**: Implementing secure deserialization checks wherever required.
9. **Using Components with Known Vulnerabilities**: Regular scanning of dependencies and vendors.
10. **Insufficient Logging & Monitoring**: Implementing comprehensive logging and security monitoring.

<a name="user-access-control"></a>
## 2. הרשאות משתמשים / User Access Control

### עברית
מערכת הרשאות המשתמש תיאכף בשתי שכבות:

1. **שכבת האפליקציה**: בדיקות הרשאה בצד השרת לפני ביצוע פעולות בבסיס הנתונים.
2. **שכבת בסיס הנתונים**: שימוש ב-Row Level Security (RLS) של Supabase להגבלת גישה ברמת המידע.

**הרמות המוגדרות**:
- **מנהל (admin)**: גישה מלאה לכל הנתונים והתכונות.
- **רכז (coordinator)**: ניהול אירועים, משתמשים וציוד.
- **מתנדב נוער (youth_volunteer)**: צפייה ועדכון מוגבל של אירועים ושל התיעוד שלהם.
- **בת שירות (service_girl)**: צפייה ועדכון מוגבל של אירועים ושל התיעוד שלהם.

לכל הרשאה יוגדרו תפקידים ספציפיים עם Row Level Security בבסיס הנתונים.

### English
User permissions will be enforced in two layers:

1. **Application Layer**: Permission checks on the server-side before performing database operations.
2. **Database Layer**: Using Supabase Row Level Security (RLS) to restrict access at the data level.

**Defined Roles**:
- **Admin**: Full access to all data and features.
- **Coordinator**: Management of events, users, and equipment.
- **Youth Volunteer**: Limited viewing and updating of events and their documentation.
- **Service Girl**: Limited viewing and updating of events and their documentation.

Each permission will have specific roles defined with Row Level Security in the database.

<a name="database-rate-limiting"></a>
## 3. הגבלת פניות לבסיס הנתונים / Database Rate Limiting

### עברית
למניעת התקפות DoS (מניעת שירות) ולמיטוב ביצועים, יוטמעו מגבלות פניות לבסיס הנתונים:

1. **הגבלה ברמת האפליקציה**:
   - מקסימום 100 בקשות לדקה למשתמש בודד (ניתן לשינוי לפי צורך).
   - מימוש באמצעות Edge Function ב-Supabase שיעקוב אחר פניות משתמשים.

2. **הגבלה ברמת בסיס הנתונים**:
   - הגדרת פונקציות RLS שבודקות כמות פניות בפרק זמן נתון.
   - חסימה זמנית של משתמשים שחורגים ממכסת הפניות.

3. **ניטור**:
   - לוג פעולות DB על כל פנייה שחורגת ממכסת הפניות הרגילה.
   - התראות בזמן אמת למנהלי המערכת על פעילות חריגה.

### English
To prevent DoS (Denial of Service) attacks and optimize performance, database rate limiting will be implemented:

1. **Application Level Limiting**:
   - Maximum 100 requests per minute per single user (adjustable as needed).
   - Implementation via Supabase Edge Function that tracks user requests.

2. **Database Level Limiting**:
   - Defining RLS functions that check the number of requests in a given time period.
   - Temporary blocking of users who exceed the request quota.

3. **Monitoring**:
   - DB action logging for any request that exceeds the normal request quota.
   - Real-time alerts to system administrators about unusual activity.

<a name="prepared-statements"></a>
## 4. Prepared Statements

### עברית
לכל פנייה לבסיס הנתונים נשתמש ב-Prepared Statements כדי למנוע התקפות הזרקת SQL:

1. **שימוש ב-Supabase SDK**: 
   ```typescript
   // לא בטוח - אין להשתמש בצורה זו
   const query = `SELECT * FROM users WHERE name = '${userInput}'`;
   
   // בטוח - להשתמש תמיד בצורה הזו
   const { data } = await supabase
     .from('users')
     .select('*')
     .eq('name', userInput);
   ```

2. **פונקציות מותאמות**:
   - יצירת פונקציות עטיפה לפעולות DB נפוצות לוודא שימוש נכון.
   - סניטציה של כל קלט לפני העברתו ל-query.

3. **בדיקות אבטחה**:
   - סריקה אוטומטית של קוד למציאת SQL queries שאינם משתמשים ב-prepared statements.

### English
For all database queries, we will use Prepared Statements to prevent SQL injection attacks:

1. **Using Supabase SDK**: 
   ```typescript
   // Unsafe - don't use this way
   const query = `SELECT * FROM users WHERE name = '${userInput}'`;
   
   // Safe - always use this way
   const { data } = await supabase
     .from('users')
     .select('*')
     .eq('name', userInput);
   ```

2. **Custom Functions**:
   - Creating wrapper functions for common DB operations to ensure proper usage.
   - Sanitizing all input before passing it to a query.

3. **Security Tests**:
   - Automated code scanning to find SQL queries that don't use prepared statements.

<a name="captcha-implementation"></a>
## 5. הטמעת Captcha / CAPTCHA Implementation

### עברית
כדי למנוע התקפות אוטומטיות, נטמיע CAPTCHA בכל טופס במערכת:

1. **שימוש ב-reCAPTCHA של Google**:
   - הטמעה ב-v3 שאינה פולשנית למשתמש אך מספקת אבטחה.
   - אימות שרת צד-שרת של תגובת ה-CAPTCHA לפני ביצוע פעולות רגישות.

2. **מיקום**:
   - טפסי הרשמה והתחברות.
   - טפסי יצירה ועריכה של אירועים.
   - טפסי דיווח ומשוב.
   - כל ממשק המאפשר שינוי מידע משמעותי.

3. **התאמה למובייל**:
   - ממשק CAPTCHA מותאם למכשירים ניידים.
   - אופציות נגישות למשתמשים עם מוגבלויות.

### English
To prevent automated attacks, we will implement CAPTCHA in every form in the system:

1. **Using Google reCAPTCHA**:
   - Implementing v3 which is non-intrusive for users but provides security.
   - Server-side verification of CAPTCHA responses before performing sensitive operations.

2. **Placement**:
   - Registration and login forms.
   - Event creation and editing forms.
   - Reporting and feedback forms.
   - Any interface that allows significant data changes.

3. **Mobile Adaptation**:
   - CAPTCHA interface adapted for mobile devices.
   - Accessibility options for users with disabilities.

<a name="waf-protection"></a>
## 6. הגנת WAF / WAF Protection

### עברית
נשלב Web Application Firewall (WAF) להגנה נוספת:

1. **הטמעת Cloudflare**:
   - סינון בקשות זדוניות.
   - הגנה מפני התקפות DDoS.
   - הגנת Bot.

2. **כללי סינון מותאמים**:
   - חסימת IP שמבצעים בקשות חשודות.
   - זיהוי ומניעת פעילות חשודה (הזרקת SQL, XSS).
   - זיהוי גיאוגרפי של בקשות והגבלה לפי צורך.

3. **ניטור וניתוח**:
   - ניתוח דפוסי תעבורה לזיהוי איומים.
   - דוחות אבטחה תקופתיים.

### English
We will integrate a Web Application Firewall (WAF) for additional protection:

1. **Implementing Cloudflare**:
   - Filtering malicious requests.
   - Protection against DDoS attacks.
   - Bot protection.

2. **Custom Filtering Rules**:
   - Blocking IPs that make suspicious requests.
   - Identifying and preventing suspicious activity (SQL injection, XSS).
   - Geographic identification of requests and limitation as needed.

3. **Monitoring and Analysis**:
   - Traffic pattern analysis for threat identification.
   - Periodic security reports.

<a name="vendor-requirements"></a>
## 7. דרישות ספקים / Vendor Requirements

### עברית
נעבוד רק עם ספקים העומדים בתקני אבטחה מחמירים:

1. **תקינה נדרשת**:
   - ISO27001 - תקן בינלאומי לניהול אבטחת מידע.
   - SOC 2 Type II - תקן לבקרות ארגוניות על אבטחה, זמינות, עיבוד, שלמות וסודיות.

2. **מדיניות פרטיות ותיקוני באגים**:
   - מדיניות פרטיות ברורה ושקופה.
   - מחויבות לתיקון באגי אבטחה בזמן סביר.
   - עדכוני אבטחה תקופתיים.

3. **בדיקת ספקים**:
   - תהליך אישור ספקים לפני שילובם במערכת.
   - הערכה תקופתית של ספקים קיימים.

### English
We will only work with vendors who meet strict security standards:

1. **Required Standards**:
   - ISO27001 - International standard for information security management.
   - SOC 2 Type II - Standard for organizational controls on security, availability, processing, integrity, and confidentiality.

2. **Privacy Policy and Bug Fixes**:
   - Clear and transparent privacy policy.
   - Commitment to fixing security bugs in a reasonable time.
   - Periodic security updates.

3. **Vendor Assessment**:
   - Vendor approval process before integration into the system.
   - Periodic evaluation of existing vendors.

<a name="llm-security"></a>
## 8. אבטחת LLM / LLM Security

### עברית
אם האפליקציה תשלב מודלי שפה גדולים (LLMs), נטמיע אמצעי אבטחה ייעודיים:

1. **הגנה מפני פרומפט אינג'קשן (Prompt Injection)**:
   - סניטציה של קלט משתמש לפני העברה ל-LLM.
   - הגבלת הרשאות הפעולה של ה-LLM.

2. **הגנה על מידע פרטי**:
   - סינון מידע רגיש מהתגובות של ה-LLM.
   - הגבלת גישה למידע רגיש.

3. **ניטור תוכן**:
   - בדיקת תוכן שנוצר ע"י LLM לזיהוי תוכן לא הולם.
   - לוג של כל האינטראקציות עם ה-LLM.

### English
If the application integrates Large Language Models (LLMs), we will implement dedicated security measures:

1. **Protection against Prompt Injection**:
   - Sanitizing user input before passing to the LLM.
   - Limiting the action permissions of the LLM.

2. **Protection of Private Information**:
   - Filtering sensitive information from LLM responses.
   - Limiting access to sensitive information.

3. **Content Monitoring**:
   - Checking content created by LLM to identify inappropriate content.
   - Logging all interactions with the LLM.

---

## יישום / Implementation

תכנית האבטחה הזו תיושם בשלבים:

1. **שלב 1**: הטמעת RLS והרשאות משתמשים.
2. **שלב 2**: הוספת CAPTCHA לטפסים ווידוא Prepared Statements.
3. **שלב 3**: הטמעת WAF והגבלת קצב פניות.
4. **שלב 4**: בחינת ספקים והטמעת אבטחת LLM (אם רלוונטי).

This security plan will be implemented in phases:

1. **Phase 1**: Implementation of RLS and user permissions.
2. **Phase 2**: Adding CAPTCHA to forms and ensuring Prepared Statements.
3. **Phase 3**: Implementing WAF and rate limiting.
4. **Phase 4**: Vendor review and LLM security implementation (if relevant).
