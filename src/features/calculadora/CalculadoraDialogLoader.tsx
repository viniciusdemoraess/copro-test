import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useCalculadora } from './CalculadoraContext';

// Carrega o dialog (e todo o wizard) sob demanda, apenas após a primeira
// abertura — mantém o chunk da calculadora fora do bundle inicial.
const CalculadoraDialog = lazy(() => import('./CalculadoraDialog'));

export function CalculadoraDialogLoader() {
  const { open } = useCalculadora();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open && !mounted) setMounted(true);
  }, [open, mounted]);

  if (!mounted) return null;

  return (
    <Suspense fallback={null}>
      <CalculadoraDialog />
    </Suspense>
  );
}
