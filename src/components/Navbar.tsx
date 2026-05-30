"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Compass, Navigation, PlusCircle, ShieldAlert, Sun, Moon, Menu, X, Landmark } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if current user is an Admin
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isAdmin = isLoaded && userEmail && adminEmails.includes(userEmail);

  // Load and apply dark mode
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (theme === "dark" || (!theme && systemPrefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const navigation = [
    { name: "Discover", href: "/", icon: Compass },
    { name: "Smart Travel", href: "/travel", icon: Navigation },
    { name: "Suggest Temple", href: "/contribute", icon: PlusCircle },
    ...(isAdmin ? [{ name: "Admin Panel", href: "/admin", icon: ShieldAlert }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-navbar border-b transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-saffron-600 to-amber-400 text-white shadow-md transition-transform duration-300 group-hover:scale-105">
                <Landmark className="h-5 w-5" />
                <div className="absolute -inset-0.5 -z-10 rounded-xl bg-gradient-to-tr from-saffron-600 to-amber-400 opacity-30 blur group-hover:opacity-60 transition-opacity"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold tracking-wider text-saffron-600 dark:text-saffron-500">
                  JainYatra
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-cream-800 dark:text-cream-800/80 -mt-1">
                  India
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-500"
                      : "text-cream-800 hover:text-saffron-500 dark:text-foreground dark:hover:text-saffron-500"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action panel */}
          <div className="hidden md:flex items-center gap-4">
            <UserButton />
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-glass-border bg-background hover:bg-cream-100 dark:hover:bg-cream-200 text-foreground transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-saffron-500" />
              ) : (
                <Moon className="h-4 w-4 text-cream-900" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <UserButton />
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-glass-border bg-background text-foreground"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-saffron-500" />
              ) : (
                <Moon className="h-4 w-4 text-cream-900" />
              )}
            </button>
            
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-glass-border bg-background text-foreground"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-glass-border bg-background px-4 pt-2 pb-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-500"
                    : "text-cream-800 hover:bg-cream-100 dark:text-foreground dark:hover:bg-cream-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
