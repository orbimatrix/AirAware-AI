'use server';

import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { firebaseConfig } from '@/firebase/config';

// Helper function to initialize Firebase app on the server if it doesn't exist.
// This is safe to call multiple times.
function getAuthInstance(): Auth {
  const app = !getApps().length
    ? initializeApp(firebaseConfig)
    : getApp();
  return getAuth(app);
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type AuthState = {
  error: string | null;
  success: boolean;
};

export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const auth = getAuthInstance();
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: 'Invalid email or password format.', success: false };
  }

  try {
    await signInWithEmailAndPassword(
      auth,
      parsed.data.email,
      parsed.data.password
    );
  } catch (e: any) {
    // Firebase provides error codes, but for simplicity, we'll use the message.
    return { error: e.message || 'Login failed.', success: false };
  }
  // On success, return success state. Redirect is handled by the client.
  return { error: null, success: true };
}

export async function signup(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const auth = getAuthInstance();
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: 'Invalid email or password format.', success: false };
  }

  try {
    await createUserWithEmailAndPassword(
      auth,
      parsed.data.email,
      parsed.data.password
    );
  } catch (e: any) {
    return { error: e.message || 'Signup failed.', success: false };
  }

  // On success, return success state. Redirect is handled by the client.
  return { error: null, success: true };
}

export async function logout() {
    // Since this is a server action, we just redirect.
    // The client-side `useUser` hook will detect the signed-out state.
    // In a real app, you would handle session invalidation here.
    // For this setup, we'll rely on client-side redirect after logout.
    // A more robust solution might involve clearing cookies if they were used for session management.
    return redirect('/login');
}
