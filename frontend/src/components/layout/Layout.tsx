import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div>
          <Button
            variant="ghost"
            className="md:hidden mb-4"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu />
          </Button>
          <Outlet />
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
};
