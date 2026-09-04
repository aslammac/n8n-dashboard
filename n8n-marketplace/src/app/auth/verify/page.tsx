"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { CheckCircle2, XCircle } from "lucide-react";
import api from "@/lib/api";
import AuthShell from "@/components/auth/AuthShell";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }
    const verify = async () => {
      try {
        await api.get(`/auth/verify?token=${token}`);
        setStatus("success");
        Cookies.remove("token");
        Cookies.remove("refreshToken");
        setTimeout(() => router.push("/auth/login"), 3000);
      } catch (err) {
        setStatus("error");
        setMessage(
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "Verification failed.",
        );
      }
    };
    verify();
  }, [token, router]);

  return (
    <AuthShell title="Email verification">
      <div className="text-center">
        {status === "verifying" && (
          <div className="flex flex-col items-center py-4">
            <span className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin" />
            <p className="mt-4 text-sm text-fg-muted">Verifying your email…</p>
          </div>
        )}
        {status === "success" && (
          <div className="flex flex-col items-center py-2">
            <CheckCircle2 className="w-12 h-12 text-success mb-3" />
            <p className="font-medium">Email verified.</p>
            <p className="mt-1 text-sm text-fg-subtle">Redirecting to sign in…</p>
          </div>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center py-2">
            <XCircle className="w-12 h-12 text-danger mb-3" />
            <p className="font-medium text-danger">{message}</p>
            <Link
              href="/auth/login"
              className="mt-4 text-sm font-medium text-primary hover:text-primary-hover"
            >
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </AuthShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}
