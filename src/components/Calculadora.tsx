import { useMemo, useState } from 'react';
import { useClasses } from '@/hooks/useClasses';
import { calcularViabilidade, formatarMoeda } from '@/services/calculadora';
import type { CalculadoraInputs } from '@/types/calculadora';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalculadoraChart } from '@/components/CalculadoraChart';
import { AlertCircle, CheckCircle } from 'lucide-react';

const VALORES_PADRAO: CalculadoraInputs = {
  classeId: '874bf276-3fa0-4d59-9bb7-c07ecb9e5597',
  areaHectares: 800,

  // 1ª Safra (Soja)
  produtividadeSoja: 60,
  margemLucroSojaPercent: 8,
  precoVendaSoja: 125,

  // 2ª Safra (Milho)
  produtividadeMilho: 120,
  margemLucroMilhoPercent: 2,
  precoVendaMilho: 50,

  custoTerceirizacao: 300,

  // Legado (serão calculados automaticamente)
  producaoSoja: undefined,
  producaoMilho: undefined,
  margemLucroSoja: undefined,
  margemLucroMilho: undefined,
};

export function Calculadora() {
  const { data: classes, isLoading } = useClasses();
  const [inputs, setInputs] = useState<CalculadoraInputs>(VALORES_PADRAO);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  const classeAtual = useMemo(
    () => classes?.find((c) => c.id === inputs.classeId),
    [classes, inputs.classeId]
  );

  const resultado = useMemo(() => {
    if (!classeAtual) {
      console.log('🔍 DEBUG: classeAtual não encontrado. Classe ID:', inputs.classeId);
      console.log('🔍 Classes disponíveis:', classes?.map(c => ({ id: c.id, classe: c.classe })));
      return null;
    }
    console.log('✅ Calculando com classe:', classeAtual.classe);
    return calcularViabilidade(classeAtual, inputs);
  }, [classeAtual, inputs]);

  const handleInputChange = (field: keyof CalculadoraInputs, value: string | number) => {
    setInputs((prev) => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Carregando modelos de colheita...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold">Calculadora de Viabilidade</h1>
        <p className="text-muted-foreground mt-2">
          Analise se vale a pena comprar uma colhedora para sua propriedade
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ENTRADA DE DADOS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados da Propriedade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Seleção de Classe */}
            <div>
              <label className="block text-sm font-medium mb-2">Modelo da Colhedora</label>
              <select
                value={inputs.classeId}
                onChange={(e) => handleInputChange('classeId', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">-- Selecione um modelo --</option>
                {classes?.map((classe) => (
                  <option key={classe.id} value={classe.id}>
                    {classe.classe} (R$ {classe.preco_compra?.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {classeAtual && (
              <div className="bg-muted/50 p-3 rounded text-sm space-y-1">
                <p><strong>Potência:</strong> {classeAtual.potencia || 'Não informado'}</p>
                <p><strong>Vida Útil:</strong> {classeAtual.vida_util_anos} anos</p>
                <p><strong>Rendimento:</strong> {classeAtual.rendimento_ha_hora} ha/hora</p>
              </div>
            )}

            {/* Dados de Produção */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold text-sm">1ª Safra - Soja</h3>

              <div>
                <label className="block text-xs font-medium mb-1">Área (hectares)</label>
                <input
                  type="number"
                  value={inputs.areaHectares}
                  onChange={(e) => handleInputChange('areaHectares', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Produtividade (sacas/hectare)</label>
                <input
                  type="number"
                  value={inputs.produtividadeSoja || ''}
                  onChange={(e) => handleInputChange('produtividadeSoja', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Ex: 60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Margem de Lucro (%)</label>
                <input
                  type="number"
                  value={inputs.margemLucroSojaPercent || ''}
                  onChange={(e) => handleInputChange('margemLucroSojaPercent', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Ex: 8"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Preço de Venda (R$/saca)</label>
                <input
                  type="number"
                  value={inputs.precoVendaSoja || ''}
                  onChange={(e) => handleInputChange('precoVendaSoja', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Ex: 125"
                />
              </div>
            </div>

            {/* 2ª Safra */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold text-sm">2ª Safra - Milho</h3>

              <div>
                <label className="block text-xs font-medium mb-1">Produtividade (sacas/hectare)</label>
                <input
                  type="number"
                  value={inputs.produtividadeMilho || ''}
                  onChange={(e) => handleInputChange('produtividadeMilho', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Ex: 120"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Margem de Lucro (%)</label>
                <input
                  type="number"
                  value={inputs.margemLucroMilhoPercent || ''}
                  onChange={(e) => handleInputChange('margemLucroMilhoPercent', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Ex: 2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Preço de Venda (R$/saca)</label>
                <input
                  type="number"
                  value={inputs.precoVendaMilho || ''}
                  onChange={(e) => handleInputChange('precoVendaMilho', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Ex: 50"
                />
              </div>
            </div>

            {/* Margens de Lucro */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold text-sm">Margem de Lucro (R$/saca)</h3>

              <div>
                <label className="block text-xs font-medium mb-1">Soja</label>
                <input
                  type="number"
                  value={inputs.margemLucroSoja}
                  onChange={(e) => handleInputChange('margemLucroSoja', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Milho</label>
                <input
                  type="number"
                  value={inputs.margemLucroMilho}
                  onChange={(e) => handleInputChange('margemLucroMilho', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
            </div>

            {/* Custos de Comparação */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold text-sm">Terceirização</h3>

              <div>
                <label className="block text-xs font-medium mb-1">Custo (R$/ha ou total)</label>
                <input
                  type="number"
                  value={inputs.custoTerceirizacao}
                  onChange={(e) => handleInputChange('custoTerceirizacao', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground italic pt-2">
              ℹ️ Campos em amarelo na spreadsheet original
            </div>
          </CardContent>
        </Card>

        {/* RESULTADOS */}
        {resultado && (
          <div className="space-y-4">
            {/* Indicador Principal */}
            <Card className={resultado.results.viavel ? 'border-green-500' : 'border-red-500'}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {resultado.results.viavel ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span>Vale a Pena! ✓</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <span>Não é Viável</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Margem de Vantagem Anual</p>
                  <p className={`text-3xl font-bold ${
                    resultado.results.margemVantagem >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {formatarMoeda(resultado.results.margemVantagem)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t text-sm">
                  <div>
                    <p className="text-muted-foreground">Lucro Anual</p>
                    <p className="font-semibold">{formatarMoeda(resultado.results.lucroLiquido)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">vs Terceirizar</p>
                    <p className="font-semibold">{formatarMoeda(resultado.results.resultadoTerceirizacao)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Indicadores Financeiros */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Análise Financeira</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Payback</p>
                    <p className="font-semibold">{resultado.results.paybackAnosMeses}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Taxa de Retorno</p>
                    <p className="font-semibold">{resultado.results.taxaRetornoAnual.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Custo/Hectare</p>
                    <p className="font-semibold">{formatarMoeda(resultado.results.custoPorHectare)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Custos Anuais</p>
                    <p className="font-semibold">{formatarMoeda(resultado.results.custosAnuais)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Break-even */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Produção Mínima</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Para cobrir custos da máquina</p>
                  <p className="font-semibold">{resultado.results.sacasMinimosAnual} sacas/ano</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Para vencer terceirização</p>
                  <p className="font-semibold">{resultado.results.sacasParaVencerTerceirizacao} sacas/ano</p>
                </div>
              </CardContent>
            </Card>

            {/* Botão Detalhes */}
            <Button
              onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
              variant="outline"
              className="w-full"
            >
              {mostrarDetalhes ? 'Ocultar' : 'Mostrar'} Detalhes Técnicos
            </Button>
          </div>
        )}
      </div>

      {/* DETALHES TÉCNICOS */}
      {resultado && mostrarDetalhes && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Breakdown de Custos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhamento de Custos Anuais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Amortização</span>
                <span className="font-semibold">{formatarMoeda(resultado.results.custoAmortizadoAnual)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Manutenção</span>
                <span className="font-semibold">{formatarMoeda(resultado.results.custoManutencaoAnual)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Seguro</span>
                <span className="font-semibold">{formatarMoeda(resultado.results.custoSeguroAnual)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Operador</span>
                <span className="font-semibold">{formatarMoeda(resultado.results.custoOperadorAnual)}</span>
              </div>
              <div className="flex justify-between pt-2 font-bold text-base">
                <span>Total Anual</span>
                <span>{formatarMoeda(resultado.results.custosAnuais)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown de Receitas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhamento de Receitas Anuais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Lucro Soja</span>
                <span className="font-semibold text-green-600">{formatarMoeda(resultado.results.receitaSoja)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Lucro Milho</span>
                <span className="font-semibold text-green-600">{formatarMoeda(resultado.results.receitaMilho)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Revenda (ao final)</span>
                <span className="font-semibold text-blue-600">{formatarMoeda(resultado.results.receituaRevendaAoFinal)}</span>
              </div>
              <div className="flex justify-between pt-2 font-bold text-base">
                <span>Total Bruto</span>
                <span className="text-green-600">{formatarMoeda(resultado.results.lucroBrutoAnual)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Especificações Técnicas */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Especificações Técnicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Vida Útil</p>
                  <p className="font-semibold">{resultado.analiseDetalhada.vida_util} anos</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rendimento</p>
                  <p className="font-semibold">{resultado.analiseDetalhada.rendimento_ha_hora} ha/h</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Horas Operação/Ano</p>
                  <p className="font-semibold">{resultado.analiseDetalhada.horasOperacaoPorAno}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Potência</p>
                  <p className="font-semibold">{resultado.analiseDetalhada.potencia}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!resultado && (
        <Card className="border-dashed">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {inputs.classeId ? 'Carregando análise...' : 'Selecione um modelo de colhedora para ver a análise'}
            </p>
            {!classes || classes.length === 0 && (
              <p className="text-xs text-red-500 mt-2">❌ Nenhum modelo disponível no banco de dados</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* GRÁFICO COMPARATIVO */}
      {resultado && <CalculadoraChart data={resultado} />}
    </div>
  );
}
