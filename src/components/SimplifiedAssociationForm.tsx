import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import {
  validateEmail,
  validateFullName,
  validatePhone,
} from '@/lib/validation-utils';
import { useEmailService } from '@/hooks/useEmailService';
import { CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface FormData {
  nomeCompleto: string;
  telefone: string;
  email: string;
  aceitouTermos: boolean;
}

const renderTemplate = (template: string, variables: Record<string, string>): string => {
  let rendered = template
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    rendered = rendered.replace(regex, value || `{{${key}}}`)
  })
  return rendered
}

const SimplifiedAssociationForm: React.FC = () => {
  const navigate = useNavigate();
  const { sendEmail } = useEmailService();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: '',
    telefone: '',
    email: '',
    aceitouTermos: false,
  });

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = 'É obrigatório informar o seu nome completo';
    } else if (!validateFullName(formData.nomeCompleto)) {
      newErrors.nomeCompleto = 'Informe seu nome completo (mínimo 2 palavras)';
    }

    const phoneDigits = formData.telefone.replace(/\D/g, '');
    if (!phoneDigits) {
      newErrors.telefone = 'É obrigatório informar o seu telefone';
    } else if (!validatePhone(formData.telefone)) {
      newErrors.telefone = 'Telefone inválido (deve ter 10 ou 11 dígitos)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'É obrigatório informar o seu e-mail';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.aceitouTermos) {
      newErrors.aceitouTermos = 'Você deve aceitar os termos para continuar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const candidatoData = {
        full_name: formData.nomeCompleto,
        phones: [{ numero: formData.telefone, whatsapp: false }],
        whatsapp: formData.telefone.replace(/\D/g, ''),
        email: formData.email,
        email_confirmation: formData.email,
        terms_accepted: formData.aceitouTermos,
        status: 'novo',
        cpf: '',
      };

      const { error } = await supabase
        .from('association_forms')
        .insert(candidatoData);

      if (error) {
        throw error;
      }

      await sendConfirmationEmails();

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao salvar candidatura:', error);
      toast.error('Erro ao enviar candidatura. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendConfirmationEmails = async () => {
    try {
      const { data: settings } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['contact_email', 'contact_phone']);

      const emailCooprosoja = settings?.find(s => s.setting_key === 'contact_email')?.setting_value || 'contato@cooprosoja.com.br';
      const telefoneCooprosoja = settings?.find(s => s.setting_key === 'contact_phone')?.setting_value || '';
      const dataEnvio = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const adminUrl = `${window.location.origin}/admin/candidatos`;

      const variables = {
        nome: formData.nomeCompleto,
        email: formData.email,
        telefone: formData.telefone,
        telefone_cooprosoja: telefoneCooprosoja,
        email_cooprosoja: emailCooprosoja,
        data_envio: dataEnvio,
        admin_url: adminUrl,
      };

      const { data: templates } = await supabase
        .from('email_templates')
        .select('*')
        .in('type', ['user_confirmation', 'admin_notification'])
        .eq('is_active', true);

      const userTemplate = templates?.find(t => t.type === 'user_confirmation');
      const adminTemplate = templates?.find(t => t.type === 'admin_notification');

      const emailPromises = [];

      if (userTemplate) {
        const subject = renderTemplate(userTemplate.subject, variables);
        const html = renderTemplate(userTemplate.html_body, variables);
        const text = userTemplate.text_body ? renderTemplate(userTemplate.text_body, variables) : undefined;
        emailPromises.push(sendEmail({ to: formData.email, subject, html, text }));
      }

      if (adminTemplate) {
        const subject = renderTemplate(adminTemplate.subject, variables);
        const html = renderTemplate(adminTemplate.html_body, variables);
        const text = adminTemplate.text_body ? renderTemplate(adminTemplate.text_body, variables) : undefined;
        emailPromises.push(sendEmail({ to: emailCooprosoja, subject, html, text }));
      }

      await Promise.allSettled(emailPromises);
    } catch (error) {
      console.error('Erro ao enviar emails de confirmação:', error);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Quero ser Cooperado</h1>
        <p className="text-sm text-muted-foreground">
          Preencha o formulário abaixo e nossa equipe entrará em contato para dar continuidade ao processo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nomeCompleto" className="text-base font-medium">
            Nome Completo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nomeCompleto"
            type="text"
            placeholder="Digite seu nome completo"
            value={formData.nomeCompleto}
            onChange={(e) => updateFormData('nomeCompleto', e.target.value)}
            className={errors.nomeCompleto ? 'border-destructive' : ''}
          />
          {errors.nomeCompleto && (
            <p className="text-sm text-destructive">{errors.nomeCompleto}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone" className="text-base font-medium">
            Telefone de Contato <span className="text-destructive">*</span>
          </Label>
          <Input
            id="telefone"
            type="tel"
            placeholder="(00) 00000-0000"
            value={formData.telefone}
            onChange={(e) => updateFormData('telefone', formatPhone(e.target.value))}
            maxLength={15}
            className={errors.telefone ? 'border-destructive' : ''}
          />
          {errors.telefone && (
            <p className="text-sm text-destructive">{errors.telefone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-medium">
            E-mail <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="termos"
              checked={formData.aceitouTermos}
              onCheckedChange={(checked) => updateFormData('aceitouTermos', checked as boolean)}
              className={errors.aceitouTermos ? 'border-destructive' : ''}
            />
            <div className="flex-1">
              <Label
                htmlFor="termos"
                className="text-sm font-normal cursor-pointer leading-relaxed"
              >
                Eu aceito os termos e condições e autorizo o uso dos meus dados para fins de
                associação à Cooprosoja. Estou ciente de que a cooperativa entrará em contato
                para prosseguir com o processo de associação.
                <span className="text-destructive"> *</span>
              </Label>
            </div>
          </div>
          {errors.aceitouTermos && (
            <p className="text-sm text-destructive ml-7">{errors.aceitouTermos}</p>
          )}
        </div>

        <div className="pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 text-white text-lg py-6"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Campos marcados com <span className="text-destructive">*</span> são obrigatórios
        </p>
      </form>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-primary">
              Solicitação Enviada com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-base mt-4">
              Obrigado pelo seu interesse em fazer parte da Cooprosoja!
              <br />
              <br />
              Nossa equipe entrará em contato em breve para dar continuidade ao processo de associação.
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

export default SimplifiedAssociationForm;
