'use server';

import { getAuthenticatedAppForUser } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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
  const { auth } = await getAuthenticatedAppForUser();
  const user = auth.currentUser;

  if (!user) {
    return { success: false, error: 'You must be logged in to update your profile.' };
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
    const { updateProfile } = await import('firebase/auth');
    await updateProfile(user, {
      displayName: parsed.data.displayName,
    });
    revalidatePath('/profile');
    revalidatePath('/');
    return { success: true, error: null };
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to update profile.' };
  }
}
