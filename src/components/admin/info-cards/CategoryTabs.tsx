import React from 'react';
import { Briefcase, Package } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { InfoCardCategory, categoryTabs } from '@/types/info-card';

interface CategoryTabsProps {
  activeCategory: InfoCardCategory;
  onCategoryChange: (category: InfoCardCategory) => void;
  stats: Partial<Record<InfoCardCategory, { total: number; active: number }>>;
}

const categoryIcons: Partial<Record<InfoCardCategory, React.ComponentType<{ className?: string }>>> = {
  servico: Briefcase,
  entrega: Package,
};

export function CategoryTabs({ activeCategory, onCategoryChange, stats }: CategoryTabsProps) {
  return (
    <Tabs value={activeCategory} onValueChange={(v) => onCategoryChange(v as InfoCardCategory)}>
      <TabsList className="grid w-full grid-cols-2 h-auto">
        {categoryTabs.map(tab => {
          const Icon = categoryIcons[tab.id];
          const stat = stats[tab.id] || { total: 0, active: 0 };

          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span className="text-xs sm:text-sm">{tab.label}</span>
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0 h-5 data-[state=active]:bg-primary-foreground/20"
              >
                {stat.total}
              </Badge>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
