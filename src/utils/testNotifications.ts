
import { createNotification } from "./notificationUtils";

export const createTestNotifications = async (userId: string) => {
  if (!userId) return;
  
  await createNotification({
    userId,
    content: "ברוכים הבאים למערכת ניהול האירועים! לחצו כאן לסיור מודרך במערכת.",
    type: "system",
  });
  
  await createNotification({
    userId,
    content: "האירוע 'קידושישי - פרשת ויקרא' נוצר בהצלחה.",
    type: "event",
  });
  
  await createNotification({
    userId,
    content: "שובצת לאירוע 'קידושישי - פרשת צו' ביום שישי הקרוב.",
    type: "assignment",
  });
  
  await createNotification({
    userId,
    content: "התקבל דיווח חדש על האירוע האחרון.",
    type: "report",
  });
};
