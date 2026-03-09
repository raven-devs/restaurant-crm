import { Outlet } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { Sidebar } from '@/layout/Sidebar';
import { IconButton } from '@/components/IconButton';
import { Copyright, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/theme/ThemeContext';

export function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 items-center justify-end border-b px-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium">
                {user?.employee_name ?? user?.email}
              </span>
              {user?.org_unit_name && (
                <span className="text-xs text-muted-foreground">
                  {user.org_unit_name}
                </span>
              )}
            </div>
            <IconButton
              tooltip={theme === 'light' ? 'Dark mode' : 'Light mode'}
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
            >
              {theme === 'light' ? (
                <Moon className="size-4" />
              ) : (
                <Sun className="size-4" />
              )}
            </IconButton>
            <IconButton
              tooltip="Log out"
              variant="ghost"
              size="icon-sm"
              onClick={logout}
            >
              <LogOut className="size-4" />
            </IconButton>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
        <footer className="flex h-10 items-center justify-between border-t px-4 text-xs text-muted-foreground">
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-foreground">
              Terms of Use
            </a>
          </div>
          <div className="flex items-center gap-1">
            <Copyright className="size-3.5" />
            <span>RavenDevs</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
