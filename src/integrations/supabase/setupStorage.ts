
import { supabase } from './client';

export const setupStorage = async () => {
  try {
    // First check if the avatars bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      return false;
    }

    // Check which buckets we need to create
    const requiredBuckets = ['avatars', 'event_posters', 'report_images'];
    const existingBuckets = buckets.map(bucket => bucket.name);
    
    // Create any missing buckets
    for (const bucketName of requiredBuckets) {
      if (!existingBuckets.includes(bucketName)) {
        console.log(`Creating bucket: ${bucketName}`);
        try {
          const { error: createError } = await supabase
            .storage
            .createBucket(bucketName, {
              public: true,
              fileSizeLimit: 5 * 1024 * 1024, // 5MB
            });

          if (createError) {
            console.error(`Error creating bucket ${bucketName}:`, createError);
          } else {
            console.log(`${bucketName} bucket created successfully`);
          }
        } catch (err) {
          console.error(`Failed to create bucket ${bucketName}:`, err);
        }
      } else {
        console.log(`${bucketName} bucket already exists`);
      }
    }

    return true;
  } catch (error) {
    console.error("Error setting up storage:", error);
    return false;
  }
};

// Helper function to safely encode Hebrew text for storage
export const safeEncodeHebrew = (text: string): string => {
  // Instead of using btoa which fails with non-Latin characters,
  // we use encodeURIComponent which handles Unicode characters properly
  if (!text) return '';
  return encodeURIComponent(text);
};

// Helper function to decode safely encoded Hebrew text
export const safeDecodeHebrew = (encodedText: string): string => {
  if (!encodedText) return '';
  try {
    return decodeURIComponent(encodedText);
  } catch (e) {
    console.error("Error decoding text:", e);
    return encodedText; // Return as-is if decoding fails
  }
};
