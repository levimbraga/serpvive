"use client";

const STEPS = [
  "Connect Google Search Console",
  "Select your site",
  "Importing data",
];

type OnboardingProgressProps = {
  currentStep: 1 | 2 | 3;
};

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <div className="w-full max-w-md mx-auto mb-10">
      <p className="text-sm text-[#6B7280] text-center mb-4">
        Step {currentStep} of 3:{" "}
        <span className="text-[#111827] font-medium">{STEPS[currentStep - 1]}</span>
      </p>
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={i} className="flex items-center">
              {/* Dot */}
              <div
                className={`w-3 h-3 rounded-full shrink-0 transition-colors ${
                  isCompleted
                    ? "bg-[#3B82F6]"
                    : isCurrent
                      ? "bg-[#3B82F6] ring-4 ring-[#3B82F6]/20"
                      : "bg-[#D1D5DB]"
                }`}
              />
              {/* Connector line (not after last dot) */}
              {i < STEPS.length - 1 && (
                <div
                  className={`w-24 h-0.5 transition-colors ${
                    stepNum < currentStep ? "bg-[#3B82F6]" : "bg-[#E5E7EB]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
