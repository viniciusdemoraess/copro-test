import React, { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  value: number;
  label: string;
  subtext: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  iconColor,
  iconBgColor,
  value,
  label,
  subtext,
  trend,
  delay = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const visibilityTimeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(visibilityTimeout);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 1000;
    const steps = 60;
    const stepValue = value / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.round(stepValue * currentStep));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value, isVisible]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      <div
        className={cn(
          'inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4',
          iconBgColor
        )}
      >
        <Icon className={cn('h-6 w-6', iconColor)} />
      </div>

      <div className="space-y-1">
        <p className="text-3xl font-bold text-foreground">
          {formatNumber(displayValue)}
        </p>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{subtext}</p>
          {trend && (
            <span
              className={cn(
                'text-xs font-medium px-1.5 py-0.5 rounded',
                trend.isPositive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
