import { Outlet } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { Sidebar } from '@/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 items-center justify-end border-b px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="icon-sm" onClick={logout}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
