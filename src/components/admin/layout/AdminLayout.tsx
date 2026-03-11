import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminTopBar from './AdminTopBar';
import AdminSidebar from './AdminSidebar';
import MobileSidebarDrawer from './MobileSidebarDrawer';
import AdminContent from './AdminContent';

const AdminLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AdminTopBar onMenuClick={() => setIsMobileMenuOpen(true)} />
      <AdminSidebar />
      <MobileSidebarDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <AdminContent>
        <Outlet />
      </AdminContent>
    </div>
  );
};

export default AdminLayout;
