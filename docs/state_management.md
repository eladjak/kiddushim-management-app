# תשתית ניהול מצב וניהול נתונים

## אתגרים בניהול מצב הנוכחי

במערכת הנוכחית אנו מזהים מספר אתגרים בניהול המצב:
1. **גישה לא עקבית** - שימוש במספר שיטות לניהול מצב (Context API, useState, משתנים גלובליים)
2. **קשיים בסנכרון נתונים** - סנכרון לא עקבי של נתונים מול Supabase
3. **טיפול בשגיאות ומצבי טעינה** - אין טיפול אחיד בשגיאות ובמצבי טעינה
4. **מטמון לא יעיל** - אין ניהול מטמון אפקטיבי, מה שמוביל לבקשות חוזרות ובלתי הכרחיות
5. **קושי בטיפול בקוד עברי** - אתגרים מיוחדים בקידוד וטיפול בטקסט עברי

## ארכיטקטורת ניהול מצב מוצעת

### 1. React Query כמנגנון מרכזי

האפליקציה תשתמש ב-React Query (TanStack Query) כמנגנון מרכזי לניהול מצב שרת, עם היתרונות הבאים:
- **ניהול מטמון חכם** - מטמון חכם עם פעולות validating, invalidating, refetching וכו'
- **מצבי טעינה מובנים** - טיפול מובנה במצבי טעינה, שגיאות והצלחה
- **אופטימיזציות ביצועים** - פיצ׳רים מובנים כמו de-duplication, window focus refetching
- **חווית משתמש משופרת** - תמיכה ב-optimistic updates ו-infinite loading
- **עקביות וארגון** - מבנה אחיד לכל בקשות הנתונים

### 2. מבנה ארכיטקטורי לניהול המצב והנתונים

```
services/
  ├── api/           # שכבת API כללית
  │   ├── client.ts  # הגדרות בסיסיות לקריאות API
  │   └── utils.ts   # פונקציות עזר לבקשות API
  │
  ├── supabase/      # שירותי Supabase
  │   ├── client.ts  # יצירת Client
  │   ├── auth.ts    # שירותי אימות
  │   └── storage.ts # שירותי אחסון
  │
  ├── entity/        # שירותים לכל ישות נתונים
  │   ├── events.ts
  │   ├── users.ts
  │   ├── equipment.ts
  │   └── reports.ts
  │
  └── query/         # הגדרות React Query והוקים
      ├── hooks/     # custom hooks לשימוש בקומפוננטות
      ├── mutations/ # הגדרות mutations
      └── queries/   # הגדרות queries
```

## React Query - הגדרה ושימוש

### 1. הגדרת QueryClient

```typescript
// src/lib/react-query.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000 // 10 minutes
    },
  },
});
```

### 2. יצירת Provider בשורש האפליקציה

```typescript
// src/App.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/react-query';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* שאר האפליקציה */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}
```

### 3. דוגמה לשירות ישות

```typescript
// src/services/entity/events.ts
import { supabase } from '../supabase/client';
import type { Event, EventCreate, EventUpdate } from '@/types/events';

export const eventsService = {
  // קבלת כל האירועים
  async getAll() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
      
    if (error) throw error;
    return data;
  },
  
  // קבלת אירוע לפי מזהה
  async getById(id: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*, event_assignments(*), event_equipment(*, equipment(*))')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // יצירת אירוע חדש
  async create(event: EventCreate) {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // עדכון אירוע קיים
  async update(id: string, event: EventUpdate) {
    const { data, error } = await supabase
      .from('events')
      .update(event)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // מחיקת אירוע
  async delete(id: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  }
};
```

### 4. דוגמה להוקי React Query לאירועים

```typescript
// src/services/query/hooks/useEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '@/services/entity/events';
import type { Event, EventCreate, EventUpdate } from '@/types/events';
import { toast } from '@/components/ui/use-toast';

// קבועים לשימוש כמפתחות query
export const EVENTS_KEYS = {
  all: ['events'] as const,
  lists: () => [...EVENTS_KEYS.all, 'list'] as const,
  list: (filters: string) => [...EVENTS_KEYS.lists(), { filters }] as const,
  details: () => [...EVENTS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...EVENTS_KEYS.details(), id] as const,
};

// הוק לקבלת כל האירועים
export const useEvents = (filters = '') => {
  return useQuery({
    queryKey: EVENTS_KEYS.list(filters),
    queryFn: () => eventsService.getAll(),
    onError: (error: Error) => {
      toast({
        title: 'שגיאה בטעינת אירועים',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

// הוק לקבלת אירוע ספציפי
export const useEvent = (id: string) => {
  return useQuery({
    queryKey: EVENTS_KEYS.detail(id),
    queryFn: () => eventsService.getById(id),
    enabled: !!id,
    onError: (error: Error) => {
      toast({
        title: 'שגיאה בטעינת פרטי אירוע',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

// הוק ליצירת אירוע חדש
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newEvent: EventCreate) => eventsService.create(newEvent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.lists() });
      toast({
        title: 'אירוע נוצר בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה ביצירת אירוע',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

// הוק לעדכון אירוע
export const useUpdateEvent = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updatedEvent: EventUpdate) => eventsService.update(id, updatedEvent),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.lists() });
      toast({
        title: 'אירוע עודכן בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה בעדכון אירוע',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

// הוק למחיקת אירוע
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => eventsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.lists() });
      toast({
        title: 'אירוע נמחק בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה במחיקת אירוע',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};
```

### 5. דוגמה לשימוש בקומפוננטה

```tsx
// src/components/events/EventsList.tsx
import { useEvents } from '@/services/query/hooks/useEvents';
import { EventCard } from './EventCard';
import { Skeleton } from '@/components/ui/skeleton';

export const EventsList = () => {
  const { data: events, isLoading, isError, error } = useEvents();
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        שגיאה בטעינת אירועים: {error?.message}
      </div>
    );
  }
  
  if (!events?.length) {
    return (
      <div className="p-4 text-center">
        לא נמצאו אירועים.
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};
```

## טיפול בבעיות טקסט עברי

### אתגרים בטיפול בטקסט עברי

הטיפול בטקסט עברי מציב אתגרים ייחודיים, במיוחד בעבודה מול Supabase:
1. **כיוון טקסט**: טקסט עברי נכתב מימין לשמאל, בניגוד ל-LTR של אנגלית
2. **קידוד תווים**: לפעמים יש בעיות בקידוד תווים עבריים בתקשורת HTTP
3. **מיקום סימני פיסוק**: בטקסט עברי סימני פיסוק מופיעים באופן שונה
4. **מיזוג בין עברית ואנגלית**: לעתים קרובות, יש שילוב של טקסט עברי ואנגלי

### פתרונות מוצעים

#### 1. שימוש ב-Middleware לטיפול בטקסט עברי

```typescript
// src/services/api/middleware/hebrew.ts
import type { ApiResponse } from '@/types/api';

/**
 * מידלוור לטיפול בטקסט עברי לפני שליחה לשרת
 */
export const hebrewRequestMiddleware = <T>(data: T): T => {
  // אם הנתונים אינם אובייקט, החזר אותם כמו שהם
  if (!data || typeof data !== 'object') return data;
  
  // עבור על כל השדות
  const result = { ...data } as T;
  
  Object.entries(data).forEach(([key, value]) => {
    // טיפול רקורסיבי באובייקטים מקוננים
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      (result as any)[key] = hebrewRequestMiddleware(value);
    } 
    // טיפול במערכים
    else if (Array.isArray(value)) {
      (result as any)[key] = value.map(item => 
        typeof item === 'object' ? hebrewRequestMiddleware(item) : item
      );
    }
    // טיפול בטקסט עברי
    else if (typeof value === 'string') {
      // תיקון שדות טקסט אם נדרש
      (result as any)[key] = value;
    }
  });
  
  return result;
};

/**
 * מידלוור לטיפול בטקסט עברי בתשובה מהשרת
 */
export const hebrewResponseMiddleware = <T>(response: ApiResponse<T>): ApiResponse<T> => {
  if (!response.data) return response;
  
  if (Array.isArray(response.data)) {
    response.data = response.data.map(item => 
      typeof item === 'object' ? handleHebrewInObject(item) : item
    ) as T;
  } else if (typeof response.data === 'object') {
    response.data = handleHebrewInObject(response.data as Record<string, any>) as T;
  }
  
  return response;
};

/**
 * טיפול בטקסט עברי בשדות אובייקט
 */
function handleHebrewInObject<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  
  Object.entries(obj).forEach(([key, value]) => {
    // טיפול רקורסיבי באובייקטים מקוננים
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = handleHebrewInObject(value);
    } 
    // טיפול במערכים
    else if (Array.isArray(value)) {
      result[key] = value.map(item => 
        typeof item === 'object' ? handleHebrewInObject(item) : item
      );
    }
    // טיפול בטקסט עברי
    else if (typeof value === 'string') {
      // תיקון שדות טקסט אם נדרש
      result[key] = value;
    }
  });
  
  return result;
}
```

#### 2. יצירת שכבה ייעודית לתמיכה ב-RTL ובעברית

```typescript
// src/lib/rtl/utils.ts

/**
 * פונקציה לבדיקה אם טקסט מכיל תווים עבריים
 */
export const containsHebrew = (text: string): boolean => {
  const hebrewPattern = /[\u0590-\u05FF]/;
  return hebrewPattern.test(text);
};

/**
 * פונקציה לקביעת כיוון טקסט אוטומטית
 */
export const getTextDirection = (text: string): 'rtl' | 'ltr' => {
  if (!text) return 'rtl'; // ברירת מחדל היא RTL
  
  // בדיקה האם התו הראשון הוא עברי
  return containsHebrew(text.charAt(0)) ? 'rtl' : 'ltr';
};

/**
 * פונקציה להבטחת הצגה נכונה של טקסט מעורב (עברית ואנגלית)
 */
export const formatMixedText = (text: string): string => {
  if (!text) return '';
  
  // הוספת תגי HTML אם נדרש להבטחת כיוון נכון
  // זו דוגמה פשוטה - במציאות יש להשתמש בספריות כמו react-i18next
  return text;
};
```

## יתרונות הגישה המוצעת

### 1. ארגון ותחזוקתיות
- **מבנה ברור ומודולרי** - הפרדה בין שכבות והיררכיה מובנת
- **הפרדת אחריות** - כל שכבה אחראית על תפקיד מוגדר
- **קוד יותר תחזוקתי** - קל להרחיב ולשנות שירותים ספציפיים

### 2. שיפור חווית המשתמש
- **תצוגת מצבי טעינה** - הצגה ברורה של טעינת נתונים
- **טיפול מובנה בשגיאות** - תצוגת שגיאות בצורה ידידותית
- **תצוגה מידית** - שימוש במטמון חכם לתצוגה מהירה של נתונים

### 3. שיפור ביצועים
- **הפחתת בקשות מיותרות** - בזכות מטמון חכם
- **אופטימיזציה בצד הלקוח** - שימוש ב-stale-while-revalidate
- **ניהול מטמון חכם** - עדכונים אוטומטיים של המטמון בהתאם לפעולות משתמש

## סיכום ושלבי יישום

### שלב 1: התקנת ספריות וקונפיגורציה
1. התקנת React Query והגדרת QueryClient
2. הגדרת מידלוור וכלים לטיפול בטקסט עברי
3. הגדרה מחדש של client ל-Supabase

### שלב 2: בניית שכבת שירותים
1. יצירת שכבת שירותים לכל ישות
2. אינטגרציה עם Supabase
3. הוספת טיפול בשגיאות עקבי

### שלב 3: בניית שכבת React Query
1. יצירת hooks ספציפיים לכל ישות
2. הגדרות Queries ו-Mutations
3. אינטגרציה עם UI למצבי טעינה ושגיאות

### שלב 4: שילוב בקומפוננטות
1. הסבת קומפוננטות לשימוש בהוקים החדשים
2. הוספת מצבי טעינה ושגיאות
3. בדיקת סנכרון נתונים ועדכונים בזמן אמת

הגישה המוצעת מספקת בסיס איתן לניהול מצב באפליקציה, תוך שימוש בכלים וטכניקות מודרניים שיקלו על התחזוקה והרחבת האפליקציה בעתיד. 