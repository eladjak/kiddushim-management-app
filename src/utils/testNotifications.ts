
import { createNotification } from "./notificationUtils";

export const createTestNotifications = async (userId: string) => {
  if (!userId) return;
  
  await createNotification({
    userId,
    title: "ברוכים הבאים!",
    message: "ברוכים הבאים למערכת ניהול האירועים! לחצו כאן לסיור מודרך במערכת.",
    type: "system",
    link: "/docs",
  });
  
  await createNotification({
    userId,
    title: "אירוע חדש נוצר",
    message: "האירוע 'קידושישי - פרשת ויקרא' נוצר בהצלחה.",
    type: "event",
    link: "/events",
  });
  
  await createNotification({
    userId,
    title: "שובצת לאירוע",
    message: "שובצת לאירוע 'קידושישי - פרשת צו' ביום שישי הקרוב.",
    type: "assignment",
    link: "/events",
  });
  
  await createNotification({
    userId,
    title: "דיווח חדש",
    message: "התקבל דיווח חדש על האירוע האחרון.",
    type: "report",
    link: "/reports",
  });
};
