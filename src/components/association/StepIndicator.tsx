import React from 'react';
import { User, Phone, Mail, MapPin, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const steps = [
    { icon: User, label: 'Dados Pessoais' },
    { icon: Phone, label: 'Contato' },
    { icon: Mail, label: 'E-mail' },
    { icon: MapPin, label: 'Endereço' },
    { icon: Check, label: 'Confirmação' }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {/* Linha de conexão */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2 -z-10" />
        
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const Icon = step.icon;

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors mb-2 bg-background",
                  isActive && "bg-accent border-2 border-accent",
                  isCompleted && "bg-accent",
                  !isActive && !isCompleted && "bg-muted border-2 border-muted"
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6",
                    (isActive || isCompleted) && "text-white",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}
                />
              </div>
              <span className="text-xs text-center text-muted-foreground hidden md:block">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
