import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Sparkles, ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Premium — Coming soon | FlowStore',
  description: 'Premium plans for FlowStore are launching soon.',
};

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Flow<span className="text-primary">Store</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-soft border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Premium is coming soon
          </h1>
          <p className="text-fg-muted leading-relaxed mb-8">
            Paid plans and premium workflows are not available yet. Every free
            workflow is fully usable right now — browse, preview and download.
          </p>

          <Link
            href="/"
            className="inline-flex items-center px-5 py-3 bg-primary hover:bg-primary-hover text-primary-fg rounded-xl font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Browse free workflows
          </Link>
        </div>
      </main>
    </div>
  );
}
