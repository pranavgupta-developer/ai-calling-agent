"use client";

import { motion } from "framer-motion";
import {
  Bot,
  CalendarDays,
  Home,
  PhoneCall,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const stats = [
  { label: "Active Calls", value: "18", icon: PhoneCall },
  { label: "Leads Today", value: "47", icon: TrendingUp },
  { label: "Appointments", value: "12", icon: CalendarDays },
];

export function LoginHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-xl"
    >
      <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent blur-3xl" />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-800/80 p-8 shadow-2xl backdrop-blur-xl dark:from-slate-950/90 dark:via-slate-900/80 dark:to-slate-900/70">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
              <Sparkles className="size-3.5" />
              AI-Powered Operations
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Your agency command center
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
              Manage properties, qualify leads, book appointments, and let your AI
              calling assistant handle inbound inquiries around the clock.
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

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.08, duration: 0.45 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
            >
              <div className="mb-3 flex items-center justify-between">
                <stat.icon className="size-4 text-blue-300" />
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  Live
                </span>
              </div>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.55 }}
          className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15">
              <Home className="size-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Smart CRM Interface
              </p>
              <p className="text-xs text-slate-400">
                Unified view of listings, conversations, and pipeline activity.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {[82, 64, 91].map((width, index) => (
              <motion.div
                key={width}
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ delay: 0.5 + index * 0.12, duration: 0.8 }}
                className="h-2 rounded-full bg-gradient-to-r from-blue-500/80 to-indigo-400/70"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
