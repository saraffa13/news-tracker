"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "./AuthProvider";

const links = [
  { href: "/", label: "Home" },
  { href: "/add", label: "Add News" },
  { href: "/revise", label: "Revise" },
  { href: "/words", label: "Words" },
  { href: "/learnt", label: "Learnt" },
  { href: "/favorites", label: "Favorites" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <nav className="sticky top-0 z-40 bg-[var(--card)] border-b border-[var(--border-color)] backdrop-blur-sm bg-opacity-90">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-[var(--accent)]">
              NewsDecoder
            </Link>
            {user && !isAuthPage && (
              <div className="hidden sm:flex items-center gap-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user && !isAuthPage && (
              <>
                <span className="hidden sm:inline text-xs text-[var(--text-secondary)]">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
        {/* Mobile nav */}
        {user && !isAuthPage && (
          <div className="sm:hidden flex gap-1 pb-2 overflow-x-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  pathname === link.href
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
