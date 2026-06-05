"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DeviceCalibration } from "./device-calibration";
import { ProfileManager } from "./profile-manager";
import { NavigationItem } from "@/components/school/navigation-item";

// ─── TYPES ──────────────────────────────────────────────────────────────────

type CategoryId =
  | "profile"
  | "notifications"
  | "communication"
  | "meetings"
  | "attendance"
  | "calendar"
  | "class-space"
  | "appearance"
  | "privacy"
  | "connected-systems"
  | "experimental";

type NotificationItem = {
  id: string;
  type: "announcement" | "invite" | "message" | "schedule" | "system";
  title: string;
  meta: string;
  isRead: boolean;
  isPinned: boolean;
  isArchived: boolean;
};

// ─── AUDIO SYNTHESIZER ──────────────────────────────────────────────────────

function playAxisSound(
  type: "message" | "invite" | "announcement" | "reminder",
  volumePercent: number,
  enabled: boolean
) {
  if (!enabled) return;
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  
  try {
    const ctx = new AudioContextClass();
    const volScale = volumePercent / 100;
    
    if (type === "message") {
      // Soft modern chime: Dual high sine wave decay
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
      // Warm tone: Major triad chord decay
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
      // Gentle pulse: Frequency sweep
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
      // Ambient tap: Quick transient decay
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
    console.error("Web Audio API not supported or context blocked", e);
  }
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export function SettingsWorkspace() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("profile");

  // Load and sync theme state globally
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
    triggerFeedback("Interface theme updated");
  };

  // General feedback status notification
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  // ─── STATE WORKFLOWS ──────────────────────────────────────────────────────

  // Profile Settings
  const [profileName, setProfileName] = useState("Aarav Chen");
  const [profileRole, setProfileRole] = useState("Physics Master Teacher");
  const [profileEmail, setProfileEmail] = useState("aarav.chen@axis.edu");
  const [profilePhone, setProfilePhone] = useState("+1 (555) 019-2834");
  const [profileDepartment, setProfileDepartment] = useState("Science Department");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profilePhoneVisibility, setProfilePhoneVisibility] = useState("Staff Members");

  // Presence & Focus Settings
  const [teachingStatusSync, setTeachingStatusSync] = useState(true);
  const [meetingPresenceSync, setMeetingPresenceSync] = useState(true);
  const [freePeriodAvailableSync, setFreePeriodAvailableSync] = useState(true);
  const [teachingFocusMode, setTeachingFocusMode] = useState(true);

  // Notifications State
  const [roomNotify, setRoomNotify] = useState(true);
  const [coverNotify, setCoverNotify] = useState(true);
  const [digestNotify, setDigestNotify] = useState(false);
  const [announcementDelivery, setAnnouncementDelivery] = useState("pulse"); // pulse | banner | dashboard
  const [muteAnnouncementsInClass, setMuteAnnouncementsInClass] = useState(true);
  const [notificationIntensity, setNotificationIntensity] = useState("adaptive"); // adaptive | balanced | silent

  // Sound & Communication State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(60);
  const [commVisibility, setCommVisibility] = useState("open"); // open | colleagues | emergency

  // Meetings Settings
  const [meetCamera, setMeetCamera] = useState(true);
  const [meetMic, setMeetMic] = useState(true);
  const [meetGuestJoin, setMeetGuestJoin] = useState(true);
  const [meetAutoShareLink, setMeetAutoShareLink] = useState(false);
  const [meetRecordingConsent, setMeetRecordingConsent] = useState("ask"); // ask | auto-record | disable

  // Attendance Settings
  const [attendanceSystem, setAttendanceSystem] = useState("automated");
  const [homeroomAdmin, setHomeroomAdmin] = useState(true);
  const [attendanceGracePeriod, setAttendanceGracePeriod] = useState(10); // mins
  const [parentNotificationDelay, setParentNotificationDelay] = useState(30); // mins

  // Calendar Settings
  const [timetableStyle, setTimetableStyle] = useState("week-view");
  const [externalSync, setExternalSync] = useState(true);
  const [freePeriodVisualization, setFreePeriodVisualization] = useState("opportunity"); // opportunity | study | empty
  const [scheduleConflictPolicy, setScheduleConflictPolicy] = useState("warn"); // warn | decline | manual

  // Class Space Settings
  const [dashboardDensity, setDashboardDensity] = useState("calm");
  const [contextIntensity, setContextIntensity] = useState("balanced");
  const [classDefaultView, setClassDefaultView] = useState("overview"); // overview | tasks | resources | grading
  const [taskAutoArchiveDays, setTaskAutoArchiveDays] = useState(14); // days

  // Privacy Settings
  const [autoStatus, setAutoStatus] = useState(true);
  const [shareProximity, setShareProximity] = useState(true);

  // Experimental Features Settings
  const [gestureShortcuts, setGestureShortcuts] = useState(true);
  const [predictiveAbsenteeismAlert, setPredictiveAbsenteeismAlert] = useState(true);

  // Roster notifications data
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: "not-1", type: "announcement", title: "Assembly timing adjusted: Period 4 moves to Period 5", meta: "Today · Academic Office", isRead: false, isPinned: false, isArchived: false },
    { id: "not-2", type: "announcement", title: "Working Saturday confirmed for May 31st (Thursday timetable)", meta: "Yesterday · HR & Administration", isRead: false, isPinned: true, isArchived: false },
    { id: "not-3", type: "invite", title: "Marcus Vance invited you to Department Alignment Session", meta: "2 hours ago · Science Dept", isRead: false, isPinned: false, isArchived: false },
    { id: "not-4", type: "message", title: "Dilan Patel: 'Question regarding drag forces IA error calculations'", meta: "3 hours ago · Physics IA", isRead: true, isPinned: false, isArchived: false },
    { id: "not-5", type: "schedule", title: "Lab 3 collision experiment moved to Lab 4 for Period 5", meta: "Yesterday · Scheduling Office", isRead: true, isPinned: false, isArchived: true },
    { id: "not-6", type: "announcement", title: "Room allocations updated: Grade 11 Physics HL moves to Lab 3", meta: "3 days ago · Scheduling Office", isRead: true, isPinned: false, isArchived: false },
    { id: "not-7", type: "announcement", title: "Exam schedule published: Semester 1 IB Mock timings active", meta: "4 days ago · Exam Committee", isRead: true, isPinned: false, isArchived: false },
  ]);

  // Categories configurations
  const categories: { id: CategoryId; label: string; desc: string }[] = [
    { id: "profile", label: "Profile", desc: "Account Information and Profile Details" },
    { id: "notifications", label: "Notification Alerts", desc: "Manage alerts and notification choices" },
    { id: "communication", label: "Sound & Messages", desc: "Adjust notification chimes and contact visibility" },
    { id: "meetings", label: "Meetings", desc: "Configure camera, microphone, and default room settings" },
    { id: "attendance", label: "Attendance Settings", desc: "Homeroom verification protocols and settings" },
    { id: "calendar", label: "Calendar & Timetable", desc: "Timetable layouts and external calendar sync" },
    { id: "class-space", label: "Class Space", desc: "Adjust layout density and panel settings" },
    { id: "appearance", label: "Appearance", desc: "Choose color themes and visual preferences" },
    { id: "privacy", label: "Privacy Settings", desc: "Manage activity status and location checks" },
    { id: "connected-systems", label: "Connected Systems", desc: "Link Google Classroom, Canvas, and other platforms" },
    { id: "experimental", label: "Beta Features", desc: "Try experimental tools and gesture shortcuts" },
  ];

  // Mapped styling variables matching local context theme selector
  const styling = useMemo(() => {
    return {
      dark: {
        bg: "bg-[#0A0A0B]/60 text-white",
        panelBg: "bg-[#0C0C0E]/40 border-white/[0.06]",
        itemBg: "bg-white/[0.01]",
        itemHoverBg: "hover:bg-white/[0.02]",
        border: "border-white/[0.06]",
        textMuted: "text-white/40",
        textPrimary: "text-white/90",
        inputBg: "bg-[#0C0C0E]/70 border-white/[0.08]",
        btnActive: "bg-white text-black font-bold",
        indicator: "bg-cyan-400",
      },
      light: {
        bg: "bg-[#F3F4F6] text-black",
        panelBg: "bg-white border-black/[0.08]",
        itemBg: "bg-black/[0.01]",
        itemHoverBg: "hover:bg-black/[0.02]",
        border: "border-black/[0.08]",
        textMuted: "text-black/50",
        textPrimary: "text-black/90",
        inputBg: "bg-[#F9FAFB] border-black/[0.08]",
        btnActive: "bg-[#111827] text-white font-bold",
        indicator: "bg-indigo-600",
      },
      "high-contrast": {
        bg: "bg-black text-white",
        panelBg: "bg-black border-2 border-white",
        itemBg: "bg-black border border-white/40",
        itemHoverBg: "hover:bg-white/10",
        border: "border-2 border-white",
        textMuted: "text-white",
        textPrimary: "text-white font-bold",
        inputBg: "bg-black border-2 border-white",
        btnActive: "bg-white text-black font-extrabold",
        indicator: "bg-white",
      },
      axis: {
        bg: "bg-[#050607] text-white",
        panelBg: "bg-[#121417]/90 border-white/[0.08]",
        itemBg: "bg-[#16191F]/40 border border-white/[0.04]",
        itemHoverBg: "hover:bg-[#1A1D24]",
        border: "border-white/[0.08]",
        textMuted: "text-white/35",
        textPrimary: "text-white/95",
        inputBg: "bg-[#181B22] border-white/[0.10]",
        btnActive: "bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(34,211,238,0.25)]",
        indicator: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]",
      },
    }[activeTheme] || {
      bg: "bg-[#0A0A0B] text-white",
      panelBg: "bg-[#0C0C0E]/40 border-white/[0.06]",
      itemBg: "bg-white/[0.01]",
      itemHoverBg: "hover:bg-white/[0.02]",
      border: "border-white/[0.06]",
      textMuted: "text-white/40",
      textPrimary: "text-white/90",
      inputBg: "bg-[#0C0C0E]/70 border-white/[0.08]",
      btnActive: "bg-white text-black",
      indicator: "bg-cyan-400",
    };
  }, [activeTheme]);

  // ─── NOTIFICATION ACTIONS ─────────────────────────────────────────────────

  const handleTogglePin = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
    triggerFeedback("Notification pin state toggled");
  };

  const handleToggleArchive = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isArchived: !n.isArchived } : n))
    );
    triggerFeedback("Notification archive status modified");
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    triggerFeedback("Notification dismissed");
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead && !n.isArchived).length;
  }, [notifications]);

  return (
    <div className={`rounded-2xl border ${styling.border} ${styling.panelBg} shadow-[0_12px_48px_-16px_rgba(0,0,0,0.6)] overflow-hidden`}>
      
      {/* Top feedback bar */}
      <div className={`h-14 border-b ${styling.border} px-6 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider block">
            Settings
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

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[580px] divide-x divide-white/[0.06] md:divide-x border-t border-white/[0.04]">
        
        {/* LEFT PANEL: CATEGORIES NAVIGATION */}
        <div className="p-safe-sm space-y-0.5 bg-[#0C0C0E]/40 overflow-y-auto">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <NavigationItem
                key={cat.id}
                id={cat.id}
                label={cat.label}
                subLabel={cat.desc}
                badge={cat.id === "notifications" && unreadCount > 0 && (
                  <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
                isActive={isActive}
                onClick={() => setActiveCategory(cat.id)}
                isCollapsed={false}
                layoutId="settingsActiveHighlight"
                theme={activeTheme}
              />
            );
          })}
        </div>

        {/* RIGHT PANEL: DYNAMIC CATEGORY WORKSPACE */}
        <div className="p-safe-lg md:p-safe-xl overflow-y-auto max-h-[640px] scrollbar-none space-y-safe-lg min-w-0">
          
          {/* PROFILE CATEGORY */}
          {activeCategory === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Profile</h3>
                <p className="text-xs text-white/40 mt-1">Manage your account information and profile photo.</p>
              </div>

              <ProfileManager
                profileData={{
                  name: profileName,
                  role: profileRole,
                  department: profileDepartment,
                  email: profileEmail,
                  phone: profilePhone,
                  image: profileImage,
                }}
                phoneVisibility={profilePhoneVisibility}
                onPhoneVisibilityChange={setProfilePhoneVisibility}
                onUpdate={(updatedData) => {
                  if (updatedData.name !== undefined) setProfileName(updatedData.name);
                  if (updatedData.role !== undefined) setProfileRole(updatedData.role);
                  if (updatedData.department !== undefined) setProfileDepartment(updatedData.department);
                  if (updatedData.email !== undefined) setProfileEmail(updatedData.email);
                  if (updatedData.phone !== undefined) setProfilePhone(updatedData.phone);
                  if (updatedData.image !== undefined) setProfileImage(updatedData.image);
                }}
                styling={styling}
              />
            </div>
          )}

          {/* NOTIFICATIONS CATEGORY (NOTIFICATION CENTER) */}
          {activeCategory === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Notification Alerts</h3>
                <p className="text-xs text-white/40 mt-1">Manage how and when you receive notifications and announcements.</p>
              </div>

              {/* Notification Center List */}
              <div className="space-y-2.5">
                {notifications.filter((n) => !n.isArchived).map((not) => {
                  const typeLabels = {
                    announcement: "School Announcement",
                    invite: "Meeting Invite",
                    message: "Direct Message",
                    schedule: "Timetable Event",
                    system: "System update",
                  };
                  return (
                    <div
                      key={not.id}
                      className={`rounded-xl border border-white/[0.04] p-safe-md flex flex-col gap-2.5 transition-all ${
                        not.isRead ? "bg-white/[0.01]" : "bg-white/[0.03] border-white/[0.08]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.2 rounded tracking-widest ${
                              not.type === "announcement"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : not.type === "invite"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            }`}>
                              {typeLabels[not.type]}
                            </span>
                            {not.isPinned && (
                              <span className="text-[9px] text-cyan-400" title="Pinned">📌</span>
                            )}
                          </div>
                          <p className={`text-xs leading-relaxed ${not.isRead ? "text-white/60" : "text-white font-semibold"}`}>
                            {not.title}
                          </p>
                          <span className="text-[9px] text-white/30 block">{not.meta}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {!not.isRead && (
                            <button
                              onClick={() => handleMarkRead(not.id)}
                              className="px-2 py-1 text-[9px] text-white/50 hover:text-white transition-colors"
                              title="Mark Read"
                            >
                              ✓ Read
                            </button>
                          )}
                          <button
                            onClick={() => handleTogglePin(not.id)}
                            className="px-2 py-1 text-[9px] text-white/30 hover:text-white"
                          >
                            Pin
                          </button>
                          <button
                            onClick={() => handleToggleArchive(not.id)}
                            className="px-2 py-1 text-[9px] text-white/30 hover:text-white"
                          >
                            Archive
                          </button>
                          <button
                            onClick={() => handleDismiss(not.id)}
                            className="px-2 py-1 text-[9px] text-white/20 hover:text-red-400"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {notifications.filter((n) => !n.isArchived).length === 0 && (
                  <div className="text-center py-8 border border-dashed border-white/5 rounded-xl">
                    <span className="text-xs text-white/20 italic">No active notifications.</span>
                  </div>
                )}
              </div>

              {/* Delivery and intensity configurations */}
              <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest block">Notification Preferences</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Announcement Delivery Mode</label>
                    <select
                      value={announcementDelivery}
                      onChange={(e) => setAnnouncementDelivery(e.target.value)}
                      className={`w-full rounded-xl border ${styling.inputBg} px-3 py-2.5 text-xs text-inherit bg-transparent focus:outline-none`}
                    >
                      <option value="pulse">Subtle Top-Right Pulse Indicator</option>
                      <option value="banner">Gentle Slide-Down Banner</option>
                      <option value="dashboard">Contextual Timeline Placement</option>
                    </select>
                    <span className="text-[9px] text-white/35">Selects the visual layer for incoming school broadcasts.</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Notification Delivery Intensity</label>
                    <select
                      value={notificationIntensity}
                      onChange={(e) => setNotificationIntensity(e.target.value)}
                      className={`w-full rounded-xl border ${styling.inputBg} px-3 py-2.5 text-xs text-inherit bg-transparent focus:outline-none`}
                    >
                      <option value="adaptive">Adaptive (Mutes when lecturing / in meetings)</option>
                      <option value="balanced">Balanced (Quiet chimes for direct messages)</option>
                      <option value="silent">Focused (Queue silently in Notification Center)</option>
                    </select>
                    <span className="text-[9px] text-white/35">Determines alert threshold and sound trigger behaviors.</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white/80 block">Mute Announcements In Class</span>
                      <span className="text-[10px] text-white/35 mt-0.5 block">Defer all school-wide broadcasts until active class period ends</span>
                    </div>
                    <button
                      onClick={() => setMuteAnnouncementsInClass(!muteAnnouncementsInClass)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        muteAnnouncementsInClass ? "bg-white" : "bg-white/10"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                        muteAnnouncementsInClass ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                    <div>
                      <span className="text-xs font-semibold text-white/80 block">Room Adjustments</span>
                      <span className="text-[10px] text-white/35 mt-0.5 block">Alert immediately upon Period slot displacement</span>
                    </div>
                    <button
                      onClick={() => setRoomNotify(!roomNotify)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        roomNotify ? "bg-white" : "bg-white/10"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                        roomNotify ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                    <div>
                      <span className="text-xs font-semibold text-white/80 block">Cover Requests</span>
                      <span className="text-[10px] text-white/35 mt-0.5 block">Show notifications when coordinator requests slot coverages</span>
                    </div>
                    <button
                      onClick={() => setCoverNotify(!coverNotify)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        coverNotify ? "bg-white" : "bg-white/10"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                        coverNotify ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                    <div>
                      <span className="text-xs font-semibold text-white/80 block">Daily Digest Summary</span>
                      <span className="text-[10px] text-white/35 mt-0.5 block">Consolidated end-of-day operational status reports</span>
                    </div>
                    <button
                      onClick={() => setDigestNotify(!digestNotify)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        digestNotify ? "bg-white" : "bg-white/10"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                        digestNotify ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COMMUNICATION CATEGORY (SOUND DESIGN BOARD) */}
          {activeCategory === "communication" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Sound Architecture & Alerts</h3>
                <p className="text-xs text-white/40 mt-1">Configure premium, OS-inspired notification audio signatures.</p>
              </div>

              {/* Sound Designer Board */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-md space-y-safe-md">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">Interactive Audio Signatures</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => playAxisSound("message", soundVolume, soundEnabled)}
                    className="rounded-xl border border-white/[0.04] bg-[#0E0E10] hover:bg-white/[0.02] p-safe-md text-center space-y-2 transition-all group"
                  >
                    <span className="text-[10px] font-semibold text-white/40 group-hover:text-white transition-colors block">Message Chime</span>
                    <span className="text-[8px] text-white/20 block font-mono">Sine 880Hz</span>
                    <span className="text-[9.5px] text-white/30 block leading-tight">Soft modern chime for instant DMs</span>
                    <span className="text-[10px] text-cyan-400 font-bold block pt-1">Play ▶</span>
                  </button>

                  <button
                    onClick={() => playAxisSound("invite", soundVolume, soundEnabled)}
                    className="rounded-xl border border-white/[0.04] bg-[#0E0E10] hover:bg-white/[0.02] p-safe-md text-center space-y-2 transition-all group"
                  >
                    <span className="text-[10px] font-semibold text-white/40 group-hover:text-white transition-colors block">Invite Chord</span>
                    <span className="text-[8px] text-white/20 block font-mono">Triad C-E-G</span>
                    <span className="text-[9.5px] text-white/30 block leading-tight">Warm major chord for meetings</span>
                    <span className="text-[10px] text-cyan-400 font-bold block pt-1">Play ▶</span>
                  </button>

                  <button
                    onClick={() => playAxisSound("announcement", soundVolume, soundEnabled)}
                    className="rounded-xl border border-white/[0.04] bg-[#0E0E10] hover:bg-white/[0.02] p-safe-md text-center space-y-2 transition-all group"
                  >
                    <span className="text-[10px] font-semibold text-white/40 group-hover:text-white transition-colors block">Announcement</span>
                    <span className="text-[8px] text-white/20 block font-mono">Sweep 261-523Hz</span>
                    <span className="text-[9.5px] text-white/30 block leading-tight">Gentle sweeping pulse for broadcasts</span>
                    <span className="text-[10px] text-cyan-400 font-bold block pt-1">Play ▶</span>
                  </button>

                  <button
                    onClick={() => playAxisSound("reminder", soundVolume, soundEnabled)}
                    className="rounded-xl border border-white/[0.04] bg-[#0E0E10] hover:bg-white/[0.02] p-safe-md text-center space-y-2 transition-all group"
                  >
                    <span className="text-[10px] font-semibold text-white/40 group-hover:text-white transition-colors block">Reminder Tap</span>
                    <span className="text-[8px] text-white/20 block font-mono">Sine 329Hz</span>
                    <span className="text-[9.5px] text-white/30 block leading-tight">Quiet ambient tap for time cues</span>
                    <span className="text-[10px] text-cyan-400 font-bold block pt-1">Play ▶</span>
                  </button>
                </div>
              </div>

              {/* Volume sliders */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/80">Enable Sound Effects</span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      soundEnabled ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                      soundEnabled ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Alert Volume</span>
                    <span className="font-bold">{soundVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(parseInt(e.target.value) || 0)}
                    disabled={!soundEnabled}
                    className="w-full accent-white disabled:opacity-20"
                  />
                </div>

                <div className="flex flex-col gap-1.5 max-w-sm pt-2 border-t border-white/[0.04]">
                  <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">School-Wide Message Visibility</label>
                  <select
                    value={commVisibility}
                    onChange={(e) => setCommVisibility(e.target.value)}
                    className={`w-full rounded-xl border ${styling.inputBg} px-3 py-2.5 text-xs text-inherit bg-transparent focus:outline-none`}
                  >
                    <option value="open">Open (Colleagues & Students can view status/send DMs)</option>
                    <option value="colleagues">Colleagues Only (Restrict student DMs during focus periods)</option>
                    <option value="emergency">Emergency Only (Silence everything unless flagged high-priority)</option>
                  </select>
                  <span className="text-[9.5px] text-white/30">Determines who can see your activity status and initiate direct messaging.</span>
                </div>
              </div>
            </div>
          )}

          {/* MEETINGS CATEGORY */}
          {activeCategory === "meetings" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Hardware Test & Calibration</h3>
                <p className="text-xs text-white/40 mt-1 mb-4">Calibrate and test media devices before entering room call spaces.</p>
                <DeviceCalibration />
              </div>

              <div className="space-y-6 pt-4 border-t border-white/[0.06]">
                <div>
                  <h3 className="text-sm font-semibold text-white/95">Meeting Defaults</h3>
                  <p className="text-xs text-white/40 mt-1">Configure default settings for your virtual meetings.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5 max-w-sm">
                  <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Recording Policy</label>
                  <select
                    value={meetRecordingConsent}
                    onChange={(e) => setMeetRecordingConsent(e.target.value)}
                    className={`w-full rounded-xl border ${styling.inputBg} px-3 py-2.5 text-xs text-inherit bg-transparent focus:outline-none`}
                  >
                    <option value="ask">Ask participants for consent</option>
                    <option value="auto-record">Automatically record and transcribe</option>
                    <option value="disable">Disable recording for guests</option>
                  </select>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Default Camera State</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Start call rooms with video feed active</span>
                  </div>
                  <button
                    onClick={() => setMeetCamera(!meetCamera)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      meetCamera ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                      meetCamera ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Default Microphone State</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Start call rooms unmute</span>
                  </div>
                  <button
                    onClick={() => setMeetMic(!meetMic)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      meetMic ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                      meetMic ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Allow External Guest Join</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Allow guests to join via share link</span>
                  </div>
                  <button
                    onClick={() => setMeetGuestJoin(!meetGuestJoin)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      meetGuestJoin ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                      meetGuestJoin ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Auto-generate Share Link</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Always create a share link when starting a call</span>
                  </div>
                  <button
                    onClick={() => setMeetAutoShareLink(!meetAutoShareLink)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      meetAutoShareLink ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                      meetAutoShareLink ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ATTENDANCE CATEGORY */}
          {activeCategory === "attendance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Homeroom & Attendance</h3>
                <p className="text-xs text-white/40 mt-1">Configure how student attendance is verified.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5 max-w-sm">
                  <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Check-in Method</label>
                  <select
                    value={attendanceSystem}
                    onChange={(e) => setAttendanceSystem(e.target.value)}
                    className={`w-full rounded-xl border ${styling.inputBg} px-3 py-2.5 text-xs text-inherit bg-transparent focus:outline-none`}
                  >
                    <option value="manual">Manual Check</option>
                    <option value="assisted">Assisted Check-in</option>
                    <option value="automated">Automated Wi-Fi Check-in</option>
                  </select>
                </div>

                <div className="space-y-1.5 max-w-sm pt-2 border-t border-white/[0.04]">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Lateness Grace Period</span>
                    <span className="font-bold">{attendanceGracePeriod} minutes</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={attendanceGracePeriod}
                    onChange={(e) => setAttendanceGracePeriod(parseInt(e.target.value) || 1)}
                    className="w-full accent-white"
                  />
                  <span className="text-[9.5px] text-white/35">Number of minutes after period start before a student is flagged late.</span>
                </div>

                <div className="space-y-1.5 max-w-sm pt-2 border-t border-white/[0.04]">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Parent Absence Notification Delay</span>
                    <span className="font-bold">{parentNotificationDelay} minutes</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="5"
                    value={parentNotificationDelay}
                    onChange={(e) => setParentNotificationDelay(parseInt(e.target.value) || 0)}
                    className="w-full accent-white"
                  />
                  <span className="text-[9.5px] text-white/35">Delay automated emails to parents (0 = notify immediately).</span>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Manual Overrides</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Allow teachers to manually override automated attendance</span>
                  </div>
                  <button
                    onClick={() => setHomeroomAdmin(!homeroomAdmin)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      homeroomAdmin ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                      homeroomAdmin ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CALENDAR CATEGORY */}
          {activeCategory === "calendar" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Calendar & Scheduling</h3>
                <p className="text-xs text-white/40 mt-1">Configure your schedule view and calendar syncing.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Default Layout</label>
                    <select
                      value={timetableStyle}
                      onChange={(e) => setTimetableStyle(e.target.value)}
                      className={`w-full rounded-xl border ${styling.inputBg} px-3 py-2.5 text-xs text-inherit bg-transparent focus:outline-none`}
                    >
                      <option value="day-focus">Daily View</option>
                      <option value="week-view">Weekly Grid</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Free Period Display</label>
                    <select
                      value={freePeriodVisualization}
                      onChange={(e) => setFreePeriodVisualization(e.target.value)}
                      className={`w-full rounded-xl border ${styling.inputBg} px-3 py-2.5 text-xs text-inherit bg-transparent focus:outline-none`}
                    >
                      <option value="opportunity">Show as free time</option>
                      <option value="study">Designate as quiet self-study</option>
                      <option value="empty">Leave space blank</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 max-w-sm pt-2 border-t border-white/[0.04]">
                  <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Meeting Conflicts</label>
                  <select
                    value={scheduleConflictPolicy}
                    onChange={(e) => setScheduleConflictPolicy(e.target.value)}
                    className={`w-full rounded-xl border ${styling.inputBg} px-3 py-2.5 text-xs text-inherit bg-transparent focus:outline-none`}
                  >
                    <option value="warn">Warn and ask for approval</option>
                    <option value="decline">Automatically decline conflicting invites</option>
                    <option value="manual">Review conflicts manually</option>
                  </select>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">External Sync Feeds</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Sync with Google Calendar and Outlook</span>
                  </div>
                  <button
                    onClick={() => setExternalSync(!externalSync)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      externalSync ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                      externalSync ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CLASS SPACE CATEGORY */}
          {activeCategory === "class-space" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Class Space Settings</h3>
                <p className="text-xs text-white/40 mt-1">Personalize how tasks and resource libraries behave.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Dashboard Density</label>
                    <select
                      value={dashboardDensity}
                      onChange={(e) => setDashboardDensity(e.target.value)}
                      className={`w-full rounded-xl border ${styling.inputBg} px-3 py-2.5 text-xs text-inherit bg-transparent focus:outline-none`}
                    >
                      <option value="spacious">Spacious Layout</option>
                      <option value="calm">Calm (Medium)</option>
                      <option value="compact">Compact Grid</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Assistant Level</label>
                    <select
                      value={contextIntensity}
                      onChange={(e) => setContextIntensity(e.target.value)}
                      className={`w-full rounded-xl border ${styling.inputBg} px-3 py-2.5 text-xs text-inherit bg-transparent focus:outline-none`}
                    >
                      <option value="minimal">Minimal (Warnings only)</option>
                      <option value="balanced">Balanced (Suggestions and tips)</option>
                      <option value="enhanced">Enhanced (Smart predictions)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Default Workspace View</label>
                    <select
                      value={classDefaultView}
                      onChange={(e) => setClassDefaultView(e.target.value)}
                      className={`w-full rounded-xl border ${styling.inputBg} px-3 py-2.5 text-xs text-inherit bg-transparent focus:outline-none`}
                    >
                      <option value="overview">Class Overview</option>
                      <option value="tasks">Tasks & Assignments list</option>
                      <option value="resources">Folder Resource Library</option>
                      <option value="grading">Grading Desk Workspace</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Auto-Archive Closed Tasks</label>
                    <select
                      value={taskAutoArchiveDays}
                      onChange={(e) => setTaskAutoArchiveDays(parseInt(e.target.value) || 0)}
                      className={`w-full rounded-xl border ${styling.inputBg} px-3 py-2.5 text-xs text-inherit bg-transparent focus:outline-none`}
                    >
                      <option value="7">7 Days after close date</option>
                      <option value="14">14 Days after close date</option>
                      <option value="30">30 Days after close date</option>
                      <option value="0">Never auto-archive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* APPEARANCE CATEGORY (THEMES & MINI PREVIEWS) */}
          {activeCategory === "appearance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Interface Themes</h3>
                <p className="text-xs text-white/40 mt-1">Select and preview fully functional dashboard themes.</p>
              </div>

              {/* Theme selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["light", "dark", "high-contrast", "axis"] as const).map((tId) => {
                  const isActive = activeTheme === tId;
                  const labelMap = {
                    light: "Light Theme",
                    dark: "Dark Theme",
                    "high-contrast": "High Contrast",
                    axis: "Axis Theme",
                  };
                  return (
                    <button
                      key={tId}
                      onClick={() => handleThemeApply(tId)}
                      className={`rounded-xl border p-safe-md text-center space-y-2 transition-all ${
                        isActive
                          ? "bg-white text-black border-white font-bold"
                          : "bg-white/[0.01] border-white/10 text-white/40 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-semibold block">{labelMap[tId]}</span>
                      <div className="flex justify-center gap-1 mt-2">
                        {tId === "light" && <span className="size-3 rounded-full bg-white border border-gray-400" />}
                        {tId === "dark" && <span className="size-3 rounded-full bg-zinc-900 border border-zinc-700" />}
                        {tId === "high-contrast" && <span className="size-3 rounded-full bg-black border-2 border-white" />}
                        {tId === "axis" && <span className="size-3 rounded-full bg-[#050607] border border-cyan-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mini previews */}
              <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                <span className="text-[10px] font-bold text-white/35 uppercase tracking-widest block">
                  Active Theme Previews
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Dashboard Preview Card */}
                  <div className={`rounded-xl border p-safe-md space-y-3 text-left ${
                    activeTheme === "light"
                      ? "bg-[#F3F4F6] text-black border-black/[0.08]"
                      : activeTheme === "high-contrast"
                      ? "bg-black text-white border-2 border-white"
                      : activeTheme === "axis"
                      ? "bg-[#050607] text-white border-white/[0.08]"
                      : "bg-[#0A0A0B] text-white border-white/[0.06]"
                  }`}>
                    <span className="text-[8px] font-bold opacity-45 uppercase block tracking-wider">Dashboard preview</span>
                    
                    <div className="space-y-2">
                      <div className={`h-8 rounded p-2 flex justify-between items-center text-[9px] ${
                        activeTheme === "light" ? "bg-black/5" : "bg-white/5"
                      }`}>
                        <span>Period 4 Physics</span>
                        <span className={`size-1.5 rounded-full ${activeTheme === "axis" ? "bg-cyan-400" : "bg-green-400"}`} />
                      </div>
                      <div className={`h-8 rounded p-2 flex justify-between items-center text-[9px] ${
                        activeTheme === "light" ? "bg-black/5" : "bg-white/5"
                      }`}>
                        <span>Lab 3 Reservation</span>
                        <span className="opacity-40">12:45 PM</span>
                      </div>
                    </div>
                  </div>

                  {/* Timetable Preview Card */}
                  <div className={`rounded-xl border p-safe-md space-y-3 text-left ${
                    activeTheme === "light"
                      ? "bg-[#F3F4F6] text-black border-black/[0.08]"
                      : activeTheme === "high-contrast"
                      ? "bg-black text-white border-2 border-white"
                      : activeTheme === "axis"
                      ? "bg-[#050607] text-white border-white/[0.08]"
                      : "bg-[#0A0A0B] text-white border-white/[0.06]"
                  }`}>
                    <span className="text-[8px] font-bold opacity-45 uppercase block tracking-wider">Timetable preview</span>
                    
                    <div className="space-y-2 relative border-l border-white/10 pl-2">
                      <div className="text-[8px] leading-tight">
                        <span className="font-semibold block">09:00 AM  -  Homeroom</span>
                        <span className="opacity-50">Attendance verified</span>
                      </div>
                      <div className="text-[8px] leading-tight">
                        <span className="font-semibold block">10:30 AM  -  Lab Setup</span>
                        <span className="opacity-50">Prism kit ready</span>
                      </div>
                    </div>
                  </div>

                  {/* Messaging Preview Card */}
                  <div className={`rounded-xl border p-safe-md space-y-3 text-left ${
                    activeTheme === "light"
                      ? "bg-[#F3F4F6] text-black border-black/[0.08]"
                      : activeTheme === "high-contrast"
                      ? "bg-black text-white border-2 border-white"
                      : activeTheme === "axis"
                      ? "bg-[#050607] text-white border-white/[0.08]"
                      : "bg-[#0A0A0B] text-white border-white/[0.06]"
                  }`}>
                    <span className="text-[8px] font-bold opacity-45 uppercase block tracking-wider">Messaging preview</span>
                    
                    <div className="space-y-2 text-[8px]">
                      <div className={`rounded p-1.5 max-w-[80%] ${
                        activeTheme === "light" ? "bg-black/5" : "bg-white/5"
                      }`}>
                        Hello Mr. Chen, is Lab 3 booked?
                      </div>
                      <div className={`rounded p-1.5 max-w-[80%] ml-auto text-right ${
                        activeTheme === "axis" ? "bg-cyan-400 text-black font-semibold" : "bg-white text-black"
                      }`}>
                        Yes, moved to Lab 4.
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* PRIVACY CATEGORY */}
          {activeCategory === "privacy" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Privacy & Security</h3>
                <p className="text-xs text-white/40 mt-1">Manage status transparency and physical location proximity logs.</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest block">Presence Settings</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white/80 block">Teaching Status</span>
                      <span className="text-[10px] text-white/35 mt-0.5 block">Automatically show &quot;Teaching&quot; during scheduled classes</span>
                    </div>
                    <button
                      onClick={() => setTeachingStatusSync(!teachingStatusSync)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        teachingStatusSync ? "bg-white" : "bg-white/10"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                        teachingStatusSync ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                    <div>
                      <span className="text-xs font-semibold text-white/80 block">Meeting Call Status</span>
                      <span className="text-[10px] text-white/35 mt-0.5 block">Automatically publish &quot;In Meeting&quot; when joining active video calls</span>
                    </div>
                    <button
                      onClick={() => setMeetingPresenceSync(!meetingPresenceSync)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        meetingPresenceSync ? "bg-white" : "bg-white/10"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                        meetingPresenceSync ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                    <div>
                      <span className="text-xs font-semibold text-white/80 block">Free Period Availability</span>
                      <span className="text-[10px] text-white/35 mt-0.5 block">Show &quot;Available During Free Period&quot; for students and peers</span>
                    </div>
                    <button
                      onClick={() => setFreePeriodAvailableSync(!freePeriodAvailableSync)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        freePeriodAvailableSync ? "bg-white" : "bg-white/10"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                        freePeriodAvailableSync ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                    <div>
                      <span className="text-xs font-semibold text-white/80 block">Teaching Focus Mode</span>
                      <span className="text-[10px] text-white/35 mt-0.5 block">Automatically mute ambient notifications during active instruction</span>
                    </div>
                    <button
                      onClick={() => setTeachingFocusMode(!teachingFocusMode)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        teachingFocusMode ? "bg-white" : "bg-white/10"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                        teachingFocusMode ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                      }`} />
                    </button>
                  </div>
                </div>

                <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest block pt-4 border-t border-white/[0.04]">Device Location</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white/80 block">Automatic Status Updates</span>
                      <span className="text-[10px] text-white/35 mt-0.5 block">Automatically change status to &quot;Teaching&quot; or &quot;In Meeting&quot;</span>
                    </div>
                    <button
                      onClick={() => setAutoStatus(!autoStatus)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        autoStatus ? "bg-white" : "bg-white/10"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                        autoStatus ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                    <div>
                      <span className="text-xs font-semibold text-white/80 block">Location Check-ins</span>
                      <span className="text-[10px] text-white/35 mt-0.5 block">Share device location to verify classroom attendance</span>
                    </div>
                    <button
                      onClick={() => setShareProximity(!shareProximity)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        shareProximity ? "bg-white" : "bg-white/10"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                        shareProximity ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONNECTED SYSTEMS CATEGORY */}
          {activeCategory === "connected-systems" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Connected Platforms</h3>
                <p className="text-xs text-white/40 mt-1">Connect your school apps directly to Axis.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-md flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-white/90 block">Google Classroom</span>
                    <span className="text-[10px] text-emerald-400 font-bold block mt-1">Connected ✓</span>
                  </div>
                  <button 
                    onClick={() => triggerFeedback("Google Classroom disconnected")}
                    className="rounded bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white transition-all"
                  >
                    Disconnect
                  </button>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-md flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-white/90 block">Microsoft Teams Sync</span>
                    <span className="text-[10px] text-white/30 block mt-1">Not Linked</span>
                  </div>
                  <button 
                    onClick={() => triggerFeedback("Microsoft Teams connected successfully")}
                    className="rounded bg-white text-black font-bold px-3 py-1.5 text-[10px] transition-all"
                  >
                    Connect
                  </button>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-md flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-white/90 block">Canvas LMS Sync</span>
                    <span className="text-[10px] text-white/30 block mt-1">Not Linked</span>
                  </div>
                  <button 
                    onClick={() => triggerFeedback("Canvas LMS connected successfully")}
                    className="rounded bg-white text-black font-bold px-3 py-1.5 text-[10px] transition-all"
                  >
                    Connect
                  </button>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-md flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-white/90 block">Zoom Video API</span>
                    <span className="text-[10px] text-white/30 block mt-1">Not Linked</span>
                  </div>
                  <button 
                    onClick={() => triggerFeedback("Zoom Video API connected successfully")}
                    className="rounded bg-white text-black font-bold px-3 py-1.5 text-[10px] transition-all"
                  >
                    Connect
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* EXPERIMENTAL FEATURES CATEGORY */}
          {activeCategory === "experimental" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white/95">Experimental Features</h3>
                <p className="text-xs text-white/40 mt-1">Test out cutting edge features (unstable).</p>
              </div>

              <div className="rounded-xl border border-red-500/10 bg-red-500/[0.01] p-4 text-[11px] text-white/50 leading-relaxed">
                ⚠️ **Warning:** Experimental features may alter interface states unpredictably. Disable them if you experience runtime issues.
              </div>

              <div className="space-y-4">
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">AI Timetable Suggestions</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Let AI automatically resolve scheduling conflicts</span>
                  </div>
                  <button className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none bg-white/10">
                    <span className="pointer-events-none inline-block size-4 transform rounded-full bg-white/50 translate-x-0" />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Smart Messaging Context</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Link notes and captures with your message history</span>
                  </div>
                  <button className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none bg-white/10">
                    <span className="pointer-events-none inline-block size-4 transform rounded-full bg-white/50 translate-x-0" />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Capture Shortcut Key</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Hold the &quot;E&quot; key anywhere to take a quick note</span>
                  </div>
                  <button
                    onClick={() => setGestureShortcuts(!gestureShortcuts)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      gestureShortcuts ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                      gestureShortcuts ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white/80 block">Student Absence Predictions</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">Flag students at risk of missing homeroom based on previous attendance</span>
                  </div>
                  <button
                    onClick={() => setPredictiveAbsenteeismAlert(!predictiveAbsenteeismAlert)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      predictiveAbsenteeismAlert ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ${
                      predictiveAbsenteeismAlert ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                    }`} />
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

