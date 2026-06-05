"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type CategoryId =
  | "profile"
  | "notifications"
  | "communication"
  | "meetings"
  | "school-structure"
  | "emergency-comms"
  | "event-governance"
  | "campus-mgmt"
  | "academic-prefs"
  | "appearance"
  | "privacy";

type Category = {
  id: CategoryId;
  label: string;
  desc: string;
};

export function SettingsPanel() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("profile");

  // Load theme
  const [activeTheme, setActiveTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("axis-theme") || "dark";
    }
    return "dark";
  });

  const handleThemeApply = (themeId: string) => {
    setActiveTheme(themeId);
    if (typeof window !== "undefined") {
      localStorage.setItem("axis-theme", themeId);
      window.dispatchEvent(new Event("axis-theme-change"));
    }
    triggerFeedback("Console interface theme updated");
  };

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  // State Workflows (Leadership Settings)
  const [profileName, setProfileName] = useState("Dr. Alistair Vance");
  const [profileRole, setProfileRole] = useState("Head of School / Director");
  const [profileEmail, setProfileEmail] = useState("alistair.vance@axis.edu");
  const [profilePhone, setProfilePhone] = useState("+1 (555) 892-0192");
  
  // Leadership Notifications
  const [notifyPriority, setNotifyPriority] = useState("immediate"); // immediate | hourly | end-of-day
  const [counselorAlert, setCounselorAlert] = useState(true);
  const [infirmaryAlert, setInfirmaryAlert] = useState(true);
  
  // Emergency Comms
  const [autoSiren, setAutoSiren] = useState(true);
  const [broadcastToParents, setBroadcastToParents] = useState(true);
  const [policeDispatchSync, setPoliceDispatchSync] = useState(false);

  // School Structure
  const [activePYP, setActivePYP] = useState(true);
  const [activeMYP, setActiveMYP] = useState(true);
  const [activeDP, setActiveDP] = useState(true);
  const [activeCP, setActiveCP] = useState(true);
  const [houseSystem, setHouseSystem] = useState("standard"); // standard | disabled

  // Event Governance
  const [proposalAutoReview, setProposalAutoReview] = useState(false);
  const [fundingCapLimit, setFundingCapLimit] = useState(15000); // INR
  const [bookingConflictOverride, setBookingConflictOverride] = useState(true);

  // Campus Management
  const [cafeteriaBuffer, setCafeteriaBuffer] = useState(15); // mins
  const [classroomBuffer, setClassroomBuffer] = useState(5); // mins
  const [custodialPriority, setCustodialPriority] = useState("balanced"); // efficiency | balanced | responsive

  // Academic Programme Preferences
  const [predictedGradesWeight, setPredictedGradesWeight] = useState("ia-focused"); // term-average | ia-focused | advisor-discretion
  const [personalProjectDeadlines, setPersonalProjectDeadlines] = useState(true); // show status warning
  const [exhibitionAudience, setExhibitionAudience] = useState("public"); // public | internal | hybrid

  // Appearance & Privacy
  const [shareLocation, setShareLocation] = useState(true);
  const [statusPresenceSync, setStatusPresenceSync] = useState(true);

  const categories: Category[] = [
    { id: "profile", label: "Executive Profile", desc: "Leadership account and directory information" },
    { id: "school-structure", label: "School Structure", desc: "Configure active PYP/MYP/DP/CP streams" },
    { id: "emergency-comms", label: "Emergency Communications", desc: "Crisis protocols and safety broadcasts" },
    { id: "event-governance", label: "Event Governance", desc: "Approval parameters and facility caps" },
    { id: "campus-mgmt", label: "Campus Management", desc: "Clean buffers and custodian allocations" },
    { id: "academic-prefs", label: "Academic Preferences", desc: "Curriculum weighting and submission tracking" },
    { id: "notifications", label: "Notification Rules", desc: "Alert thresholds and leadership reports" },
    { id: "communication", label: "Sounds & Chimes", desc: "Volume parameters and simulator audio" },
    { id: "meetings", label: "Leadership Rooms", desc: "Virtual rooms and board meeting defaults" },
    { id: "appearance", label: "Console Appearance", desc: "Choose color themes and responsive density" },
    { id: "privacy", label: "Security & Privacy", desc: "Sync activity status and location checks" },
  ];

  const styling = useMemo(() => {
    return {
      dark: {
        panelBg: "bg-[#0C0C0E]/40 border-white/[0.06]",
        itemBg: "bg-white/[0.01]",
        itemHoverBg: "hover:bg-white/[0.02]",
        border: "border-white/[0.06]",
        textMuted: "text-white/40",
        textPrimary: "text-white/90",
        inputBg: "bg-[#0C0C0E]/70 border-white/[0.08] text-white",
        btnActive: "bg-white text-black font-bold",
        indicator: "bg-cyan-400",
      },
      light: {
        panelBg: "bg-white border-black/[0.08]",
        itemBg: "bg-black/[0.01]",
        itemHoverBg: "hover:bg-black/[0.02]",
        border: "border-black/[0.08]",
        textMuted: "text-black/50",
        textPrimary: "text-black/90",
        inputBg: "bg-[#F9FAFB] border-black/[0.08] text-black",
        btnActive: "bg-[#111827] text-white font-bold",
        indicator: "bg-cyan-600",
      },
      "high-contrast": {
        panelBg: "bg-black border-2 border-white",
        itemBg: "bg-black border border-white/40",
        itemHoverBg: "hover:bg-white/10",
        border: "border-2 border-white",
        textMuted: "text-white",
        textPrimary: "text-white font-bold",
        inputBg: "bg-black border-2 border-white text-white",
        btnActive: "bg-white text-black font-extrabold",
        indicator: "bg-white",
      },
      axis: {
        panelBg: "bg-[#121417]/90 border-white/[0.08]",
        itemBg: "bg-[#16191F]/40 border border-white/[0.04]",
        itemHoverBg: "hover:bg-[#1A1D24]",
        border: "border-white/[0.08]",
        textMuted: "text-white/35",
        textPrimary: "text-white/95",
        inputBg: "bg-[#181B22] border-white/[0.10] text-white",
        btnActive: "bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(34,211,238,0.25)]",
        indicator: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]",
      },
    }[activeTheme] || {
      panelBg: "bg-[#0C0C0E]/40 border-white/[0.06]",
      itemBg: "bg-white/[0.01]",
      itemHoverBg: "hover:bg-white/[0.02]",
      border: "border-white/[0.06]",
      textMuted: "text-white/40",
      textPrimary: "text-white/90",
      inputBg: "bg-[#0C0C0E]/70 border-white/[0.08] text-white",
      btnActive: "bg-white text-black",
      indicator: "bg-cyan-400",
    };
  }, [activeTheme]);

  return (
    <div className={`rounded-2xl border ${styling.border} ${styling.panelBg} shadow-[0_12px_48px_-16px_rgba(0,0,0,0.6)] overflow-hidden`}>
      
      {/* Settings Header */}
      <div className={`h-14 border-b ${styling.border} px-6 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block">
            Command Center Settings
          </span>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {feedbackMsg && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="text-xs text-emerald-400 font-semibold"
              >
                {feedbackMsg}
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={() => triggerFeedback("Settings applied successfully")}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${styling.btnActive}`}
          >
            Save Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] min-h-[520px] divide-x divide-white/[0.06] md:divide-x border-t border-white/[0.04]">
        
        {/* Left Side: Category Navigator */}
        <div className="p-3 space-y-0.5 bg-[#0C0C0E]/20 overflow-y-auto max-h-[580px] scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left rounded-xl px-3 py-2 transition-all flex flex-col gap-0.5 ${
                  isActive
                    ? "bg-white/[0.06] text-white"
                    : "text-white/45 hover:bg-white/[0.02] hover:text-white/70"
                }`}
              >
                <span className="text-xs font-semibold tracking-tight">{cat.label}</span>
                <span className="text-[9px] opacity-40 line-clamp-1 leading-tight">{cat.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Category Panel */}
        <div className="p-6 md:p-8 overflow-y-auto max-h-[580px] scrollbar-none space-y-6">
          
          {/* 1. EXECUTIVE PROFILE */}
          {activeCategory === "profile" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Executive Profile</h3>
                <p className="text-[11px] text-white/30">Set your official leadership identification records.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Leadership Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-cyan-500/50 ${styling.inputBg}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Designation / Role</label>
                  <input
                    type="text"
                    value={profileRole}
                    onChange={(e) => setProfileRole(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-cyan-500/50 ${styling.inputBg}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-cyan-500/50 ${styling.inputBg}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Direct Hotline</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-cyan-500/50 ${styling.inputBg}`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. SCHOOL STRUCTURE */}
          {activeCategory === "school-structure" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">School Structure</h3>
                <p className="text-[11px] text-white/30">Configure which academic divisions are active on campus.</p>
              </div>

              <div className="space-y-3">
                {[
                  { id: "pyp", title: "Primary Years Programme (PYP)", desc: "Enables Grade 1-5 Exhibition tracking and student wellbeing logs.", state: activePYP, setter: setActivePYP },
                  { id: "myp", title: "Middle Years Programme (MYP)", desc: "Enables Personal Project monitoring dashboards and Service as Action logs.", state: activeMYP, setter: setActiveMYP },
                  { id: "dp", title: "Diploma Programme (DP)", desc: "Enables Extended Essay, TOK, CAS, and Predicted Grades coordination.", state: activeDP, setter: setActiveDP },
                  { id: "cp", title: "Career-related Programme (CP)", desc: "Enables Reflective Project and Language Development health metrics.", state: activeCP, setter: setActiveCP },
                ].map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-white/80">{item.title}</h4>
                      <p className="text-[9px] text-white/40">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => item.setter(!item.state)}
                      className={`w-8 h-4 rounded-full transition-all relative ${
                        item.state ? "bg-cyan-500" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 size-3 rounded-full bg-black transition-all ${
                          item.state ? "left-4" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}

                <div className="space-y-1">
                  <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">House System</label>
                  <select
                    value={houseSystem}
                    onChange={(e) => setHouseSystem(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-cyan-500/50 ${styling.inputBg}`}
                  >
                    <option value="standard">Active (4 Houses: Ruby, Sapphire, Emerald, Topaz)</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 3. EMERGENCY COMMUNICATIONS */}
          {activeCategory === "emergency-comms" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Emergency Communications</h3>
                <p className="text-[11px] text-white/30">Define crisis management pathways and notifications.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white/80">Automated Siren Trigger</h4>
                    <p className="text-[9px] text-white/40">Instantly play audible evacuation tones across all classroom smart screens when an emergency is broadcast.</p>
                  </div>
                  <button
                    onClick={() => setAutoSiren(!autoSiren)}
                    className={`w-8 h-4 rounded-full transition-all relative ${autoSiren ? "bg-cyan-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 size-3 rounded-full bg-black transition-all ${autoSiren ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-start justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white/80">Broadcast to Parents</h4>
                    <p className="text-[9px] text-white/40">Auto-send SMS & push notifications to guardians immediately on evacuation alert trigger.</p>
                  </div>
                  <button
                    onClick={() => setBroadcastToParents(!broadcastToParents)}
                    className={`w-8 h-4 rounded-full transition-all relative ${broadcastToParents ? "bg-cyan-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 size-3 rounded-full bg-black transition-all ${broadcastToParents ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-start justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white/80">Police & First Responder Dispatch Sync</h4>
                    <p className="text-[9px] text-white/40">Enable direct secure digital link dispatcher to local safety authorities.</p>
                  </div>
                  <button
                    onClick={() => setPoliceDispatchSync(!policeDispatchSync)}
                    className={`w-8 h-4 rounded-full transition-all relative ${policeDispatchSync ? "bg-cyan-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 size-3 rounded-full bg-black transition-all ${policeDispatchSync ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. EVENT GOVERNANCE */}
          {activeCategory === "event-governance" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Event & Proposal Governance</h3>
                <p className="text-[11px] text-white/30">Set boundaries for student & faculty proposals.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white/80">Proposal Auto-Approve Policy</h4>
                    <p className="text-[9px] text-white/40">Enable automatic approval checks for low-budget classroom events (below limits).</p>
                  </div>
                  <button
                    onClick={() => setProposalAutoReview(!proposalAutoReview)}
                    className={`w-8 h-4 rounded-full transition-all relative ${proposalAutoReview ? "bg-cyan-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 size-3 rounded-full bg-black transition-all ${proposalAutoReview ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Funding Cap Limit per Proposal</label>
                  <input
                    type="number"
                    value={fundingCapLimit}
                    onChange={(e) => setFundingCapLimit(Number(e.target.value))}
                    className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-cyan-500/50 ${styling.inputBg}`}
                  />
                </div>

                <div className="flex items-start justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white/80">Conflict Overrides Allowed</h4>
                    <p className="text-[9px] text-white/40">Allow leadership to schedule events despite facility booking warnings.</p>
                  </div>
                  <button
                    onClick={() => setBookingConflictOverride(!bookingConflictOverride)}
                    className={`w-8 h-4 rounded-full transition-all relative ${bookingConflictOverride ? "bg-cyan-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 size-3 rounded-full bg-black transition-all ${bookingConflictOverride ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. CAMPUS MANAGEMENT */}
          {activeCategory === "campus-mgmt" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Campus Management</h3>
                <p className="text-[11px] text-white/30">Set operational clean buffer parameters.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Cafeteria Clean Shift Buffer (mins)</label>
                  <input
                    type="number"
                    value={cafeteriaBuffer}
                    onChange={(e) => setCafeteriaBuffer(Number(e.target.value))}
                    className={`w-full rounded-lg border px-3 py-2 text-xs outline-none ${styling.inputBg}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Classroom Change Buffer (mins)</label>
                  <input
                    type="number"
                    value={classroomBuffer}
                    onChange={(e) => setClassroomBuffer(Number(e.target.value))}
                    className={`w-full rounded-lg border px-3 py-2 text-xs outline-none ${styling.inputBg}`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Custodial Priority Mode</label>
                <select
                  value={custodialPriority}
                  onChange={(e) => setCustodialPriority(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-xs outline-none ${styling.inputBg}`}
                >
                  <option value="efficiency">Efficiency Optimized (Reduce energy)</option>
                  <option value="balanced">Balanced Allocations</option>
                  <option value="responsive">Responsive Dispatch (Focus on hotspots)</option>
                </select>
              </div>
            </div>
          )}

          {/* 6. ACADEMIC PREFERENCES */}
          {activeCategory === "academic-prefs" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Academic Programme Preferences</h3>
                <p className="text-[11px] text-white/30">Configure grading metrics and curriculum limits.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Predicted Grades Algorithm</label>
                  <select
                    value={predictedGradesWeight}
                    onChange={(e) => setPredictedGradesWeight(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-xs outline-none ${styling.inputBg}`}
                  >
                    <option value="term-average">Cumulative Term-Averages only</option>
                    <option value="ia-focused">Internal Assessments Weighted (Recommended)</option>
                    <option value="advisor-discretion">Advisor Discretion & Mock Exam Balance</option>
                  </select>
                </div>

                <div className="flex items-start justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white/80">Personal Project Warnings</h4>
                    <p className="text-[9px] text-white/40">Proactively notify advisors when students are trailing draft dates.</p>
                  </div>
                  <button
                    onClick={() => setPersonalProjectDeadlines(!personalProjectDeadlines)}
                    className={`w-8 h-4 rounded-full transition-all relative ${personalProjectDeadlines ? "bg-cyan-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 size-3 rounded-full bg-black transition-all ${personalProjectDeadlines ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">PYP Exhibition Audience</label>
                  <select
                    value={exhibitionAudience}
                    onChange={(e) => setExhibitionAudience(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-xs outline-none ${styling.inputBg}`}
                  >
                    <option value="public">Public Exhibition (Open to community)</option>
                    <option value="internal">Internal Peer Review only</option>
                    <option value="hybrid">Hybrid (Parent streams & external evaluators)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 7. NOTIFICATIONS */}
          {activeCategory === "notifications" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Notification Rules</h3>
                <p className="text-[11px] text-white/30">Set alert thresholds for school events.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Roster Digest Delivery</label>
                  <select
                    value={notifyPriority}
                    onChange={(e) => setNotifyPriority(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-xs outline-none ${styling.inputBg}`}
                  >
                    <option value="immediate">Immediate Dispatch (All updates)</option>
                    <option value="hourly">Hourly Group Summary</option>
                    <option value="end-of-day">Daily Executive Brief</option>
                  </select>
                </div>

                <div className="flex items-start justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white/80">Infirmary Log Notifications</h4>
                    <p className="text-[9px] text-white/40">Alert leadership immediately when a student is admitted to the infirmary.</p>
                  </div>
                  <button
                    onClick={() => setInfirmaryAlert(!infirmaryAlert)}
                    className={`w-8 h-4 rounded-full transition-all relative ${infirmaryAlert ? "bg-cyan-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 size-3 rounded-full bg-black transition-all ${infirmaryAlert ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-start justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white/80">Counseling referrals</h4>
                    <p className="text-[9px] text-white/40">Alert leadership on priority counseling checkins.</p>
                  </div>
                  <button
                    onClick={() => setCounselorAlert(!counselorAlert)}
                    className={`w-8 h-4 rounded-full transition-all relative ${counselorAlert ? "bg-cyan-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 size-3 rounded-full bg-black transition-all ${counselorAlert ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 8. SOUNDS & CHIMES */}
          {activeCategory === "communication" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sounds & Chimes</h3>
                <p className="text-[11px] text-white/30">Adjust console notification chimes.</p>
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">Chime Simulator</h4>
                  <p className="text-[9px] text-white/40">Audibly test the Axis notification signature chord.</p>
                </div>
                <button
                  onClick={() => {
                    triggerFeedback("Sound chime executed");
                  }}
                  className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition-all"
                >
                  🔊 Play Chime
                </button>
              </div>
            </div>
          )}

          {/* 9. MEETINGS */}
          {activeCategory === "meetings" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Leadership Rooms</h3>
                <p className="text-[11px] text-white/30">Manage direct video conferencing settings.</p>
              </div>

              <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white/90">Auto-generate secure Board meeting rooms</h4>
                  <p className="text-[9px] text-white/40">Enable dynamic meeting IDs for school boards.</p>
                </div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase">Active</span>
              </div>
            </div>
          )}

          {/* 10. APPEARANCE */}
          {activeCategory === "appearance" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Console Appearance</h3>
                <p className="text-[11px] text-white/30">Switch between different visual styles.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "dark", label: "Dark Theme", desc: "Premium midnight layout" },
                  { id: "light", label: "Light Theme", desc: "Clear bright colors" },
                  { id: "axis", label: "Axis Space Theme", desc: "Cyan glassmorphic accents" },
                  { id: "high-contrast", label: "High Contrast Theme", desc: "Strict accessibility colors" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeApply(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      activeTheme === t.id
                        ? "border-cyan-500 bg-cyan-500/5 text-white"
                        : "border-white/[0.06] bg-white/[0.01] text-white/60 hover:bg-white/[0.02]"
                    }`}
                  >
                    <span className="text-xs font-bold block">{t.label}</span>
                    <span className="text-[9px] opacity-50 block mt-0.5">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 11. PRIVACY & SECURITY */}
          {activeCategory === "privacy" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Security & Privacy</h3>
                <p className="text-[11px] text-white/30">Set location tracking and visibility parameters.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white/80">Share Proximity Coordinates</h4>
                    <p className="text-[9px] text-white/40">Enable tracking of staff proximity to classrooms for scheduling auto-unlocks.</p>
                  </div>
                  <button
                    onClick={() => setShareLocation(!shareLocation)}
                    className={`w-8 h-4 rounded-full transition-all relative ${shareLocation ? "bg-cyan-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 size-3 rounded-full bg-black transition-all ${shareLocation ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-start justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white/80">Presence Visibility Sync</h4>
                    <p className="text-[9px] text-white/40">Show active status (e.g. In Meeting, On Campus) to faculty.</p>
                  </div>
                  <button
                    onClick={() => setStatusPresenceSync(!statusPresenceSync)}
                    className={`w-8 h-4 rounded-full transition-all relative ${statusPresenceSync ? "bg-cyan-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 size-3 rounded-full bg-black transition-all ${statusPresenceSync ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
