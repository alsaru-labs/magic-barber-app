import { supabase } from "@/lib/supabaseClient";

/**
 * Gets the current active session.
 */
export async function getSession(): Promise<any> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return session;
}

/**
 * Signs in a user using email and password.
 */
export async function signIn(email: string, password: string): Promise<any> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Signs out the current user.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * Subscribes to authentication state changes.
 * Returns an object with an unsubscribe function.
 */
export function subscribeToAuthChanges(callback: (session: any) => void): { unsubscribe: () => void } {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return {
    unsubscribe: () => {
      subscription.unsubscribe();
    }
  };
}
