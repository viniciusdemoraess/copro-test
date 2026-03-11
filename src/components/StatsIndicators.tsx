import React, { useEffect, useState, useRef } from 'react';
import * as Icons from 'lucide-react';
import { useStatsIndicators } from '@/hooks/useStatsIndicators';
interface CounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}
const Counter: React.FC<CounterProps> = ({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCount();
        }
      });
    }, {
      threshold: 0.3
    });
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [hasAnimated]);
  const animateCount = () => {
    const startTime = Date.now();
    const startValue = 0;
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (end - startValue) * easeOutQuart;
      setCount(currentValue);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setCount(end);
      }
    };
    requestAnimationFrame(tick);
  };
  const formatNumber = (num: number) => {
    if (decimals > 0) {
      return num.toFixed(decimals).replace('.', ',');
    }
    return Math.floor(num).toLocaleString('pt-BR');
  };
  return <span ref={ref} className="tabular-nums">
    {prefix}{formatNumber(count)}{suffix}
  </span>;
};
const StatsIndicators: React.FC = () => {
  const { data: stats, isLoading } = useStatsIndicators();

  if (isLoading) {
    return (
      <section className="relative -mt-8 sm:-mt-16 md:-mt-24 lg:-mt-32 z-20 px-2 sm:px-6 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-background rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl border border-border/20 overflow-hidden">
            <div className="grid grid-cols-3 divide-x divide-border/20">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-3 sm:py-6 md:py-8 px-1 sm:px-4 animate-pulse">
                  <div className="h-8 w-8 bg-muted rounded-full mx-auto mb-3" />
                  <div className="h-8 bg-muted rounded mx-auto mb-2" />
                  <div className="h-4 bg-muted rounded mx-auto w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <section className="relative -mt-8 sm:-mt-16 md:-mt-24 lg:-mt-32 z-20 px-2 sm:px-6 lg:px-16">
      <div className="max-w-5xl mx-auto">
        <div className="bg-background rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl border border-border/20 overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-border/20">
            {stats.map((stat) => {
              const IconComponent = stat.icon
                ? (Icons[stat.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>)
                : null;
              const hasDecimals = stat.value % 1 !== 0;
              return (
                <div key={stat.id} className="py-3 sm:py-6 md:py-8 px-1 sm:px-4 group hover:bg-primary/5 transition-colors duration-300 items-center justify-center flex flex-col">
                  {/* Icon */}
                  <div className="mb-1 sm:mb-3 p-1.5 sm:p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                    {IconComponent ? (
                      <IconComponent className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    ) : (
                      <div className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    )}
                  </div>

                  {/* Number */}
                  <div className="text-primary text-base sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-0.5 sm:mb-1">
                    <Counter
                      end={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix ? '' : ''}
                      decimals={hasDecimals ? 1 : 0}
                    />
                  </div>

                  {/* Suffix */}
                  {stat.suffix && (
                    <div className="text-primary text-[10px] sm:text-sm md:text-lg lg:text-xl font-semibold mb-0.5 sm:mb-1 text-center leading-tight">
                      {stat.suffix}
                    </div>
                  )}

                  {/* Label */}
                  {stat.label && (
                    <p className="text-muted-foreground text-[10px] sm:text-sm md:text-base text-center font-medium leading-tight">
                      {stat.label}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
export default StatsIndicators;