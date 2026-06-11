"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { detectContextInText } from "./teacher-context-engine";
import { MessageTextWithTeacherContext } from "./teacher-context-trigger";
import { TeacherContextActionModal } from "./teacher-context-modals";
import type { DetectedContext } from "./teacher-context-engine";

// ─── Pre-Meeting Calibration Tools ────────────────────────────────────────

interface HTMLVideoElementWithSink extends HTMLVideoElement {
  setSinkId: (sinkId: string) => Promise<void>;
}

interface AudioContextWithSink extends AudioContext {
  setSinkId: (sinkId: string) => Promise<void>;
}

const defaultCameras = [
  { deviceId: "default-cam", label: "Integrated FaceTime HD Camera", kind: "videoinput", groupId: "" },
  { deviceId: "usb-cam-1", label: "Logitech Brio 4K USB Webcam", kind: "videoinput", groupId: "" }
] as unknown as MediaDeviceInfo[];

const defaultMicrophones = [
  { deviceId: "default-mic", label: "Built-in MacBook Microphone (Core Audio)", kind: "audioinput", groupId: "" },
  { deviceId: "studio-mic-1", label: "Yeti Stereo USB Microphone", kind: "audioinput", groupId: "" },
  { deviceId: "bt-mic-1", label: "AirPods Pro Bluetooth Microphone", kind: "audioinput", groupId: "" }
] as unknown as MediaDeviceInfo[];

const defaultSpeakers = [
  { deviceId: "default-spk", label: "MacBook Pro Speakers (Built-in)", kind: "audiooutput", groupId: "" },
  { deviceId: "bt-spk-1", label: "AirPods Pro Bluetooth Stereo", kind: "audiooutput", groupId: "" },
  { deviceId: "ext-spk-1", label: "External Display Audio Out", kind: "audiooutput", groupId: "" }
] as unknown as MediaDeviceInfo[];

function createSimulatedStream(): { stream: MediaStream; cleanup: () => void } {
  if (typeof window === "undefined") {
    return { stream: new MediaStream(), cleanup: () => {} };
  }
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  
  let animationFrameId: number;
  let phase = 0;
  
  const draw = () => {
    if (!ctx) return;
    
    // Draw dark background matching Axis theme
    ctx.fillStyle = "#0A0A0C";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw some modern digital grid or glowing dots
    ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }
    
    // Draw cyan sine wave (simulated video/audio signal)
    ctx.strokeStyle = "#06B6D4"; // Cyan
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const y = canvas.height / 2 + Math.sin(x * 0.01 + phase) * 50;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Draw text indicator
    ctx.fillStyle = "rgba(6, 182, 212, 0.8)";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.fillText("SIMULATED CAMERA FEED (NO HARDWARE)", canvas.width / 2, canvas.height / 2 - 80);
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText("Axis Pre-Meeting Calibration Active", canvas.width / 2, canvas.height / 2 + 100);
    
    phase += 0.05;
    animationFrameId = requestAnimationFrame(draw);
  };
  
  draw();
  
  const stream = canvas.captureStream ? canvas.captureStream(30) : new MediaStream();
  
  // Also create a simulated audio track if Web Audio API is supported
  let audioContext: AudioContext | null = null;
  let oscillator: OscillatorNode | null = null;
  let gainNode: GainNode | null = null;
  let mediaStreamDestination: MediaStreamAudioDestinationNode | null = null;
  
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
      oscillator = audioContext.createOscillator();
      gainNode = audioContext.createGain();
      mediaStreamDestination = audioContext.createMediaStreamDestination();
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.00001, audioContext.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(mediaStreamDestination);
      oscillator.start();
      
      const audioTrack = mediaStreamDestination.stream.getAudioTracks()[0];
      if (audioTrack && stream.addTrack) {
        stream.addTrack(audioTrack);
      }
    }
  } catch (e) {
    console.warn("Web Audio API not supported, audio track omitted from simulated stream:", e);
  }
  
  return {
    stream,
    cleanup: () => {
      cancelAnimationFrame(animationFrameId);
      if (oscillator) oscillator.stop();
      if (audioContext) audioContext.close();
    }
  };
}

interface VideoPreviewProps {
  stream: MediaStream | null;
  isActive: boolean;
  className?: string;
  selectedSpeaker?: string;
}

function VideoPreview({ stream, isActive, className, selectedSpeaker }: VideoPreviewProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (isActive && stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      video.play().catch((err: unknown) => {
        console.warn("Error playing video stream:", err);
      });
    } else {
      video.srcObject = null;
    }
  }, [stream, isActive]);

  useEffect(() => {
    const video = ref.current as HTMLVideoElementWithSink | null;
    if (!video || !selectedSpeaker) return;
    if (video.setSinkId) {
      video.setSinkId(selectedSpeaker).catch((err: unknown) => {
        console.warn("Error setting sink ID for speaker output:", err);
      });
    }
  }, [selectedSpeaker]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted
      className={className}
    />
  );
}

type MeetingItem = {
  id: string;
  title: string;
  organizer?: string;
  participants: string[];
  classGroup?: string;
  time: string;
  purpose: string;
  status: "scheduled" | "invited";
  suggestedPrep?: string;
  timetableBlock?: string;
  isShareable?: boolean;
  shareLink?: string;
};

type DecisionItem = {
  id: string;
  text: string;
  time: string;
};

type ParticipantEntity = {
  id: string;
  name: string;
  type: "class" | "department" | "staff" | "student" | "counselor" | "guest" | "coordinator";
  participantsCount: number;
  subLabel?: string;
  role?: string;
  section?: string;
  status?: "Available" | "Teaching" | "Active" | "Offline" | "In Meeting";
};

type GroupMember = {
  name: string;
  role: string;
  section: string;
  status: string;
};

const ALL_ENTITIES: ParticipantEntity[] = [
  // Classes
  { id: "ent-class-1", name: "DP1 Physics A", type: "class", participantsCount: 24, subLabel: "24 Students · Period 4", role: "Class", section: "Grade 11-A" },
  { id: "ent-class-2", name: "DP1 Physics B", type: "class", participantsCount: 22, subLabel: "22 Students · Period 5", role: "Class", section: "Grade 11-B" },
  { id: "ent-class-3", name: "DP2 Physics HL", type: "class", participantsCount: 20, subLabel: "20 Students · Period 2", role: "Class", section: "Grade 12-A" },
  { id: "ent-class-4", name: "MYP 4 Science", type: "class", participantsCount: 18, subLabel: "18 Students · Period 1", role: "Class", section: "Grade 10" },
  { id: "ent-class-5", name: "Homeroom 11-F", type: "class", participantsCount: 22, subLabel: "22 Students · Advisory", role: "Class", section: "Advisory 11-F" },
  // Departments & Groups
  { id: "ent-dept-1", name: "Physics Department", type: "department", participantsCount: 4, subLabel: "4 Staff members", role: "Department", section: "Faculty Hub 4" },
  { id: "ent-dept-2", name: "Academic Committee", type: "department", participantsCount: 5, subLabel: "5 Staff members", role: "Committee", section: "Advisory Board" },
  // Staff
  { id: "ent-staff-1", name: "Marcus Vance", type: "staff", participantsCount: 1, subLabel: "Science Head · Teacher", role: "Science Head", section: "Faculty Hub 4", status: "Teaching" },
  { id: "ent-staff-2", name: "Aarav Chen", type: "staff", participantsCount: 1, subLabel: "Physics Master · Teacher", role: "Physics Master", section: "Faculty Hub 4", status: "Available" },
  { id: "ent-staff-3", name: "Elena Rostova", type: "staff", participantsCount: 1, subLabel: "Chemistry Teacher", role: "Chemistry Teacher", section: "Faculty Hub 4", status: "Offline" },
  { id: "ent-staff-4", name: "Jin Woo", type: "staff", participantsCount: 1, subLabel: "Science Instructor", role: "Science Instructor", section: "Faculty Hub 4", status: "Offline" },
  { id: "ent-staff-5", name: "Sarah Jenkins", type: "staff", participantsCount: 1, subLabel: "Academic Coordinator", role: "Coordinator", section: "Admin Office", status: "In Meeting" },
  // Counselors
  { id: "ent-counselor-1", name: "Sarah Chen", type: "counselor", participantsCount: 1, subLabel: "Guidance Counselor", role: "Counselor", section: "Room 102", status: "Available" },
  // Students (Individuals)
  { id: "ent-student-1", name: "Ananya Patel", type: "student", participantsCount: 1, subLabel: "Student · Grade 11-B", role: "Student", section: "Grade 11-B", status: "Active" },
  { id: "ent-student-2", name: "Chloe Vance", type: "student", participantsCount: 1, subLabel: "Student · Grade 11-A", role: "Student", section: "Grade 11-A", status: "Active" },
  { id: "ent-student-3", name: "Dilan Patel", type: "student", participantsCount: 1, subLabel: "Student · Grade 11-B", role: "Student", section: "Grade 11-B", status: "Active" },
  // Extra Search demo targets
  { id: "ent-staff-ananya", name: "Ananya Sharma", type: "staff", participantsCount: 1, subLabel: "Humanities Teacher", role: "Teacher", section: "Faculty Hub 2", status: "Available" },
  { id: "ent-coord-ananya", name: "Ananya Rao", type: "coordinator", participantsCount: 1, subLabel: "IB DP Coordinator", role: "Coordinator", section: "IB Office", status: "In Meeting" },
  // Guests
  { id: "ent-guest-1", name: "Jonathan Sterling (Parent)", type: "guest", participantsCount: 1, subLabel: "Caleb's Parent · External Guest", role: "Parent", section: "External" },
];

const GROUP_MEMBERS: { [entityId: string]: GroupMember[] } = {
  "ent-class-1": [
    { name: "Chloe Vance", role: "Student", section: "Grade 11-A", status: "Active" },
    { name: "Emma Watson", role: "Student", section: "Grade 11-A", status: "Available" },
    { name: "Lucas Gray", role: "Student", section: "Grade 11-A", status: "Offline" },
    { name: "Oliver Queen", role: "Student", section: "Grade 11-A", status: "Active" },
  ],
  "ent-class-2": [
    { name: "Dilan Patel", role: "Student", section: "Grade 11-B", status: "Active" },
    { name: "Aria Thorne", role: "Student", section: "Grade 11-B", status: "Available" },
    { name: "Jin Woo", role: "Student", section: "Grade 11-B", status: "Offline" },
    { name: "Chloe Bennett", role: "Student", section: "Grade 11-B", status: "Active" },
  ],
  "ent-class-3": [
    { name: "Alex Mercer", role: "Student", section: "Grade 12-A", status: "Active" },
    { name: "Nisha Rao", role: "Student", section: "Grade 12-A", status: "Available" },
    { name: "Bruce Wayne", role: "Student", section: "Grade 12-A", status: "In Meeting" },
  ],
  "ent-class-4": [
    { name: "Peter Parker", role: "Student", section: "Grade 10", status: "Active" },
    { name: "Miles Morales", role: "Student", section: "Grade 10", status: "Available" },
    { name: "Gwen Stacy", role: "Student", section: "Grade 10", status: "Offline" },
  ],
  "ent-class-5": [
    { name: "Caleb Sterling", role: "Student", section: "Advisory 11-F", status: "Active" },
    { name: "Zoe Kravitz", role: "Student", section: "Advisory 11-F", status: "Available" },
    { name: "Harry Osborn", role: "Student", section: "Advisory 11-F", status: "Offline" },
  ],
  "ent-dept-1": [
    { name: "Marcus Vance", role: "Science Head", section: "Faculty Hub 4", status: "Teaching" },
    { name: "Aarav Chen", role: "Physics Master", section: "Faculty Hub 4", status: "Available" },
    { name: "Elena Rostova", role: "Chemistry Teacher", section: "Faculty Hub 4", status: "Offline" },
    { name: "Jin Woo", role: "Science Instructor", section: "Faculty Hub 4", status: "Offline" },
  ],
  "ent-dept-2": [
    { name: "Sarah Jenkins", role: "Coordinator", section: "Admin Office", status: "In Meeting" },
    { name: "Marcus Vance", role: "Science Head", section: "Faculty Hub 4", status: "Teaching" },
    { name: "Principal Varma", role: "Principal", section: "Admin Office", status: "Available" },
  ],
};

export function MeetingsWorkspace({
  initialMeeting = null,
  onLeaveMeeting,
  onStartMeetingTransit,
  isCallActiveMode = false,
  theme = "dark",
}: {
  initialMeeting?: MeetingItem | null;
  onLeaveMeeting?: () => void;
  onStartMeetingTransit?: (meeting: MeetingItem) => void;
  isCallActiveMode?: boolean;
  theme?: string;
}) {
  // Views: "overview" | "meeting"
  const [currentView, setCurrentView] = useState<"overview" | "meeting">(isCallActiveMode ? "meeting" : "overview");

  // Mock Meetings State - Strictly Virtual
  const [meetings, setMeetings] = useState<MeetingItem[]>([
    {
      id: "meet-1",
      title: "DP1 Physics Planning",
      participants: ["Aarav Chen", "Marcus Vance", "Sarah Chen"],
      classGroup: "Grade 11 Physics (B)",
      time: "2:15 PM - 3:00 PM (Today)",
      purpose: "Resolve Period 5 curricular delivery overlaps",
      status: "scheduled",
      timetableBlock: "Period 5",
      isShareable: true,
      shareLink: "http://localhost:3000/school/experience/demo?role=guest&meetingId=meet-1&title=DP1%20Physics%20Planning",
    },
    {
      id: "meet-2",
      title: "Student Support Review",
      participants: ["Aarav Chen", "Sarah Chen"],
      classGroup: "Grade 11 Advisory Group",
      time: "4:00 PM - 4:30 PM (Today)",
      purpose: "Formulate support plan for Chloe Vance workload stress",
      status: "scheduled",
      timetableBlock: "Period 7",
      isShareable: true,
      shareLink: "http://localhost:3000/school/experience/demo?role=guest&meetingId=meet-2&title=Student%20Support%20Review",
    },
    {
      id: "meet-3",
      title: "Department Alignment Session",
      organizer: "Marcus Vance (Science Head)",
      participants: ["Marcus Vance", "Aarav Chen", "Jin Woo", "Elena Rostova"],
      classGroup: "Science Department",
      time: "10:30 AM - 11:15 AM (Tomorrow)",
      purpose: "Finalize experimental frameworks and draft IA submission deadlines",
      status: "invited",
      suggestedPrep: "Bring tracking sheets for Physics IA submissions progress",
      timetableBlock: "Period 3",
    },
    {
      id: "meet-4",
      title: "Parent Follow-Up: Sterling Case",
      organizer: "Aarav Chen",
      participants: ["Aarav Chen", "Jonathan Sterling (Parent)"],
      classGroup: "Homeroom 11-F",
      time: "9:00 AM - 9:30 AM (Friday)",
      purpose: "Discussion on Caleb Sterling automated attendance logs warnings",
      status: "scheduled",
      timetableBlock: "Period 1",
    },
  ]);

  // Selected meeting for the active call
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingItem | null>(initialMeeting);

  // Form Fields under "Start a Meeting" toolbox
  const [meetTitle, setMeetTitle] = useState("");
  const [meetPurpose, setMeetPurpose] = useState("");
  const [meetTime, setMeetTime] = useState("12:45 PM (Period 5)");

  const [selectedContext, setSelectedContext] = useState<DetectedContext | null>(null);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [contextToast, setContextToast] = useState<string | null>(null);

  const handleContextAction = (context: DetectedContext) => {
    setSelectedContext(context);
    setIsContextModalOpen(true);
  };

  const handleContextConfirm = (context: DetectedContext, formData: Record<string, string>) => {
    const contextData = {
      ...context,
      title: formData.title || context.title,
      description: formData.description || context.description,
      date: formData.date || context.date,
      time: formData.time || context.time,
      targetGroup: formData.targetGroup || context.targetGroup,
      participants: formData.participants ? formData.participants.split(",").map(p => p.trim()) : context.participants
    };

    if (context.type === "meeting") {
      setMeetTitle(contextData.title || "Coordination Meeting");
      setMeetPurpose(contextData.description || "");
      if (contextData.date) {
        setMeetTime(`${contextData.date} ${contextData.time || "14:30"}`);
      }
    } else if (context.type === "task" || context.type === "assignment") {
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        if (context.type === "task") win.axisContextPendingTask = contextData;
        else win.axisContextPendingAssignment = contextData;
      }
      const targetClass = contextData.targetGroup || "Grade 11 Physics (B)";
      window.dispatchEvent(new CustomEvent("axis-context-auto-action", {
        detail: {
          type: context.type,
          autoOpen: true,
          context: contextData,
          targetClass
        }
      }));
      window.dispatchEvent(new CustomEvent("axis-navigate-workspace", {
        detail: { workspace: "class-space", targetClass, autoOpenModal: true }
      }));
    } else if (context.type === "event" || context.type === "calendar") {
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        win.axisContextPendingEvent = contextData;
      }
      window.dispatchEvent(new CustomEvent("axis-context-auto-action", {
        detail: {
          type: context.type === "calendar" ? "calendar" : "event",
          autoOpen: true,
          context: contextData
        }
      }));
      window.dispatchEvent(new CustomEvent("axis-navigate-workspace", {
        detail: { workspace: "calendar", autoOpenModal: true }
      }));
    } else if (context.type === "announcement") {
      window.dispatchEvent(new CustomEvent("axis-context-auto-action", {
        detail: {
          type: "announcement",
          autoOpen: true,
          context: contextData,
          targetClass: contextData.targetGroup || "Grade 11 Physics (B)"
        }
      }));
      window.dispatchEvent(new CustomEvent("axis-navigate-workspace", {
        detail: { workspace: "home", autoOpenModal: true }
      }));
    }

    setContextToast(`✓ ${context.type.charAt(0).toUpperCase() + context.type.slice(1)} created successfully`);
    setTimeout(() => setContextToast(null), 2500);
  };

  useEffect(() => {
    const handleContextAutoAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.type === "meeting") {
        const { context } = customEvent.detail;
        if (context) {
          setMeetTitle(context.title || "Coordination Meeting");
          setMeetPurpose(context.description || context.trigger || "");
          if (context.date) {
            setMeetTime(`${context.date} ${context.time || "14:30"}`);
          }
        }
      }
    };
    window.addEventListener("axis-context-auto-action", handleContextAutoAction);
    return () => {
      window.removeEventListener("axis-context-auto-action", handleContextAutoAction);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if (win.axisContextPendingMeeting) {
        const context = win.axisContextPendingMeeting;
        setMeetTitle(context.title || "Coordination Meeting");
        setMeetPurpose(context.description || context.trigger || "");
        if (context.date) {
          setMeetTime(`${context.date} ${context.time || "14:30"}`);
        }
        delete win.axisContextPendingMeeting;
      }
    }
  }, []);
  
  // Custom smart selection picker states
  const [meetingType, setMeetingType] = useState<"class" | "multi-class" | "department" | "staff" | "custom" | "guest">("class");
  const [selectedEntities, setSelectedEntities] = useState<ParticipantEntity[]>([ALL_ENTITIES[1]]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingMembersEntityId, setViewingMembersEntityId] = useState<string | null>(null);

  const [generateShareLink, setGenerateShareLink] = useState(false);
  const [sharingMeetingId, setSharingMeetingId] = useState<string | null>(null);

  const selectedGroupsCount = useMemo(() => {
    return selectedEntities.filter((e) => e.type === "class" || e.type === "department").length;
  }, [selectedEntities]);

  const totalParticipantsCount = useMemo(() => {
    const sum = selectedEntities.reduce((acc, curr) => acc + curr.participantsCount, 0);
    // Aarav Chen (host) is +1
    return sum + 1;
  }, [selectedEntities]);

  const filteredSearchEntities = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return ALL_ENTITIES.filter((entity) => {
      // Don't show already selected entities
      if (selectedEntities.some((se) => se.id === entity.id)) return false;

      // Filter based on query
      return (
        entity.name.toLowerCase().includes(query) ||
        (entity.subLabel && entity.subLabel.toLowerCase().includes(query)) ||
        entity.type.toLowerCase().includes(query) ||
        (entity.role && entity.role.toLowerCase().includes(query))
      );
    });
  }, [searchQuery, selectedEntities]);

  const viewingMembers = useMemo(() => {
    if (!viewingMembersEntityId) return null;
    const entity = ALL_ENTITIES.find((e) => e.id === viewingMembersEntityId);
    const members = GROUP_MEMBERS[viewingMembersEntityId] || [];
    return { entity, members };
  }, [viewingMembersEntityId]);

  const handleAddEntity = (entity: ParticipantEntity) => {
    if (selectedEntities.some((e) => e.id === entity.id)) return;
    setSelectedEntities((prev) => [...prev, entity]);
    setSearchQuery("");
  };

  const handleRemoveEntity = (id: string) => {
    setSelectedEntities((prev) => prev.filter((e) => e.id !== id));
  };

  const contextLayerInsight = useMemo(() => {
    if (selectedEntities.length === 0) {
      return {
        type: "info",
        text: "Select participants to analyze availability, overlaps, and conflicts.",
        iconColor: "bg-cyan-400 animate-pulse",
        textColor: "text-cyan-400",
        bgColor: "bg-cyan-500/[0.02]",
        borderColor: "border-cyan-500/10",
      };
    }

    // Check if there is a guest
    const hasGuest = selectedEntities.some((e) => e.type === "guest");
    // Check if combined class count is high
    const totalCount = selectedEntities.reduce((acc, curr) => acc + curr.participantsCount, 0);
    // Check if there are multiple classes
    const classes = selectedEntities.filter((e) => e.type === "class");

    if (hasGuest && !generateShareLink) {
      return {
        type: "warning",
        text: "External guest selected. Enable 'Generate Share Link' to allow access.",
        iconColor: "bg-amber-400",
        textColor: "text-amber-400",
        bgColor: "bg-amber-500/[0.02]",
        borderColor: "border-amber-500/10",
      };
    }

    // Combined Physics Classes specific example (DP1 Physics A + B selected)
    const hasPhysicsA = selectedEntities.some((e) => e.id === "ent-class-1");
    const hasPhysicsB = selectedEntities.some((e) => e.id === "ent-class-2");
    if (hasPhysicsA && hasPhysicsB) {
      return {
        type: "info",
        text: "Combined class session has 46 students. Shared subject: Physics. Shared teachers: Aarav Chen. Timetable overlap detected.",
        iconColor: "bg-cyan-400 animate-pulse",
        textColor: "text-cyan-400",
        bgColor: "bg-cyan-500/[0.02]",
        borderColor: "border-cyan-500/10",
      };
    }

    // Physics Department already meeting slot conflict specific example
    const hasPhysicsDept = selectedEntities.some((e) => e.id === "ent-dept-1");
    if (hasPhysicsDept && meetTime === "2:15 PM (Period 6)") {
      return {
        type: "warning",
        text: "Physics Department already meeting during this slot (Period 6 alignment session).",
        iconColor: "bg-amber-400",
        textColor: "text-amber-400",
        bgColor: "bg-amber-500/[0.02]",
        borderColor: "border-amber-500/10",
      };
    }

    // Check for unavailable selected individuals
    const unavailableCount = selectedEntities.filter(
      (e) => e.status === "Offline" || e.status === "Teaching" || e.status === "In Meeting"
    ).length;
    if (unavailableCount > 0) {
      return {
        type: "warning",
        text: `${unavailableCount} participant${unavailableCount > 1 ? "s" : ""} unavailable during selected time. Consider rescheduling.`,
        iconColor: "bg-amber-400",
        textColor: "text-amber-400",
        bgColor: "bg-amber-500/[0.02]",
        borderColor: "border-amber-500/10",
      };
    }

    if (classes.length > 1) {
      return {
        type: "info",
        text: `Combined session: ${classes.length} classes selected (${totalCount} students). Timetable conflict checks active.`,
        iconColor: "bg-cyan-400",
        textColor: "text-cyan-400",
        bgColor: "bg-cyan-500/[0.02]",
        borderColor: "border-cyan-500/10",
      };
    }

    if (totalCount > 40) {
      return {
        type: "warning",
        text: `High participant density (${totalCount} participants). Recommended to check mic calibration and mute participants upon entry.`,
        iconColor: "bg-amber-400",
        textColor: "text-amber-400",
        bgColor: "bg-amber-500/[0.02]",
        borderColor: "border-amber-500/10",
      };
    }

    // Default availability
    return {
      type: "success",
      text: `Intelligent Availability: All selected participants/groups are free during ${meetTime}.`,
      iconColor: "bg-emerald-400",
      textColor: "text-emerald-400",
      bgColor: "bg-emerald-500/[0.02]",
      borderColor: "border-emerald-500/10",
    };
  }, [selectedEntities, generateShareLink, meetTime]);

  const tempShareId = useMemo(() => `meet-share-${Date.now()}`, []);
  const tempShareLink = useMemo(() => {
    return `http://localhost:3000/school/experience/demo?role=guest&meetingId=${tempShareId}&title=${encodeURIComponent(meetTitle.trim() || "Spontaneous Virtual Realignment")}`;
  }, [meetTitle, tempShareId]);

  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);

  // Refactored hardware selections
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");
  const [permissionStatus, setPermissionStatus] = useState<"pending" | "granted" | "denied">("pending");
  const [selectedBg, setSelectedBg] = useState<"none" | "blur" | "axis" | "school">("none");
  const [micLevel, setMicLevel] = useState(0);
  const [isTestingSpeaker, setIsTestingSpeaker] = useState(false);

  // Active Call Session states
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState("00:00");
  const meetingTimerRef = useRef(0);

  // Live media stream state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Initialize and enumerate devices/permission
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let simulatedCleanup: (() => void) | null = null;
    let isCurrent = true;

    async function initDevicesAndStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!isCurrent) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        setPermissionStatus("granted");
        activeStream = stream;
        setLocalStream(stream);

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devices.filter(d => d.kind === "videoinput");
        const audioInDevs = devices.filter(d => d.kind === "audioinput");
        const audioOutDevs = devices.filter(d => d.kind === "audiooutput");

        setCameras(videoDevs.length ? videoDevs : defaultCameras);
        setMicrophones(audioInDevs.length ? audioInDevs : defaultMicrophones);
        setSpeakers(audioOutDevs.length ? audioOutDevs : defaultSpeakers);

        if (videoDevs.length && !selectedCamera) setSelectedCamera(videoDevs[0].deviceId);
        if (audioInDevs.length && !selectedMicrophone) {
          setSelectedMicrophone(audioInDevs[0].deviceId);
        }
        if (audioOutDevs.length && !selectedSpeaker) setSelectedSpeaker(audioOutDevs[0].deviceId);
      } catch (err) {
        console.warn("Media stream access denied or failed, using simulated devices:", err);
        setPermissionStatus("denied");
        setCameras(defaultCameras);
        setMicrophones(defaultMicrophones);
        setSpeakers(defaultSpeakers);
        setSelectedCamera("default-cam");
        setSelectedMicrophone("default-mic");
        setSelectedSpeaker("default-spk");

        const sim = createSimulatedStream();
        simulatedCleanup = sim.cleanup;
        if (isCurrent) {
          setLocalStream(sim.stream);
        } else {
          sim.cleanup();
        }
      }
    }

    initDevicesAndStream();

    return () => {
      isCurrent = false;
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
      if (simulatedCleanup) {
        simulatedCleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update MediaStream when Camera/Mic selections change
  useEffect(() => {
    if (permissionStatus !== "granted") return;

    let isCurrent = true;

    async function updateStream() {
      try {
        const constraints: MediaStreamConstraints = {
          video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
          audio: selectedMicrophone ? { deviceId: { exact: selectedMicrophone } } : true,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isCurrent) {
          if (localStream) {
            localStream.getTracks().forEach(t => t.stop());
          }
          setLocalStream(stream);
        } else {
          stream.getTracks().forEach(t => t.stop());
        }
      } catch (err) {
        console.warn("Failed to update media stream constraints:", err);
      }
    }

    updateStream();

    return () => {
      isCurrent = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCamera, selectedMicrophone, permissionStatus]);

  // Synchronize audio track status based on view and mute states
  useEffect(() => {
    if (localStream) {
      const active = currentView === "meeting" ? !isAudioMuted : micActive;
      localStream.getAudioTracks().forEach(track => {
        track.enabled = active;
      });
    }
  }, [localStream, currentView, isAudioMuted, micActive]);

  // Synchronize video track status based on view and camera status
  useEffect(() => {
    if (localStream) {
      const active = currentView === "meeting" ? !isVideoMuted : cameraActive;
      localStream.getVideoTracks().forEach(track => {
        track.enabled = active;
      });
    }
  }, [localStream, currentView, isVideoMuted, cameraActive]);

  // Real-time Mic Level Analyzer & Simulated fluctuation
  useEffect(() => {
    if (!localStream) {
      setMicLevel(0);
      return;
    }

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let microphone: MediaStreamAudioSourceNode | null = null;
    let javascriptNode: ScriptProcessorNode | null = null;
    let animationFrameId: number;

    const isActive = currentView === "meeting" ? !isAudioMuted : micActive;
    if (!isActive) {
      setMicLevel(0);
      return;
    }

    const isSimulated = permissionStatus === "denied";

    if (isSimulated) {
      let count = 0;
      const simulateMic = () => {
        count += 0.15;
        const base = Math.abs(Math.sin(count)) * 25;
        const noise = Math.random() * 8;
        setMicLevel(Math.min(100, Math.max(0, base + noise)));
        animationFrameId = requestAnimationFrame(simulateMic);
      };
      simulateMic();
      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }

    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      audioContext = new AudioContextClass();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      microphone = audioContext.createMediaStreamSource(localStream);
      javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
      
      microphone.connect(analyser);
      analyser.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      javascriptNode.onaudioprocess = () => {
        analyser!.getByteFrequencyData(dataArray);
        let values = 0;
        for (let i = 0; i < bufferLength; i++) {
          values += dataArray[i];
        }
        const average = values / bufferLength;
        setMicLevel(Math.min(100, Math.round((average / 120) * 100)));
      };
    } catch (e) {
      console.warn("Failed to setup audio analyser:", e);
      let count = 0;
      const simulateMic = () => {
        count += 0.1;
        setMicLevel(Math.round(20 + Math.sin(count) * 10 + Math.random() * 5));
        animationFrameId = requestAnimationFrame(simulateMic);
      };
      simulateMic();
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (javascriptNode) javascriptNode.disconnect();
      if (microphone) microphone.disconnect();
      if (audioContext) audioContext.close();
    };
  }, [localStream, micActive, isAudioMuted, currentView, permissionStatus]);

  // Synthesis Speaker Audio Test Chime
  const handleTestSpeaker = () => {
    if (isTestingSpeaker) return;
    setIsTestingSpeaker(true);
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass() as AudioContextWithSink;
      
      if (selectedSpeaker && ctx.setSinkId) {
        ctx.setSinkId(selectedSpeaker).catch((err: unknown) => {
          console.warn("Error setting sink ID:", err);
        });
      }
      
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.15);
      gain2.gain.setValueAtTime(0, now + 0.15);
      gain2.gain.linearRampToValueAtTime(0.2, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      osc1.start(now);
      osc1.stop(now + 0.5);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.85);
      
      setTimeout(() => {
        setIsTestingSpeaker(false);
        ctx.close();
      }, 1000);
    } catch (err) {
      console.warn("Failed to play speaker test chime:", err);
      setIsTestingSpeaker(false);
    }
  };

  // Unified Sidebar States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"chat" | "participants" | "ledger">("ledger");

  // Meeting Chat messages type and state
  type MeetingMessage = {
    id: string;
    sender: "teacher" | "other";
    senderName: string;
    avatar: string;
    role: string;
    text: string;
    time: string;
  };

  const [meetingMessages, setMeetingMessages] = useState<MeetingMessage[]>([
    {
      id: "mm-1",
      sender: "other",
      senderName: "Marcus Vance",
      avatar: "MV",
      role: "Science Head",
      text: "Hi Aarav, thanks for setting this up so quickly.",
      time: "2:15 PM"
    },
    {
      id: "mm-2",
      sender: "other",
      senderName: "Sarah Chen",
      avatar: "SC",
      role: "Guidance Counselor",
      text: "Hello everyone, glad we can coordinate on the DP1 student workload issues.",
      time: "2:16 PM"
    },
    {
      id: "mm-3",
      sender: "teacher",
      senderName: "Aarav Chen",
      avatar: "AC",
      role: "Physics Master (You)",
      text: "Welcome Marcus, Sarah. Let's first review the Period 5 room assignments conflict.",
      time: "2:17 PM"
    },
    {
      id: "mm-4",
      sender: "other",
      senderName: "Marcus Vance",
      avatar: "MV",
      role: "Science Head",
      text: "Lab 3 is booked for Period 2, but we need it for collision setup by Period 5.",
      time: "2:18 PM"
    }
  ]);
  const [meetingChatInput, setMeetingChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeSidebarTab === "chat" && isSidebarOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [meetingMessages, activeSidebarTab, isSidebarOpen]);

  const handleSendMeetingMessage = () => {
    if (!meetingChatInput.trim()) return;
    const newMsg: MeetingMessage = {
      id: `mm-msg-${Date.now()}`,
      sender: "teacher",
      senderName: "Aarav Chen",
      avatar: "AC",
      role: "Physics Master (You)",
      text: meetingChatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMeetingMessages((prev) => [...prev, newMsg]);
    setMeetingChatInput("");
  };

  const handleToggleSidebar = (tab: "chat" | "participants" | "ledger") => {
    if (isSidebarOpen && activeSidebarTab === tab) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
      setActiveSidebarTab(tab);
    }
  };

  const getParticipantDetails = (name: string) => {
    if (name === "Aarav Chen") {
      return {
        role: "Physics Master (Host)",
        avatar: "AC",
        status: "Active",
        isMuted: isAudioMuted,
        isHandRaised: isHandRaised
      };
    }
    const entity = ALL_ENTITIES.find(e => e.name === name);
    return {
      role: entity?.role || (name.includes("Parent") ? "Guest Parent" : "Participant"),
      avatar: name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase(),
      status: name === "Marcus Vance" && !mutedAll ? "Speaking" : "Active",
      isMuted: name === "Marcus Vance" ? mutedAll : true,
      isHandRaised: false
    };
  };

  // Call features
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [decisionInput, setDecisionInput] = useState("");
  const [generatedRecap, setGeneratedRecap] = useState<string | null>(null);

  // Form validation state (requires Title, Purpose, and at least one Participant)
  const isFormInvalid = !meetTitle.trim() || !meetPurpose.trim() || selectedEntities.length === 0;

  // Premium call feature simulation states
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mutedAll, setMutedAll] = useState(false);
  const [activeCaption, setActiveCaption] = useState("");

  // Auto-generated captions simulation effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentView === "meeting") {
      const simulatedCaptions = [
        { speaker: "Aarav Chen", text: "Welcome everyone to our coordination call. Let's sync on physics planning." },
        { speaker: "Marcus Vance", text: "Hi Aarav. I wanted to verify the Period 5 room assignments." },
        { speaker: "Aarav Chen", text: "Yes, I have selected the combined DP1 Physics groups to resolve this." },
        { speaker: "Marcus Vance", text: "Excellent, that will align perfectly with our timetable blocks." },
        { speaker: "Elena Rostova", text: "Should we log the decision for the lab kit setup as well?" },
        { speaker: "Aarav Chen", text: "Yes, let's authorize the swap using the resolution button." },
      ];
      let captionIndex = 0;
      timer = setInterval(() => {
        const item = simulatedCaptions[captionIndex];
        setActiveCaption(`[${item.speaker}]: ${item.text}`);
        captionIndex = (captionIndex + 1) % simulatedCaptions.length;
      }, 5000);
      setActiveCaption(`[Aarav Chen]: Welcome everyone to our coordination call. Let's sync on physics planning.`);
    } else {
      setActiveCaption("");
    }
    return () => clearInterval(timer);
  }, [currentView]);

  // Timer simulation for active meeting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentView === "meeting") {
      interval = setInterval(() => {
        meetingTimerRef.current += 1;
        const mins = Math.floor(meetingTimerRef.current / 60).toString().padStart(2, "0");
        const secs = (meetingTimerRef.current % 60).toString().padStart(2, "0");
        setMeetingDuration(`${mins}:${secs}`);
      }, 1000);
    } else {
      meetingTimerRef.current = 0;
      setMeetingDuration("00:00");
      setGeneratedRecap(null);
    }
    return () => clearInterval(interval);
  }, [currentView]);

  // Invitation responses
  const handleInvitationResponse = (id: string, response: "accept" | "decline") => {
    if (response === "accept") {
      setMeetings((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "scheduled" as const } : m))
      );
    } else {
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // Launch Call Directly using RHS parameters
  const handleLaunchInstantMeeting = () => {
    const titleVal = meetTitle.trim() || "Spontaneous Virtual Realignment";
    const purposeVal = meetPurpose.trim() || "Immediate operational realignment";
    const groupLabel = selectedEntities.map((e) => e.name).join(", ") || "Custom Participant Group";
    const participantNames = ["Aarav Chen", ...selectedEntities.map((e) => e.name)];
 
    const instantMeet: MeetingItem = {
      id: `meet-instant-${Date.now()}`,
      title: titleVal,
      participants: participantNames,
      classGroup: groupLabel,
      time: "Active Now",
      purpose: purposeVal,
      status: "scheduled",
      timetableBlock: meetTime,
      isShareable: generateShareLink,
      shareLink: generateShareLink ? tempShareLink : undefined,
    };
 
    if (onStartMeetingTransit) {
      onStartMeetingTransit(instantMeet);
    } else {
      setSelectedMeeting(instantMeet);
      setIsAudioMuted(!micActive);
      setIsVideoMuted(!cameraActive);
      setCurrentView("meeting");
    }
  };
 
  // Schedule Session using RHS parameters
  const handleScheduleFutureMeeting = () => {
    const titleVal = meetTitle.trim() || "Virtual Coordination Sync";
    const purposeVal = meetPurpose.trim() || "Curricular guidelines scheduling sync";
    const groupLabel = selectedEntities.map((e) => e.name).join(", ") || "Custom Participant Group";
    const participantNames = ["Aarav Chen", ...selectedEntities.map((e) => e.name)];
 
    const scheduledMeet: MeetingItem = {
      id: `meet-custom-${Date.now()}`,
      title: titleVal,
      participants: participantNames,
      classGroup: groupLabel,
      time: `${meetTime} (Scheduled Today)`,
      purpose: purposeVal,
      status: "scheduled",
      timetableBlock: meetTime,
      isShareable: generateShareLink,
      shareLink: generateShareLink ? tempShareLink : undefined,
    };
 
    setMeetings((prev) => [scheduledMeet, ...prev]);
    // Reset Form fields
    setMeetTitle("");
    setMeetPurpose("");
    setGenerateShareLink(false);
    setSelectedEntities([ALL_ENTITIES[1]]);
    alert(`Success: "${titleVal}" added to scheduled virtual meetings.`);
  };
 
  const handleJoinExistingMeeting = (meet: MeetingItem) => {
    if (onStartMeetingTransit) {
      onStartMeetingTransit(meet);
    } else {
      setSelectedMeeting(meet);
      setIsAudioMuted(!micActive);
      setIsVideoMuted(!cameraActive);
      setCurrentView("meeting");
    }
  };

  // Decisions Ledger
  const handleAddDecision = () => {
    if (!decisionInput.trim()) return;
    const newDecision: DecisionItem = {
      id: `dec-${Date.now()}`,
      text: decisionInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setDecisions((prev) => [...prev, newDecision]);
    setDecisionInput("");
  };

  const handleGenerateRecap = () => {
    if (!selectedMeeting) return;
    const decisionLogStr = decisions.length > 0
      ? decisions.map((d) => `• [${d.time}] ${d.text}`).join("\n")
      : "• No formal decisions logged during coordination.";

    const recap = `AXIS VIRTUAL MEETING RECAP
-----------------------------------
Meeting: ${selectedMeeting.title}
Timestamp: ${new Date().toLocaleDateString()}
Subject: ${selectedMeeting.purpose}
Virtual Channel: Axis Secure Room (${selectedMeeting.id})

Decisions Ledger:
${decisionLogStr}

Follow-ups Generated:
1. Virtual schedules and coordination timelines synced.
2. Participant dashboard status metrics updated.`;

    setGeneratedRecap(recap);
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full">
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: DUAL PANEL OVERVIEW */}
        {currentView === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-safe-lg w-full"
          >
            {/* COLUMN A: MY MEETINGS */}
            <div className="space-y-safe-lg">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E]/40 p-safe-lg shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="flex flex-col gap-1 pb-safe-md border-b border-white/[0.06] mb-safe-md">
                  <h2 className="text-sm font-semibold tracking-tight text-white/90">My Meetings</h2>
                  <p className="text-[10px] text-white/35 font-medium leading-none">Your scheduled virtual rooms & coordination links</p>
                </div>

                {/* Scheduled Meetings list */}
                <div className="space-y-safe-md">
                  {meetings.filter((m) => m.status === "scheduled").map((meet) => (
                    <div
                      key={meet.id}
                      className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-safe-md hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300 flex flex-col gap-safe-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-safe-md">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-semibold text-white/95 truncate">{meet.title}</h3>
                            <span className="text-[8px] font-bold px-1.5 py-0.2 rounded uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              Virtual Link Active
                            </span>
                          </div>
                          <p className="text-[11px] text-white/45 leading-relaxed truncate">{meet.purpose}</p>
                          
                          <div className="flex items-center gap-2.5 text-[9px] text-white/30 font-medium">
                            <span>{meet.time}</span>
                            <span className="size-1 rounded-full bg-white/10" />
                            <span>Scope: {meet.classGroup}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => setSharingMeetingId(sharingMeetingId === meet.id ? null : meet.id)}
                            className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold transition-all ${
                              sharingMeetingId === meet.id
                                ? "bg-white text-black border-white"
                                : "bg-white/[0.02] border-white/10 text-white/70 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            Share Link
                          </button>
                          <button
                            onClick={() => handleJoinExistingMeeting(meet)}
                            className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-black hover:opacity-90 transition-all"
                          >
                            Join Room
                          </button>
                        </div>
                      </div>

                      {sharingMeetingId === meet.id && (
                        <div className="pt-3 border-t border-white/[0.05] space-y-2 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Shareable Meeting Link</span>
                            <span className="text-[8px] text-emerald-400 font-medium">Guest access enabled</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={meet.shareLink || `http://localhost:3000/school/experience/demo?role=guest&meetingId=${meet.id}&title=${encodeURIComponent(meet.title)}`}
                              className="flex-1 text-[10px] font-mono bg-black/40 border border-white/5 rounded px-2.5 py-1 text-white/60 focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                const link = meet.shareLink || `http://localhost:3000/school/experience/demo?role=guest&meetingId=${meet.id}&title=${encodeURIComponent(meet.title)}`;
                                navigator.clipboard.writeText(link);
                                alert("Share link copied to clipboard!");
                              }}
                              className="rounded bg-white/10 hover:bg-white/20 border border-white/5 px-2.5 py-1 text-[10px] font-bold text-white transition-all shrink-0"
                            >
                              Copy Link
                            </button>
                            <button
                              onClick={() => {
                                const newId = `meet-reg-${Date.now()}`;
                                const newLink = `http://localhost:3000/school/experience/demo?role=guest&meetingId=${newId}&title=${encodeURIComponent(meet.title)}`;
                                setMeetings(prev => prev.map(m => m.id === meet.id ? { ...m, shareLink: newLink, isShareable: true } : m));
                              }}
                              className="rounded bg-white/10 hover:bg-white/20 border border-white/5 px-2.5 py-1 text-[10px] font-bold text-white transition-all shrink-0"
                            >
                              Regenerate Link
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Invitations Panel */}
              <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E]/40 p-safe-lg shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="flex flex-col gap-1 pb-safe-sm border-b border-white/[0.06] mb-safe-md">
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Pending Room Invites</h3>
                </div>

                <div className="space-y-safe-md">
                  {meetings.filter((m) => m.status === "invited").map((meet) => (
                    <div
                      key={meet.id}
                      className="rounded-xl border border-white/[0.04] bg-[#0E0E10]/50 p-safe-md flex flex-col sm:flex-row sm:items-start justify-between gap-safe-md"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <span className="text-[9px] text-white/30 font-medium">From {meet.organizer}</span>
                        <h4 className="text-xs font-semibold text-white/95 mt-0.5">{meet.title}</h4>
                        <p className="text-[11px] text-white/50 leading-relaxed">{meet.purpose}</p>
                        
                        {meet.suggestedPrep && (
                          <div className="text-[9px] bg-white/[0.02] border border-white/[0.04] rounded p-2 text-white/40 mt-1 leading-snug">
                            <strong>Prep suggestion:</strong> {meet.suggestedPrep}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                        <button
                          onClick={() => handleInvitationResponse(meet.id, "decline")}
                          className="text-[10px] font-semibold text-white/35 hover:text-white transition-colors px-2 py-1"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleInvitationResponse(meet.id, "accept")}
                          className="rounded bg-white/10 hover:bg-white/20 border border-white/5 px-2.5 py-1 text-[10px] font-bold text-white transition-all"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                  {meetings.filter((m) => m.status === "invited").length === 0 && (
                    <div className="text-xs text-white/20 text-center py-4 italic border border-dashed border-white/5 rounded-xl">
                      No pending room invitations.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN B: START A VIRTUAL MEETING */}
            <div className="relative space-y-safe-lg">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E]/40 p-safe-lg shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl space-y-safe-lg">
                <div className="flex flex-col gap-1 pb-safe-md border-b border-white/[0.06]">
                  <h2 className="text-sm font-semibold tracking-tight text-white/90">Start a Virtual Meeting</h2>
                  <p className="text-[10px] text-white/35 font-medium leading-none">Configure operational tools and spawn secure room link</p>
                </div>

                {/* Form fields */}
                <div className="space-y-safe-md">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider block">Virtual Session Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Lab Collision Realignment Sync"
                      value={meetTitle}
                      onChange={(e) => setMeetTitle(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-safe-md py-safe-sm text-xs text-white placeholder-white/25 focus:border-white/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider block">Agenda / Purpose</label>
                    <input
                      type="text"
                      placeholder="e.g. Sync curricular period delivery timelines"
                      value={meetPurpose}
                      onChange={(e) => setMeetPurpose(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-safe-md py-safe-sm text-xs text-white placeholder-white/25 focus:border-white/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-safe-sm">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider block">Timetable Slot</label>
                      <select
                        value={meetTime}
                        onChange={(e) => setMeetTime(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.06] bg-[#0E0E10] px-safe-sm py-safe-sm text-xs text-white/80 focus:outline-none"
                      >
                        <option>12:45 PM (Period 5)</option>
                        <option>2:15 PM (Period 6)</option>
                        <option>4:00 PM (Period 7)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider block">Meeting Type</label>
                      <select
                        value={meetingType}
                        onChange={(e) => {
                          const val = e.target.value as "class" | "multi-class" | "department" | "staff" | "custom" | "guest";
                          setMeetingType(val);
                          // Set default entities when selection type changes
                          if (val === "class") {
                            setSelectedEntities([ALL_ENTITIES[0]]); // DP1 Physics A
                          } else if (val === "department") {
                            setSelectedEntities([ALL_ENTITIES[5]]); // Science Dept
                          } else if (val === "staff") {
                            setSelectedEntities([ALL_ENTITIES[7]]); // Marcus Vance
                          } else if (val === "guest") {
                            setSelectedEntities([ALL_ENTITIES[18] || ALL_ENTITIES[11]]); // Guest
                          } else {
                            setSelectedEntities([]);
                          }
                        }}
                        className="w-full rounded-xl border border-white/[0.06] bg-[#0E0E10] px-safe-sm py-safe-sm text-xs text-white/80 focus:outline-none"
                      >
                        <option value="class">Single Class</option>
                        <option value="multi-class">Multi-Class</option>
                        <option value="department">Department</option>
                        <option value="staff">Staff Meeting</option>
                        <option value="custom">Custom (Freeform)</option>
                        <option value="guest">Guest Meeting</option>
                      </select>
                    </div>
                  </div>

                  {/* Smart Participant Picker Section */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider block">
                        Search & Select Participants
                      </label>
                      <span className="text-[8px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded uppercase font-semibold">
                        Smart Picker
                      </span>
                    </div>

                    {/* Search Input Box */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search names, classes, departments, or roles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] pl-10 pr-safe-md py-safe-sm text-xs text-white placeholder-white/20 focus:border-white/20 focus:outline-none transition-all"
                      />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                        <svg className="size-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      {/* Dropdown Menu Search Results */}
                      <AnimatePresence>
                        {searchQuery.trim().length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute z-40 left-0 right-0 mt-1 max-h-[180px] overflow-y-auto rounded-xl border border-white/10 bg-[#0C0C0E] p-1.5 shadow-2xl space-y-0.5 scrollbar-thin scrollbar-thumb-white/10"
                          >
                            {filteredSearchEntities.map((entity) => (
                              <button
                                key={entity.id}
                                type="button"
                                onClick={() => handleAddEntity(entity)}
                                className="w-full text-left rounded-lg px-3 py-2 text-xs hover:bg-white/5 flex items-center justify-between text-white/80 hover:text-white transition-colors"
                              >
                                <div className="flex flex-col">
                                  <span className="font-semibold">{entity.name}</span>
                                  <span className="text-[9px] text-white/35 mt-0.5">{entity.subLabel}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[8px] opacity-40 border border-white/10 rounded px-1.5 py-0.2 uppercase font-medium">
                                    {entity.type}
                                  </span>
                                  <svg className="size-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                  </svg>
                                </div>
                              </button>
                            ))}
                            {filteredSearchEntities.length === 0 && (
                              <div className="text-[10px] text-white/30 text-center py-3 italic">
                                No matching resources found.
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Selected Entities List */}
                    <div className="rounded-xl border border-white/[0.04] bg-black/20 p-safe-sm space-y-safe-sm">
                      <span className="text-[8px] font-bold text-white/35 uppercase tracking-widest block">
                        Selected Entity Scope
                      </span>

                      <div className="flex flex-col gap-safe-sm max-h-[130px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent pr-1">
                        {selectedEntities.map((entity) => (
                          <div
                            key={entity.id}
                            className="flex items-center justify-between p-safe-sm rounded-lg bg-white/[0.01] border border-white/[0.03] text-left"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-medium text-white/95 truncate">
                                  {entity.name}
                                </span>
                                <span className="text-[8px] bg-white/5 px-1 py-0.2 rounded text-white/40 uppercase">
                                  {entity.type}
                                </span>
                              </div>
                              <span className="text-[9px] text-white/35 line-clamp-1 mt-0.5">
                                {entity.subLabel}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-3">
                              {(entity.type === "class" || entity.type === "department") && (
                                <button
                                  type="button"
                                  onClick={() => setViewingMembersEntityId(entity.id)}
                                  className="text-[9px] text-cyan-400 hover:text-cyan-300 font-semibold underline px-1 py-0.5"
                                >
                                  View Members
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveEntity(entity.id)}
                                className="text-white/40 hover:text-red-400 transition-colors p-1"
                              >
                                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                        {selectedEntities.length === 0 && (
                          <div className="text-[10px] text-white/30 text-center py-4 italic">
                            No group, department, or individual selected.
                          </div>
                        )}
                      </div>

                      {/* Selection Metrics Counters */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[8.5px] text-white/30 font-bold uppercase tracking-wider">
                        <span>Selected Groups: {selectedGroupsCount}</span>
                        <span>Total Participants: {totalParticipantsCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shareable Link Config Checkbox */}
                  <div className="flex items-center gap-2.5 py-1 px-1">
                    <input
                      type="checkbox"
                      id="generateShareLink"
                      checked={generateShareLink}
                      onChange={(e) => setGenerateShareLink(e.target.checked)}
                      className="rounded border-white/10 bg-white/[0.02] text-white focus:ring-0 size-3.5"
                    />
                    <label htmlFor="generateShareLink" className="text-[10px] font-semibold text-white/60 cursor-pointer select-none">
                      Generate Share Link (external guests)
                    </label>
                  </div>

                  {generateShareLink ? (
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-safe-sm space-y-safe-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-semibold text-white/45 uppercase tracking-wider">Generated Share Link</span>
                        <span className="text-[8px] text-emerald-400 font-medium">Guest access active</span>
                      </div>
                      <div className="flex items-center gap-safe-sm">
                        <input
                          type="text"
                          readOnly
                          value={tempShareLink}
                          className="flex-1 text-[9px] font-mono bg-black/40 border border-white/5 rounded px-safe-sm py-0.5 text-white/50 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(tempShareLink);
                            alert("Copied temporary share link!");
                          }}
                          className="rounded bg-white/10 hover:bg-white/20 border border-white/5 px-2 py-0.5 text-[9px] font-bold text-white transition-all shrink-0"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                      <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">
                        Axis Secure Meeting Room Link
                      </span>
                      <span className="block text-[9px] text-white/30 font-mono mt-1">
                        Generated: https://axis.ecosystem.virtual/room-secure
                      </span>
                    </div>
                  )}
                </div>

                {/* Inline Live Calibration Tools */}
                <div className="space-y-4 pt-5 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest block text-white/40">
                      Pre-Meeting Hardware Check
                    </span>
                    {permissionStatus === "granted" ? (
                      <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        System Ready
                      </span>
                    ) : permissionStatus === "denied" ? (
                      <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Simulated Mode
                      </span>
                    ) : (
                      <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                        Pending Permission
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Live Preview & Mic Activity */}
                    <div className="space-y-2">
                      {/* Aspect-video video container with background glow/ring */}
                      <div className={`relative rounded-xl aspect-video overflow-hidden bg-black border ${
                        selectedBg === "axis" ? "border-cyan-500 ring-2 ring-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.25)]" :
                        selectedBg === "school" ? "border-amber-500 ring-2 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.25)]" :
                        "border-white/10"
                      }`}>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                          {cameraActive ? (
                            <VideoPreview
                              stream={localStream}
                              isActive={cameraActive}
                              selectedSpeaker={selectedSpeaker}
                              className={`w-full h-full object-cover scale-x-[-1] transition-all duration-300 ${
                                selectedBg === "blur" ? "blur-md opacity-60 scale-105" : "opacity-80"
                              }`}
                            />
                          ) : (
                            <span className="text-[9px] text-white/30 uppercase tracking-widest font-extrabold">Camera Off</span>
                          )}
                        </div>

                        {/* CSS Background overlays */}
                        {cameraActive && selectedBg === "axis" && (
                          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/40 via-transparent to-transparent pointer-events-none z-10 flex flex-col justify-end p-2">
                            <span className="text-[7px] font-extrabold text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-1.5 py-0.5 rounded self-start flex items-center gap-1 uppercase tracking-widest">
                              <span className="size-1 rounded-full bg-cyan-400 animate-ping" />
                              Axis Digital
                            </span>
                          </div>
                        )}

                        {cameraActive && selectedBg === "school" && (
                          <div className="absolute inset-0 bg-gradient-to-tr from-amber-950/40 via-transparent to-transparent pointer-events-none z-10 flex flex-col justify-end p-2">
                            <span className="text-[7px] font-extrabold text-amber-400 bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded self-start flex items-center gap-1 uppercase tracking-widest">
                              <span className="size-1 rounded-full bg-amber-400 animate-ping" />
                              School Pride
                            </span>
                          </div>
                        )}

                        {/* Self Label */}
                        <span className="absolute top-2 left-2 text-[8px] text-white/40 uppercase tracking-widest z-10 font-bold bg-black/40 px-1.5 py-0.5 rounded">
                          Self Mirror
                        </span>

                        {/* Video Control Buttons Layer */}
                        <div className="absolute bottom-2 right-2 flex gap-1 z-20">
                          <button
                            type="button"
                            title={cameraActive ? "Turn Camera Off" : "Turn Camera On"}
                            aria-label={cameraActive ? "Turn Camera Off" : "Turn Camera On"}
                            onClick={() => setCameraActive(!cameraActive)}
                            className={`size-6 rounded-md flex items-center justify-center border transition-all ${
                              cameraActive ? "bg-black/60 border-white/10 hover:bg-black/80 text-white" : "bg-red-500/20 border-red-500/30 text-red-400"
                            }`}
                          >
                            {cameraActive ? (
                              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                              </svg>
                            ) : (
                              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                              </svg>
                            )}
                          </button>
                          <button
                            type="button"
                            title={micActive ? "Mute Microphone" : "Unmute Microphone"}
                            aria-label={micActive ? "Mute Microphone" : "Unmute Microphone"}
                            onClick={() => setMicActive(!micActive)}
                            className={`size-6 rounded-md flex items-center justify-center border transition-all ${
                              micActive ? "bg-black/60 border-white/10 hover:bg-black/80 text-white" : "bg-red-500/20 border-red-500/30 text-red-400"
                            }`}
                          >
                            {micActive ? (
                              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                              </svg>
                            ) : (
                              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                              </svg>
                            )}
                          </button>
                          <button
                            type="button"
                            title="Cycle Background Effects"
                            aria-label="Cycle Background Effects"
                            onClick={() => {
                              const bgs: ("none" | "blur" | "axis" | "school")[] = ["none", "blur", "axis", "school"];
                              const nextIdx = (bgs.indexOf(selectedBg) + 1) % bgs.length;
                              setSelectedBg(bgs[nextIdx]);
                            }}
                            className={`size-6 rounded-md flex items-center justify-center border transition-all ${
                              selectedBg !== "none" ? "bg-cyan-500 border-transparent text-white" : "bg-black/60 border-white/10 hover:bg-black/80 text-white"
                            }`}
                          >
                            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L14 15l-4.187.904zM18 10.5l-.562-3.438L14 6.5l3.438-.563L18 2.5l.562 3.438L22 6.5l-3.438.562L18 10.5z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Mic Level Indicator */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-wider">
                          <span className="text-white/35">Microphone Level</span>
                          <span className="font-mono text-cyan-400">{micActive ? `${Math.round(micLevel)}%` : "MUTED"}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden relative bg-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-500 transition-all duration-75"
                            style={{ width: micActive ? `${micLevel}%` : "0%" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Device Selectors & Status */}
                    <div className="space-y-2.5 flex flex-col justify-between">
                      {/* Selectors */}
                      <div className="space-y-1.5">
                        <div>
                          <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5 text-white/35">Camera Input</label>
                          <select
                            value={selectedCamera}
                            onChange={(e) => setSelectedCamera(e.target.value)}
                            className="w-full rounded border px-2 py-1 text-[9px] focus:outline-none bg-[#0E0E10] border-white/10 text-white/80"
                          >
                            {cameras.map((c) => (
                              <option key={c.deviceId} value={c.deviceId}>
                                {c.label || `Camera (${c.deviceId.slice(0, 5)}...)`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5 text-white/35">Microphone Input</label>
                          <select
                            value={selectedMicrophone}
                            onChange={(e) => {
                              setSelectedMicrophone(e.target.value);
                            }}
                            className="w-full rounded border px-2 py-1 text-[9px] focus:outline-none bg-[#0E0E10] border-white/10 text-white/80"
                          >
                            {microphones.map((m) => (
                              <option key={m.deviceId} value={m.deviceId}>
                                {m.label || `Microphone (${m.deviceId.slice(0, 5)}...)`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[8px] font-bold uppercase tracking-wider block mb-0.5 text-white/35">Speaker Output</label>
                          <div className="flex gap-1.5">
                            <select
                              value={selectedSpeaker}
                              onChange={(e) => setSelectedSpeaker(e.target.value)}
                              className="flex-1 rounded border px-2 py-1 text-[9px] focus:outline-none bg-[#0E0E10] border-white/10 text-white/80"
                            >
                              {speakers.map((s) => (
                                <option key={s.deviceId} value={s.deviceId}>
                                  {s.label || `Speaker (${s.deviceId.slice(0, 5)}...)`}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={handleTestSpeaker}
                              disabled={isTestingSpeaker}
                              className={`rounded px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                                isTestingSpeaker
                                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                  : "bg-white/10 hover:bg-white/20 border border-white/10 text-white"
                              }`}
                            >
                              {isTestingSpeaker ? (
                                <>
                                  <span className="flex gap-0.5 animate-pulse">
                                    <span className="w-0.5 h-1.5 bg-cyan-400" />
                                    <span className="w-0.5 h-2.5 bg-cyan-400" />
                                    <span className="w-0.5 h-1.5 bg-cyan-400" />
                                  </span>
                                  Test...
                                </>
                              ) : (
                                <>
                                  <svg className="size-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                                  </svg>
                                  Test
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Device Status Summary Card */}
                      <div className="rounded-lg p-2.5 space-y-1.5 border bg-[#0E0E10]/50 border-white/[0.04]">
                        <span className="text-[8px] font-extrabold uppercase tracking-widest block text-white/30">
                          Device Readiness
                        </span>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[8px] font-bold">
                          <div className="flex items-center gap-1">
                            <span className={`size-1.5 rounded-full ${cameraActive && cameras.length > 0 ? "bg-emerald-400" : "bg-red-400"}`} />
                            <span className="text-white/50">Camera: {cameraActive && cameras.length > 0 ? "Active" : "Off"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`size-1.5 rounded-full ${micActive && microphones.length > 0 ? "bg-emerald-400" : "bg-red-400"}`} />
                            <span className="text-white/50">Mic: {micActive && microphones.length > 0 ? "Active" : "Off"}</span>
                          </div>
                          <div className="flex items-center gap-1 col-span-2">
                            <span className={`size-1.5 rounded-full ${speakers.length > 0 ? "bg-emerald-400" : "bg-red-400"}`} />
                            <span className="text-white/50">Speaker: {speakers.length > 0 ? "Connected" : "Not Found"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Background Effects Grid Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-bold uppercase tracking-wider block text-white/35">
                      Background Effects
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: "none", label: "None", icon: "∅" },
                        { id: "blur", label: "Blur", icon: "░" },
                        { id: "axis", label: "Axis", icon: "✦" },
                        { id: "school", label: "School", icon: "🎓" }
                      ].map((bg) => (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => {
                            setSelectedBg(bg.id as "none" | "blur" | "axis" | "school");
                          }}
                          className={`rounded py-1.5 px-1 text-[8.5px] font-extrabold uppercase tracking-wider border transition-all flex flex-col items-center gap-1 ${
                            selectedBg === bg.id
                              ? "bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/10"
                              : "bg-[#0E0E10] border-white/10 text-white/60 hover:bg-white/5"
                          }`}
                        >
                          <span className="text-xs leading-none">{bg.icon}</span>
                          <span>{bg.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Assisted intelligent highlights with dynamic Context warnings */}
                <div className={`rounded-lg ${contextLayerInsight.bgColor} ${contextLayerInsight.borderColor} border p-2.5 text-[9px] ${contextLayerInsight.textColor} leading-normal flex items-start gap-2 transition-all duration-300`}>
                  <span className={`size-1.5 rounded-full ${contextLayerInsight.iconColor} mt-1.5 shrink-0`} />
                  <div>
                    {contextLayerInsight.text}
                  </div>
                </div>

                {/* Buttons block */}
                <div className="flex items-center gap-safe-sm pt-safe-sm border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={handleScheduleFutureMeeting}
                    disabled={isFormInvalid}
                    className={`text-[10px] font-semibold transition-colors px-safe-sm py-safe-sm ${
                      isFormInvalid
                        ? "text-white/20 cursor-not-allowed"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    Schedule Slot
                  </button>
                  <button
                    type="button"
                    onClick={handleLaunchInstantMeeting}
                    disabled={isFormInvalid}
                    className={`flex-1 rounded-xl font-bold text-xs py-3 transition-all text-center ${
                      isFormInvalid
                        ? "bg-white/10 text-white/30 cursor-not-allowed"
                        : "bg-white text-[#0A0A0C] hover:opacity-90 animate-pulse hover:animate-none"
                    }`}
                  >
                    Start Room Call Now
                  </button>
                </div>
              </div>

              {/* Group Members Overlay Modal */}
              <AnimatePresence>
                {viewingMembersEntityId && viewingMembers && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-[#0A0A0C]/80 backdrop-blur-sm flex items-center justify-center p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.95, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.95, y: 10 }}
                      className="bg-[#0E0E10] border border-white/10 rounded-2xl w-full max-w-xs p-safe-lg shadow-2xl space-y-safe-md"
                    >
                      <div className="flex items-center justify-between pb-safe-sm border-b border-white/[0.06]">
                        <div className="flex flex-col">
                          <h3 className="text-xs font-semibold text-white/90">
                            {viewingMembers.entity?.name} Members
                          </h3>
                          <span className="text-[9px] text-white/40 mt-0.5">
                            {viewingMembers.entity?.participantsCount} participants in scope
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setViewingMembersEntityId(null)}
                          className="text-white/40 hover:text-white transition-colors p-1"
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                        {viewingMembers.members.map((m, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                          >
                            <div className="flex flex-col">
                              <span className="text-[11px] font-medium text-white/90">{m.name}</span>
                              <span className="text-[9px] text-white/35">{m.role} · {m.section}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={`size-1.5 rounded-full ${
                                m.status === "Active" || m.status === "Available"
                                  ? "bg-green-400"
                                  : m.status === "In Meeting" || m.status === "Teaching"
                                  ? "bg-cyan-400 animate-pulse"
                                  : "bg-white/20"
                              }`} />
                              <span className="text-[8px] text-white/45">{m.status}</span>
                            </div>
                          </div>
                        ))}
                        {viewingMembers.members.length === 0 && (
                          <div className="text-[10px] text-white/30 text-center py-4 italic">
                            No membership records registered.
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-white/[0.06] flex justify-end">
                        <button
                          type="button"
                          onClick={() => setViewingMembersEntityId(null)}
                          className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/5 px-3 py-1.5 text-[10px] font-bold text-white transition-all"
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: IN-MEETING ENVIRONMENT */}
        {currentView === "meeting" && selectedMeeting && (
          <motion.div
            key="meeting"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`fixed inset-0 z-50 flex flex-col justify-between ${theme === "light" ? "bg-[#F3F4F6] text-black" : theme === "high-contrast" ? "bg-black text-white border-2 border-white" : theme === "axis" ? "bg-[#050607] text-white" : "bg-[#0A0A0C] text-white"}`}
          >
            {/* Meeting Header */}
            <div className={`h-16 border-b px-6 flex items-center justify-between ${theme === "light" ? "bg-white border-black/[0.08] text-black" : "bg-[#0E0E10] border-white/[0.08] text-white"}`}>
              <div className="flex items-center gap-3">
                {isRecording ? (
                  <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full">
                    <span className="size-2 rounded-full bg-red-500 animate-ping" />
                    <span className="size-2 rounded-full bg-red-500 absolute" />
                    <span className="text-[9px] font-bold text-red-400 tracking-wider uppercase ml-1.5">REC</span>
                  </div>
                ) : (
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
                <div className="flex flex-col">
                  <h2 className="text-xs font-semibold text-white">{selectedMeeting.title}</h2>
                  <span className="text-[9px] text-white/40 mt-0.5">{selectedMeeting.purpose}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-white/50 font-bold bg-white/5 px-2.5 py-1 rounded">
                  {meetingDuration}
                </span>
                <button
                  onClick={() => setCurrentView("overview")}
                  className="rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-transparent px-3 py-1.5 text-[10px] font-bold text-red-400 transition-all"
                >
                  Leave Room
                </button>
              </div>
            </div>

            {/* In-Call Workspace main container */}
            <div className="flex-1 flex overflow-hidden relative">
              
              {/* Call participant videos grid */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center">
                <div className="max-w-5xl mx-auto w-full space-y-6">
                  
                  {/* Video Panels Layout */}
                  <div className={`grid gap-6 w-full ${isScreenSharing ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>
                    
                    {/* If screen sharing is enabled, render the Screen Share Tile first */}
                    {isScreenSharing && (
                      <div className="lg:col-span-2 aspect-[16/10] rounded-2xl border border-cyan-500/30 bg-cyan-950/10 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col justify-between p-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#0C0D10]/95 flex flex-col justify-center items-center p-6 border border-cyan-500/20 rounded-2xl">
                          {/* Grid background effect */}
                          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                          
                          {/* Simulated Chart/Analytics */}
                          <div className="w-full max-w-md bg-black/40 border border-white/5 rounded-xl p-4 space-y-3 z-10">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Physics Curriculum Planner</span>
                              <span className="text-[9px] text-white/40 font-mono">Presenting Screen</span>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[9px] text-white/60">
                                <span>Topic 4: Waves (IB DP Syllabus)</span>
                                <span className="text-emerald-400 font-bold">82% completed</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-400 rounded-full w-[82%]" />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 pt-1">
                              <div className="bg-white/5 border border-white/5 rounded p-2 text-center">
                                <span className="text-[8px] text-white/30 block">Period 5</span>
                                <span className="text-xs font-bold text-white mt-1 block">Lab 3</span>
                              </div>
                              <div className="bg-white/5 border border-white/5 rounded p-2 text-center">
                                <span className="text-[8px] text-white/30 block">Class Size</span>
                                <span className="text-xs font-bold text-white mt-1 block">46 Studs</span>
                              </div>
                              <div className="bg-white/5 border border-white/5 rounded p-2 text-center">
                                <span className="text-[8px] text-white/30 block">Overlap</span>
                                <span className="text-xs font-bold text-emerald-400 mt-1 block">Resolved</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-start z-10 w-full">
                          <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            Aarav Chen is presenting
                          </span>
                          <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-400 uppercase tracking-wider font-semibold">Screen</span>
                        </div>
                      </div>
                    )}

                    {/* Webcams Container */}
                    <div className={`space-y-4 ${isScreenSharing ? "lg:col-span-1 flex flex-col justify-between gap-4 h-full" : "col-span-2 grid grid-cols-2 gap-6"}`}>
                      
                      {/* Grid Box 1: Self */}
                      <div className={`rounded-2xl border flex flex-col justify-between p-4 relative overflow-hidden bg-[#0E0E10] border-white/[0.08] text-white ${isScreenSharing ? "flex-1 min-h-[120px] aspect-video" : "aspect-video"} ${
                        selectedBg === "axis" ? "border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.25)]" :
                        selectedBg === "school" ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]" : ""
                      }`}>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                          {!isVideoMuted ? (
                            <VideoPreview
                              stream={localStream}
                              isActive={!isVideoMuted}
                              selectedSpeaker={selectedSpeaker}
                              className={`w-full h-full object-cover scale-x-[-1] transition-all duration-300 ${
                                selectedBg === "blur" ? "blur-md opacity-60 scale-105" : "opacity-80"
                              }`}
                            />
                          ) : (
                            <div className="text-white/20 text-[10px] font-semibold uppercase tracking-wider">Video Disabled</div>
                          )}
                        </div>

                        {/* CSS Background overlays inside meeting */}
                        {!isVideoMuted && selectedBg === "axis" && (
                          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/40 via-transparent to-transparent pointer-events-none z-10 flex flex-col justify-end p-2">
                            <span className="text-[7px] font-extrabold text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-1.5 py-0.5 rounded self-start flex items-center gap-1 uppercase tracking-widest leading-none">
                              <span className="size-1 rounded-full bg-cyan-400 animate-ping" />
                              Axis Digital
                            </span>
                          </div>
                        )}

                        {!isVideoMuted && selectedBg === "school" && (
                          <div className="absolute inset-0 bg-gradient-to-tr from-amber-950/40 via-transparent to-transparent pointer-events-none z-10 flex flex-col justify-end p-2">
                            <span className="text-[7px] font-extrabold text-amber-400 bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded self-start flex items-center gap-1 uppercase tracking-widest leading-none">
                              <span className="size-1 rounded-full bg-amber-400 animate-ping" />
                              School Pride
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-start z-10">
                          <span className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Aarav Chen</span>
                          {isHandRaised && (
                            <span className="text-[8px] bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1 shadow-[0_4px_12px_rgba(245,158,11,0.15)]">
                              ✋ Hand Raised
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center z-10">
                          <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">Self</span>
                          {isAudioMuted && (
                            <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded">Muted</span>
                          )}
                        </div>
                      </div>

                      {/* Grid Box 2: Marcus Vance */}
                      <div className={`rounded-2xl border flex flex-col justify-between p-4 relative overflow-hidden ${theme === "light" ? "bg-white border-black/[0.08] text-zinc-900" : "bg-[#0E0E10] border-white/[0.08] text-white"} ${isScreenSharing ? "flex-1 min-h-[120px] aspect-video" : "aspect-video"}`}>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          {mutedAll ? (
                            <div className="text-white/20 text-[10px] font-semibold uppercase tracking-wider">Muted by host</div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <motion.span animate={{ height: [12, 32, 12] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-white/20 rounded-full" />
                              <motion.span animate={{ height: [18, 48, 18] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-white/45 rounded-full" />
                              <motion.span animate={{ height: [24, 12, 24] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-white/30 rounded-full" />
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-start z-10">
                          <span className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Marcus Vance</span>
                          {mutedAll ? (
                            <span className="text-[8px] bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded text-red-400 font-bold uppercase tracking-wider">Muted</span>
                          ) : (
                            <span className="text-[8px] text-[#0A0A0C] bg-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">Speaking</span>
                          )}
                        </div>

                        <div className="flex justify-between items-center z-10">
                          <span className="text-[8px] text-white/50">Science Head</span>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Captions Block */}
                  {captionsEnabled && activeCaption && (
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/75 px-5 py-3 text-center text-xs text-white max-w-2xl mx-auto shadow-lg backdrop-blur-md">
                      <p className="leading-relaxed">
                        {(() => {
                          const colonIdx = activeCaption.indexOf("]:");
                          if (colonIdx !== -1) {
                            const speaker = activeCaption.slice(1, colonIdx);
                            const text = activeCaption.slice(colonIdx + 2);
                            return (
                              <>
                                <span className="text-cyan-400 font-bold tracking-tight">[{speaker}]:</span>
                                <span className="text-white font-medium ml-1.5">{text}</span>
                              </>
                            );
                          }
                          return activeCaption;
                        })()}
                      </p>
                    </div>
                  )}

                  {/* Agenda resolution card inside meeting */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-md flex flex-col md:flex-row md:items-center justify-between gap-safe-md">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-white/35 uppercase tracking-widest">Active Meeting Resolution Item</span>
                      <h4 className="text-xs font-semibold text-white/95">Authorize Period 5 Timetable Swap</h4>
                      <p className="text-[10px] text-white/40 leading-snug">
                        Confirming virtual slot assignment: Science Dept curriculum reviews move to Period 6 virtual room; Aarav Chen moves to Period 5.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const newDecisionText = "Authorized Period 5 timetable swap: Science Department virtual alignment moved to Period 6 room; Aarav Chen class moved to Period 5.";
                        const newDecision: DecisionItem = {
                          id: `dec-${Date.now()}`,
                          text: newDecisionText,
                          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        };
                        setDecisions((prev) => [...prev, newDecision]);
                        alert("Timetable swap authorized.");
                      }}
                      className="rounded bg-white px-3.5 py-1.5 text-[10px] font-bold text-black hover:opacity-90 transition-all shrink-0"
                    >
                      Authorize Swap
                    </button>
                  </div>

                </div>
              </div>

              {/* Unified Slide-over/Squeeze Right Sidebar */}
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 320, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={`border-l flex flex-col justify-between overflow-hidden shrink-0 ${theme === "light" ? "border-black/[0.08] bg-white text-zinc-900" : "border-white/[0.08] bg-[#0E0E10] text-white"}`}
                  >
                    <div className="w-[320px] h-full flex flex-col justify-between">
                      
                      {/* Sidebar Header Tabs */}
                      <div className="flex border-b border-white/[0.06] bg-black/20 p-safe-sm">
                        <button
                          onClick={() => setActiveSidebarTab("chat")}
                          className={`flex-1 py-safe-sm text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                            activeSidebarTab === "chat"
                              ? "bg-white/10 text-cyan-400 font-bold"
                              : "text-white/40 hover:text-white/80 hover:bg-white/[0.02]"
                          }`}
                        >
                          Chat
                        </button>
                        <button
                          onClick={() => setActiveSidebarTab("participants")}
                          className={`flex-1 py-safe-sm text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                            activeSidebarTab === "participants"
                              ? "bg-white/10 text-cyan-400 font-bold"
                              : "text-white/40 hover:text-white/80 hover:bg-white/[0.02]"
                          }`}
                        >
                          Participants ({selectedMeeting.participants.length})
                        </button>
                        <button
                          onClick={() => setActiveSidebarTab("ledger")}
                          className={`flex-1 py-safe-sm text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                            activeSidebarTab === "ledger"
                              ? "bg-white/10 text-cyan-400 font-bold"
                              : "text-white/40 hover:text-white/80 hover:bg-white/[0.02]"
                          }`}
                        >
                          Ledger
                        </button>
                      </div>

                      {/* Sidebar Body */}
                      <div className="flex-1 overflow-y-auto p-safe-md scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                        
                        {/* TAB 1: CHAT */}
                        {activeSidebarTab === "chat" && (
                          <div className="h-full flex flex-col justify-between gap-safe-sm">
                            <div className="flex-1 overflow-y-auto space-y-safe-sm pr-1 scroll-smooth max-h-[calc(100vh-280px)]">
                              {meetingMessages.map((msg) => (
                                <div
                                  key={msg.id}
                                  className={`flex flex-col gap-1 rounded-xl p-safe-sm text-left border transition-all duration-200 hover:border-white/10 ${
                                    msg.sender === "teacher"
                                      ? "bg-cyan-500/[0.03] border-cyan-500/10"
                                      : "bg-white/[0.01] border-white/[0.04]"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-white/90 truncate">
                                      {msg.senderName}
                                    </span>
                                    <span className="text-[8px] text-white/30 shrink-0">
                                      {msg.time}
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-white/40 font-medium leading-none">
                                    {msg.role}
                                  </span>
                                  <p className="text-xs text-white/70 leading-normal mt-1.5 whitespace-pre-wrap">
                                    {msg.sender === "teacher" ? msg.text : (() => {
                                      const detected = detectContextInText(msg.text);
                                      return detected.length > 0 ? (
                                        <MessageTextWithTeacherContext
                                          text={msg.text}
                                          contexts={detected}
                                          onAction={handleContextAction}
                                        />
                                      ) : msg.text;
                                    })()}
                                  </p>
                                </div>
                              ))}
                              <div ref={chatBottomRef} />
                            </div>
                            {/* Chat input */}
                            <div className="flex gap-safe-sm pt-safe-sm border-t border-white/[0.06]">
                              <input
                                type="text"
                                placeholder="Type a message..."
                                value={meetingChatInput}
                                onChange={(e) => setMeetingChatInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSendMeetingMessage();
                                }}
                                className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2 text-xs text-white placeholder-white/20 focus:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
                              />
                              <button
                                onClick={handleSendMeetingMessage}
                                className="rounded-xl bg-white hover:bg-white/95 px-safe-sm py-safe-sm text-xs font-bold text-black transition-colors"
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        )}

                        {/* TAB 2: PARTICIPANTS */}
                        {activeSidebarTab === "participants" && (
                          <div className="space-y-safe-sm text-left">
                            <span className="text-[9px] font-bold text-white/35 uppercase tracking-widest block">
                              Active in Room ({selectedMeeting.participants.length})
                            </span>
                            <div className="space-y-safe-sm">
                              {selectedMeeting.participants.map((name, idx) => {
                                const details = getParticipantDetails(name);
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-safe-sm rounded-xl bg-white/[0.01] border border-white/[0.04] transition-all hover:bg-white/[0.02] hover:border-white/10"
                                  >
                                    <div className="flex items-center gap-safe-sm min-w-0">
                                      <div className="size-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/80 shrink-0 relative">
                                        {details.avatar}
                                        {/* Status dot */}
                                        <span className={`absolute bottom-0 right-0 size-2 rounded-full border border-[#0E0E10] ${
                                          details.status === "Speaking" ? "bg-green-400" : "bg-cyan-500"
                                        }`} />
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold text-white/90 truncate">
                                          {name}
                                        </span>
                                        <span className="text-[9px] text-white/35 truncate mt-0.5">
                                          {details.role}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-safe-sm shrink-0">
                                      {details.isMuted ? (
                                        <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-safe-sm py-0.5 rounded uppercase font-bold">
                                          Muted
                                        </span>
                                      ) : (
                                        <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 px-safe-sm py-0.5 rounded uppercase font-bold animate-pulse">
                                          Active
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* TAB 3: LEDGER (Decisions) */}
                        {activeSidebarTab === "ledger" && (
                          <div className="h-full flex flex-col justify-between text-left">
                            <div className="space-y-safe-md">
                              <span className="text-[9px] font-bold text-white/35 uppercase tracking-widest block">Decisions Ledger</span>
                              
                              <div className="space-y-safe-sm max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                                {decisions.map((dec) => (
                                  <div key={dec.id} className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-safe-sm">
                                    <p className="text-[10px] leading-relaxed text-white/80">{dec.text}</p>
                                    <span className="text-[8px] text-white/30 block mt-1">{dec.time}</span>
                                  </div>
                                ))}
                                {decisions.length === 0 && (
                                  <span className="text-[10px] text-white/20 italic block text-center py-4 border border-dashed border-white/5 rounded-lg">
                                    No decisions logged yet.
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="space-y-safe-sm pt-safe-sm border-t border-white/[0.06] mt-safe-md">
                              <div className="flex gap-safe-sm">
                                <input
                                  type="text"
                                  placeholder="Log a decision..."
                                  value={decisionInput}
                                  onChange={(e) => setDecisionInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleAddDecision();
                                  }}
                                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-safe-sm py-safe-sm text-[10px] text-white placeholder-white/20 focus:outline-none"
                                />
                                <button
                                  onClick={handleAddDecision}
                                  className="rounded-xl bg-white/10 hover:bg-white/20 px-safe-sm py-safe-sm text-[10px] text-white font-bold"
                                >
                                  Log
                                </button>
                              </div>

                              <button
                                onClick={handleGenerateRecap}
                                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-[10px] font-semibold text-white/90 py-safe-sm transition-all text-center"
                              >
                                Generate Meeting Summary
                              </button>

                              <AnimatePresence>
                                {generatedRecap && (
                                  <motion.pre
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="rounded-lg border border-white/[0.06] bg-white/[0.01] p-safe-sm text-[9px] text-white/60 font-mono overflow-x-auto leading-normal whitespace-pre-wrap mt-2 max-h-48"
                                  >
                                    {generatedRecap}
                                  </motion.pre>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Sidebar Footer */}
                      <div className="p-safe-md border-t border-white/[0.06] text-center bg-black/10">
                        <span className="text-[9px] text-white/25 leading-none">Axis School Meetings</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* In-Call controls footer */}
            <div className={`h-20 border-t px-safe-lg flex items-center justify-center gap-safe-md ${theme === "light" ? "border-black/[0.08] bg-white text-zinc-900" : "border-white/[0.08] bg-[#0E0E10] text-white"}`}>
              
              {/* Mic Toggle */}
              <button
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className={`size-11 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-105 outline-none focus:ring-1 focus:ring-red-500/30 ${
                  isAudioMuted 
                    ? "bg-red-500/10 border-red-500/20 text-red-400" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
                title={isAudioMuted ? "Unmute Mic" : "Mute Mic"}
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {isAudioMuted ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  )}
                </svg>
              </button>

              {/* Video Toggle */}
              <button
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                className={`size-11 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-105 outline-none focus:ring-1 focus:ring-red-500/30 ${
                  isVideoMuted 
                    ? "bg-red-500/10 border-red-500/20 text-red-400" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
                title={isVideoMuted ? "Enable Camera" : "Disable Camera"}
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {isVideoMuted ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9a2.25 2.25 0 012.25-2.25H12A2.25 2.25 0 0114.25 9v7.5A2.25 2.25 0 0112 18.75z" />
                  )}
                </svg>
              </button>

              {/* CC (Captions) Toggle */}
              <button
                onClick={() => setCaptionsEnabled(!captionsEnabled)}
                className={`size-11 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-105 outline-none focus:ring-1 focus:ring-cyan-500/30 ${
                  captionsEnabled 
                    ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-400 font-bold" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
                title={captionsEnabled ? "Disable Subtitles" : "Enable Subtitles"}
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18v14H3V5zm5 5h2a1 1 0 011 1v2a1 1 0 01-1 1H8v-4zm7 0h2a1 1 0 011 1v2a1 1 0 01-1 1h-2v-4z" />
                </svg>
              </button>

              {/* Screen Share Toggle */}
              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`size-11 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-105 outline-none focus:ring-1 focus:ring-cyan-500/30 ${
                  isScreenSharing 
                    ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-400" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
                title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25V13m-18 0a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 13m-18 0V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5V13" />
                </svg>
              </button>

              {/* Hand Raise Toggle */}
              <motion.button
                onClick={() => setIsHandRaised(!isHandRaised)}
                animate={isHandRaised ? {
                  y: -4,
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(245, 158, 11, 0.15)"
                } : {
                  y: 0,
                  scale: 1,
                  boxShadow: "none"
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                className={`size-11 rounded-full border flex items-center justify-center transition-colors relative outline-none focus:ring-1 focus:ring-amber-500/50 ${
                  isHandRaised 
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-400" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
                title={isHandRaised ? "Lower Hand" : "Raise Hand"}
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0V14m-3-2.5H10m0 0V5a1.5 1.5 0 113 0v9m-3-2.5h3m0 0V7.5a1.5 1.5 0 113 0V14m-3-2.5h3m0 0V10a1.5 1.5 0 113 0v4a7 7 0 01-12 0v-2.5" />
                </svg>
                
                {isHandRaised && (
                  <motion.span
                    className="absolute inset-0 rounded-full border border-amber-400/30"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  />
                )}
              </motion.button>

              {/* Record Toggle */}
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`size-11 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-105 outline-none focus:ring-1 focus:ring-red-500/30 ${
                  isRecording 
                    ? "bg-red-500/15 border-red-500/30 text-red-500" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
                title={isRecording ? "Stop Recording" : "Start Recording"}
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="5" fill="currentColor" className={isRecording ? "animate-pulse text-red-500" : "text-white/40"} />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </button>

              <span className="h-6 w-px bg-white/10 mx-1" />

              {/* Participants Panel Toggle */}
              <button
                onClick={() => handleToggleSidebar("participants")}
                className={`size-11 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-105 outline-none focus:ring-1 focus:ring-cyan-500/30 ${
                  isSidebarOpen && activeSidebarTab === "participants"
                    ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-400"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
                title="Toggle Participants Panel"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </button>

              {/* Chat Panel Toggle */}
              <button
                onClick={() => handleToggleSidebar("chat")}
                className={`size-11 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-105 outline-none focus:ring-1 focus:ring-cyan-500/30 ${
                  isSidebarOpen && activeSidebarTab === "chat"
                    ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-400"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
                title="Toggle Chat Panel"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025 4.486 4.486 0 00-.319-2.039C3.783 15.368 3 13.783 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </button>

              {/* Decisions Ledger Panel Toggle */}
              <button
                onClick={() => handleToggleSidebar("ledger")}
                className={`size-11 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-105 outline-none focus:ring-1 focus:ring-cyan-500/30 ${
                  isSidebarOpen && activeSidebarTab === "ledger"
                    ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-400"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
                title="Toggle Decisions Ledger"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </button>

              <span className="h-6 w-px bg-white/10 mx-1" />

              {/* Mute All Toggle (Host control) */}
              <button
                onClick={() => setMutedAll(!mutedAll)}
                className={`size-11 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-105 outline-none focus:ring-1 focus:ring-red-500/30 ${
                  mutedAll 
                    ? "bg-red-500/10 border-red-500/20 text-red-400" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
                title={mutedAll ? "Unmute All Participants" : "Mute All Participants"}
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" className={mutedAll ? "block" : "hidden"} />
                </svg>
              </button>

              {/* Leave Call */}
              <button
                onClick={() => {
                  if (onLeaveMeeting) {
                    onLeaveMeeting();
                  } else {
                    setCurrentView("overview");
                  }
                }}
                className="h-11 rounded-full bg-red-600/90 border border-red-500/20 hover:bg-red-500 text-white font-bold text-xs px-6 transition-all duration-200 hover:scale-105 outline-none ml-4"
              >
                End Call
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TeacherContextActionModal
        context={selectedContext}
        isOpen={isContextModalOpen}
        onClose={() => {
          setIsContextModalOpen(false);
          setSelectedContext(null);
        }}
        onConfirm={handleContextConfirm}
      />

      <AnimatePresence>
        {contextToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-4 py-3 rounded-xl border border-cyan-500/30 bg-[#0E0E10]/95 backdrop-blur-md shadow-2xl flex items-center gap-2.5 text-xs text-cyan-400 font-semibold"
          >
            {contextToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

