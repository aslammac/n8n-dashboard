"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthShell from "@/components/auth/AuthShell";

function CallbackContent() {
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    if (token && refreshToken) {
      login(token, refreshToken);
    }
  }, [searchParams, login]);

  return (
    <AuthShell title="Signing you in…">
      <div className="flex flex-col items-center py-4">
        <span className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-sm text-fg-muted">
          Please wait while we finish authenticating.
        </p>
      </div>
    </AuthShell>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  );
}
