
import { supabase } from './client';

export const setupStorage = async () => {
  try {
    // First check if the avatars bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      throw bucketsError;
    }

    const avatarsBucketExists = buckets.some(bucket => bucket.name === 'avatars');

    if (!avatarsBucketExists) {
      // Create the avatars bucket if it doesn't exist
      const { error: createError } = await supabase
        .storage
        .createBucket('avatars', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 2, // 2MB
        });

      if (createError) {
        console.error("Error creating bucket:", createError);
        throw createError;
      }
      
      console.log("Avatars bucket created successfully");
      
      // Ensure public access for the bucket
      const { error: policyError } = await supabase
        .storage
        .from('avatars')
        .createSignedUrl('dummy.txt', 1); // This is just to trigger policy check
        
      if (policyError && !policyError.message.includes('not found')) {
        console.error("Warning: You may need to set up storage policies for the avatars bucket");
      }
    } else {
      console.log("Avatars bucket already exists");
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
