import React, { useId } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatBRL, parseBRL } from '@/lib/format-utils';
import { IMEA_URL } from '../constants';

// Badge de safra: 1ª = verde (marca), 2ª = âmbar.
export function SafraBadge({ safra }: { safra: 1 | 2 }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        safra === 1
          ? 'bg-primary/10 text-primary'
          : 'bg-amber-100 text-amber-800'
      )}
    >
      {safra}ª safra
    </span>
  );
}

// Atalho externo para o portal do IMEA.
export function ImeaCallout() {
  return (
    <a
      href={IMEA_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-secondary/30 bg-secondary/5 px-3 py-2 text-sm font-medium text-secondary hover:bg-secondary/10 transition-colors"
    >
      <ExternalLink className="h-4 w-4" />
      Acesse aqui os Indicadores de preço e produtividade do IMEA
    </a>
  );
}

interface FieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  suffix?: string;
  error?: string;
  helper?: string;
  placeholder?: string;
  step?: string;
}

// Campo numérico com sufixo interno (ha, sc/ha, %, h/dia...).
export function NumberField({
  label,
  value,
  onChange,
  suffix,
  error,
  helper,
  placeholder,
  step = 'any',
}: FieldProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          value={value ?? ''}
          placeholder={placeholder}
          aria-invalid={!!error}
          onChange={(e) =>
            onChange(e.target.value === '' ? null : Number(e.target.value))
          }
          className={cn(suffix && 'pr-14', error && 'border-destructive')}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {helper && !error && (
        <p className="text-xs text-muted-foreground">{helper}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Campo de moeda com formato BRL (R$ 3.500.000,00)
interface CurrencyFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
  helper?: string;
  placeholder?: string;
}

export function CurrencyField({
  label,
  value,
  onChange,
  error,
  helper,
  placeholder,
}: CurrencyFieldProps) {
  const id = useId();
  const [displayValue, setDisplayValue] = React.useState(
    value ? formatBRL(value) : ''
  );

  React.useEffect(() => {
    setDisplayValue(value ? formatBRL(value) : '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);
    const parsed = parseBRL(raw);
    onChange(parsed);
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={displayValue}
        placeholder={placeholder || 'R$ 0,00'}
        aria-invalid={!!error}
        onChange={handleChange}
        className={error ? 'border-destructive' : ''}
      />
      {helper && !error && (
        <p className="text-xs text-muted-foreground">{helper}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function TextField({
  label,
  value,
  onChange,
  error,
  placeholder,
}: TextFieldProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
        className={cn(error && 'border-destructive')}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Rodapé padrão das etapas com Voltar/Continuar.
export function StepFooter({
  onBack,
  onNext,
  nextLabel,
  showBack = true,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  showBack?: boolean;
}) {
  return (
    <div className="mt-6 flex items-center justify-between">
      {showBack ? (
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
      ) : (
        <span />
      )}
      <Button type="button" onClick={onNext}>
        {nextLabel}
      </Button>
    </div>
  );
}
