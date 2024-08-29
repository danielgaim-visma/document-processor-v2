import React from 'react';

const StepIndicator = ({ steps, currentStep }) => (
  <div className="flex items-center justify-between mb-12">
    {steps.map((step, index) => (
      <div key={step.name} className="flex flex-col items-center">
        <div className={`rounded-full transition duration-500 ease-in-out h-16 w-16 flex items-center justify-center border-2 ${
          index <= currentStep ? 'border-blue-400 bg-blue-900' : 'border-gray-600 bg-gray-700'
        }`}>
          <step.icon size={24} className={index <= currentStep ? 'text-blue-400' : 'text-gray-400'} />
        </div>
        <div className="text-center mt-4">
          <span className={`text-xs font-medium uppercase ${
            index <= currentStep ? 'text-blue-400' : 'text-gray-500'
          }`}>
            {step.name}
          </span>
        </div>
      </div>
    ))}
  </div>
);

export default StepIndicator;