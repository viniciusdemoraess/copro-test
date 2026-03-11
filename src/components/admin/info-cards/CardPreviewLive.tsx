import React from 'react';
import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { InfoCardForm } from '@/types/info-card';

interface CardPreviewLiveProps {
  formData: Partial<InfoCardForm>;
}

export function CardPreviewLive({ formData }: CardPreviewLiveProps) {
  const Icon = formData.iconName 
    ? (Icons[formData.iconName as keyof typeof Icons] as React.ComponentType<{ className?: string; style?: React.CSSProperties }>)
    : null;
  
  return (
    <div className="sticky top-4">
      <p className="text-sm font-medium text-muted-foreground mb-3">
        Preview
      </p>
      
      <div 
        className="rounded-xl shadow-md p-6 border transition-all"
        style={{ backgroundColor: formData.backgroundColor || '#ffffff' }}
      >
        {/* Icon or Image */}
        <div className="flex justify-center mb-4">
          {formData.imageUrl ? (
            <img 
              src={formData.imageUrl} 
              alt="Preview" 
              className="w-16 h-16 object-cover rounded-lg"
            />
          ) : Icon ? (
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${formData.iconColor || '#0e873d'}20` }}
            >
              <Icon 
                className="w-8 h-8" 
                style={{ color: formData.iconColor || '#0e873d' }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Ícone</span>
            </div>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-center text-foreground mb-3">
          {formData.title || 'Título do Card'}
        </h3>
        
        {/* Description */}
        <div 
          className="text-sm text-muted-foreground text-center mb-4 line-clamp-4"
          dangerouslySetInnerHTML={{ 
            __html: formData.description || 'Descrição do card...' 
          }}
        />
        
        {/* Link */}
        {formData.linkUrl && (
          <div className="flex justify-center">
            <span 
              className="inline-flex items-center text-sm font-medium gap-1"
              style={{ color: formData.iconColor || '#0e873d' }}
            >
              {formData.linkText || 'Saiba mais'}
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
