"use client";

import React from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthShell from "@/components/auth/AuthShell";

const FIELD =
  "w-full rounded-xl px-4 py-3 bg-surface border border-border text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-colors text-sm";

export default function RegisterPage() {
  const { register } = useAuth();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [newsletter, setNewsletter] = React.useState(true);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(firstName, lastName, email, password, newsletter, false);
      setSuccess(true);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell title="Check your email">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-soft text-primary border border-primary/20 mb-4">
            <MailCheck className="h-6 w-6" />
          </div>
          <p className="text-sm text-fg-muted">
            We&apos;ve sent a verification link to <strong className="text-fg">{email}</strong>.
            Verify your account to continue.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block text-sm font-medium text-primary hover:text-primary-hover"
          >
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join the FlowStore community."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:text-primary-hover">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="text-danger text-sm text-center bg-danger/10 py-2 rounded-lg border border-danger/20">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={FIELD}
            placeholder="First name"
            aria-label="First name"
          />
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={FIELD}
            placeholder="Last name"
            aria-label="Last name"
          />
        </div>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={FIELD}
          placeholder="Email address"
          aria-label="Email address"
        />
        <input
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={FIELD}
          placeholder="Password"
          aria-label="Password"
        />
        <label className="flex items-start gap-2.5 text-sm text-fg-muted">
          <input
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
          />
          Subscribe to the newsletter for new workflows and updates
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-fg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
