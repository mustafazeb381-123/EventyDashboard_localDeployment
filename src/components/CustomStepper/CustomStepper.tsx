import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepData {
  label: string;
  completed?: boolean;
  active?: boolean;
}

interface CustomStepperProps {
  steps: StepData[];
  activeStep: number;
  className?: string;
  connectorStateColors?: boolean;
  nonLinear?: boolean;
  hideConnectors?: boolean | "inactive";
  onStepClick?: (stepIndex: number) => void;
}

const CustomStepper: React.FC<CustomStepperProps> = ({
  steps,
  activeStep,
  className,
  onStepClick,
}) => {
  const handleStepClick = (stepIndex: number) => {
    if (onStepClick) {
      onStepClick(stepIndex);
    }
  };

  return (
    <motion.div
      className={cn(
        "relative w-full min-w-full px-4 sm:px-6 lg:px-8",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}>
      <div className="flex justify-between items-center w-full relative">
        {/* Full Width Background Line */}
        <div className="absolute top-2 md:top-4 left-0 right-0 h-[4px] bg-gray-200 rounded-full z-0"></div>

        {/* Active Progress Line */}
        <motion.div
          className="absolute top-2 md:top-4 left-0 h-[4px] bg-gradient-to-r from-[#0F4999] to-[#1A1F58] rounded-full z-0"
          initial={{ width: "0%" }}
          animate={{
            width: `${
              activeStep > 0 ? (activeStep / (steps.length - 1)) * 100 : 0
            }%`,
          }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
            type: "spring",
            stiffness: 80,
            damping: 20,
          }}></motion.div>

        {/* Step Circles */}
        <AnimatePresence mode="wait">
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;

            return (
              <motion.div
                key={index}
                className="flex flex-col items-center z-10 relative flex-shrink-0 -mx-8 sm:-mx-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 120,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}>
                {/* Step Circle */}
                <motion.div
                  className={cn(
                    "flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full border-2 text-[10px] sm:text-xs lg:text-sm font-medium cursor-pointer bg-gray-400",
                    {
                      "border-white text-white": isActive,
                      "bg-gradient-to-r from-[#0F4999] to-[#1A1F58] border-orange-400 text-white":
                        isCompleted,
                      "bg-gray-200 border-white text-white":
                        !isActive && !isCompleted,
                    }
                  )}
                  onClick={() => handleStepClick(index)}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{
                    scale: { duration: 0.3, ease: "easeInOut" },
                  }}
                  whileHover={{
                    y: -2,
                  }}>
                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.svg
                        key="checkmark"
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}>
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </motion.svg>
                    ) : (
                      <motion.span
                        key="number"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}>
                        {index + 1}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Step Label */}
                <motion.div
                  className="text-center mt-1 sm:mt-2 max-w-[80px] sm:max-w-[120px] lg:max-w-none"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}>
                  <span
                    className={cn(
                      "text-[10px] sm:text-[12px] lg:text-[14px] whitespace-nowrap overflow-hidden text-ellipsis block font-medium transition-colors duration-300",
                      isActive || isCompleted
                        ? "text-[#1A1F58]"
                        : "text-gray-400"
                    )}>
                    {step.label}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CustomStepper;
