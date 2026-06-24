"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, signOut, subscribeToAuthChanges } from "@/lib/services/auth";

export function useAdminAuth() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check auth session
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const activeSession = await getSession();
        setSession(activeSession);
        
        if (!activeSession && pathname.startsWith("/admin/dashboard")) {
          router.push("/admin");
        }
      } catch (err) {
        console.error("Layout auth get session error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { unsubscribe } = subscribeToAuthChanges((currentSession) => {
      setSession(currentSession);
      if (!currentSession && pathname.startsWith("/admin/dashboard")) {
        router.push("/admin");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [pathname, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/admin");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return {
    session,
    isLoading,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    handleSignOut,
    pathname
  };
}
