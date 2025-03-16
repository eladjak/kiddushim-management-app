
import { supabase } from "./client";
import { logger } from "@/utils/logger";

/**
 * Safe encode Hebrew text to work around encoding issues
 * This function is now a no-op as we're handling Hebrew text directly
 */
export const safeEncodeHebrew = (text: string): string => {
  // Return text as-is instead of trying to encode it
  return text;
};

/**
 * Safe decode Hebrew text
 * This function is now a no-op as we're handling Hebrew text directly
 */
export const safeDecodeHebrew = (text: string): string => {
  // Return text as-is
  return text;
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
    const existingBucketNames = buckets.map(bucket => bucket.name);
    
    // Log which buckets already exist
    for (const bucketName of requiredBuckets) {
      if (existingBucketNames.includes(bucketName)) {
        logger.info(`${bucketName} bucket already exists`);
      }
    }
    
    // We won't attempt to create buckets from the client side anymore
    // as it's causing RLS policy violations. These need to be created
    // by an admin or through SQL migrations
    
    return true;
  } catch (error) {
    logger.error("Error setting up storage:", { error });
    return false;
  }
};
