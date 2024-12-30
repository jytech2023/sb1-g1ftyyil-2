import React from 'react';
import { CheckCircle } from 'lucide-react';

interface Props {
  currentStep: 'details' | 'confirmation';
}

export default function CartSteps({ currentStep }: Props) {
  const steps = [
    { key: 'details', label: 'Delivery Details' },
    { key: 'confirmation', label: 'Confirm Order' }
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.key}>
          {/* Step */}
          <div className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full
              ${currentStep === step.key ? 'bg-orange-500 text-white' : 
                index < steps.findIndex(s => s.key === currentStep) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
            `}>
              {index < steps.findIndex(s => s.key === currentStep) ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep === step.key ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>

          {/* Connector */}
          {index < steps.length - 1 && (
            <div className="flex-1 mx-4 h-0.5 bg-gray-200" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}