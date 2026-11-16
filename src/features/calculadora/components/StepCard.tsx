import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StepCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

// Shell padrão do card de cada etapa do wizard.
export function StepCard({ title, subtitle, children }: StepCardProps) {
  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
