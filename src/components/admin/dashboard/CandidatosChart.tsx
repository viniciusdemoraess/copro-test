import React, { useState, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, X, TrendingUp, TrendingDown } from 'lucide-react';
import { useCandidatosChartData, useTodayYesterdayStats } from '@/hooks/useCandidatos';

interface CandidatosChartProps {
  loading?: boolean;
}

// Helper function to get default date range (start of last month to today)
const getDefaultDateRange = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Start of last month
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Format as YYYY-MM-DD for input type="date"
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    dateFrom: formatDate(lastMonthStart),
    dateTo: formatDate(today),
  };
};

const CandidatosChart: React.FC<CandidatosChartProps> = ({ loading: externalLoading = false }) => {
  // Initialize with default date range
  const defaultDates = useMemo(() => getDefaultDateRange(), []);
  const [dateFrom, setDateFrom] = useState<string>(defaultDates.dateFrom);
  const [dateTo, setDateTo] = useState<string>(defaultDates.dateTo);

  const filters = useMemo(() => ({
    dateFrom: dateFrom || null,
    dateTo: dateTo || null,
  }), [dateFrom, dateTo]);

  const { data: chartData, isLoading } = useCandidatosChartData(filters);
  const { data: todayYesterdayStats, isLoading: statsLoading } = useTodayYesterdayStats();

  const loading = externalLoading || isLoading;

  const handleClearFilters = () => {
    // Reset to default date range
    const defaultDates = getDefaultDateRange();
    setDateFrom(defaultDates.dateFrom);
    setDateTo(defaultDates.dateTo);
  };

  // Check if current filters are different from default
  const hasCustomFilters = useMemo(() => {
    const defaultDates = getDefaultDateRange();
    return dateFrom !== defaultDates.dateFrom || dateTo !== defaultDates.dateTo;
  }, [dateFrom, dateTo]);

  // Calculate trend (difference between today and yesterday)
  const trend = useMemo(() => {
    if (!todayYesterdayStats) return null;
    const diff = todayYesterdayStats.today - todayYesterdayStats.yesterday;

    // Calculate percentage change
    let percentage = 0;
    if (todayYesterdayStats.yesterday > 0) {
      percentage = Math.round((diff / todayYesterdayStats.yesterday) * 100);
    } else if (todayYesterdayStats.today > 0) {
      // If yesterday was 0 and today has candidates, it's a 100% increase
      percentage = 100;
    }

    return {
      value: Math.abs(percentage),
      isPositive: diff >= 0,
      diff,
    };
  }, [todayYesterdayStats]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Candidatos por Período
          </CardTitle>
        </div>

        {/* Preview: Today and Yesterday Stats */}
        {!hasCustomFilters && (
          <div className="flex items-center gap-4 mt-4 p-4 bg-muted/50 rounded-lg border border-border">
            {statsLoading ? (
              <>
                <Skeleton className="h-16 w-32" />
                <Skeleton className="h-16 w-32" />
              </>
            ) : todayYesterdayStats ? (
              <>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-muted-foreground">Hoje</span>
                    {trend && (
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-1 ${trend.isPositive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                      >
                        {trend.isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {trend.value}%
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {todayYesterdayStats.today}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {trend && trend.diff !== 0 && (
                      <span className={trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {trend.isPositive ? '+' : ''}{trend.diff} {trend.diff === 1 ? 'candidato' : 'candidatos'} em relação a ontem
                      </span>
                    )}
                    {trend && trend.diff === 0 && 'Sem mudança em relação a ontem'}
                  </p>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Ontem</p>
                  <p className="text-2xl font-bold text-foreground">
                    {todayYesterdayStats.yesterday}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total de candidatos
                  </p>
                </div>
              </>
            ) : null}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[140px]"
              placeholder="Data inicial"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[140px]"
              placeholder="Data final"
            />
          </div>
          {hasCustomFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-9"
            >
              <X className="w-4 h-4 mr-1" />
              Restaurar padrão
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : chartData && chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Candidatos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível para o período selecionado
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidatosChart;
