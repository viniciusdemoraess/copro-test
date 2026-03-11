import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import StepIndicator from './association/StepIndicator';
import Step1Personal from './association/Step1Personal';
import Step2Contact from './association/Step2Contact';
import Step3Email from './association/Step3Email';
import Step3Address from './association/Step3Address';
import Step4Confirmation from './association/Step4Confirmation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  validateCPF,
  validatePhone,
  validateEmail,
  validateBirthDate,
  validateCEP,
  validateFullName,
  validateTextOnly,
} from '@/lib/validation-utils';

interface FormData {
  cpf: string;
  rg: string;
  rgOrgao: string;
  nomeCompleto: string;
  dataNascimento: string;
  nacionalidade: string;
  estadoCivil: string;
  profissao: string;
  telefones: Array<{ numero: string; whatsapp: boolean }>;
  emailPrincipal: string;
  emailConfirmacao: string;
  emailsSecundarios: string[];
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  estado: string;
  aceitouTermos: boolean;
}

interface AssociationFormProps {
  initialCpf?: string;
}

const AssociationForm: React.FC<AssociationFormProps> = ({ initialCpf = '' }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    cpf: initialCpf,
    rg: '',
    rgOrgao: 'SSP-MT',
    nomeCompleto: '',
    dataNascimento: '',
    nacionalidade: '',
    estadoCivil: '',
    profissao: '',
    telefones: [{ numero: '', whatsapp: false }],
    emailPrincipal: '',
    emailConfirmacao: '',
    emailsSecundarios: [],
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    municipio: '',
    estado: '',
    aceitouTermos: false
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      // Validação CPF
      const cpfDigits = formData.cpf.replace(/\D/g, '');
      if (!cpfDigits) {
        newErrors.cpf = 'É obrigatório informar o seu CPF';
      } else if (cpfDigits.length !== 11) {
        newErrors.cpf = 'CPF deve conter 11 dígitos';
      } else if (!validateCPF(formData.cpf)) {
        newErrors.cpf = 'CPF inválido';
      }

      // Validação RG
      const rgDigits = formData.rg.replace(/\D/g, '');
      if (!rgDigits) {
        newErrors.rg = 'É obrigatório informar seu RG';
      } else if (rgDigits.length < 7) {
        newErrors.rg = 'RG deve conter pelo menos 7 dígitos';
      }

      // Validação Nome Completo
      if (!formData.nomeCompleto.trim()) {
        newErrors.nomeCompleto = 'É obrigatório informar o seu nome completo';
      } else if (!validateFullName(formData.nomeCompleto)) {
        newErrors.nomeCompleto = 'Informe seu nome completo (mínimo 2 palavras)';
      }

      // Validação Data de Nascimento
      const dataDigits = formData.dataNascimento.replace(/\D/g, '');
      if (!dataDigits) {
        newErrors.dataNascimento = 'É obrigatório informar sua data de nascimento';
      } else {
        const dateValidation = validateBirthDate(formData.dataNascimento);
        if (!dateValidation.valid) {
          newErrors.dataNascimento = dateValidation.error || 'Data de nascimento inválida';
        }
      }

      // Validação Nacionalidade
      if (!formData.nacionalidade.trim()) {
        newErrors.nacionalidade = 'É obrigatório informar sua nacionalidade';
      } else if (!validateTextOnly(formData.nacionalidade, 2)) {
        newErrors.nacionalidade = 'Nacionalidade deve conter apenas letras';
      }

      // Validação Estado Civil
      if (!formData.estadoCivil) {
        newErrors.estadoCivil = 'É obrigatório informar seu estado civil';
      }

      // Validação Profissão
      if (!formData.profissao.trim()) {
        newErrors.profissao = 'É obrigatório informar sua profissão';
      } else if (!validateTextOnly(formData.profissao, 2)) {
        newErrors.profissao = 'Profissão deve conter apenas letras';
      }
    }

    if (currentStep === 2) {
      formData.telefones.forEach((telefone, index) => {
        const phoneDigits = telefone.numero.replace(/\D/g, '');
        if (!phoneDigits) {
          newErrors[`telefone${index}`] = 'É obrigatório informar o seu Telefone';
        } else if (!validatePhone(telefone.numero)) {
          newErrors[`telefone${index}`] = 'Telefone inválido (deve ter 10 ou 11 dígitos)';
        }
      });
    }

    if (currentStep === 3) {
      // Validação Email Principal
      if (!formData.emailPrincipal.trim()) {
        newErrors.emailPrincipal = 'É obrigatório informar o seu e-mail';
      } else if (!validateEmail(formData.emailPrincipal)) {
        newErrors.emailPrincipal = 'E-mail inválido';
      }

      // Validação Confirmação de Email
      if (!formData.emailConfirmacao.trim()) {
        newErrors.emailConfirmacao = 'É obrigatório confirmar o seu e-mail';
      } else if (formData.emailPrincipal !== formData.emailConfirmacao) {
        newErrors.emailConfirmacao = 'Os e-mails não correspondem';
      }

      // Validação Emails Secundários (se preenchidos)
      formData.emailsSecundarios.forEach((email: string, index: number) => {
        if (email.trim() && !validateEmail(email)) {
          newErrors[`emailSecundario${index}`] = 'E-mail secundário inválido';
        }
      });
    }

    if (currentStep === 4) {
      // Validação CEP
      const cepDigits = formData.cep.replace(/\D/g, '');
      if (!cepDigits) {
        newErrors.cep = 'É obrigatório informar o CEP';
      } else if (!validateCEP(formData.cep)) {
        newErrors.cep = 'CEP inválido (deve conter 8 dígitos)';
      }

      // Validação Logradouro
      if (!formData.logradouro.trim()) {
        newErrors.logradouro = 'É obrigatório informar o logradouro';
      } else if (formData.logradouro.trim().length < 3) {
        newErrors.logradouro = 'Logradouro deve ter pelo menos 3 caracteres';
      }

      // Validação Município
      if (!formData.municipio.trim()) {
        newErrors.municipio = 'É obrigatório informar o Município';
      } else if (!validateTextOnly(formData.municipio, 2)) {
        newErrors.municipio = 'Município deve conter apenas letras';
      }

      // Validação Estado
      if (!formData.estado) {
        newErrors.estado = 'É obrigatório informar o Estado';
      }
    }

    if (currentStep === 5) {
      if (!formData.aceitouTermos) {
        newErrors.aceitouTermos = 'Você deve aceitar os termos para finalizar';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      // Find WhatsApp number
      const whatsappPhone = formData.telefones.find(t => t.whatsapp)?.numero || formData.telefones[0]?.numero || null;

      // Prepare data for database
      const candidatoData = {
        cpf: formData.cpf.replace(/\D/g, ''),
        rg: formData.rg.replace(/\D/g, '') || null,
        rg_orgao: formData.rgOrgao || 'SSP-MT',
        full_name: formData.nomeCompleto,
        birth_date: formData.dataNascimento || null,
        nationality: formData.nacionalidade || null,
        marital_status: formData.estadoCivil || null,
        profession: formData.profissao || null,
        phones: formData.telefones,
        whatsapp: whatsappPhone ? whatsappPhone.replace(/\D/g, '') : null,
        email: formData.emailPrincipal,
        email_confirmation: formData.emailConfirmacao,
        secondary_emails: formData.emailsSecundarios.filter(e => e),
        cep: formData.cep.replace(/\D/g, '') || null,
        street: formData.logradouro || null,
        number: formData.numero || null,
        complement: formData.complemento || null,
        neighborhood: formData.bairro || null,
        city: formData.municipio || null,
        state: formData.estado || null,
        terms_accepted: formData.aceitouTermos,
        status: 'novo',
      };

      const { error } = await supabase
        .from('association_forms')
        .insert(candidatoData);

      if (error) {
        if (error.code === '23505') {
          // CPF já cadastrado - redirecionar para tela de já associado
          const cpfLimpo = formData.cpf.replace(/\D/g, '');
          window.location.href = `/associacao?status=ja-associado&cpf=${cpfLimpo}`;
          return;
        } else {
          throw error;
        }
      }

      // Also save to localStorage as backup
      localStorage.setItem('associationData', JSON.stringify(formData));

      // Mostrar modal de sucesso
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Erro ao salvar candidatura:', error);
      toast.error('Erro ao enviar candidatura. Tente novamente.');
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Seja Associado</h1>
        <p className="text-sm text-muted-foreground">
          São apenas algumas etapas para dar início a sua participação como cooperado aqui na Cooprosoja.
        </p>
      </div>

      <StepIndicator currentStep={currentStep} totalSteps={5} />

      {currentStep === 1 && (
        <Step1Personal
          formData={formData}
          updateFormData={updateFormData}
          errors={errors}
        />
      )}
      {currentStep === 2 && (
        <Step2Contact
          formData={formData}
          updateFormData={updateFormData}
          errors={errors}
        />
      )}
      {currentStep === 3 && (
        <Step3Email
          formData={formData}
          updateFormData={updateFormData}
          errors={errors}
        />
      )}
      {currentStep === 4 && (
        <Step3Address
          formData={formData}
          updateFormData={updateFormData}
          errors={errors}
        />
      )}
      {currentStep === 5 && (
        <Step4Confirmation
          formData={{ ...formData, updateFormData }}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 gap-4">
        {currentStep > 1 && (
          <button
            onClick={handlePrevious}
            className="flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary hover:bg-primary/5 rounded-lg font-semibold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
        )}

        {currentStep < 5 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors ml-auto"
          >
            Avançar
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!formData.aceitouTermos}
            className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg font-semibold transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Finalizar Associação
          </button>
        )}
      </div>

      {/* Modal de Sucesso */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-primary">
              Associação Realizada com Sucesso! 🎉
            </DialogTitle>
            <DialogDescription className="text-base mt-4">
              Parabéns! Sua solicitação de associação foi enviada com sucesso.
              <br />
              <br />
              Nossa equipe entrará em contato em breve para dar continuidade ao processo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handleCloseSuccessModal}
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white"
            >
              Voltar para a Página Inicial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AssociationForm;
