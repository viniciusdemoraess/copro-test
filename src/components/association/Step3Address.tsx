import React, { useState } from 'react';
import InputMask from 'react-input-mask';
import { cn } from '@/lib/utils';
import { validateCEP, validateAddressNumber, BRAZILIAN_STATES } from '@/lib/validation-utils';

interface Step3AddressProps {
  formData: any;
  updateFormData: (field: string, value: string) => void;
  errors: Record<string, string>;
}

const Step3Address: React.FC<Step3AddressProps> = ({ formData, updateFormData, errors }) => {
  const [loadingCep, setLoadingCep] = useState(false);

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        updateFormData('logradouro', data.logradouro || '');
        updateFormData('bairro', data.bairro || '');
        updateFormData('municipio', data.localidade || '');
        updateFormData('estado', data.uf || '');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-primary mb-6">Endereço onde mora</h2>

      {/* CEP */}
      <div>
        <label className="block text-sm text-muted-foreground mb-2">CEP</label>
        <InputMask
          mask="99.999-999"
          value={formData.cep}
          onChange={(e) => {
            updateFormData('cep', e.target.value);
            buscarCep(e.target.value);
          }}
          className={cn(
            "w-full pb-2 border-b-2 focus:outline-none text-foreground bg-transparent",
            errors.cep ? "border-destructive" : "border-accent"
          )}
          placeholder="78.000-000"
        />
        {loadingCep && <p className="text-xs text-muted-foreground mt-1">Buscando endereço...</p>}
        {errors.cep && (
          <div className="flex items-center gap-1 text-xs text-destructive mt-1">
            <span>⚠️</span>
            <span>{errors.cep}</span>
          </div>
        )}
      </div>

      {/* Logradouro e Número */}
      <div className="grid md:grid-cols-[2fr,1fr] gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Logradouro</label>
          <input
            type="text"
            value={formData.logradouro}
            onChange={(e) => updateFormData('logradouro', e.target.value)}
            className={cn(
              "w-full pb-2 border-b-2 focus:outline-none text-foreground bg-transparent",
              errors.logradouro ? "border-destructive" : "border-accent"
            )}
            placeholder="Rua, Avenida, etc."
            maxLength={200}
          />
          {errors.logradouro && (
            <div className="flex items-center gap-1 text-xs text-destructive mt-1">
              <span>⚠️</span>
              <span>{errors.logradouro}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">Número</label>
          <input
            type="text"
            value={formData.numero}
            onChange={(e) => {
              const value = e.target.value;
              // Permite números, letras, hífen e barra
              if (/^[0-9A-Za-z\s\-/]*$/.test(value) || value === '') {
                updateFormData('numero', value);
              }
            }}
            className="w-full pb-2 border-b-2 border-accent focus:outline-none text-foreground bg-transparent"
            placeholder="10000"
            maxLength={20}
          />
        </div>
      </div>

      {/* Complemento e Bairro */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Complemento</label>
          <input
            type="text"
            value={formData.complemento}
            onChange={(e) => updateFormData('complemento', e.target.value)}
            className="w-full pb-2 border-b-2 border-accent focus:outline-none text-foreground bg-transparent"
            placeholder="Apto, Bloco, etc."
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">Bairro</label>
          <input
            type="text"
            value={formData.bairro}
            onChange={(e) => updateFormData('bairro', e.target.value)}
            className="w-full pb-2 border-b-2 border-accent focus:outline-none text-foreground bg-transparent"
            placeholder="Bairro"
            maxLength={100}
          />
        </div>
      </div>

      {/* Município e Estado */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Município</label>
          <input
            type="text"
            value={formData.municipio}
            onChange={(e) => {
              const value = e.target.value;
              // Permite apenas letras, espaços e caracteres acentuados
              if (/^[a-zA-ZÀ-ÿ\s]*$/.test(value) || value === '') {
                updateFormData('municipio', value);
              }
            }}
            className={cn(
              "w-full pb-2 border-b-2 focus:outline-none text-foreground bg-transparent",
              errors.municipio ? "border-destructive" : "border-accent"
            )}
            placeholder="Cuiabá"
            maxLength={100}
          />
          {errors.municipio && (
            <div className="flex items-center gap-1 text-xs text-destructive mt-1">
              <span>⚠️</span>
              <span>{errors.municipio}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">Estado</label>
          <select
            value={formData.estado}
            onChange={(e) => updateFormData('estado', e.target.value)}
            className="w-full pb-2 border-b-2 border-accent focus:outline-none text-foreground bg-transparent"
          >
            <option value="">Selecione o estado</option>
            {BRAZILIAN_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Step3Address;
