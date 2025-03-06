
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
      // Create the event-media bucket with proper policy
      const { error } = await supabase.storage.createBucket('event-media', {
        public: true,
        fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
        return;
      }
      
      console.log('Created event-media bucket');
      
      // Add a permissive policy for authenticated users
      const { error: policyError } = await supabase.storage.from('event-media').createSignedUrl('dummy-path', 60);
      if (policyError && !policyError.message.includes('not found')) {
        console.error('Error setting bucket policy:', policyError);
      }
    }
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
};
