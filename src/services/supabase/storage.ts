import { supabase } from './client';

/**
 * טיפוסים עבור שירותי אחסון
 */
export interface FileUploadOptions {
  bucket: string;
  path: string;
  file: File;
  fileOptions?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  };
}

/**
 * שירותי אחסון לעבודה עם Supabase Storage
 */
export const storageService = {
  /**
   * העלאת קובץ לאחסון
   */
  async uploadFile({ bucket, path, file, fileOptions }: FileUploadOptions) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        ...fileOptions,
      });

    if (error) throw error;
    return data;
  },

  /**
   * מחיקת קובץ מהאחסון
   */
  async deleteFile(bucket: string, path: string) {
    const { data, error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;
    return data;
  },

  /**
   * קבלת URL ציבורי לקובץ
   */
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * יצירת URL להורדה חתום עם הגבלת זמן
   */
  async createSignedUrl(bucket: string, path: string, expiresIn = 60) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data;
  },

  /**
   * קבלת רשימת קבצים בתיקייה
   */
  async listFiles(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) throw error;
    return data;
  },

  /**
   * יצירת מכל אחסון חדש
   */
  async createBucket(id: string, options: { public: boolean } = { public: false }) {
    const { data, error } = await supabase.storage.createBucket(id, options);

    if (error) throw error;
    return data;
  },

  /**
   * הורדת קובץ
   */
  async downloadFile(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) throw error;
    return data;
  },
}; 