"use client";
import Link from "next/link"; // Import Link
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-900">
          SecureVote
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            {/* Show Admin Button only for admins */}
            {user.role === 'admin' && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Admin Panel
                </Link>
              </Button>
            )}

            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium">{user.username}</span>
              <span className="text-xs text-slate-500 uppercase">{user.role}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}