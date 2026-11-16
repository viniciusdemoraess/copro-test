import React, { createContext, useCallback, useContext, useState } from 'react';

interface CalculadoraContextValue {
  open: boolean;
  openCalculadora: () => void;
  closeCalculadora: () => void;
  setOpen: (open: boolean) => void;
}

const CalculadoraContext = createContext<CalculadoraContextValue | null>(null);

export function CalculadoraProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openCalculadora = useCallback(() => setOpen(true), []);
  const closeCalculadora = useCallback(() => setOpen(false), []);

  return (
    <CalculadoraContext.Provider
      value={{ open, openCalculadora, closeCalculadora, setOpen }}
    >
      {children}
    </CalculadoraContext.Provider>
  );
}

export function useCalculadora() {
  const ctx = useContext(CalculadoraContext);
  if (!ctx) {
    throw new Error('useCalculadora deve ser usado dentro de CalculadoraProvider');
  }
  return ctx;
}
