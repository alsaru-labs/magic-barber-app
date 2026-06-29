"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, signOut, subscribeToAuthChanges } from "@/lib/services/auth";

export function useAdminAuth() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<any>({ user: { email: "admin@magicbarber.com" } });
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Bypass session check to allow free access
  useEffect(() => {
    setSession({ user: { email: "admin@magicbarber.com" } });
    setIsLoading(false);
  }, [pathname, router]);

  const handleSignOut = async () => {
    router.push("/admin");
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
