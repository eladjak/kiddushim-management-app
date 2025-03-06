
import { supabase } from "./client";

/**
 * Set up storage buckets if they don't exist
 */
export const setupStorage = async () => {
  try {
    // Check if the bucket already exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'event-media');
    
    if (!bucketExists) {
      // Create the event-media bucket
      const { error } = await supabase.storage.createBucket('event-media', {
        public: true,
        fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
      });
      
      if (error) throw error;
      console.log('Created event-media bucket');
    }
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
};
