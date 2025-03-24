/**
 * הגדרת פונקציות בסיסיות לקריאות API
 */

// אובייקט הגדרות ברירת מחדל
export const defaultOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
};

// בסיס URL עבור קריאות API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * פונקציה כללית לקריאות API
 * 
 * @param endpoint נקודת קצה (endpoint)
 * @param options אפשרויות בקשה
 * @returns תשובת הבקשה
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
  });

  // בדיקת מענה תקין
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `שגיאה בקריאת API: ${response.status}`);
  }

  // כאשר המענה ריק
  if (response.status === 204) {
    return {} as T;
  }

  // מענה תקין
  return await response.json();
}

/**
 * פונקציית עזר עבור בקשות GET
 */
export function get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * פונקציית עזר עבור בקשות POST
 */
export function post<T>(
  endpoint: string,
  data: unknown,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * פונקציית עזר עבור בקשות PUT
 */
export function put<T>(
  endpoint: string,
  data: unknown,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * פונקציית עזר עבור בקשות DELETE
 */
export function del<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
}

/**
 * פונקציית עזר עבור בקשות PATCH
 */
export function patch<T>(
  endpoint: string,
  data: unknown,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
} 