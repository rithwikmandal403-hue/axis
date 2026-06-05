"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

import { HeroSection } from "@/components/hero-section";
import { Navbar } from "@/components/navbar";
import { UserTypeSelection } from "@/components/onboarding/user-type-selection";

const programmeData = {
  pyp: {
    title: "Primary Years Programme (PYP)",
    description: "Coordinates student portfolios, unit inquiry planners, developmental milestones, and parent summaries in a single, child-safe workspace. Empowers early-years teachers to capture learning evidence without database drag.",
    signal: "Unit Inquiry portfolios active · Capturing evidence"
  },
  myp: {
    title: "Middle Years Programme (MYP)",
    description: "Unifies assessment criteria across eight subject groups, service-as-action milestones, personal project checklists, and advisor feedback. Helps coordinators monitor academic requirements across grades.",
    signal: "8 Subject criteria aligned · Service milestones active"
  },
  dp: {
    title: "Diploma Programme (DP)",
    description: "Manages Extended Essay advisor assignments, CAS deadlines, TOK essay handoffs, and mock exam calendars. Coordinates student study paths and teacher review pipelines in a unified schedule canvas.",
    signal: "EE advisor review live · CAS telemetry synced"
  },
  cp: {
    title: "Career-related Programme (CP)",
    description: "Bridges vocational studies, language portfolios, service-learning milestones, and external work placements. Keeps student advisors and external monitors aligned on student reflective projects.",
    signal: "Vocational logs synced · Placement schedules active"
  }
};

export function LandingPage() {
  const selectorRef = useRef<HTMLDivElement>(null);
  const [activeProg, setActiveProg] = useState<"pyp" | "myp" | "dp" | "cp">("dp");

  const handleExplore = useCallback(() => {
    selectorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 selection:bg-white/10 font-sans antialiased overflow-x-hidden">
      {/* 1. Header & Hero Section */}
      <div>
        <Navbar />
        <HeroSection onGetStarted={handleExplore} />
      </div>

      {/* 2. Built for academic, workplace, and connected environments (The Three Domains) */}
      <section className="mx-auto max-w-[1360px] px-6 py-20 md:px-10 md:py-28 border-t border-white/10">
        <div className="max-w-[720px] mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">The Axis Architecture</p>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-white md:text-[44px]">One core system. Three distinct environments.</h2>
          <p className="mt-4 text-lg text-zinc-400">Axis adapts dynamically to the structure of your institution, creating a custom environment centered around how your people actually coordinate.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Academic */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-8 hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300">
            <div className="flex size-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 mb-6">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white">Academic Space</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">Designed for schools and universities. Unifies student timetables, attendance tracking, lesson intelligence, and academic progress with minimal admin drag.</p>
          </div>
          {/* Card 2: Workplace */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-8 hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300">
            <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 mb-6">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18.4V14.15m16.5 0a9 9 0 00-16.5 0m16.5 0L19.5 9.75A1.875 1.875 0 0017.625 8H6.375a1.875 1.875 0 00-1.875 1.75L3 14.15M12 3v3m3-3H9" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white">Workplace Space</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">Designed for collaborative teams. Connects project milestones, client boards, calendar coordination, and contextual messages in a single workflow canvas.</p>
          </div>
          {/* Card 3: Organizations */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-8 hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300">
            <div className="flex size-12 items-center justify-center rounded-xl bg-slate-500/10 text-slate-400 mb-6">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5-1.5h-3.75a1.125 1.125 0 00-1.125 1.125v9.75" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white">Organizational Space</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">Designed for multi-site and enterprise environments. Bridges departments, custom databases, and executive reports without separating operational details.</p>
          </div>
        </div>
      </section>

      {/* 3. The Fragmentation Problem & Metrics */}
      <section className="mx-auto max-w-[1360px] px-6 py-20 md:px-10 md:py-28 border-t border-white/10 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">The Problem</p>
            <h2 className="mt-4 text-3xl font-medium tracking-tight text-white md:text-[44px]">The high cost of fragmentation.</h2>
            <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
              Modern institutions accumulate systems quietly — attendance in one database, schedules in spreadsheets, communications across chat channels.
            </p>
            <p className="mt-4 text-zinc-400 leading-relaxed">
              As the number of tools grows, team coordination breaks down. Attention is drained by constant platform jumping, and critical context is lost between system boundaries.
            </p>
            
            {/* Comparison boxes */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-red-500/10 bg-red-500/[0.01] p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Fragmented Operations</span>
                <ul className="mt-3 space-y-2 text-xs text-zinc-400 list-disc list-inside">
                  <li>Dozens of browser tabs open daily</li>
                  <li>Lost message history across tools</li>
                  <li>No single source of coordination</li>
                  <li>Information decays at system borders</li>
                </ul>
              </div>
              <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.01] p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">The Axis Ecosystem</span>
                <ul className="mt-3 space-y-2 text-xs text-zinc-400 list-disc list-inside">
                  <li>Zero tab switches between spaces</li>
                  <li>Single, immutable source of truth</li>
                  <li>Timetables coordinate communication</li>
                  <li>Live status updates flow organically</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Metrics layout */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/5 bg-[#121214]/40 p-6 md:p-8">
              <p className="text-4xl font-medium tracking-tightest text-white md:text-5xl">9+</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Disconnected Tools</p>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">Silos navigated daily by staff, parents, and administration.</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#121214]/40 p-6 md:p-8">
              <p className="text-4xl font-medium tracking-tightest text-white md:text-5xl">23%</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Operational Drag</p>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">Estimated weekly time lost exclusively to context switching.</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#121214]/40 p-6 md:p-8">
              <p className="text-4xl font-medium tracking-tightest text-white md:text-5xl">67%</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Information Decay</p>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">Teams reporting critical directives missed in multiple inboxes.</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#121214]/40 p-6 md:p-8">
              <p className="text-4xl font-medium tracking-tightest text-white md:text-5xl">4.2x</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Interruption Factor</p>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">Average cognitive recovery period required per working hour.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The Operational Clarity Philosophy */}
      <section className="mx-auto max-w-[720px] px-6 py-24 text-center md:py-32">
        <div className="space-y-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">The Philosophy</p>
          <h2 className="text-3xl font-medium tracking-tight text-white md:text-[48px] leading-[1.1]">
            Not another admin database.<br />
            A calm operating layer.
          </h2>
          <div className="my-10 h-px w-24 bg-white/20 mx-auto" />
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-[640px] mx-auto">
            Axis doesn&apos;t add another layer of noise. By connecting your active timetable, presence telemetry, and communication structures, it reveals scheduling opportunities dynamically and unifies daily coordination.
          </p>
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-[640px] mx-auto">
            When schedules shift or events occur, the system responds instantly — directing notifications only to affected members, preserving focus, and restoring absolute operational clarity.
          </p>
        </div>
      </section>

      {/* 5. The interactive "Who are you?" Perspective Selector */}
      <div id="selector-section" ref={selectorRef} className="mx-auto w-full max-w-[1360px] px-6 pb-12 pt-8 md:px-10">
        <UserTypeSelection />
      </div>

      {/* 6. Multi-Environment Program Identity (IB interactive preview) */}
      <section className="mx-auto max-w-[1360px] px-6 py-20 md:px-10 md:py-28 border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-12 items-center">
          {/* Left: Interactive display */}
          <div className="rounded-2xl border border-white/5 bg-[#121214]/30 p-8 backdrop-blur-sm relative overflow-hidden min-h-[360px] flex flex-col justify-between">
            {/* Background radial highlight */}
            <div className="absolute -right-20 -top-20 size-60 rounded-full bg-sky-500/5 blur-3xl" />
            
            <div>
              <div className="flex gap-2 mb-6">
                {(["pyp", "myp", "dp", "cp"] as const).map((prog) => (
                  <button
                    key={prog}
                    onClick={() => setActiveProg(prog)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeProg === prog
                        ? "bg-white text-[#0A0A0B]"
                        : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {prog.toUpperCase()}
                  </button>
                ))}
              </div>
              
              <motion.div
                key={activeProg}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Active Academic Mode
                </span>
                <h3 className="text-2xl font-medium text-white">{programmeData[activeProg].title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm max-w-[560px]">
                  {programmeData[activeProg].description}
                </p>
              </motion.div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500">TELEMETRY SIGNAL:</span>
              <span className="text-[11px] font-mono text-emerald-400 animate-pulse flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400" />
                {programmeData[activeProg].signal}
              </span>
            </div>
          </div>

          {/* Right: Explanatory Copy */}
          <div className="lg:pl-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Institutional Coherence</p>
            <h2 className="mt-4 text-3xl font-medium tracking-tight text-white md:text-[44px] leading-tight">Adaptable to your curriculum.</h2>
            <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
              Axis is not a rigid template. It aligns to the specific academic pathways of international curriculums, matching requirements for IB, Cambridge, or custom national standards out of the box.
            </p>
            <p className="mt-4 text-zinc-400 leading-relaxed">
              Administrators maintain complete structural integrity of their courses, grading models, and timetabling matrices, while teachers experience a clean, unified workflow environment.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
