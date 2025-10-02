import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { firebaseConfig } from '@/firebase/config';

async function getAuthenticatedAppForUser() {
  const idToken = await getIdToken();

  if (!idToken) {
    const app =
      getApps().find((a) => a.name === 'unauthenticated-session') ||
      initializeApp(
        {
          projectId: firebaseConfig.projectId,
        },
        'unauthenticated-session'
      );
    return { app, auth: getAuth(app) };
  }

  const app =
    getApps().find((a) => a.name === idToken.uid) ||
    initializeApp(
      {
        projectId: firebaseConfig.projectId,
      },
      idToken.uid
    );

  return { app, auth: getAuth(app) };
}

async function getIdToken() {
  const cookieStore = cookies();
  const session = cookieStore.get('firebase-session-cookie')?.value || '';
  if (!session) return null;

  const app =
    getApps().find((a) => a.name === 'auth-session') ||
    initializeApp(
      {
        projectId: firebaseConfig.projectId,
      },
      'auth-session'
    );
  const auth = getAuth(app);
  try {
    const decodedIdToken = await auth.verifySessionCookie(session, true);
    return decodedIdToken;
  } catch (error) {
    console.log('error verifying cookie', error);
    return null;
  }
}

export { getAuthenticatedAppForUser, getIdToken };
