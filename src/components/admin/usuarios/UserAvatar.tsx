import React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface UserAvatarProps {
  fullName: string | null;
  avatarUrl: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
};

const getInitials = (name: string | null): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getColorFromId = (name: string | null): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-rose-500',
  ];
  
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  fullName, 
  avatarUrl, 
  size = 'md',
  className 
}) => {
  const initials = getInitials(fullName);
  const bgColor = getColorFromId(fullName);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName || 'User avatar'}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-semibold',
        sizeClasses[size],
        bgColor,
        className
      )}
    >
      {initials === '?' ? (
        <User className={cn(size === 'xl' ? 'w-10 h-10' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4')} />
      ) : (
        initials
      )}
    </div>
  );
};

export default UserAvatar;
