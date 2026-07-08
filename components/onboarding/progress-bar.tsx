import { CheckIcon } from "lucide-react";

type Step = {
  id: string;
  name: string;
};

type ProgressBarProps = {
  steps: Step[];
  currentStepIndex: number;
};

export function ProgressBar({ steps, currentStepIndex }: ProgressBarProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden rounded-md lg:flex lg:rounded-none lg:border-l lg:border-r lg:border-gray-200 dark:lg:border-gray-800">
        {steps.map((step, stepIdx) => {
          const isComplete = currentStepIndex > stepIdx;
          const isCurrent = currentStepIndex === stepIdx;

          return (
            <li key={step.id} className="relative overflow-hidden lg:flex-1">
              <div
                className={`group flex items-center border-b-2 lg:border-b-0 lg:border-l-2 lg:border-t-2 py-4 px-6 text-sm font-medium ${
                  isComplete
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                    : isCurrent
                    ? "border-blue-600 bg-white dark:bg-zinc-900"
                    : "border-transparent bg-gray-50 dark:bg-zinc-950"
                }`}
              >
                <span className="flex flex-col">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      isComplete
                        ? "text-blue-600 dark:text-blue-400"
                        : isCurrent
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500"
                    }`}
                  >
                    Step {stepIdx + 1}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isComplete || isCurrent
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </span>
                </span>
                
                {isComplete && (
                   <span className="ml-auto w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                     <CheckIcon className="w-4 h-4 text-white" />
                   </span>
                )}
              </div>
              
              {/* Arrow separator for lg screens */}
              {stepIdx !== steps.length - 1 ? (
                <div className="absolute right-0 top-0 hidden h-full w-5 lg:block" aria-hidden="true">
                  <svg
                    className="h-full w-full text-gray-300 dark:text-gray-800"
                    viewBox="0 0 22 80"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 -2L20 40L0 82"
                      vectorEffect="non-scaling-stroke"
                      stroke="currentcolor"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
