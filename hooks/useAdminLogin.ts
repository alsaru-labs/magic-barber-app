"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "@/lib/services/auth";

export function useAdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check session on mount disabled for mock access
  useEffect(() => {
    // Let user see the beautiful login page and login with any credentials
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // Mock login bypass - accepts any email/password immediately
    setTimeout(() => {
      setIsLoading(false);
      router.push("/admin/dashboard");
    }, 600);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    errorMessage,
    handleLogin
  };
}
