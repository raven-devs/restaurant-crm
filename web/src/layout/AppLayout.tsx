import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/auth/AuthContext';
import { Sidebar } from '@/layout/Sidebar';
import { IconButton } from '@/components/IconButton';
import { Copyright, Globe, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/theme/ThemeContext';

export function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'uk' : 'en');
  };

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
              tooltip={t('layout.language')}
              variant="ghost"
              size="icon-sm"
              onClick={toggleLanguage}
            >
              <Globe className="size-4" />
            </IconButton>
            <IconButton
              tooltip={
                theme === 'light' ? t('layout.darkMode') : t('layout.lightMode')
              }
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
              tooltip={t('layout.logout')}
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
              {t('layout.privacyPolicy')}
            </a>
            <a href="/terms" className="hover:text-foreground">
              {t('layout.termsOfUse')}
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
