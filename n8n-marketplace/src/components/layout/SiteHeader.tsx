"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { PRIMARY_NAV, SITE } from "@/data/site";
import { track, EVENTS } from "@/lib/analytics";

interface SiteHeaderProps {
  /** `transparent` sits over a hero backdrop until scrolled; `solid` always has a surface. */
  variant?: "solid" | "transparent";
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`text-lg font-semibold tracking-tight ${className}`}
      aria-label={`${SITE.name} home`}
    >
      <span className="text-primary">Flow</span>
      <span>Store</span>
    </Link>
  );
}

export default function SiteHeader({ variant = "solid" }: SiteHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (variant !== "transparent") return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  useEffect(() => setMenuOpen(false), [pathname]);

  const showSurface = variant === "solid" || scrolled;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        showSurface ? "glass-panel" : "border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Wordmark />
          <nav className="hidden md:flex items-center gap-6">
            {PRIMARY_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    active ? "text-fg" : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>


        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {user?.roles?.includes("admin") && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 border border-border bg-surface text-sm font-medium rounded-full hover:bg-surface-2 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}

              {/* User pill */}
              <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-border">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary uppercase">
                    {user?.firstName?.charAt(0) ?? "U"}
                  </span>
                </div>
                {/* Name + tier */}
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium">{user?.firstName}</span>
                  <span className="text-[10px] text-fg-subtle capitalize tracking-wide">
                    {user?.subscriptionTier}
                  </span>
                </div>
                {/* Sign out */}
                <button
                  onClick={logout}
                  title="Sign out"
                  className="ml-1 p-1.5 text-fg-muted hover:text-fg hover:bg-surface-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => track(EVENTS.ctaClicked, { location: "header" })}
                className="hidden sm:inline-flex items-center px-4 py-2 bg-surface hover:bg-surface-2 border border-border text-sm font-medium rounded-full transition-colors"
              >
                Login
              </Link>
              <a
                href={SITE.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track(EVENTS.ctaClicked, { location: "header_demo" })}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-primary-fg text-sm font-semibold rounded-full transition-all duration-200 shadow-sm shadow-primary/20"
              >
                Book a demo
              </a>
            </>
          )}

          {/* Mobile hamburger — always last so it never breaks desktop layout */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 text-fg-muted hover:text-fg rounded-lg"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border bg-card"
          >
            <nav className="container mx-auto px-6 py-4 flex flex-col gap-1">
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="py-2.5 text-sm font-medium text-fg-muted hover:text-fg"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={SITE.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 text-sm font-medium text-fg-muted hover:text-fg"
              >
                Book a demo
              </a>
              <div className="h-px bg-border my-2" />
              {isAuthenticated ? (
                <>
                  {user?.roles?.includes("admin") && (
                    <Link href="/admin" className="py-2.5 text-sm font-medium text-fg-muted hover:text-fg">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="py-2.5 text-left text-sm font-medium text-fg-muted hover:text-fg"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="py-2.5 text-sm font-medium text-primary"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
