import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, Home, FolderOpen, Image, Video, MessageSquare, Mic, FileText, Users, UserCog, Shield, X, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import type { MenuItem } from '@/types/dashboard';

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/admin/dashboard',
  },
  {
    id: 'midias',
    label: 'Mídias',
    icon: FolderOpen,
    children: [
      {
        id: 'carrossel',
        label: 'Carrossel',
        icon: Image,
        path: '/admin/midias/carrossel',
      },
      {
        id: 'video-destaque',
        label: 'Vídeo Destaque',
        icon: Video,
        path: '/admin/midias/video-destaque',
      },
      {
        id: 'popup',
        label: 'PopUp',
        icon: MessageSquare,
        path: '/admin/midias/popup',
      },
    ],
  },
  {
    id: 'podcasts',
    label: 'Podcasts',
    icon: Mic,
    path: '/admin/podcasts',
  },
  {
    id: 'cards-informativos',
    label: 'Cards Informativos',
    icon: FileText,
    path: '/admin/cards-informativos',
  },
  {
    id: 'candidatos',
    label: 'Candidatos',
    icon: Users,
    path: '/admin/candidatos',
  },
  {
    id: 'indicadores',
    label: 'Indicadores',
    icon: BarChart3,
    path: '/admin/indicadores',
  },
  {
    id: 'usuarios',
    label: 'Usuários',
    icon: UserCog,
    path: '/admin/usuarios',
    adminOnly: true,
  },
];

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['midias']);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isChildActive = (children?: MenuItem[]) => {
    if (!children) return false;
    return children.some((child) => isActive(child.path));
  };

  const renderMenuItem = (item: MenuItem, isSubItem = false) => {
    if (item.adminOnly && !isAdmin) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.path) || isChildActive(item.children);
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleExpanded(item.id)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors',
              active
                ? 'bg-green-100 text-primary border-l-[3px] border-primary'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          <div
            className={cn(
              'overflow-hidden transition-all duration-200',
              isExpanded ? 'max-h-96' : 'max-h-0'
            )}
          >
            <div className="mt-1 space-y-1">
              {item.children?.map((child) => renderMenuItem(child, true))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <NavLink
        key={item.id}
        to={item.path || '#'}
        onClick={onClose}
        className={({ isActive: navIsActive }) =>
          cn(
            'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
            isSubItem && 'pl-10',
            navIsActive
              ? 'bg-green-100 text-primary border-l-[3px] border-primary'
              : 'text-muted-foreground hover:bg-muted'
          )
        }
      >
        <Icon className="h-5 w-5" />
        <span>{item.label}</span>
        {item.adminOnly && (
          <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-green-100 text-primary rounded-full flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 w-72 h-full bg-card z-50 md:hidden transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-semibold text-foreground">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>
      </aside>
    </>
  );
};

export default MobileSidebarDrawer;
