import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AlreadyAssociated: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [nome, setNome] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarNomeAssociado = async () => {
      try {
        // Tenta pegar o CPF da URL ou do localStorage
        const cpfFromUrl = searchParams.get('cpf');
        const associationData = localStorage.getItem('associationData');
        let cpf = cpfFromUrl;

        if (!cpf && associationData) {
          try {
            const data = JSON.parse(associationData);
            cpf = data.cpf?.replace(/\D/g, '');
          } catch (e) {
            console.error('Erro ao ler dados do localStorage:', e);
          }
        }

        if (cpf) {
          const cpfLimpo = cpf.replace(/\D/g, '');

          // Busca o nome do associado pelo CPF
          const { data, error } = await supabase
            .from('association_forms')
            .select('full_name')
            .eq('cpf', cpfLimpo)
            .maybeSingle();

          if (!error && data?.full_name) {
            setNome(data.full_name);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar nome do associado:', error);
      } finally {
        setLoading(false);
      }
    };

    buscarNomeAssociado();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <CheckCircle2 className="w-16 h-16 text-accent mx-auto" />

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white">
            Você já faz parte da associação
          </h1>
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-white/80">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Carregando...</span>
            </div>
          ) : (
            <>
              {nome && (
                <p className="text-xl font-semibold text-accent">
                  Olá, {nome}!
                </p>
              )}
              <p className="text-white/80">
                Obrigado por fazer parte da nossa associação.
                <br />
                Seu CPF já está cadastrado em nosso sistema.
              </p>
            </>
          )}
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para o início
        </button>
      </div>
    </div>
  );
};

export default AlreadyAssociated;
