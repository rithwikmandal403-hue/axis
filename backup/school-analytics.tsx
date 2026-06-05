"use client";

import { useMemo } from "react";

export function SchoolAnalytics({ theme }: { theme: string }) {
  
  const enrollmentTrends = [
    { grade: "Grade 12", count: 88, growth: "+8% YoY" },
    { grade: "Grade 11", count: 96, growth: "+12% YoY" },
    { grade: "Grade 10", count: 118, growth: "+15% YoY" },
    { grade: "Grade 9", count: 110, growth: "+6% YoY" },
    { grade: "Grade 6-8", count: 126, growth: "+4% YoY" },
    { grade: "Grade 1-5", count: 154, growth: "+10% YoY" },
  ];

  const attendanceTrends = [
    { day: "Monday", rate: "97.4%", color: "bg-emerald-500" },
    { day: "Tuesday", rate: "96.2%", color: "bg-emerald-500" },
    { day: "Wednesday", rate: "95.8%", color: "bg-emerald-500" },
    { day: "Thursday", rate: "96.5%", color: "bg-emerald-500" },
    { day: "Friday", rate: "94.2%", color: "bg-yellow-500 animate-pulse" },
  ];

  const subjectDemand = [
    { name: "Physics HL", growth: "+18% enrollment YoY", note: "Additional section may be required" },
    { name: "Math AA HL", growth: "+12% enrollment YoY", note: "Section E added to balance load" },
    { name: "Chemistry HL", growth: "+15% enrollment YoY", note: "Lab 2 occupancy near capacity limits" },
    { name: "Computer Science", growth: "+22% enrollment YoY", note: "CS lab stations upgraded" },
  ];

  const teacherWorkload = [
    { dept: "Mathematics", periods: 168, avg: "18.6 periods/teacher", status: "optimal" },
    { dept: "Science", periods: 182, avg: "15.1 periods/teacher", status: "optimal" },
    { dept: "Languages", periods: 110, avg: "22.0 periods/teacher", status: "overload" },
    { dept: "Humanities", periods: 96, avg: "16.0 periods/teacher", status: "optimal" },
    { dept: "Arts Center", periods: 42, avg: "14.0 periods/teacher", status: "optimal" },
  ];

  const facilityUtil = [
    { space: "Science Laboratories", pct: 85, color: "bg-cyan-500" },
    { space: "Main Gymnasium", pct: 60, color: "bg-indigo-500" },
    { space: "Main Auditorium", pct: 40, color: "bg-purple-500" },
    { space: "Central Library Study", pct: 90, color: "bg-emerald-500" },
  ];

  const styling = useMemo(() => {
    return {
      dark: {
        panelBg: "bg-[#0C0C0E]/40 border-white/[0.06]",
        border: "border-white/[0.06]",
        textMuted: "text-white/40",
        textPrimary: "text-white/90"
      },
      light: {
        panelBg: "bg-white border-zinc-200 shadow-sm",
        border: "border-black/[0.08]",
        textMuted: "text-black/50",
        textPrimary: "text-zinc-900"
      },
      "high-contrast": {
        panelBg: "bg-black border-2 border-white",
        border: "border-2 border-white",
        textMuted: "text-white",
        textPrimary: "text-white font-bold"
      },
      axis: {
        panelBg: "bg-[#121417]/90 border-white/[0.08]",
        border: "border-white/[0.08]",
        textMuted: "text-white/35",
        textPrimary: "text-cyan-50"
      }
    }[theme] || {
      panelBg: "bg-[#0C0C0E]/40 border-white/[0.06]",
      border: "border-white/[0.06]",
      textMuted: "text-white/40",
      textPrimary: "text-white/90"
    };
  }, [theme]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      
      {/* 1. Enrollment & Attendance Trends */}
      <div className={`p-6 rounded-3xl border ${styling.panelBg} space-y-6`}>
        <div>
          <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Student Trends</span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">Enrollment & Attendance Trends</h3>
          <p className="text-[11px] text-white/35">Roster records mapping positive yearly growth metrics and attendance ratios.</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {enrollmentTrends.map((e, idx) => (
              <div key={idx} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex justify-between items-center font-semibold">
                <div>
                  <span className="text-[9px] opacity-45">{e.grade}</span>
                  <p className="text-white mt-0.5 font-mono">{e.count} Enrolled</p>
                </div>
                <span className="text-[9px] text-emerald-400 font-bold">{e.growth}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs font-semibold pt-4 border-t border-white/5">
            <span className="text-[9px] text-white/35 uppercase tracking-wider block font-sans">Weekly Attendance</span>
            {attendanceTrends.map((att, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 bg-white/[0.01] border border-white/[0.03] rounded-xl">
                <span className="text-white/60">{att.day}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-white/80">{att.rate}</span>
                  <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${att.color}`} style={{ width: att.rate }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Facility Utilization & Demand Spikes */}
      <div className={`p-6 rounded-3xl border ${styling.panelBg} space-y-6`}>
        <div>
          <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Room Usage</span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">Room Usage & Course Demand</h3>
          <p className="text-[11px] text-white/35">Overview of classroom utilization and high-enrollment subjects.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 text-xs font-semibold">
            <span className="text-[9px] text-white/35 uppercase tracking-wider block font-sans">Room Utilization Rates</span>
            {facilityUtil.map((fac, idx) => (
              <div key={idx} className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl space-y-1.5">
                <div className="flex justify-between text-[10px] text-white/70">
                  <span>{fac.space}</span>
                  <strong className="font-mono">{fac.pct}%</strong>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${fac.color}`} style={{ width: `${fac.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs font-semibold pt-4 border-t border-white/5">
            <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider block">Course Enrollment Spikes</span>
            <div className="space-y-2">
              {subjectDemand.map((sub, idx) => (
                <div key={idx} className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <strong className="text-white/80">{sub.name}</strong>
                    <span className="text-[9px] text-white/40 block mt-0.5">{sub.note}</span>
                  </div>
                  <span className="text-[9px] text-cyan-400 bg-cyan-950/20 px-2 py-0.5 rounded font-mono font-bold uppercase">{sub.growth}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Teacher Workload Splits */}
      <div className={`p-6 rounded-3xl border ${styling.panelBg} space-y-6 md:col-span-2`}>
        <div>
          <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Teacher Loading</span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">Teacher Workload Distribution</h3>
          <p className="text-[11px] text-white/35">Weekly periods and average workload per academic department.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-semibold">
          {teacherWorkload.map((wk, idx) => (
            <div key={idx} className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl flex flex-col justify-between h-28">
              <div className="flex justify-between items-start">
                <strong className="text-white/95 text-xs">{wk.dept}</strong>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                  wk.status === "overload" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse" : "bg-emerald-500/10 text-emerald-400"
                } border`}>
                  {wk.status}
                </span>
              </div>
              <div className="pt-3 border-t border-white/5 flex justify-between items-end">
                <div>
                  <span className="text-[9px] opacity-40 block leading-tight">Total Period Load</span>
                  <span className="text-white font-mono">{wk.periods} hrs / wk</span>
                </div>
                <span className="text-[9px] text-cyan-400 font-mono leading-none block">{wk.avg}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
