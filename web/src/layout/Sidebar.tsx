import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ShoppingCart,
  Users,
  Cake,
  UserCog,
  Building2,
  Megaphone,
  ListChecks,
  BarChart3,
} from 'lucide-react';

const navItems = [
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/nomenclature', label: 'Nomenclature', icon: Cake },
  { to: '/employees', label: 'Employees', icon: UserCog },
  { to: '/org-units', label: 'Org Structure', icon: Building2 },
  { to: '/sales-channels', label: 'Sales Channels', icon: Megaphone },
  { to: '/order-statuses', label: 'Order Statuses', icon: ListChecks },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-56 flex-col border-r bg-sidebar">
      <div className="flex h-12 items-center border-b px-4">
        <span className="text-sm font-semibold text-sidebar-foreground">
          Restaurant CRM
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
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
