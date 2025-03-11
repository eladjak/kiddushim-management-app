
import { supabase } from './client';
import { logger } from '@/utils/logger';

export const setupStorage = async () => {
  try {
    // First check if the avatars bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      logger.error("Error listing buckets:", { error: bucketsError });
      return false;
    }

    // Check which buckets we need to create
    const requiredBuckets = ['avatars', 'event_posters', 'report_images'];
    const existingBuckets = buckets.map(bucket => bucket.name);
    
    // Create any missing buckets
    for (const bucketName of requiredBuckets) {
      if (!existingBuckets.includes(bucketName)) {
        logger.info(`Creating bucket: ${bucketName}`);
        try {
          const { error: createError } = await supabase
            .storage
            .createBucket(bucketName, {
              public: true,
              fileSizeLimit: 5 * 1024 * 1024, // 5MB
            });

          if (createError) {
            logger.error(`Error creating bucket ${bucketName}:`, { error: createError });
          } else {
            logger.info(`${bucketName} bucket created successfully`);
          }
        } catch (err) {
          logger.error(`Failed to create bucket ${bucketName}:`, { error: err });
        }
      } else {
        logger.info(`${bucketName} bucket already exists`);
      }
    }

    return true;
  } catch (error) {
    logger.error("Error setting up storage:", { error });
    return false;
  }
};

// Helper function to safely encode Hebrew text for storage
export const safeEncodeHebrew = (text: string): string => {
  if (!text) return '';
  // Use encodeURIComponent which properly handles Unicode characters
  return encodeURIComponent(text);
};

// Helper function to decode safely encoded Hebrew text
export const safeDecodeHebrew = (encodedText: string): string => {
  if (!encodedText) return '';
  try {
    return decodeURIComponent(encodedText);
  } catch (e) {
    logger.error("Error decoding text:", { error: e });
    return encodedText; // Return as-is if decoding fails
  }
};
