import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  number: number;
}

const steps: Step[] = [
  { label: "Dados", number: 1 },
  { label: "Revisão", number: 2 },
  { label: "Pagamento", number: 3 },
  { label: "Confirmação", number: 4 },
];

interface CheckoutStepsProps {
  currentStep: number;
}

const CheckoutSteps = ({ currentStep }: CheckoutStepsProps) => {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-2xl mx-auto mb-8">
      {steps.map((step, i) => (
        <div key={step.number} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                currentStep > step.number
                  ? "bg-primary border-primary text-primary-foreground"
                  : currentStep === step.number
                  ? "bg-primary border-primary text-primary-foreground scale-110"
                  : "bg-muted border-border text-muted-foreground"
              )}
            >
              {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
            </div>
            <span
              className={cn(
                "text-xs mt-1 font-heading font-medium whitespace-nowrap",
                currentStep >= step.number ? "text-primary" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 flex-1 mx-2 mt-[-1rem] transition-all",
                currentStep > step.number ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default CheckoutSteps;
