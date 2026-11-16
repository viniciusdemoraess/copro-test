import { useMemo } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StepCard } from '../components/StepCard';
import { CurrencyField, StepFooter } from '../components/shared';
import { useClasses } from '@/hooks/useClasses';
import type { CalculadoraWizard } from '../useCalculadoraWizard';

export function StepColheitadeira({ wizard }: { wizard: CalculadoraWizard }) {
  const { formData, errors, updateField, goNext, goBack } = wizard;
  const { data: classes = [], isLoading } = useClasses();

  // Rótulo do botão principal muda conforme a opção de financiamento (§3.5).
  const nextLabel = formData.financiada ? 'Continuar' : 'Ver resultados';

  // Ordena as classes por número extraído do nome
  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => {
      const numA = parseInt(a.classe.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.classe.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });
  }, [classes]);

  // Quando uma classe é selecionada, auto-preenche o valor de compra
  const handleClasseChange = (selectedClasse: string) => {
    updateField('modelo_colheitadeira', selectedClasse);
    const selectedClass = classes.find((cls) => cls.classe === selectedClasse);
    if (selectedClass && selectedClass.preco_compra) {
      updateField('valor_maquina', selectedClass.preco_compra);
    }
  };

  // Calcula a capacidade de colheita e verifica se atende à expectativa
  const capacidadeAnalise = useMemo(() => {
    const selectedClass = classes.find((cls) => cls.classe === formData.modelo_colheitadeira);

    if (!selectedClass || !selectedClass.rendimento_ha_hora) {
      return null;
    }

    const rendimentoHaHora = selectedClass.rendimento_ha_hora;
    const horasDia = formData.horas_dia || 0;
    const prazoDias = formData.prazo_colheita || 0;
    const area1 = formData.area_1safra || 0;
    const area2 = formData.area_2safra || 0;
    const areaTotal = area1 + area2;

    // Cálculo: rendimento/hora × horas/dia × dias = hectares
    const hectaresPorDia = rendimentoHaHora * horasDia;
    const capacidadeTotal = hectaresPorDia * prazoDias * 2; // × 2 safras

    const atende = capacidadeTotal >= areaTotal;
    const diferenca = Math.abs(capacidadeTotal - areaTotal);

    return {
      hectaresPorDia,
      capacidadeTotal,
      areaTotal,
      atende,
      diferenca,
    };
  }, [formData.modelo_colheitadeira, formData.horas_dia, formData.prazo_colheita, formData.area_1safra, formData.area_2safra, classes]);

  return (
    <StepCard
      title="Colheitadeira"
      subtitle="Informe o modelo e o valor de uma unidade. Depois diga se ela será financiada."
    >
      <div className="grid gap-5 sm:max-w-md">
        <div className="space-y-1.5">
          <Label htmlFor="classe-select" className="text-sm text-muted-foreground">
            Modelo da colheitadeira
          </Label>
          <Select
            value={formData.modelo_colheitadeira}
            onValueChange={handleClasseChange}
            disabled={isLoading}
          >
            <SelectTrigger
              id="classe-select"
              className={errors.modelo_colheitadeira ? 'border-destructive' : ''}
            >
              <SelectValue
                placeholder={isLoading ? 'Carregando...' : 'Selecione uma classe'}
              />
            </SelectTrigger>
            <SelectContent>
              {sortedClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.classe}>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">{cls.classe}</span>
                    <span className="text-xs text-muted-foreground">
                      {cls.plataforma_pes && `${cls.plataforma_pes} pés`}
                      {cls.plataforma_pes && cls.potencia && ' • '}
                      {cls.potencia}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.modelo_colheitadeira && (
            <p className="text-xs text-destructive">
              {errors.modelo_colheitadeira}
            </p>
          )}
        </div>

        <CurrencyField
          label="Valor de uma unidade"
          value={formData.valor_maquina}
          error={errors.valor_maquina}
          onChange={(v) => updateField('valor_maquina', v)}
        />

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            A colheitadeira será financiada?
          </Label>
          <RadioGroup
            value={formData.financiada ? 'sim' : 'nao'}
            onValueChange={(v) => updateField('financiada', v === 'sim')}
            className="flex items-center gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="sim" id="financiada-sim" />
              <Label htmlFor="financiada-sim" className="cursor-pointer">
                Sim
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="nao" id="financiada-nao" />
              <Label htmlFor="financiada-nao" className="cursor-pointer">
                Não
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Análise de capacidade de colheita */}
      {capacidadeAnalise && (
        <Alert className={capacidadeAnalise.atende ? 'border-primary bg-primary/5' : 'border-destructive bg-destructive/5'}>
          <div className="flex gap-3">
            {capacidadeAnalise.atende ? (
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <AlertTitle className={capacidadeAnalise.atende ? 'text-primary' : 'text-destructive'}>
                {capacidadeAnalise.atende ? '✓ Capacidade suficiente' : '⚠ Capacidade insuficiente'}
              </AlertTitle>
              <AlertDescription className="mt-2 text-sm space-y-1">
                <div>
                  <strong>Capacidade:</strong> {capacidadeAnalise.hectaresPorDia.toFixed(2)} ha/dia × {formData.prazo_colheita} dias × 2 safras = {capacidadeAnalise.capacidadeTotal.toFixed(2)} ha
                </div>
                <div>
                  <strong>Área esperada:</strong> {capacidadeAnalise.areaTotal.toFixed(2)} ha ({formData.area_1safra?.toFixed(2)} + {formData.area_2safra?.toFixed(2)})
                </div>
                {capacidadeAnalise.atende ? (
                  <div className="text-primary font-medium">
                    A classe selecionada irá atender a expectativa de colheita com margem de {capacidadeAnalise.diferenca.toFixed(2)} ha.
                  </div>
                ) : (
                  <div className="text-destructive font-medium">
                    Defasagem de {capacidadeAnalise.diferenca.toFixed(2)} hectares. A classe não conseguirá colher toda a área no prazo definido.
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      <StepFooter onBack={goBack} onNext={goNext} nextLabel={nextLabel} />
    </StepCard>
  );
}
