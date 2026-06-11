"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MapSector =
  | "academic"
  | "science"
  | "admin"
  | "library"
  | "sports"
  | "auditorium"
  | "infirmary"
  | "cafeteria"
  | "arts"
  | "tech"
  | "shared";

type CampusArea = {
  id: MapSector;
  name: string;
  type: string;
  building: string;
  currentActivity: string;
  scheduledActivity: string;
  responsibleStaff: string;
  staffRole: string;
  maintenanceStatus: "normal" | "scheduled-clean" | "attention-required" | "out-of-service";
  occupancy: number;
  capacity: number;
  upcomingEvents: string[];
  gridPos: string; // CSS Grid Position for the directory visualization
  resources: string[];
};

export function SchoolMap() {
  const [selectedArea, setSelectedArea] = useState<CampusArea | null>(null);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [activeSMS, setActiveSMS] = useState<string | null>(null);
  const [smsText, setSmsText] = useState("");

  const campusAreas: CampusArea[] = [
    {
      id: "academic",
      name: "Academic Block",
      type: "Core Classrooms & Lecture Halls",
      building: "Building A",
      currentActivity: "DP1 and DP2 Humanities seminars",
      scheduledActivity: "Period 5: DP Literature seminars",
      responsibleStaff: "Marcus Vance",
      staffRole: "Grade Lead Coordinator",
      maintenanceStatus: "normal",
      occupancy: 184,
      capacity: 300,
      upcomingEvents: ["15:00 - English IA Review", "16:00 - Faculty Roster alignment"],
      gridPos: "col-span-2 row-span-2 bg-cyan-950/20 border-cyan-800/30",
      resources: ["Smart screens", "Whiteboards", "Lecture podiums"]
    },
    {
      id: "science",
      name: "Science Block",
      type: "Laboratory Wing",
      building: "Building B",
      currentActivity: "Chemistry Titrations IA Experiments",
      scheduledActivity: "Period 5: AP Biology Lab block",
      responsibleStaff: "Ananya Rao",
      staffRole: "Science Department Lead",
      maintenanceStatus: "normal",
      occupancy: 68,
      capacity: 120,
      upcomingEvents: ["14:30 - Physics Lab calibrations"],
      gridPos: "col-span-1 row-span-2 bg-indigo-950/20 border-indigo-800/30",
      resources: ["Fume hoods", "Titration setups", "Spectrometers", "Calibration tools"]
    },
    {
      id: "admin",
      name: "Administration Block",
      type: "Executive Suites & Boardrooms",
      building: "Central Wing",
      currentActivity: "IB DP coordinator alignment briefing",
      scheduledActivity: "Period 5: Parent and guardian session",
      responsibleStaff: "Ms. Sarah Thompson",
      staffRole: "DP Coordinator",
      maintenanceStatus: "normal",
      occupancy: 14,
      capacity: 30,
      upcomingEvents: ["16:00 - Budget review", "17:00 - Board banquet"],
      gridPos: "col-span-1 row-span-1 bg-purple-950/20 border-purple-800/30",
      resources: ["Secure servers", "Boardroom TV", "Document archives"]
    },
    {
      id: "library",
      name: "Library & Study Hall",
      type: "Media Center",
      building: "Central Wing",
      currentActivity: "DP Extended Essay private study block",
      scheduledActivity: "Period 5: Year 10 Research session",
      responsibleStaff: "Linda Carter",
      staffRole: "Head Librarian",
      maintenanceStatus: "normal",
      occupancy: 48,
      capacity: 150,
      upcomingEvents: ["15:30 - TOK Exhibition setup"],
      gridPos: "col-span-1 row-span-1 bg-emerald-950/20 border-emerald-800/30",
      resources: ["3D printers", "Private study desks", "Reference archives", "Exhibition screens"]
    },
    {
      id: "sports",
      name: "Sports Complex",
      type: "Athletics Center & Olympic Pool",
      building: "Athletics Wing",
      currentActivity: "Grade 9 PE Basketball session",
      scheduledActivity: "Period 5: Swim team time-trials",
      responsibleStaff: "Coach Miller",
      staffRole: "Athletics Coordinator",
      maintenanceStatus: "normal",
      occupancy: 38,
      capacity: 200,
      upcomingEvents: ["17:00 - Varsity Basketball Game"],
      gridPos: "col-span-2 row-span-1 bg-cyan-950/20 border-cyan-800/30",
      resources: ["Scoreboards", "Timing logs", "First aid gear", "Equipment lockers"]
    },
    {
      id: "auditorium",
      name: "Main Auditorium",
      type: "Performing Arts Hall",
      building: "Arts Wing",
      currentActivity: "Drama Club Performance Preparation",
      scheduledActivity: "Period 5: Guest Speaker Setup",
      responsibleStaff: "Robert Blake",
      staffRole: "Theater Director",
      maintenanceStatus: "normal",
      occupancy: 24,
      capacity: 600,
      upcomingEvents: ["15:00 - DP Music Concert"],
      gridPos: "col-span-1 row-span-1 bg-blue-950/20 border-blue-800/30",
      resources: ["Stage lighting", "Sound deck", "Projection screen", "Wireless mics"]
    },
    {
      id: "infirmary",
      name: "School Infirmary",
      type: "Medical Clinic",
      building: "Central Wing",
      currentActivity: "Patient resting & temperature audits",
      scheduledActivity: "Continuous clinic coverage",
      responsibleStaff: "Linda Carter",
      staffRole: "Head Nurse",
      maintenanceStatus: "normal",
      occupancy: 2,
      capacity: 6,
      upcomingEvents: ["All-day clinic support"],
      gridPos: "col-span-1 row-span-1 bg-rose-950/20 border-rose-800/30",
      resources: ["Recovery beds", "Diagnostic screens", "Medical supplies", "Patient monitors"]
    },
    {
      id: "cafeteria",
      name: "Central Cafeteria",
      type: "Dining Hall",
      building: "Central Wing",
      currentActivity: "Meal Transition & Cleanup",
      scheduledActivity: "Whole-School Lunch service",
      responsibleStaff: "Chef Ronald",
      staffRole: "Culinary Director",
      maintenanceStatus: "normal",
      occupancy: 12,
      capacity: 400,
      upcomingEvents: ["18:00 - Board Members Dinner"],
      gridPos: "col-span-1 row-span-1 bg-amber-950/20 border-amber-800/30",
      resources: ["Kitchen equipment", "Audit screens", "Recycling bins"]
    },
    {
      id: "arts",
      name: "Arts Center",
      type: "Visual Arts & Clay Studios",
      building: "Arts Wing",
      currentActivity: "Grade 10 Clay Pottery Wheel Lab",
      scheduledActivity: "Period 5: DP Painting studio hours",
      responsibleStaff: "Clara Dupont",
      staffRole: "Visual Arts Coordinator",
      maintenanceStatus: "normal",
      occupancy: 18,
      capacity: 40,
      upcomingEvents: ["15:30 - Summer Art Exhibition"],
      gridPos: "col-span-1 row-span-1 bg-teal-950/20 border-teal-800/30",
      resources: ["Pottery wheels", "Clay ovens", "Easel setups", "Display cabinets"]
    },
    {
      id: "tech",
      name: "Technology Labs",
      type: "CS Lab & Robotics Hub",
      building: "Tech Wing",
      currentActivity: "G11 CAD Modeling & 3D Printing",
      scheduledActivity: "Period 5: Coding Sandbox session",
      responsibleStaff: "Linus Odegard",
      staffRole: "Computer Science Advisor",
      maintenanceStatus: "attention-required",
      occupancy: 32,
      capacity: 45,
      upcomingEvents: ["16:00 - Robotics Club alignment"],
      gridPos: "col-span-1 row-span-1 bg-cyan-950/20 border-cyan-800/30",
      resources: ["CAD workstations", "3D printers", "Robotics kits", "VR stations"]
    },
    {
      id: "shared",
      name: "Shared Spaces",
      type: "Study Lounges & Atrium",
      building: "Central Wing",
      currentActivity: "Collaborative Project Preparation",
      scheduledActivity: "Open study hours",
      responsibleStaff: "Emma Watson",
      staffRole: "Pastoral Counselor",
      maintenanceStatus: "normal",
      occupancy: 42,
      capacity: 100,
      upcomingEvents: ["Continuous open student access"],
      gridPos: "col-span-2 row-span-1 bg-zinc-900/60 border-zinc-800",
      resources: ["Collab desks", "Digital kiosk boards", "Charging hubs"]
    }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full items-start">
      
      {/* LEFT: Premium 2D Campus Directory Layout (8 cols) */}
      <div className="xl:col-span-8 space-y-4">
        
        {/* Directory Map Box */}
        <div className="border border-white/[0.08] bg-[#0E0E10]/85 p-6 rounded-3xl min-h-[500px] flex flex-col justify-between backdrop-blur-xl shadow-xl">
          <div className="flex justify-between items-start border-b border-white/[0.06] pb-3 mb-6">
            <div>
              <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block">Interactive IB Directory</span>
              <h3 className="text-sm font-bold text-white mt-0.5">Axis 2D IB Space Layout</h3>
              <p className="text-[10px] text-white/35 font-medium mt-0.5">Click any sector to view supervisor details, DP sessions, and active counts.</p>
            </div>
            <span className="text-[9px] bg-cyan-950/40 text-cyan-400 px-2 py-0.5 rounded font-mono border border-cyan-800/20">
              Live Coordinate Sync Active
            </span>
          </div>

          {/* Grid Layout representing physical airport/mall directory map */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 items-stretch">
            {campusAreas.map((area) => (
              <button
                key={area.id}
                onClick={() => setSelectedArea(area)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between min-h-[110px] cursor-pointer transition-all hover:bg-cyan-500/5 hover:border-cyan-500/40 ${area.gridPos} ${
                  selectedArea?.id === area.id ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.15)]" : ""
                }`}
              >
                <div className="w-full flex justify-between items-start">
                  <span className="text-[8px] font-mono opacity-50 uppercase tracking-widest">{area.building}</span>
                  <span className={`size-1.5 rounded-full ${
                    area.maintenanceStatus === "normal" ? "bg-emerald-400" : "bg-rose-500 animate-pulse"
                  }`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight text-white/90">{area.name}</h4>
                  <span className="text-[9px] opacity-45 mt-0.5 block truncate">{area.currentActivity}</span>
                </div>
                <div className="w-full flex items-center justify-between border-t border-white/5 pt-1.5 mt-1.5 text-[9px]">
                  <span className="opacity-35 font-mono">CAP: {area.capacity}</span>
                  <span className="opacity-75 font-bold font-mono">{area.occupancy} in area</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-white/[0.04] pt-3 flex justify-between items-center text-[10px] text-white/35 font-medium">
            <span>Click areas to view detailed timetables and contact supervisors.</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-400" /> Normal</span>
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-rose-400" /> Flagged</span>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT: Detail Overlays & Staff Contacts (4 cols) */}
      <div className="xl:col-span-4">
        <AnimatePresence mode="wait">
          {selectedArea ? (
            <motion.div
              key={selectedArea.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="border border-white/[0.08] bg-[#0E0E10]/85 p-6 rounded-3xl space-y-5 backdrop-blur-xl shadow-lg"
            >
              <div>
                <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block">{selectedArea.building}  {selectedArea.type}</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{selectedArea.name}</h3>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[9px] text-white/35 uppercase tracking-wider block">Live Roster Activity</span>
                  <p className="text-white/80 font-bold leading-relaxed">{selectedArea.currentActivity}</p>
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[9px] text-white/35 uppercase tracking-wider block">Scheduled Routine</span>
                  <p className="text-white/60 font-medium">{selectedArea.scheduledActivity}</p>
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[9px] text-white/35 uppercase tracking-wider block">Room Resources</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedArea.resources?.map((res, index) => (
                      <span key={index} className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70">
                        {res}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-white/45 uppercase tracking-wider">Occupancy density</span>
                    <span className="text-white/85 font-mono font-bold">
                      {selectedArea.occupancy} / {selectedArea.capacity} ({Math.round((selectedArea.occupancy / selectedArea.capacity) * 100)}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 transition-all duration-300"
                      style={{ width: `${(selectedArea.occupancy / selectedArea.capacity) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Sports Complex Facility breakdowns */}
                {selectedArea.id === "sports" && (
                  <div className="space-y-2 border-t border-white/[0.04] pt-3">
                    <span className="text-[9px] text-white/35 uppercase tracking-wider block font-bold">Facility Breakdowns</span>
                    <div className="space-y-1.5">
                      {[
                        { name: "Football Field", status: "Occupied", desc: "Period 1: DP1 Sports Science (Coach Miller)", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
                        { name: "Gymnasium", status: "Occupied", desc: "Period 1: DP2 PE (Coach Phelps)", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
                        { name: "Badminton Court", status: "Available", desc: "Vacant - Open Booking", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                        { name: "Swimming Pool", status: "Occupied", desc: "Period 4: DP Swim Trials (Coach Phelps)", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
                        { name: "Basketball Court", status: "Reserved", desc: "Period 2: PYP Grade 5 PE (Coach Miller)", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                        { name: "Multipurpose Hall", status: "Available", desc: "Vacant - Open Booking", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                        { name: "Dance Studio", status: "Under Maintenance", desc: "Floor buffing in progress", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
                      ].map((fac, idx) => (
                        <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-[11px] font-sans ${fac.color}`}>
                          <div>
                            <div className="font-bold text-white/90">{fac.name}</div>
                            <div className="text-[9px] opacity-75 mt-0.5 font-medium">{fac.desc}</div>
                          </div>
                          <span className="text-[8px] font-extrabold uppercase tracking-widest">{fac.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Auditorium breakdown */}
                {selectedArea.id === "auditorium" && (
                  <div className="space-y-2 border-t border-white/[0.04] pt-3">
                    <span className="text-[9px] text-white/35 uppercase tracking-wider block font-bold">Facility Breakdowns</span>
                    <div className="p-2.5 rounded-xl border flex items-center justify-between gap-3 text-[11px] font-sans text-rose-400 bg-rose-500/10 border-rose-500/20">
                      <div>
                        <div className="font-bold text-white/90">Main Auditorium</div>
                        <div className="text-[9px] opacity-75 mt-0.5 font-medium">Period 1: TOK Prep Seminar (DP2 - Sarah Chen)</div>
                      </div>
                      <span className="text-[8px] font-extrabold uppercase tracking-widest">Occupied</span>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1.5">
                  <span className="text-[9px] text-white/35 uppercase tracking-wider block">Upcoming Events</span>
                  <div className="space-y-1 font-mono text-[10px]">
                    {selectedArea.upcomingEvents.map((ev, idx) => (
                      <span key={idx} className="text-white/60 block">{ev}</span>
                    ))}
                  </div>
                </div>

                {/* Supervisor direct hotline */}
                <div className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-cyan-400 font-extrabold uppercase tracking-widest block">Responsible Staff</span>
                    <h5 className="text-xs font-black text-white/90">{selectedArea.responsibleStaff}</h5>
                    <span className="text-[9px] text-white/40 font-medium block leading-none">{selectedArea.staffRole}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1, translateY: -1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveCall(selectedArea.responsibleStaff)}
                      className="size-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center hover:bg-cyan-500 hover:text-black hover:border-cyan-500 text-cyan-400 transition-all cursor-pointer"
                      title="Call Supervisor"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-4"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, translateY: -1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setActiveSMS(selectedArea.responsibleStaff);
                        setSmsText("");
                      }}
                      className="size-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center hover:bg-cyan-500 hover:text-black hover:border-cyan-500 text-cyan-400 transition-all cursor-pointer"
                      title="Message Supervisor"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-4"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="border border-dashed border-white/[0.12] p-8 rounded-3xl h-[460px] flex flex-col justify-center items-center text-center text-xs text-white/30 space-y-2">
              <span className="text-2xl opacity-40">🏫</span>
              <h4 className="font-bold text-white/60">No Area Selected</h4>
              <p className="max-w-[200px] leading-relaxed mx-auto">Select any IB space in the directory to inspect occupancy, supervisor, and direct action triggers.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/*  CALL MODAL  */}
      <AnimatePresence>
        {activeCall && (
          <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0E0E10] border border-white/[0.08] rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl z-[210] text-white"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-400 block font-mono">Secured Hotlink Calling</span>
                <div className="size-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400 text-xl animate-pulse">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-6"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold mt-3">{activeCall}</h4>
                <span className="text-[10px] text-white/40 block">Connecting direct audio channel...</span>
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={() => { alert(`Voice chat connected with ${activeCall}.`); setActiveCall(null); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold transition-all">Accept</button>
                <button onClick={() => setActiveCall(null)} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold transition-all">Hang Up</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/*  MESSAGING MODAL  */}
      <AnimatePresence>
        {activeSMS && (
          <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0E0E10] border border-white/[0.08] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl z-[210] text-white"
            >
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                <div className="flex flex-col">
                  <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-wider leading-none">Direct Chat</span>
                  <h4 className="text-xs font-bold mt-1.5">Recipient: {activeSMS}</h4>
                </div>
                <button
                  onClick={() => setActiveSMS(null)}
                  className="text-white/40 hover:text-white hover:bg-white/10 size-6 rounded-lg flex items-center justify-center transition-colors text-xs font-bold font-mono"
                  title="Close"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1.5">
                <textarea
                  rows={4}
                  placeholder={`Compose notice to ${activeSMS}...`}
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0A0A0B] p-3 text-xs text-white outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setActiveSMS(null)} className="px-4 py-2 border border-white/10 rounded-xl text-[10px] uppercase font-bold hover:bg-white/5 transition-all">Cancel</button>
                <button
                  onClick={() => {
                    if (smsText.trim()) {
                      alert(`Message synced to ${activeSMS}: "${smsText}"`);
                      setActiveSMS(null);
                    }
                  }}
                  className="px-4 py-2 bg-cyan-500 text-black font-extrabold tracking-wider text-[10px] rounded-xl hover:opacity-90 transition-all"
                >
                  Send Notice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
