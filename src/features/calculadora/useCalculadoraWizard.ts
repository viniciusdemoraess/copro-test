import { useCallback, useEffect, useRef, useState } from 'react';
import { INITIAL_FORM_DATA, SESSION_STORAGE_KEY, STEPS } from './constants';
import { validateStepData } from './schemas';
import type { CalculadoraErrors, StepId, WizardFormData } from './types';

interface PersistedState {
  formData: WizardFormData;
  stepId: StepId;
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed?.formData || !parsed?.stepId) return null;
    // Merge para tolerar mudanças de schema entre versões.
    return {
      formData: { ...INITIAL_FORM_DATA, ...parsed.formData },
      stepId: parsed.stepId,
    };
  } catch {
    return null;
  }
}

function persist(state: PersistedState) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Modo privado / storage indisponível — ignora.
  }
}

// Sequência de etapas respeitando o fluxo condicional de financiamento (§2.2).
function visibleSteps(financiada: boolean): StepId[] {
  return STEPS.filter((s) => s.id !== 'financiamento' || financiada).map(
    (s) => s.id
  );
}

export function useCalculadoraWizard() {
  const persistedRef = useRef<PersistedState | null>(null);
  if (persistedRef.current === null) {
    persistedRef.current = loadPersisted();
  }

  const [formData, setFormData] = useState<WizardFormData>(
    () => persistedRef.current?.formData ?? INITIAL_FORM_DATA
  );
  const [currentStep, setCurrentStep] = useState<StepId>(
    () => persistedRef.current?.stepId ?? 'areas'
  );
  const [errors, setErrors] = useState<CalculadoraErrors>({});

  const steps = visibleSteps(formData.financiada);

  // Persiste a cada mudança de etapa/estado.
  useEffect(() => {
    persist({ formData, stepId: currentStep });
  }, [formData, currentStep]);

  const updateField = useCallback(
    <K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  const goBack = useCallback(() => {
    setErrors({});
    setCurrentStep((curr) => {
      const seq = visibleSteps(formData.financiada);
      const idx = seq.indexOf(curr);
      return idx > 0 ? seq[idx - 1] : curr;
    });
  }, [formData.financiada]);

  const goToStep = useCallback(
    (stepId: StepId) => {
      const seq = visibleSteps(formData.financiada);
      const targetIdx = seq.indexOf(stepId);
      const currentIdx = seq.indexOf(currentStep);
      // Só permite navegar para etapas já alcançadas (regressivas).
      if (targetIdx !== -1 && targetIdx <= currentIdx) {
        setErrors({});
        setCurrentStep(stepId);
      }
    },
    [formData.financiada, currentStep]
  );

  // Valida a etapa atual e, se válida, avança (pulando financiamento se preciso).
  const goNext = useCallback((): boolean => {
    const { valid, errors: stepErrors } = validateStepData(currentStep, formData);
    if (!valid) {
      setErrors(stepErrors);
      return false;
    }
    setErrors({});
    const seq = visibleSteps(formData.financiada);
    const idx = seq.indexOf(currentStep);
    if (idx !== -1 && idx < seq.length - 1) {
      setCurrentStep(seq[idx + 1]);
    }
    return true;
  }, [currentStep, formData]);

  const reset = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep('areas');
    setErrors({});
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignora
    }
  }, []);

  const currentIndex = steps.indexOf(currentStep);
  const isLastInputStep = currentStep === 'financiamento';

  return {
    formData,
    currentStep,
    currentIndex,
    steps,
    errors,
    isLastInputStep,
    updateField,
    goNext,
    goBack,
    goToStep,
    reset,
  };
}

export type CalculadoraWizard = ReturnType<typeof useCalculadoraWizard>;
