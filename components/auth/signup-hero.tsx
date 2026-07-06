"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  CalendarCheck,
  HeadphonesIcon,
  Home,
  MessageSquareText,
  PhoneCall,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: PhoneCall,
    title: "AI-Powered Call Handling",
    description: "Let AI answer, qualify, and route inbound calls 24/7.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Lead Qualification",
    description: "Never miss a hot lead—AI qualifies instantly, day or night.",
  },
  {
    icon: CalendarCheck,
    title: "Appointment Scheduling",
    description: "AI books showings and follow-ups directly into your calendar.",
  },
  {
    icon: MessageSquareText,
    title: "CRM Integration",
    description: "Seamless sync with your existing CRM and pipeline tools.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time insights on calls, conversions, and team activity.",
  },
  {
    icon: Home,
    title: "Property Inquiry Automation",
    description: "Automate responses to listing questions across every channel.",
  },
];

const trustBadges = [
  "Secure Authentication",
  "Enterprise-grade Security",
  "GDPR Ready",
  "99.9% Uptime",
  "Trusted by 2,500+ Agencies",
];

export function SignupHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-xl"
    >
      {/* Glow */}
      <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent blur-3xl" />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-800/80 p-8 shadow-2xl backdrop-blur-xl dark:from-slate-950/90 dark:via-slate-900/80 dark:to-slate-900/70">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
              <Sparkles className="size-3.5" />
              Start Your Free Trial
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Transform your agency with AI
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
              Join thousands of real estate professionals who automate their
              operations, qualify leads faster, and close more deals with
              AI-powered communication.
            </p>
          </div>

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="hidden size-16 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 ring-1 ring-blue-400/20 sm:flex"
          >
            <Bot className="size-8 text-blue-300" />
          </motion.div>
        </div>

        {/* Why Choose Us features */}
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Why Choose Us
          </p>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.15 + index * 0.07,
                  duration: 0.45,
                }}
                className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 backdrop-blur transition hover:border-white/10 hover:bg-white/[0.06]"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <feature.icon className="size-4 text-blue-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white">
                    {feature.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-5"
        >
          <ShieldCheck className="size-4 text-emerald-400" />
          {trustBadges.map((badge) => (
            <span
              key={badge}
              className="text-[11px] font-medium text-slate-400"
            >
              ✓ {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
