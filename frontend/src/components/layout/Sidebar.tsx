import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  Users,
  Bell,
  LogOut,
  Store,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: SidebarProps) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      roles: ['Owner', 'Manager', 'Cashier'],
    },
    {
      label: 'Products',
      href: '/products',
      icon: Package,
      roles: ['Owner', 'Manager', 'Cashier'],
    },
    {
      label: 'Inventory',
      href: '/inventory',
      icon: ClipboardList,
      roles: ['Owner', 'Manager', 'Cashier'],
    },
    {
      label: 'POS',
      href: '/pos',
      icon: ShoppingCart,
      roles: ['Owner', 'Manager', 'Cashier'],
    },
    {
      label: 'Sales History',
      href: '/sales',
      icon: ClipboardList,
      roles: ['Owner', 'Manager', 'Cashier'],
    },
    {
      label: 'Reports',
      href: '/reports',
      icon: BarChart3,
      roles: ['Owner', 'Manager'],
    },
    {
      label: 'Users',
      href: '/users',
      icon: Users,
      roles: ['Owner', 'Manager'],
    },
    {
      label: 'Notifications',
      href: '/notifications',
      icon: Bell,
      roles: ['Owner', 'Manager', 'Cashier'],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden',
          isSidebarOpen ? 'block' : 'hidden',
        )}
        onClick={() => setIsSidebarOpen(false)}
      />
      <div
        className={cn(
          'flex flex-col h-screen w-64 bg-slate-900 text-white border-r border-slate-800 transition-transform transform z-40',
          'fixed md:relative md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="p-6 flex items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="font-bold text-lg tracking-tight">
                Hardware POS
              </h1>
              <p className="text-xs text-slate-400">Inventory System</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-slate-400" />
          </Button>
        </div>

        <div className="flex-1 py-6 overflow-y-auto">
          <nav className="space-y-1 px-3">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800',
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-sm font-medium"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};
