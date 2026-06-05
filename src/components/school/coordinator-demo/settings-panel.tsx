"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DeviceCalibration } from "../teacher-demo/device-calibration";
import { NavigationItem } from "@/components/school/navigation-item";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

// ─── TYPES ──────────────────────────────────────────────────────────────────

type CategoryId =
  | "profile"
  | "notifications"
  | "communication"
  | "meetings"
  | "calendar"
  | "appearance"
  | "privacy"
  | "connected-systems"
  | "device-calibration"
  | "experimental"
  | "governance";

type Category = {
  id: CategoryId;
  label: string;
  desc: string;
};

// ─── AUDIO SYNTHESIZER FOR AXIS OPERATING SYSTEM CHIMES ──────────────────────

function playAxisSound(
  type: "message" | "invite" | "announcement" | "reminder",
  volumePercent: number,
  enabled: boolean
) {
  if (!enabled) return;
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  
  try {
    const ctx = new AudioContextClass();
    const volScale = volumePercent / 100;
    
    if (type === "message") {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc2.frequency.setValueAtTime(1320, ctx.currentTime); // E6
      
      gain.gain.setValueAtTime(0.06 * volScale, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } else if (type === "invite") {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.03 * volScale, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      });
    } else if (type === "announcement") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
      osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.25); // Sweep to C5
      
      gain.gain.setValueAtTime(0.05 * volScale, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === "reminder") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
      
      gain.gain.setValueAtTime(0.08 * volScale, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) {
    console.error("Web Audio API blocked or not supported", e);
  }
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export function SettingsPanel({ theme = "dark" }: { theme?: Theme }) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("profile");

  // Load and sync theme state globally
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("axis-theme") || theme || "dark";
    }
    return theme || "dark";
  });

  useEffect(() => {
    if (theme) {
      setActiveTheme(theme);
    }
  }, [theme]);

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

  // Profile Settings
  const [profileName, setProfileName] = useState("Ms. Sarah Thompson");
  const [profileRole, setProfileRole] = useState("DP Coordinator");
  const [profileEmail, setProfileEmail] = useState("sarah.thompson@axis.edu");
  const [profilePhone, setProfilePhone] = useState("+1 (555) 892-0192");
  const [profilePhoneVisibility, setProfilePhoneVisibility] = useState("Staff Members");

  // Notifications State
  const [roomNotify, setRoomNotify] = useState(true);
  const [coverNotify, setCoverNotify] = useState(true);
  const [digestNotify, setDigestNotify] = useState(false);
  const [announcementDelivery, setAnnouncementDelivery] = useState("pulse"); 
  const [muteAnnouncementsInClass, setMuteAnnouncementsInClass] = useState(true);
  const [notificationIntensity, setNotificationIntensity] = useState("adaptive"); 

  // Sound & Communication State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(60);
  const [commVisibility, setCommVisibility] = useState("open"); 

  // Meetings Settings
  const [meetCamera, setMeetCamera] = useState(true);
  const [meetMic, setMeetMic] = useState(true);
  const [meetGuestJoin, setMeetGuestJoin] = useState(true);
  const [meetRecordingConsent, setMeetRecordingConsent] = useState("ask"); 
  const [secureBoardMeeting, setSecureBoardMeeting] = useState(true);

  // Calendar Settings
  const [timetableStyle, setTimetableStyle] = useState("week-view");
  const [externalSync, setExternalSync] = useState(true);
  const [scheduleConflictPolicy, setScheduleConflictPolicy] = useState("warn");
  const [cohortSelection, setCohortSelection] = useState("all-dp");

  // Privacy Settings
  const [autoStatus, setAutoStatus] = useState(true);
  const [shareProximity, setShareProximity] = useState(true);

  // Connected Systems State
  const [connectedSystems, setConnectedSystems] = useState({
    classroom: true,
    canvas: false,
    m365: false,
    turnitin: true,
    managebac: true,
  });

  // Experimental Features
  const [gestureShortcuts, setGestureShortcuts] = useState(true);
  const [predictiveAbsenteeismAlert, setPredictiveAbsenteeismAlert] = useState(true);

  // Programme Governance (Coordinator-specific)
  const [activePYP, setActivePYP] = useState(true);
  const [activeMYP, setActiveMYP] = useState(true);
  const [activeDP, setActiveDP] = useState(true);
  const [activeCP, setActiveCP] = useState(true);
  const [autoSiren, setAutoSiren] = useState(true);
  const [proposalAutoReview, setProposalAutoReview] = useState(false);
  const [fundingCapLimit, setFundingCapLimit] = useState(15000); 
  const [classroomBuffer, setClassroomBuffer] = useState(5); 
  const [custodialPriority, setCustodialPriority] = useState("balanced"); 

  const categories: Category[] = [
    { id: "profile", label: "Profile", desc: "Account Information and Profile Details" },
    { id: "notifications", label: "Notification Alerts", desc: "Manage alerts and notification choices" },
    { id: "communication", label: "Sound & Messages", desc: "Adjust notification chimes and contact visibility" },
    { id: "meetings", label: "Meetings", desc: "Configure camera, microphone, and default room settings" },
    { id: "calendar", label: "Calendar & Timetable", desc: "Timetable layouts and external calendar sync" },
    { id: "appearance", label: "Appearance", desc: "Choose color themes and visual preferences" },
    { id: "privacy", label: "Privacy Settings", desc: "Manage activity status and location checks" },
    { id: "connected-systems", label: "Connected Systems", desc: "Link Canvas, Google Classroom, and Turnitin" },
    { id: "device-calibration", label: "Device Calibration", desc: "Test camera, speaker, brightness, and audio metrics" },
    { id: "experimental", label: "Beta Features", desc: "Try experimental tools and gesture shortcuts" },
    { id: "governance", label: "Programme Governance", desc: "Configure stream stream overrides, siren networks, and buffers" },
  ];

  const styling = useMemo(() => {
    return getAxisTheme(activeTheme as Theme);
  }, [activeTheme]);

  return (
    <div className={`rounded-2xl border ${styling.border} ${styling.cardBg} shadow-[0_12px_48px_-16px_rgba(0,0,0,0.6)] overflow-hidden`}>
      
      {/* Settings Header */}
      <div className={`h-14 border-b ${styling.border} px-6 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block">
            DP Coordinator Settings Workspace
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
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
              activeTheme === "light"
                ? "bg-black text-white hover:bg-black/90"
                : "bg-white text-black hover:bg-white/90"
            }`}
          >
            Save Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[580px] divide-x divide-white/[0.06] md:divide-x border-t border-white/[0.04]">
        
        {/* LEFT PANEL: CATEGORIES NAVIGATION */}
        <div className="p-3 space-y-0.5 bg-[#0C0C0E]/40 overflow-y-auto max-h-[640px] scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <NavigationItem
                key={cat.id}
                id={cat.id}
                label={cat.label}
                subLabel={cat.desc}
                isActive={isActive}
                onClick={() => setActiveCategory(cat.id)}
                isCollapsed={false}
                layoutId="settingsActiveHighlight"
                theme={activeTheme as Theme}
              />
            );
          })}
        </div>

        {/* RIGHT PANEL: DYNAMIC CATEGORY WORKSPACE */}
        <div className="p-6 md:p-8 overflow-y-auto max-h-[640px] scrollbar-none space-y-6 min-w-0">
          
          {/* 1. PROFILE */}
          {activeCategory === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Executive Profile</h3>
                <p className="text-xs text-white/40 mt-1">Set your leadership profile name, contact card, and phone visibility options.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Leadership Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none bg-black/40 border-white/10 text-white focus:border-cyan-500/50`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Designation / Role</label>
                  <input
                    type="text"
                    value={profileRole}
                    onChange={(e) => setProfileRole(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none bg-black/40 border-white/10 text-white focus:border-cyan-500/50`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none bg-black/40 border-white/10 text-white focus:border-cyan-500/50`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Direct Hotline</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none bg-black/40 border-white/10 text-white focus:border-cyan-500/50`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 max-w-sm pt-2">
                <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Hotline Visibility</label>
                <select
                  value={profilePhoneVisibility}
                  onChange={(e) => setProfilePhoneVisibility(e.target.value)}
                  className={`w-full rounded-xl border bg-black/40 border-white/10 text-white px-3 py-2.5 text-xs focus:outline-none focus:border-cyan-500/50`}
                >
                  <option value="Everyone">Public (Everyone can see)</option>
                  <option value="Staff Members">Staff & Faculty Members only</option>
                  <option value="Admins Only">Leadership & Admins only</option>
                </select>
              </div>
            </div>
          )}

          {/* 2. NOTIFICATIONS */}
          {activeCategory === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Notification Rules</h3>
                <p className="text-xs text-white/40 mt-1">Configure alert thresholds, muting parameters, and priority delivery rules.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Default Announcement Delivery</label>
                  <select
                    value={announcementDelivery}
                    onChange={(e) => setAnnouncementDelivery(e.target.value)}
                    className={`w-full rounded-xl border bg-black/40 border-white/10 text-white px-3 py-2.5 text-xs focus:outline-none`}
                  >
                    <option value="pulse">Subtle Top-Right Pulse</option>
                    <option value="banner">Slide-Down Top Banner</option>
                    <option value="dashboard">Inline Dashboard Timeline placement</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Operational Notification Intensity</label>
                  <select
                    value={notificationIntensity}
                    onChange={(e) => setNotificationIntensity(e.target.value)}
                    className={`w-full rounded-xl border bg-black/40 border-white/10 text-white px-3 py-2.5 text-xs focus:outline-none`}
                  >
                    <option value="adaptive">Adaptive (Mutes when presenting or in meetings)</option>
                    <option value="balanced">Balanced alerts & notifications</option>
                    <option value="silent">Deliver silently (Queue in panel)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Mute Broadcasts In Lecture Class</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Defer all system announcements while inside an active class period</span>
                  </div>
                  <button
                    onClick={() => setMuteAnnouncementsInClass(!muteAnnouncementsInClass)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      muteAnnouncementsInClass ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow transition duration-200 ${
                      muteAnnouncementsInClass ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Room Collision Displacements</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Alert immediately if a scheduling conflict or room collision is auto-detected</span>
                  </div>
                  <button
                    onClick={() => setRoomNotify(!roomNotify)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      roomNotify ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow transition duration-200 ${
                      roomNotify ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Cover & Substitution Requests</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Notify when substitute allocations are auto-assigned or accepted by staff</span>
                  </div>
                  <button
                    onClick={() => setCoverNotify(!coverNotify)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      coverNotify ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow transition duration-200 ${
                      coverNotify ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Daily Digest Reports</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Receive consolidated end-of-day attendance and predicted-grade dashboards</span>
                  </div>
                  <button
                    onClick={() => setDigestNotify(!digestNotify)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      digestNotify ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow transition duration-200 ${
                      digestNotify ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. SOUND & MESSAGES */}
          {activeCategory === "communication" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Sound Architecture & Messages</h3>
                <p className="text-xs text-white/40 mt-1">Configure premium, OS-inspired notification audio signatures and communication visibility.</p>
              </div>

              {/* Sound Designer Board */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 space-y-4">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">Interactive Audio Signatures</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "message", label: "Message Chime", desc: "Sine 880Hz", subtitle: "Soft modern chime for DMs" },
                    { id: "invite", label: "Invite Chord", desc: "Triad C-E-G", subtitle: "Warm major chord for meetings" },
                    { id: "announcement", label: "Announcement", desc: "Sweep 261-523Hz", subtitle: "Sweeping pulse for notices" },
                    { id: "reminder", label: "Reminder Tap", desc: "Sine 329Hz", subtitle: "Ambient tap for time cues" },
                  ].map((sound) => (
                    <button
                      key={sound.id}
                      onClick={() => playAxisSound(sound.id as "message" | "invite" | "announcement" | "reminder", soundVolume, soundEnabled)}
                      className="rounded-xl border border-white/[0.04] bg-[#0E0E10] hover:bg-white/[0.02] p-3 text-center space-y-2 transition-all group"
                    >
                      <span className="text-[10px] font-semibold text-white/40 group-hover:text-white transition-colors block">{sound.label}</span>
                      <span className="text-[8px] text-white/20 block font-mono">{sound.desc}</span>
                      <span className="text-[9px] text-white/30 block leading-tight">{sound.subtitle}</span>
                      <span className="text-[10px] text-cyan-400 font-bold block pt-1">Play ▶</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/80">Enable Sound Effects</span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      soundEnabled ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow transition duration-200 ${
                      soundEnabled ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <div className="flex justify-between text-xs text-white/45">
                    <span>Alert Volume</span>
                    <span className="font-bold font-mono">{soundVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(parseInt(e.target.value) || 0)}
                    disabled={!soundEnabled}
                    className="w-full accent-white disabled:opacity-20 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1.5 max-w-sm pt-2 border-t border-white/[0.04]">
                  <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Direct Message Availability</label>
                  <select
                    value={commVisibility}
                    onChange={(e) => setCommVisibility(e.target.value)}
                    className={`w-full rounded-xl border bg-black/40 border-white/10 text-white px-3 py-2.5 text-xs focus:outline-none`}
                  >
                    <option value="open">Open (Everyone can DM)</option>
                    <option value="colleagues">Colleagues only (Block student direct queries)</option>
                    <option value="emergency">Emergency only (Silence regular messaging)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 4. MEETINGS */}
          {activeCategory === "meetings" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Meetings Setup</h3>
                <p className="text-xs text-white/40 mt-1">Configure secure board meetings, recording consent, and hardware defaults.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Secure Board Meetings</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Restrict entry to authenticated leadership and coordinators only</span>
                  </div>
                  <button
                    onClick={() => setSecureBoardMeeting(!secureBoardMeeting)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      secureBoardMeeting ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow transition duration-200 ${
                      secureBoardMeeting ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 max-w-sm">
                  <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Video Meeting Recording Consent</label>
                  <select
                    value={meetRecordingConsent}
                    onChange={(e) => setMeetRecordingConsent(e.target.value)}
                    className={`w-full rounded-xl border bg-black/40 border-white/10 text-white px-3 py-2.5 text-xs focus:outline-none`}
                  >
                    <option value="ask">Ask participants for consent before recording</option>
                    <option value="auto-record">Automatically record and transcribe (Advisory)</option>
                    <option value="disable">Disable recording functions entirely</option>
                  </select>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Default Camera State</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Start virtual meeting calls with webcam feed active</span>
                  </div>
                  <button
                    onClick={() => setMeetCamera(!meetCamera)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      meetCamera ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow transition duration-200 ${
                      meetCamera ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Default Microphone State</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Mute microphone state on initial channel join</span>
                  </div>
                  <button
                    onClick={() => setMeetMic(!meetMic)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      meetMic ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow transition duration-200 ${
                      meetMic ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Allow External Guests Join</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Allow parents or inspectors to join via link without approval</span>
                  </div>
                  <button
                    onClick={() => setMeetGuestJoin(!meetGuestJoin)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      meetGuestJoin ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow transition duration-200 ${
                      meetGuestJoin ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. CALENDAR */}
          {activeCategory === "calendar" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Calendar & Timetable Styles</h3>
                <p className="text-xs text-white/40 mt-1">Configure layout, schedule conflicts, and cohort monitoring preferences.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5 max-w-sm">
                  <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Timetable Visual Layout</label>
                  <select
                    value={timetableStyle}
                    onChange={(e) => setTimetableStyle(e.target.value)}
                    className={`w-full rounded-xl border bg-black/40 border-white/10 text-white px-3 py-2.5 text-xs focus:outline-none`}
                  >
                    <option value="week-view">Detailed Weekly Grid Layout</option>
                    <option value="day-focus">Cinematic Single-Day Timeline</option>
                    <option value="compact">Compact Period blocks list</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 max-w-sm">
                  <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Conflict Handling Policy</label>
                  <select
                    value={scheduleConflictPolicy}
                    onChange={(e) => setScheduleConflictPolicy(e.target.value)}
                    className={`w-full rounded-xl border bg-black/40 border-white/10 text-white px-3 py-2.5 text-xs focus:outline-none`}
                  >
                    <option value="warn">Warn (Surfaces indicator details)</option>
                    <option value="block">Strict Block (Prevent overlapping bookings)</option>
                    <option value="bypass">Bypass conflict overrides</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 max-w-sm">
                  <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Cohort Monitor Selection</label>
                  <select
                    value={cohortSelection}
                    onChange={(e) => setCohortSelection(e.target.value)}
                    className={`w-full rounded-xl border bg-black/40 border-white/10 text-white px-3 py-2.5 text-xs focus:outline-none`}
                  >
                    <option value="all-dp">All DP Candidates (DP1 & DP2)</option>
                    <option value="dp1">DP1 Cohort Only</option>
                    <option value="dp2">DP2 Cohort Only</option>
                  </select>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">External Calendar Integration</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Sync internal events to Google Calendar and Outlook live schedules</span>
                  </div>
                  <button
                    onClick={() => setExternalSync(!externalSync)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      externalSync ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow transition duration-200 ${
                      externalSync ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. APPEARANCE */}
          {activeCategory === "appearance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Appearance</h3>
                <p className="text-xs text-white/40 mt-1">Switch between different visual styles and layout themes.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "dark", label: "Dark Theme", desc: "Premium midnight layout" },
                  { id: "light", label: "Light Theme", desc: "Clear bright colors" },
                  { id: "axis", label: "Axis Space Theme", desc: "Cyan glassmorphic accents" },
                  { id: "high-contrast", label: "High Contrast Theme", desc: "Strict accessibility colors" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeApply(t.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      activeTheme === t.id
                        ? "border-cyan-500 bg-cyan-500/5 text-white"
                        : "border-white/[0.06] bg-white/[0.01] text-white/60 hover:bg-white/[0.02]"
                    }`}
                  >
                    <span className="text-xs font-bold block">{t.label}</span>
                    <span className="text-[9px] opacity-50 block mt-1">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 7. PRIVACY */}
          {activeCategory === "privacy" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Security & Privacy</h3>
                <p className="text-xs text-white/40 mt-1">Set location tracking and visibility parameters.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white/80">Proximity Tracking Coordinator Coordinates</h4>
                    <p className="text-[9px] text-white/40">Broadcasting coordinate telemetry to classroom nodes to allow automatic panel locks and unlocks.</p>
                  </div>
                  <button
                    onClick={() => setShareProximity(!shareProximity)}
                    className={`w-8 h-4 rounded-full transition-all relative ${shareProximity ? "bg-cyan-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 size-3 rounded-full bg-black transition-all ${shareProximity ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-start justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white/80">Presence Status Sync</h4>
                    <p className="text-[9px] text-white/40">Synchronize presence statuses (In Class, In Meeting) to calendar and staff directories.</p>
                  </div>
                  <button
                    onClick={() => setAutoStatus(!autoStatus)}
                    className={`w-8 h-4 rounded-full transition-all relative ${autoStatus ? "bg-cyan-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 size-3 rounded-full bg-black transition-all ${autoStatus ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 8. CONNECTED SYSTEMS */}
          {activeCategory === "connected-systems" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Connected Systems</h3>
                <p className="text-xs text-white/40 mt-1">Integrate school applications directly with your Axis coordination environment.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "classroom", label: "Google Classroom Integration", desc: "Sync courseworks and class templates" },
                  { key: "canvas", label: "Canvas LMS Integration", desc: "Sync grades and student cohorts" },
                  { key: "m365", label: "Microsoft 365 Integration", desc: "Calendar, Teams meeting, and OneDrive syncing" },
                  { key: "turnitin", label: "Turnitin IA Checks", desc: "Automated plagiarism scans on draft submissions" },
                  { key: "managebac", label: "ManageBac Cohort Sync", desc: "Synchronize IB DP student registration profiles" },
                ].map((system) => {
                  const isConnected = connectedSystems[system.key as keyof typeof connectedSystems];
                  return (
                    <div key={system.key} className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 flex justify-between items-center gap-3">
                      <div>
                        <span className="text-xs font-semibold text-white/95 block">{system.label}</span>
                        <span className={`text-[9px] font-bold block mt-1 ${isConnected ? "text-emerald-400" : "text-white/30"}`}>
                          {isConnected ? "Connected ✓" : "Not Linked"}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setConnectedSystems((prev) => ({
                            ...prev,
                            [system.key]: !isConnected,
                          }));
                          triggerFeedback(isConnected ? `${system.label} disconnected` : `${system.label} connected successfully`);
                        }}
                        className={`rounded px-3 py-1.5 text-[9px] font-bold transition-all ${
                          isConnected
                            ? "bg-white/10 hover:bg-white/20 text-white"
                            : "bg-white text-black hover:bg-white/95"
                        }`}
                      >
                        {isConnected ? "Disconnect" : "Connect"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 9. DEVICE CALIBRATION */}
          {activeCategory === "device-calibration" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Device Calibration</h3>
                <p className="text-xs text-white/40 mt-1 mb-4">Interactive webcam stream view, volume indicator bars, speaker checks, and brightness settings.</p>
              </div>

              <DeviceCalibration 
                confirmLabel="Apply Calibration"
                onConfirm={() => {
                  triggerFeedback("Device calibration settings applied successfully");
                }}
                theme={activeTheme as Theme}
              />
            </div>
          )}

          {/* 10. EXPERIMENTAL / BETA FEATURES */}
          {activeCategory === "experimental" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Beta Features</h3>
                <p className="text-xs text-white/40 mt-1">Try new tools and features currently in active development.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white/80">Gesture Keyboard Shortcuts</h4>
                    <p className="text-[9px] text-white/40">Enable custom swipe gesture combinations and desktop multi-touch hotkeys.</p>
                  </div>
                  <button
                    onClick={() => setGestureShortcuts(!gestureShortcuts)}
                    className={`w-8 h-4 rounded-full transition-all relative ${gestureShortcuts ? "bg-cyan-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 size-3 rounded-full bg-black transition-all ${gestureShortcuts ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-start justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white/80">Predictive Absenteeism Models</h4>
                    <p className="text-[9px] text-white/40">Run background machine learning on attendance data to flag student risk scores.</p>
                  </div>
                  <button
                    onClick={() => setPredictiveAbsenteeismAlert(!predictiveAbsenteeismAlert)}
                    className={`w-8 h-4 rounded-full transition-all relative ${predictiveAbsenteeismAlert ? "bg-cyan-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 size-3 rounded-full bg-black transition-all ${predictiveAbsenteeismAlert ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 11. PROGRAMME GOVERNANCE */}
          {activeCategory === "governance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Programme Governance</h3>
                <p className="text-xs text-white/40 mt-1">Configure active school streams, emergency sirens, funding thresholds, and buffer periods.</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 space-y-3">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">Active Streams Override</span>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { state: activePYP, setter: setActivePYP, label: "PYP Active" },
                      { state: activeMYP, setter: setActiveMYP, label: "MYP Active" },
                      { state: activeDP, setter: setActiveDP, label: "DP Active" },
                      { state: activeCP, setter: setActiveCP, label: "CP Active" },
                    ].map((stream, idx) => (
                      <button
                        key={idx}
                        onClick={() => stream.setter(!stream.state)}
                        className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                          stream.state
                            ? "border-cyan-500/30 bg-cyan-500/5 text-cyan-400"
                            : "border-white/[0.06] bg-white/[0.01] text-white/40"
                        }`}
                      >
                        <span className="text-xs font-semibold">{stream.label}</span>
                        <span className={`size-2 rounded-full ${stream.state ? "bg-cyan-400" : "bg-white/10"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Emergency Siren Network Trigger</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Sound alarm bells automatically across smart panels on critical broadcasts</span>
                  </div>
                  <button
                    onClick={() => setAutoSiren(!autoSiren)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      autoSiren ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow transition duration-200 ${
                      autoSiren ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Proposal Auto-Approve Policy</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Automatically approve low-cost proposals without manual review</span>
                  </div>
                  <button
                    onClick={() => setProposalAutoReview(!proposalAutoReview)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      proposalAutoReview ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow transition duration-200 ${
                      proposalAutoReview ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Proposal Funding Cap limit</label>
                    <input
                      type="number"
                      value={fundingCapLimit}
                      onChange={(e) => setFundingCapLimit(Number(e.target.value) || 0)}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none bg-black/40 border-white/10 text-white focus:border-cyan-500/50`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-white/35 font-bold uppercase tracking-wider">Classroom Change Buffer (mins)</label>
                    <input
                      type="number"
                      value={classroomBuffer}
                      onChange={(e) => setClassroomBuffer(Number(e.target.value) || 0)}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none bg-black/40 border-white/10 text-white focus:border-cyan-500/50`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 max-w-sm pt-2">
                  <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Custodial Priority Dispatch Mode</label>
                  <select
                    value={custodialPriority}
                    onChange={(e) => setCustodialPriority(e.target.value)}
                    className={`w-full rounded-xl border bg-black/40 border-white/10 text-white px-3 py-2.5 text-xs focus:outline-none`}
                  >
                    <option value="efficiency">Efficiency Optimized (Eco energy focus)</option>
                    <option value="balanced">Balanced Allocations</option>
                    <option value="responsive">Responsive Dispatch (Hotspot focused)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
