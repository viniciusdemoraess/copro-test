import React from 'react';
import { TermosViewModal } from './TermosViewModal';

interface Step4ConfirmationProps {
  formData: any;
}

const Step4Confirmation: React.FC<Step4ConfirmationProps> = ({ formData }) => {
  const [aceitouTermos, setAceitouTermos] = React.useState(formData.aceitouTermos || false);
  const [showTermosModal, setShowTermosModal] = React.useState(false);

  const handleCheckboxChange = (checked: boolean) => {
    setAceitouTermos(checked);
    // Update parent form data
    if (formData.updateFormData) {
      formData.updateFormData('aceitouTermos', checked);
    }
  };
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-primary mb-6">Revisão dos Dados</h2>

      {/* Dados Pessoais */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-primary mb-3">Dados Pessoais:</h3>
        <div className="grid md:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">CPF:</span>
            <span className="ml-2 text-foreground">{formData.cpf}</span>
          </div>
          <div>
            <span className="text-muted-foreground">RG:</span>
            <span className="ml-2 text-foreground">{formData.rg} {formData.rgOrgao}</span>
          </div>
          <div className="md:col-span-2">
            <span className="text-muted-foreground">Nome:</span>
            <span className="ml-2 text-foreground">{formData.nomeCompleto}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Data de Nascimento:</span>
            <span className="ml-2 text-foreground">{formData.dataNascimento}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Nacionalidade:</span>
            <span className="ml-2 text-foreground">{formData.nacionalidade}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Estado Civil:</span>
            <span className="ml-2 text-foreground">{formData.estadoCivil}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Profissão:</span>
            <span className="ml-2 text-foreground">{formData.profissao}</span>
          </div>
        </div>
      </div>

      {/* Contatos Telefônicos */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-primary mb-3">Contatos Telefônicos:</h3>
        <div className="space-y-2 text-sm">
          {formData.telefones?.map((telefone: any, index: number) => (
            <div key={index}>
              <span className="text-muted-foreground">Celular {index + 1}:</span>
              <span className="ml-2 text-foreground">{telefone.numero}</span>
              <span className="ml-2 text-foreground">
                - WhatsApp: {telefone.whatsapp ? '✅ Sim' : '❌ Não'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* E-mails */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-primary mb-3">E-mails:</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">E-mail Principal:</span>
            <span className="ml-2 text-foreground">{formData.emailPrincipal || '-'}</span>
          </div>
          {formData.emailsSecundarios?.filter((email: string) => email.trim()).map((email: string, index: number) => (
            <div key={index}>
              <span className="text-muted-foreground">E-mail Secundário {index + 1}:</span>
              <span className="ml-2 text-foreground">{email}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-primary mb-3">Endereço:</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">CEP:</span>
            <span className="ml-2 text-foreground">{formData.cep}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Logradouro:</span>
            <span className="ml-2 text-foreground">
              {formData.logradouro}, {formData.numero}
            </span>
          </div>
          {formData.complemento && (
            <div>
              <span className="text-muted-foreground">Complemento:</span>
              <span className="ml-2 text-foreground">{formData.complemento}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Bairro:</span>
            <span className="ml-2 text-foreground">{formData.bairro}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Cidade/Estado:</span>
            <span className="ml-2 text-foreground">
              {formData.municipio} - {formData.estado}
            </span>
          </div>
        </div>
      </div>

      {/* Checkbox Aceitar Termos */}
      <div className="bg-accent/10 border-2 border-accent rounded-lg p-4 mt-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={aceitouTermos}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-2 border-accent text-accent focus:ring-accent"
          />
          <span className="text-sm text-foreground">
            Li e aceito os{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowTermosModal(true);
              }}
              className="font-semibold text-primary hover:underline cursor-pointer"
            >
              termos de associação
            </button>{' '}
            da Cooprosoja
          </span>
        </label>
      </div>

      {/* Termos View Modal */}
      <TermosViewModal
        isOpen={showTermosModal}
        onClose={() => setShowTermosModal(false)}
      />
    </div>
  );
};

export default Step4Confirmation;
