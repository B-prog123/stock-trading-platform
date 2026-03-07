import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Shield, Zap, BarChart3, ArrowRight, CheckCircle2, Wallet, LineChart } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to Stockify",
    description: "Your professional-grade stock trading and portfolio management platform. Let's get you started with a quick tour.",
    icon: <LineChart className="text-emerald-500" size={48} />,
    color: "emerald"
  },
  {
    title: "Market Analysis",
    description: "Explore real-time market data, technical charts, and trending stocks. Use our advanced search to find any asset.",
    icon: <BarChart3 className="text-blue-500" size={48} />,
    color: "blue"
  },
  {
    title: "Smart Portfolio",
    description: "Track your investments with precision. Get detailed insights into your holdings, average prices, and total returns.",
    icon: <TrendingUp className="text-purple-500" size={48} />,
    color: "purple"
  },
  {
    title: "AI Insights",
    description: "Leverage the power of Gemini AI to analyze your portfolio health and get personalized investment recommendations.",
    icon: <Zap className="text-amber-500" size={48} />,
    color: "amber"
  },
  {
    title: "Secure Trading",
    description: "Execute trades instantly with our secure infrastructure. Deposit funds to your virtual wallet and start building your wealth.",
    icon: <Shield className="text-rose-500" size={48} />,
    color: "rose"
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[var(--card-bg)] border border-[var(--border-color)] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="relative h-2 bg-[var(--hover-bg)]">
          <motion.div
            className="absolute inset-y-0 left-0 bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div className={`p-6 rounded-3xl bg-${step.color}-500/10`}>
                {step.icon}
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">{step.title}</h2>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-md">
                  {step.description}
                </p>
              </div>

              {currentStep === 0 && (
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm pt-4">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    Real-time Data
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    AI Powered
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    Zero Commission
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    Secure Wallet
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-emerald-500' : 'w-2 bg-[var(--border-color)]'
                    }`}
                />
              ))}
            </div>

            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
