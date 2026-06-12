"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import { ExperienceEntrance } from "@/components/school/experience-entrance";
import { DemoTutorialProvider } from "@/components/school/demo-tutorial-context";
import { TeacherDemoShell } from "@/components/school/teacher-demo/teacher-demo-shell";
import { CoordinatorDemoShell } from "@/components/school/coordinator-demo/coordinator-demo-shell";
import { StudentDemoShell } from "@/components/school/student-demo/student-demo-shell";
import { getSchoolDemoRole } from "@/lib/school-demo-roles";

// ─── GUEST WORKSPACE ─────────────────────────────────────────────────────────

function GuestWorkspace() {
  const searchParams = useSearchParams();
  const meetingId = searchParams.get("meetingId") || "meet-secure-virtual";
  const meetingTitle = searchParams.get("title") || "Axis Virtual Room Call";

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [joined, setJoined] = useState(false);
  
  // Call States
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [callTimer, setCallTimer] = useState("00:00");

  // Call timer simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (joined) {
      let elapsed = 0;
      interval = setInterval(() => {
        elapsed += 1;
        const mins = Math.floor(elapsed / 60).toString().padStart(2, "0");
        const secs = (elapsed % 60).toString().padStart(2, "0");
        setCallTimer(`${mins}:${secs}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [joined]);

  if (!joined) {
    return (
      <div className="min-h-screen w-full bg-[#0A0A0B] text-white flex items-center justify-center p-6 antialiased relative">
        {/* Glow background */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(circle 900px at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 80%)",
          }}
        />

        <div className="relative z-10 max-w-md w-full rounded-2xl border border-white/[0.08] bg-[#0E0E10]/80 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-xl space-y-6">
          <div className="text-center">
            <span className="text-[10px] font-bold text-white/35 uppercase tracking-widest block">
              Axis Virtual Link Portal
            </span>
            <h2 className="text-lg font-bold text-white mt-1">Join as Guest</h2>
            <p className="text-xs text-white/45 mt-1.5 leading-relaxed">
              You are invited to join the active call: <br />
              <strong className="text-white/80">{meetingTitle}</strong>
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (guestName.trim()) setJoined(true);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider block">
                Your Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter guest name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-white/20 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider block">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="guest@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-white/20 focus:outline-none transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-white text-black font-bold text-xs py-3.5 hover:opacity-90 transition-all shadow-[0_4px_24px_rgba(255,255,255,0.1)]"
              >
                Join Meeting
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Fullscreen Guest active virtual room
  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] text-white flex flex-col justify-between antialiased">
      {/* Guest Header */}
      <div className="h-16 border-b border-white/[0.08] px-6 flex items-center justify-between bg-[#0E0E10]">
        <div className="flex items-center gap-3">
          <div className="size-2 rounded-full bg-red-500 animate-pulse" />
          <div className="flex flex-col">
            <h2 className="text-xs font-semibold text-white">{meetingTitle}</h2>
            <span className="text-[9px] text-white/40 mt-0.5">
              Guest Connection · Room {meetingId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/50 font-bold bg-white/5 px-2.5 py-1 rounded">
            {callTimer}
          </span>
          <button
            onClick={() => setJoined(false)}
            className="rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-transparent px-3 py-1.5 text-[10px] font-bold text-red-400 transition-all"
          >
            Leave Room
          </button>
        </div>
      </div>

      {/* Guest Participant Video layouts */}
      <div className="flex-1 flex items-center justify-center p-6 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Self Mirror View */}
          <div className="aspect-video rounded-2xl border border-white/[0.08] bg-[#0E0E10] flex flex-col justify-between p-4 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {cameraActive ? (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(circle 80px at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 100%)",
                  }}
                >
                  <svg className="size-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              ) : (
                <span className="text-[10px] text-white/20 uppercase font-semibold">
                  Camera Disabled
                </span>
              )}
            </div>

            <div className="flex justify-between items-start z-10">
              <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider">
                {guestName}
              </span>
              <span className="text-[8px] bg-white/15 px-1.5 py-0.5 rounded text-white/60">
                Guest (You)
              </span>
            </div>

            <div className="flex justify-end items-center z-10">
              {!micActive && (
                <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded">
                  Muted
                </span>
              )}
            </div>
          </div>

          {/* Teacher (Aarav Chen) Host View */}
          <div className="aspect-video rounded-2xl border border-white/[0.08] bg-[#0E0E10] flex flex-col justify-between p-4 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-3 bg-white/20 rounded-full" />
                <span className="w-1 h-5 bg-white/50 rounded-full" />
                <span className="w-1 h-4 bg-white/35 rounded-full" />
              </div>
            </div>

            <div className="flex justify-between items-start z-10">
              <span className="text-[9px] font-bold text-white/35 uppercase tracking-wider">
                Aarav Chen
              </span>
              <span className="text-[9px] text-[#0A0A0C] bg-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                Host
              </span>
            </div>

            <div className="flex justify-end items-center z-10">
              <span className="text-[9px] text-white/45">Physics Teacher</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Controls Footer */}
      <div className="h-20 border-t border-white/[0.08] px-6 bg-[#0E0E10] flex items-center justify-center gap-6">
        <button
          onClick={() => setMicActive(!micActive)}
          className={`size-10 rounded-full border flex items-center justify-center transition-all ${
            !micActive
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-white/5 border-white/10 text-white hover:bg-white/10"
          }`}
          title={micActive ? "Mute Microphone" : "Unmute Microphone"}
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {micActive ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6v12m0-12L5.25 9H3m4.5-3V3m0 18v-3" />
            )}
          </svg>
        </button>

        <button
          onClick={() => setCameraActive(!cameraActive)}
          className={`size-10 rounded-full border flex items-center justify-center transition-all ${
            !cameraActive
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-white/5 border-white/10 text-white hover:bg-white/10"
          }`}
          title={cameraActive ? "Disable Video" : "Enable Video"}
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {cameraActive ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9a2.25 2.25 0 012.25-2.25H12A2.25 2.25 0 0114.25 9v7.5A2.25 2.25 0 0112 18.75z" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── MAIN DEMO PORTAL SWITCHER ────────────────────────────────────────────────

export function SharedDemoExperience() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const isGuest = roleParam === "guest";

  if (isGuest) {
    return <GuestWorkspace />;
  }

  const role = getSchoolDemoRole(roleParam);
  const perspective = role.id === "coordinator" ? "coordinator" : role.id === "student" ? "student" : "teacher";

  return (
    <ExperienceEntrance>
      <DemoTutorialProvider perspective={perspective}>
        {role.id === "coordinator" ? (
          <CoordinatorDemoShell />
        ) : role.id === "student" ? (
          <StudentDemoShell perspectiveLabel={role.label} perspectiveId={role.id} />
        ) : (
          <TeacherDemoShell perspectiveLabel={role.label} perspectiveId={role.id} />
        )}
      </DemoTutorialProvider>
    </ExperienceEntrance>
  );
}
