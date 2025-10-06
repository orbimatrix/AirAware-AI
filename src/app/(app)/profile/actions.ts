'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAuth, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Helper function to initialize Firebase app on the server if it doesn't exist.
function getAuthInstance() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  return getAuth(app);
}


const formSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
});

type ProfileState = {
  success: boolean;
  error: string | null;
};

export async function updateProfile(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const auth = getAuthInstance();
  
  // This action should only be called by an authenticated user.
  // We rely on the client to have the user session.
  const user = auth.currentUser;

  if (!user) {
    // This case should ideally not be hit if called from a protected route.
    // The `auth.currentUser` is often null on the server, so we must be cautious.
    // The client should handle the auth state and this action should receive the UID.
    // For now, we proceed assuming client-side checks prevent this.
    // A robust solution would involve verifying a session cookie or token.
  }

  const parsed = formSchema.safeParse({
    displayName: formData.get('displayName'),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(', '),
    };
  }

  try {
    // We need to get the user from the client-side and pass it to the action,
    // as auth.currentUser is not reliable in server actions.
    // However, for this fix, we will attempt to use it, acknowledging its limitations.
    // The `firebase/auth` `updateProfile` function needs the `User` object from the client SDK.
    // A better approach would be to use the Admin SDK to update the user by UID.
    // But sticking to client SDK as requested:

    if (!auth.currentUser) {
        return { success: false, error: 'Authentication state not found on the server. Please log in again.' };
    }

    await firebaseUpdateProfile(auth.currentUser, {
      displayName: parsed.data.displayName,
    });

    revalidatePath('/profile');
    revalidatePath('/'); // Revalidate root to update header if name is shown there
    return { success: true, error: null };
  } catch (e: any) {
    console.error('Profile update failed:', e);
    return { success: false, error: e.message || 'Failed to update profile.' };
  }
}
