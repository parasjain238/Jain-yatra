"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Navigation, PlusCircle, ShieldAlert, Sun, Moon, Sparkles, Menu, X, Landmark } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { db } from "../services/db";

export default function Navbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [role, setRole] = useState<"Guest" | "Contributor" | "Admin">("Guest");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

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

    // Set initial mock role
    setRole(db.getUserRole());
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

  const handleRoleChange = (newRole: "Guest" | "Contributor" | "Admin") => {
    db.setUserRole(newRole);
    setRole(newRole);
    setRoleDropdownOpen(false);
    // Reload active page if it is admin page and role becomes non-admin to prevent locking out
    if (pathname.startsWith("/admin") && newRole !== "Admin") {
      window.location.href = "/";
    } else {
      window.location.reload();
    }
  };

  const navigation = [
    { name: "Discover", href: "/", icon: Compass },
    { name: "Smart Travel", href: "/travel", icon: Navigation },
    { name: "Suggest Temple", href: "/contribute", icon: PlusCircle },
    ...(role === "Admin" ? [{ name: "Admin Panel", href: "/admin", icon: ShieldAlert }] : []),
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

            {/* Clerk Mock Authentication / Dev Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-glass-border bg-background hover:bg-cream-100 dark:hover:bg-cream-200 text-xs font-semibold text-foreground transition-all duration-200"
              >
                <Sparkles className="h-3.5 w-3.5 text-saffron-500" />
                <span>Role: {role}</span>
              </button>
              
              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-glass-border bg-background shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 p-1">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-cream-800 dark:text-cream-800/80 border-b border-glass-border mb-1">
                    Select Test Role
                  </div>
                  {["Guest", "Contributor", "Admin"].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r as any)}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                        role === r
                          ? "bg-saffron-100 text-saffron-600 dark:bg-saffron-900/40 dark:text-saffron-500 font-semibold"
                          : "text-foreground hover:bg-cream-100 dark:hover:bg-cream-200"
                      }`}
                    >
                      {r} {r === "Admin" ? "🛡️" : r === "Contributor" ? "✍️" : "👤"}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
          
          {/* Mobile Role Switcher */}
          <div className="border-t border-glass-border pt-2 mt-2">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cream-800 dark:text-cream-800/80">
              Change Developer Role
            </div>
            <div className="flex gap-2 p-1">
              {["Guest", "Contributor", "Admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    handleRoleChange(r as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 text-center py-1.5 rounded-md text-xs border ${
                    role === r
                      ? "bg-saffron-100 border-saffron-500 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-500 font-semibold"
                      : "border-glass-border text-foreground hover:bg-cream-100 dark:hover:bg-cream-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
