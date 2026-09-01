"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, Sparkles, Infinity as InfinityIcon } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

// Display copy only — the charged amount comes from the Stripe Price you point
// STRIPE_PRO_PRICE_ID / STRIPE_LIFETIME_PRICE_ID at. Keep these in sync.
const PRO_PRICE = '$12';
const LIFETIME_PRICE = '$149';

type ApiError = { response?: { data?: { message?: string } } };

const FAQS = [
  {
    q: 'How does pricing work?',
    a: 'Free workflows are always free. Everything marked premium is unlocked by one plan — a monthly Pro subscription or a one-time Lifetime payment. There is no per-workflow price.',
  },
  {
    q: 'What is the difference between Pro and Lifetime?',
    a: 'Same access to every premium workflow. Pro bills monthly and can be cancelled anytime; Lifetime is a single payment with no recurring charge.',
  },
  {
    q: 'Do I need an account to download free workflows?',
    a: 'No — you can download up to 10 free workflows per month anonymously. Sign in for unlimited free downloads.',
  },
  {
    q: 'Can I cancel Pro?',
    a: 'Yes, from the billing portal. You keep premium access until the end of the period you already paid for.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Because premium content is delivered immediately, payments are generally final. If something is broken or misrepresented, contact us and we will make it right.',
  },
];

export default function PlansPage() {
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState<number | null>(0);
  const [busy, setBusy] = useState<'pro' | 'lifetime' | 'portal' | null>(null);
  const [notice, setNotice] = useState<'success' | 'cancelled' | null>(null);
  const [billing, setBilling] = useState<{ tier: string; hasPremium: boolean } | null>(null);

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('status');
    if (status === 'success' || status === 'cancelled') {
      setNotice(status);
      window.history.replaceState({}, '', '/plans');
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .get('/payments/billing')
      .then(({ data }) => setBilling(data))
      .catch(() => {});
  }, [isAuthenticated, notice]);

  const start = async (kind: 'pro' | 'lifetime' | 'portal') => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    setBusy(kind);
    try {
      const path =
        kind === 'pro'
          ? '/payments/subscribe'
          : kind === 'lifetime'
            ? '/payments/lifetime'
            : '/payments/portal';
      const { data } = await api.post(path);
      if (data?.url) window.location.href = data.url;
      else alert('Could not start checkout. Please try again.');
    } catch (error) {
      alert(
        (error as ApiError)?.response?.data?.message ||
          'Could not start checkout. Please try again.',
      );
    } finally {
      setBusy(null);
    }
  };

  const hasPremium = billing?.hasPremium;
  const currentTier = billing?.tier ?? user?.subscriptionTier;

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Flow<span className="text-primary">Store</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="px-4 py-2 border border-border bg-surface text-sm font-medium rounded-lg hover:bg-surface-2 transition-colors"
            >
              Browse
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-20 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            One plan, every premium workflow
          </h1>
          <p className="text-lg text-fg-muted">
            No per-workflow pricing. Subscribe monthly or pay once for lifetime
            access — either way you unlock the whole premium library.
          </p>
        </div>

        {notice === 'success' && (
          <div className="max-w-md mx-auto mb-10 text-center p-3 rounded-xl bg-success/10 border border-success/30 text-success text-sm">
            Payment received — premium access is active.
          </div>
        )}
        {notice === 'cancelled' && (
          <div className="max-w-md mx-auto mb-10 text-center p-3 rounded-xl bg-warning/10 border border-warning/30 text-warning text-sm">
            Checkout cancelled — you were not charged.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Free */}
          <div className="rounded-2xl p-8 flex flex-col border border-border bg-card">
            <h3 className="text-lg font-semibold mb-2">Free</h3>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-fg-subtle text-sm">forever</span>
            </div>
            <p className="text-fg-muted text-sm mb-6 leading-relaxed">
              The community library — browse, preview and download free workflows.
            </p>
            <ul className="space-y-3 mb-8 flex-grow">
              {[
                'Full workflow preview on the canvas',
                'Download without an account (10 / month)',
                'Unlimited free downloads when signed in',
                'Copy JSON straight into n8n',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-fg-muted">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/?isPremium=false"
              className="w-full py-3 px-4 rounded-xl font-medium text-center border border-border bg-surface hover:bg-surface-2 text-fg transition-colors"
            >
              Browse free workflows
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl p-8 flex flex-col border border-primary bg-card shadow-[0_0_0_1px_var(--primary)]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-fg text-xs font-semibold px-3 py-1 rounded-full">
              MOST FLEXIBLE
            </span>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Pro
            </h3>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold">{PRO_PRICE}</span>
              <span className="text-fg-subtle text-sm">/ month</span>
            </div>
            <p className="text-fg-muted text-sm mb-6 leading-relaxed">
              Every premium workflow while your subscription is active. Cancel
              anytime.
            </p>
            <ul className="space-y-3 mb-8 flex-grow">
              {[
                'Unlock all premium workflows',
                'Unlimited downloads',
                'New premium workflows included',
                'Cancel anytime from the billing portal',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-fg-muted">{f}</span>
                </li>
              ))}
            </ul>
            {hasPremium && currentTier === 'pro' ? (
              <button
                onClick={() => start('portal')}
                disabled={busy !== null}
                className="w-full py-3 px-4 rounded-xl font-medium text-center border border-border bg-surface hover:bg-surface-2 text-fg transition-colors disabled:opacity-60"
              >
                {busy === 'portal' ? 'Opening…' : 'Manage billing'}
              </button>
            ) : (
              <button
                onClick={() => start('pro')}
                disabled={busy !== null || hasPremium}
                className="w-full py-3 px-4 rounded-xl font-medium text-center bg-primary hover:bg-primary-hover text-primary-fg transition-colors disabled:opacity-60"
              >
                {hasPremium
                  ? 'You have premium access'
                  : busy === 'pro'
                    ? 'Redirecting…'
                    : isAuthenticated
                      ? 'Subscribe to Pro'
                      : 'Sign in to subscribe'}
              </button>
            )}
          </div>

          {/* Lifetime */}
          <div className="rounded-2xl p-8 flex flex-col border border-border bg-card">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <InfinityIcon className="w-4 h-4 text-primary" /> Lifetime
            </h3>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold">{LIFETIME_PRICE}</span>
              <span className="text-fg-subtle text-sm">one-time</span>
            </div>
            <p className="text-fg-muted text-sm mb-6 leading-relaxed">
              Pay once, keep premium access forever. No recurring charge.
            </p>
            <ul className="space-y-3 mb-8 flex-grow">
              {[
                'Everything in Pro',
                'One payment, no renewals',
                'All future premium workflows included',
                'Best value if you stay a while',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-fg-muted">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => start('lifetime')}
              disabled={busy !== null || hasPremium}
              className="w-full py-3 px-4 rounded-xl font-medium text-center border border-border bg-surface hover:bg-surface-2 text-fg transition-colors disabled:opacity-60"
            >
              {currentTier === 'lifetime'
                ? 'You own lifetime access'
                : hasPremium
                  ? 'You have premium access'
                  : busy === 'lifetime'
                    ? 'Redirecting…'
                    : isAuthenticated
                      ? 'Get lifetime access'
                      : 'Sign in to buy'}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-border border border-border rounded-2xl bg-card overflow-hidden">
            {FAQS.map((item, i) => (
              <div key={item.q}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-surface transition-colors"
                >
                  <span className="font-medium text-sm">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-fg-subtle flex-shrink-0 transition-transform ${
                      open === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {open === i && (
                  <p className="px-5 pb-4 text-sm text-fg-muted leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
