import html2pdf from 'html2pdf.js';
import type { WizardFormData, ViabilityResult } from '../types';
import { formatBRL } from '@/lib/format-utils';

export async function generateCalculadoraPDF(
  formData: WizardFormData,
  result: ViabilityResult
): Promise<void> {
  // Cria um elemento HTML contendo o relatório
  const element = document.createElement('div');
  element.style.padding = '20px';
  element.style.fontFamily = 'Arial, sans-serif';
  element.style.fontSize = '12px';
  element.style.color = '#333';
  element.style.lineHeight = '1.6';

  // Título
  const title = document.createElement('h1');
  title.textContent = 'Relatório de Viabilidade de Colheitadeira';
  title.style.marginBottom = '10px';
  title.style.borderBottom = '2px solid #333';
  element.appendChild(title);

  // Data e hora
  const dateInfo = document.createElement('p');
  dateInfo.style.fontSize = '11px';
  dateInfo.style.color = '#666';
  dateInfo.textContent = `Gerado em: ${new Date().toLocaleString('pt-BR')}`;
  element.appendChild(dateInfo);

  // Seção: Dados Informados
  const sectionDados = document.createElement('div');
  sectionDados.style.marginTop = '20px';
  sectionDados.style.marginBottom = '20px';
  sectionDados.innerHTML = `
    <h2 style="font-size: 14px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px;">DADOS INFORMADOS</h2>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div>
        <h3 style="font-size: 12px; font-weight: bold; margin-top: 10px; margin-bottom: 5px;">Áreas</h3>
        <p><strong>1ª Safra:</strong> ${formData.area_1safra?.toFixed(2) || '-'} ha</p>
        <p><strong>2ª Safra:</strong> ${formData.area_2safra?.toFixed(2) || '-'} ha</p>

        <h3 style="font-size: 12px; font-weight: bold; margin-top: 10px; margin-bottom: 5px;">Produtividade</h3>
        <p><strong>1ª Safra:</strong> ${formData.prod_1safra?.toFixed(2) || '-'} sc/ha</p>
        <p><strong>2ª Safra:</strong> ${formData.prod_2safra?.toFixed(2) || '-'} sc/ha</p>

        <h3 style="font-size: 12px; font-weight: bold; margin-top: 10px; margin-bottom: 5px;">Lucro</h3>
        <p><strong>1ª Safra:</strong> ${formData.lucro_1safra?.toFixed(2) || '-'}%</p>
        <p><strong>2ª Safra:</strong> ${formData.lucro_2safra?.toFixed(2) || '-'}%</p>
      </div>

      <div>
        <h3 style="font-size: 12px; font-weight: bold; margin-top: 10px; margin-bottom: 5px;">Preços</h3>
        <p><strong>1ª Safra:</strong> R$ ${formData.preco_1safra?.toFixed(2) || '-'}/sc</p>
        <p><strong>2ª Safra:</strong> R$ ${formData.preco_2safra?.toFixed(2) || '-'}/sc</p>

        <h3 style="font-size: 12px; font-weight: bold; margin-top: 10px; margin-bottom: 5px;">Colheitadeira</h3>
        <p><strong>Modelo:</strong> ${formData.modelo_colheitadeira || '-'}</p>
        <p><strong>Valor de compra:</strong> ${formatBRL(formData.valor_maquina || 0)}</p>
        <p><strong>Financiada:</strong> ${formData.financiada ? 'Sim' : 'Não'}</p>

        ${formData.financiada ? `
          <h3 style="font-size: 12px; font-weight: bold; margin-top: 10px; margin-bottom: 5px;">Financiamento</h3>
          <p><strong>% Financiado:</strong> ${formData.perc_financiado?.toFixed(2) || '-'}%</p>
          <p><strong>Prazo:</strong> ${formData.prazo_pagamento || '-'} anos</p>
          <p><strong>Taxa de juros:</strong> ${formData.taxa_juros?.toFixed(2) || '-'}% a.a.</p>
        ` : ''}
      </div>
    </div>
  `;
  element.appendChild(sectionDados);

  // Seção: Resultados
  const sectionResultados = document.createElement('div');
  sectionResultados.style.marginTop = '20px';
  sectionResultados.innerHTML = `
    <h2 style="font-size: 14px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px;">RESULTADOS DA ANÁLISE</h2>
    <p style="margin-bottom: 15px;">Modelo: <strong>${result.modelo}</strong> | Janela de análise: <strong>${result.janelaAnos} anos</strong></p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
      <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
        <h3 style="font-size: 12px; font-weight: bold; color: #2563eb; margin-bottom: 10px;">🚜 MÁQUINA PRÓPRIA: ${result.modelo}</h3>
        <p><strong>Receita total:</strong> ${formatBRL(result.propria.receitaAcumulada)}</p>
        <p><strong>Custo total:</strong> ${formatBRL(result.propria.custoAcumulado)}</p>
        <p style="font-size: 13px; font-weight: bold; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
          Resultado: ${formatBRL(result.propria.resultadoAcumulado)}
        </p>
        <p style="margin-top: 5px; color: ${result.propria.viavel ? '#16a34a' : '#dc2626'}; font-weight: bold;">
          Status: ${result.propria.viavel ? '✓ VIÁVEL' : '✗ INVIÁVEL'}
        </p>
      </div>

      <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
        <h3 style="font-size: 12px; font-weight: bold; color: #b45309; margin-bottom: 10px;">🛡️ COLHEITA TERCEIRIZADA</h3>
        <p><strong>Receita total:</strong> ${formatBRL(result.terceirizada.receitaAcumulada)}</p>
        <p><strong>Custo total:</strong> ${formatBRL(result.terceirizada.custoAcumulado)}</p>
        <p style="font-size: 13px; font-weight: bold; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
          Resultado: ${formatBRL(result.terceirizada.resultadoAcumulado)}
        </p>
        <p style="margin-top: 5px; color: ${result.terceirizada.viavel ? '#16a34a' : '#dc2626'}; font-weight: bold;">
          Status: ${result.terceirizada.viavel ? '✓ VIÁVEL' : '✗ INVIÁVEL'}
        </p>
      </div>
    </div>

    <div style="background-color: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
      <p style="margin: 0;"><strong>Diferença no ${result.janelaAnos}º ano:</strong></p>
      <p style="font-size: 16px; font-weight: bold; color: ${result.diferenca > 0 ? '#2563eb' : '#dc2626'}; margin-top: 5px;">
        ${formatBRL(Math.abs(result.diferenca))} ${result.diferenca > 0 ? '(A favor da máquina própria)' : '(A favor da terceirização)'}
      </p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
      <div style="border: 1px solid #e5e7eb; padding: 10px; border-radius: 3px;">
        <p style="margin: 0; font-size: 11px; color: #666;">1ª Safra - Sacas/ha</p>
        <p style="margin: 5px 0; font-size: 14px; font-weight: bold;">${result.lucroSacas1.toFixed(2)}</p>
      </div>
      <div style="border: 1px solid #e5e7eb; padding: 10px; border-radius: 3px;">
        <p style="margin: 0; font-size: 11px; color: #666;">1ª Safra - R$/ha</p>
        <p style="margin: 5px 0; font-size: 14px; font-weight: bold;">${formatBRL(result.lucroHectare1)}</p>
      </div>
      <div style="border: 1px solid #e5e7eb; padding: 10px; border-radius: 3px;">
        <p style="margin: 0; font-size: 11px; color: #666;">2ª Safra - Sacas/ha</p>
        <p style="margin: 5px 0; font-size: 14px; font-weight: bold;">${result.lucroSacas2.toFixed(2)}</p>
      </div>
      <div style="border: 1px solid #e5e7eb; padding: 10px; border-radius: 3px;">
        <p style="margin: 0; font-size: 11px; color: #666;">2ª Safra - R$/ha</p>
        <p style="margin: 5px 0; font-size: 14px; font-weight: bold;">${formatBRL(result.lucroHectare2)}</p>
      </div>
    </div>
  `;
  element.appendChild(sectionResultados);

  // Rodapé
  const footer = document.createElement('p');
  footer.style.marginTop = '20px';
  footer.style.fontSize = '10px';
  footer.style.color = '#999';
  footer.style.borderTop = '1px solid #ccc';
  footer.style.paddingTop = '10px';
  footer.textContent = 'Simulação de validação de fluxo. Os valores são uma aproximação e serão substituídos pelas fórmulas oficiais da planilha de viabilidade da Cooprosoja.';
  element.appendChild(footer);

  // Configurações do html2pdf
  const opt = {
    margin: 10,
    filename: `relatorio_colheitadeira_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
  };

  // Gera o PDF
  html2pdf().set(opt).from(element).save();
}
