import React, { useState } from 'react';
import { X, Headphones, Play, SkipForward } from 'lucide-react';

interface EarbudTutorialProps {
  onClose: () => void;
}

export const EarbudTutorial: React.FC<EarbudTutorialProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Put on your earbuds",
      description: "Make sure your earbuds or headphones are connected and working",
      icon: <Headphones className="w-16 h-16 text-accent-start" />,
      animation: "animate-pulse"
    },
    {
      title: "Stay on the main screen",
      description: "Make sure you're on the main discovery screen (not during recording or viewing results)",
      icon: <Play className="w-16 h-16 text-accent-start" />,
      animation: "animate-bounce"
    },
    {
      title: "Tap 'Next Track' gesture",
      description: "Use the Next Track button on your earbuds to start music discovery automatically",
      icon: <SkipForward className="w-16 h-16 text-accent-start" />,
      animation: "animate-pulse"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div
        className="relative bg-primary-dark/90 backdrop-blur-sm border border-primary-highlight/30 rounded-2xl p-6 max-w-md mx-4 w-full overflow-hidden"
        style={{
          background: `
            linear-gradient(135deg, rgba(26, 26, 46, 0.9), rgba(22, 33, 62, 0.95)),
            radial-gradient(circle at 20% 80%, rgba(0, 212, 170, 0.1), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(1, 163, 255, 0.05), transparent 50%)
          `,
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 0 1px rgba(75, 94, 138, 0.2)
          `
        }}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-start/5 to-accent-end/5 animate-pulse-slow" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">Earbud Control Guide</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-primary-highlight/20 hover:bg-primary-highlight/40 transition-all duration-200"
            >
              <X className="w-5 h-5 text-text-primary" />
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-gradient-to-r from-accent-start to-accent-end'
                    : index < currentStep
                    ? 'bg-accent-start/60'
                    : 'bg-primary-highlight/30'
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          <div className="text-center mb-8">
            {/* Animated Icon */}
            <div className={`flex justify-center mb-6 ${currentStepData.animation}`}>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-accent-start/20 to-accent-end/20 border border-accent-start/30">
                {currentStepData.icon}
              </div>
            </div>

            {/* Step Title */}
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              {currentStepData.title}
            </h3>

            {/* Step Description */}
            <p className="text-text-secondary leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Additional Info for Last Step */}
            {currentStep === steps.length - 1 && (
              <div className="mt-6 p-4 rounded-xl bg-primary-highlight/10 border border-primary-highlight/20">
                <p className="text-sm text-text-secondary">
                  💡 <strong>Pro tip:</strong> The app will show a toast notification when it starts discovery via your earbuds!
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                currentStep === 0
                  ? 'text-text-secondary/50 cursor-not-allowed'
                  : 'text-text-secondary hover:text-text-primary bg-primary-highlight/20 hover:bg-primary-highlight/40'
              }`}
            >
              Previous
            </button>

            <span className="text-text-secondary text-sm">
              {currentStep + 1} of {steps.length}
            </span>

            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-accent-start to-accent-end text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              {currentStep === steps.length - 1 ? 'Got it!' : 'Next'}
            </button>
          </div>

          {/* Skip Button */}
          {currentStep !== steps.length - 1 && (
            <div className="text-center mt-4">
              <button
                onClick={onClose}
                className="text-text-secondary text-sm hover:text-text-primary transition-colors duration-200"
              >
                Skip tutorial
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};