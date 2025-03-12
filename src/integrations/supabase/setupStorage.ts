import { supabase } from "./client";
import { logger } from "@/utils/logger";

/**
 * Safe encode Hebrew text to work around encoding issues
 */
export const safeEncodeHebrew = (text: string): string => {
  // Instead of using btoa which fails with non-Latin chars,
  // we'll use encodeURIComponent which handles Hebrew well
  return encodeURIComponent(text);
};

/**
 * Safe decode Hebrew text
 */
export const safeDecodeHebrew = (text: string): string => {
  try {
    return decodeURIComponent(text);
  } catch (e) {
    return text; // Return original if not encoded
  }
};

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
