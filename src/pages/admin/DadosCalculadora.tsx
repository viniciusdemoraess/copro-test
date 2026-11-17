import { IPCAList } from '@/components/admin/dados-calculadora/IPCAList';

export function DadosCalculadora() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dados da Calculadora</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie os dados utilizados na calculadora de viabilidade de colheitadeiras.
        </p>
      </div>

      <IPCAList />
    </div>
  );
}
