'use server';

import { getAuthenticatedAppForUser } from '@/lib/firebase-admin';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

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
  const { auth } = await getAuthenticatedAppForUser();
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
    return { error: e.message || 'Login failed.', success: false };
  }
  return redirect('/dashboard');
}

export async function signup(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const { auth } = await getAuthenticatedAppForUser();
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
    return { error: e.message, success: false };
  }

  return redirect('/dashboard');
}

export async function logout() {
  const { auth } = await getAuthenticatedAppForUser();
  await auth.signOut();
  redirect('/login');
}
