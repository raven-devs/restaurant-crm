import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  ShoppingCart,
  Users,
  Cake,
  UserCog,
  Building2,
  Megaphone,
  BarChart3,
  Settings,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { to: '/orders', labelKey: 'nav.orders', icon: ShoppingCart },
  { to: '/clients', labelKey: 'nav.clients', icon: Users },
  { to: '/nomenclature', labelKey: 'nav.nomenclature', icon: Cake },
  { to: '/employees', labelKey: 'nav.employees', icon: UserCog },
  { to: '/org-units', labelKey: 'nav.orgStructure', icon: Building2 },
  { to: '/sales-channels', labelKey: 'nav.salesChannels', icon: Megaphone },
  { to: '/reports', labelKey: 'nav.reports', icon: BarChart3 },
];

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-sidebar">
      <div className="flex h-12 items-center gap-2 border-b px-3">
        <img src="/logo.jpeg" alt="Cake CRM" className="h-9 w-auto rounded" />
        <span className="text-sm font-semibold text-sidebar-foreground">
          {t('nav.appName')}
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
              )
            }
          >
            <item.icon className="size-4" />
            {t(item.labelKey)}
          </NavLink>
        ))}
        <Separator className="my-1" />
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
            )
          }
        >
          <Settings className="size-4" />
          {t('nav.settings')}
        </NavLink>
      </nav>
    </aside>
  );
}
