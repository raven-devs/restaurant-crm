import { Outlet } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { Sidebar } from '@/layout/Sidebar';
import { IconButton } from '@/components/IconButton';
import { LogOut } from 'lucide-react';

export function AppLayout() {
  const { user, logout } = useAuth();

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
      </div>
    </div>
  );
}
