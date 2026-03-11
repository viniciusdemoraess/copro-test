import React from 'react';
import InputMask from 'react-input-mask';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateCPF, validateFullName, validateTextOnly, validateBirthDate } from '@/lib/validation-utils';

interface Step1PersonalProps {
  formData: any;
  updateFormData: (field: string, value: string) => void;
  errors: Record<string, string>;
}

const Step1Personal: React.FC<Step1PersonalProps> = ({ formData, updateFormData, errors }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-primary mb-6">Informe seus dados pessoais</h2>

      {/* CPF e RG */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">CPF</label>
          <InputMask
            mask="999.999.999-99"
            value={formData.cpf}
            onChange={(e) => {
              const value = e.target.value;
              updateFormData('cpf', value);
              // Validação em tempo real
              const digits = value.replace(/\D/g, '');
              if (digits.length === 11 && !validateCPF(value)) {
                // CPF inválido será validado no submit
              }
            }}
            className={cn(
              "w-full pb-2 border-b-2 focus:outline-none text-foreground bg-transparent",
              errors.cpf ? "border-destructive" : "border-accent"
            )}
            placeholder="000.000.000-00"
          />
          {errors.cpf && (
            <div className="flex items-center gap-1 text-xs text-destructive mt-1">
              <span>⚠️</span>
              <span>{errors.cpf}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">RG</label>
          <div className="flex gap-2">
            <InputMask
              mask="99.999.999-9"
              value={formData.rg}
              onChange={(e) => updateFormData('rg', e.target.value)}
              className={cn(
                "flex-1 pb-2 border-b-2 focus:outline-none text-foreground bg-transparent",
                errors.rg ? "border-destructive" : "border-accent"
              )}
              placeholder="00.000.000-0"
            />
            <select
              value={formData.rgOrgao}
              onChange={(e) => updateFormData('rgOrgao', e.target.value)}
              className="pb-2 border-b-2 border-accent focus:outline-none text-foreground bg-transparent"
            >
              <option value="SSP-MT">SSP-MT</option>
              <option value="SSP-SP">SSP-SP</option>
              <option value="SSP-RJ">SSP-RJ</option>
            </select>
          </div>
          {errors.rg && (
            <div className="flex items-center gap-1 text-xs text-destructive mt-1">
              <span>⚠️</span>
              <span>{errors.rg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Nome Completo */}
      <div>
        <label className="block text-sm text-muted-foreground mb-2">Nome Completo</label>
        <input
          type="text"
          value={formData.nomeCompleto}
          onChange={(e) => {
            const value = e.target.value;
            // Permite apenas letras, espaços e caracteres acentuados
            if (/^[a-zA-ZÀ-ÿ\s]*$/.test(value) || value === '') {
              updateFormData('nomeCompleto', value);
            }
          }}
          className={cn(
            "w-full pb-2 border-b-2 focus:outline-none text-foreground bg-transparent",
            errors.nomeCompleto ? "border-destructive" : "border-accent"
          )}
          placeholder="Fulano Sicrano Beltrano"
          maxLength={100}
        />
        {errors.nomeCompleto && (
          <div className="flex items-center gap-1 text-xs text-destructive mt-1">
            <span>⚠️</span>
            <span>{errors.nomeCompleto}</span>
          </div>
        )}
      </div>

      {/* Data de Nascimento e Nacionalidade */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Data de Nascimento</label>
          <div className="relative">
            <InputMask
              mask="99/99/9999"
              value={formData.dataNascimento}
              onChange={(e) => updateFormData('dataNascimento', e.target.value)}
              className={cn(
                "w-full pb-2 border-b-2 focus:outline-none text-foreground bg-transparent pr-8",
                errors.dataNascimento ? "border-destructive" : "border-accent"
              )}
              placeholder="01/01/1981"
            />
            <Calendar className="absolute right-0 bottom-2 w-5 h-5 text-muted-foreground" />
          </div>
          {errors.dataNascimento && (
            <div className="flex items-center gap-1 text-xs text-destructive mt-1">
              <span>⚠️</span>
              <span>{errors.dataNascimento}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">Nacionalidade</label>
          <input
            type="text"
            value={formData.nacionalidade}
            onChange={(e) => {
              const value = e.target.value;
              // Permite apenas letras, espaços e caracteres acentuados
              if (/^[a-zA-ZÀ-ÿ\s]*$/.test(value) || value === '') {
                updateFormData('nacionalidade', value);
              }
            }}
            className={cn(
              "w-full pb-2 border-b-2 focus:outline-none text-foreground bg-transparent",
              errors.nacionalidade ? "border-destructive" : "border-accent"
            )}
            placeholder="Brasileiro"
            maxLength={50}
          />
          {errors.nacionalidade && (
            <div className="flex items-center gap-1 text-xs text-destructive mt-1">
              <span>⚠️</span>
              <span>{errors.nacionalidade}</span>
            </div>
          )}
        </div>
      </div>

      {/* Estado Civil e Profissão */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Estado Civil</label>
          <select
            value={formData.estadoCivil}
            onChange={(e) => updateFormData('estadoCivil', e.target.value)}
            className={cn(
              "w-full pb-2 border-b-2 focus:outline-none text-foreground bg-transparent",
              errors.estadoCivil ? "border-destructive" : "border-accent"
            )}
          >
            <option value="">Selecione</option>
            <option value="Solteiro">Solteiro</option>
            <option value="Casado">Casado</option>
            <option value="Divorciado">Divorciado</option>
            <option value="Viúvo">Viúvo</option>
          </select>
          {errors.estadoCivil && (
            <div className="flex items-center gap-1 text-xs text-destructive mt-1">
              <span>⚠️</span>
              <span>{errors.estadoCivil}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">Profissão</label>
          <input
            type="text"
            value={formData.profissao}
            onChange={(e) => {
              const value = e.target.value;
              // Permite apenas letras, espaços e caracteres acentuados
              if (/^[a-zA-ZÀ-ÿ\s]*$/.test(value) || value === '') {
                updateFormData('profissao', value);
              }
            }}
            className={cn(
              "w-full pb-2 border-b-2 focus:outline-none text-foreground bg-transparent",
              errors.profissao ? "border-destructive" : "border-accent"
            )}
            placeholder="Agricultor"
            maxLength={50}
          />
          {errors.profissao && (
            <div className="flex items-center gap-1 text-xs text-destructive mt-1">
              <span>⚠️</span>
              <span>{errors.profissao}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step1Personal;
