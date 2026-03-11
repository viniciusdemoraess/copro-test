import React from 'react';
import { Plus, X } from 'lucide-react';
import { validateEmail } from '@/lib/validation-utils';
import { cn } from '@/lib/utils';

interface Step3EmailProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const Step3Email: React.FC<Step3EmailProps> = ({ formData, updateFormData, errors }) => {
  const [emailsSecundarios, setEmailsSecundarios] = React.useState<string[]>(
    formData.emailsSecundarios || []
  );

  const addEmailSecundario = () => {
    if (emailsSecundarios.length < 3) {
      const novosEmails = [...emailsSecundarios, ''];
      setEmailsSecundarios(novosEmails);
      updateFormData('emailsSecundarios', novosEmails);
    }
  };

  const removeEmailSecundario = (index: number) => {
    const novosEmails = emailsSecundarios.filter((_, i) => i !== index);
    setEmailsSecundarios(novosEmails);
    updateFormData('emailsSecundarios', novosEmails);
  };

  const updateEmailSecundario = (index: number, value: string) => {
    const novosEmails = [...emailsSecundarios];
    novosEmails[index] = value;
    setEmailsSecundarios(novosEmails);
    updateFormData('emailsSecundarios', novosEmails);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-6">Contato por E-mail</h2>

      {/* E-mail Principal */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          E-mail Principal
        </label>
        <input
          type="email"
          value={formData.emailPrincipal || ''}
          onChange={(e) => updateFormData('emailPrincipal', e.target.value)}
          placeholder="exemplo@email.com"
          className="w-full px-4 py-3 border-b-4 border-accent focus:outline-none focus:border-accent/80 text-foreground"
          maxLength={255}
        />
        {errors.emailPrincipal && (
          <p className="text-destructive text-sm mt-1 flex items-center gap-1">
            <span>⚠️</span> {errors.emailPrincipal}
          </p>
        )}
      </div>

      {/* Confirmar E-mail */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Confirme seu E-mail
        </label>
        <input
          type="email"
          value={formData.emailConfirmacao || ''}
          onChange={(e) => updateFormData('emailConfirmacao', e.target.value)}
          placeholder="exemplo@email.com"
          className="w-full px-4 py-3 border-b-4 border-accent focus:outline-none focus:border-accent/80 text-foreground"
          maxLength={255}
        />
        {errors.emailConfirmacao && (
          <p className="text-destructive text-sm mt-1 flex items-center gap-1">
            <span>⚠️</span> {errors.emailConfirmacao}
          </p>
        )}
      </div>

      {/* E-mails Secundários */}
      <div className="space-y-4">
        {emailsSecundarios.map((email, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                E-mail Secundário {index + 1}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => updateEmailSecundario(index, e.target.value)}
                placeholder="outro@email.com"
                className={cn(
                  "w-full px-4 py-3 border-b-4 focus:outline-none text-foreground",
                  errors[`emailSecundario${index}`] 
                    ? "border-destructive" 
                    : "border-muted focus:border-accent/80"
                )}
                maxLength={255}
              />
              {errors[`emailSecundario${index}`] && (
                <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                  <span>⚠️</span> {errors[`emailSecundario${index}`]}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeEmailSecundario(index)}
              className="mt-8 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}

        {/* Botão Adicionar E-mail Secundário */}
        {emailsSecundarios.length < 3 && (
          <button
            type="button"
            onClick={addEmailSecundario}
            className="flex items-center gap-2 text-accent hover:text-accent/80 font-medium transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <span>Adicionar E-mail Secundário (opcional)</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Step3Email;
