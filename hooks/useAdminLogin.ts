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

  // Check session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const session = await getSession();
        if (session) {
          router.push("/admin/dashboard");
        }
      } catch (err) {
        console.error("Auth check error:", err);
      }
    };
    checkActiveSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signIn(email, password);
      router.push("/admin/dashboard");
    } catch (err: any) {
      setErrorMessage("Credenciales incorrectas. Por favor, verifica tu correo y contraseña.");
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
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
