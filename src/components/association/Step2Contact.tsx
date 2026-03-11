import React from 'react';
import InputMask from 'react-input-mask';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validatePhone } from '@/lib/validation-utils';

interface Phone {
  numero: string;
  whatsapp: boolean;
}

interface Step2ContactProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const Step2Contact: React.FC<Step2ContactProps> = ({ formData, updateFormData, errors }) => {
  const telefones: Phone[] = formData.telefones || [{ numero: '', whatsapp: false }];

  const addPhone = () => {
    if (telefones.length < 5) {
      updateFormData('telefones', [...telefones, { numero: '', whatsapp: false }]);
    }
  };

  const updatePhone = (index: number, field: 'numero' | 'whatsapp', value: string | boolean) => {
    const newTelefones = [...telefones];
    newTelefones[index] = { ...newTelefones[index], [field]: value };
    updateFormData('telefones', newTelefones);
  };

  const removePhone = (index: number) => {
    if (telefones.length > 1) {
      const newTelefones = telefones.filter((_, i) => i !== index);
      updateFormData('telefones', newTelefones);
    }
  };

  // Máscara dinâmica para telefone (aceita fixo e celular)
  const getPhoneMask = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    // Se tem mais de 10 dígitos, usa máscara de celular
    if (digits.length > 10) {
      return '99 99999-9999'; // Celular (11 dígitos: 2 DDD + 9 número)
    }
    // Se tem 10 dígitos ou menos, permite ambos os formatos
    // Usa máscara de celular para permitir continuar digitando
    return '99 99999-9999'; // Permite até 11 dígitos
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-primary mb-6">Contato Telefônico</h2>

      {telefones.map((telefone, index) => (
        <div key={index} className="space-y-4 pb-6 border-b border-muted last:border-0">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Celular {index + 1}
                </label>
                <InputMask
                  mask={getPhoneMask(telefone.numero)}
                  value={telefone.numero}
                  onChange={(e) => updatePhone(index, 'numero', e.target.value)}
                  maskChar={null}
                  alwaysShowMask={false}
                  className={cn(
                    "w-full pb-2 border-b-2 focus:outline-none text-foreground bg-transparent",
                    errors[`telefone${index}`] ? "border-destructive" : "border-accent"
                  )}
                  placeholder="99 99999-9999"
                />
                {errors[`telefone${index}`] && (
                  <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                    <span>⚠️</span>
                    <span>{errors[`telefone${index}`]}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`whatsapp-${index}`}
                  checked={telefone.whatsapp}
                  onChange={(e) => updatePhone(index, 'whatsapp', e.target.checked)}
                  className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                />
                <label htmlFor={`whatsapp-${index}`} className="text-sm text-foreground">
                  WhatsApp: {telefone.whatsapp ? '✅ Sim, tenho!' : 'Não tenho'}
                </label>
              </div>
            </div>

            {telefones.length < 5 && index === telefones.length - 1 && (
              <button
                type="button"
                onClick={addPhone}
                className="mt-8 w-10 h-10 rounded-full bg-accent hover:bg-accent/90 text-white flex items-center justify-center transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      ))}

      {telefones.length >= 5 && (
        <p className="text-sm text-muted-foreground text-center">
          Você atingiu o limite máximo de 5 telefones
        </p>
      )}
    </div>
  );
};

export default Step2Contact;
