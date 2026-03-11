import React from 'react';
import { cn } from '@/lib/utils';

interface AdminContentProps {
  children: React.ReactNode;
  className?: string;
}

const AdminContent: React.FC<AdminContentProps> = ({ children, className }) => {
  return (
    <main
      className={cn(
        'mt-16 md:ml-60 min-h-[calc(100vh-4rem)] bg-muted/30 p-4 md:p-6',
        className
      )}
    >
      {children}
    </main>
  );
};

export default AdminContent;
