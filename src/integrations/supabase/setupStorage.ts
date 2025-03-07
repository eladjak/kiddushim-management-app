
import { supabase } from './client';

export const setupStorage = async () => {
  try {
    // First check if the avatars bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
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
    }

    return true;
  } catch (error) {
    console.error("Error setting up storage:", error);
    return false;
  }
};
