"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type AttendanceMode = "manual" | "assisted" | "automated";

export function AttendanceModeUI() {
  const [activeMode, setActiveMode] = useState<AttendanceMode>("automated");
  const [bindDevice, setBindDevice] = useState(true);
  const [proximityConfirm, setProximityConfirm] = useState(true);
  const [locationVerification, setLocationVerification] = useState(false);
  const [coordinatorOverride, setCoordinatorOverride] = useState(true);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 shadow-[0_12px_48px_-16px_rgba(0,0,0,0.6)] md:p-8">
      <div className="flex flex-col gap-5">
        <div>
          <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">
            Homeroom Workspace
          </span>
          <h3 className="text-xl font-medium tracking-tight text-white mt-1">Attendance Verification</h3>
          <p className="mt-1.5 text-xs text-white/45">
            Configure how student presence is tracked and updated in the school system.
          </p>
        </div>

        {/* Tab mode switches */}
        <div className="grid grid-cols-3 rounded-xl bg-white/[0.02] border border-white/[0.05] p-1 select-none">
          {(["manual", "assisted", "automated"] as AttendanceMode[]).map((mode) => {
            const isSelected = activeMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                className="relative py-2 text-xs font-semibold text-center rounded-lg focus:outline-none capitalize"
              >
                {isSelected && (
                  <motion.div
                    layoutId="attendanceModeBackground"
                    className="absolute inset-0 rounded-lg bg-white/[0.06] border border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${isSelected ? "text-white" : "text-white/40 hover:text-white/80"}`}>
                  {mode}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mode details */}
        <div className="min-h-36">
          {activeMode === "manual" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 text-xs text-white/60"
            >
              <p className="leading-relaxed">
                Standard manual roll call. Marks are typed directly into the timetable ledger. Does not sync with student hardware proximity.
              </p>
              <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3.5">
                <span className="text-[9px] font-bold text-white/35 uppercase tracking-wider block">
                  Manual Controls
                </span>
                <button className="mt-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-2 font-medium text-white hover:bg-white/[0.04] transition-all">
                  Open Roll Call Grid
                </button>
              </div>
            </motion.div>
          )}

          {activeMode === "assisted" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 text-xs text-white/60"
            >
              <p className="leading-relaxed">
                Assisted tracking. Axis queries connected classroom hardware (smart boards, locks) to detect approximate student rosters. Requires teacher checkoff.
              </p>
              <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.01] p-3.5">
                <span>Room hardware connectivity status:</span>
                <span className="text-emerald-400 font-semibold">Active · 3 sensors online</span>
              </div>
            </motion.div>
          )}

          {activeMode === "automated" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <p className="text-xs text-white/60 leading-relaxed">
                Automated proximity verification. Student presence is automatically noted when they enter the classroom, with no manual entry required.
              </p>

              {/* Dynamic toggle switches */}
              <div className="space-y-3.5">
                {/* Switch 1 */}
                <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.01] p-3">
                  <div className="flex flex-col pr-4">
                    <span className="text-xs font-semibold text-white/80">Device Binding</span>
                    <span className="text-[10px] text-white/35 mt-0.5 leading-snug">Limit accounts to one registered student device</span>
                  </div>
                  <button
                    onClick={() => setBindDevice(!bindDevice)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      bindDevice ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                        bindDevice ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                      }`}
                    />
                  </button>
                </div>

                {/* Switch 2 */}
                <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.01] p-3">
                  <div className="flex flex-col pr-4">
                    <span className="text-xs font-semibold text-white/80">Bluetooth Attendance Sync</span>
                    <span className="text-[10px] text-white/35 mt-0.5 leading-snug">Detect presence using Bluetooth beacons within the classroom</span>
                  </div>
                  <button
                    onClick={() => setProximityConfirm(!proximityConfirm)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      proximityConfirm ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                        proximityConfirm ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                      }`}
                    />
                  </button>
                </div>

                {/* Switch 3 */}
                <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.01] p-3">
                  <div className="flex flex-col pr-4">
                    <span className="text-xs font-semibold text-white/80">Location Verification</span>
                    <span className="text-[10px] text-white/35 mt-0.5 leading-snug">Cross-reference location using campus Wi-Fi AP tokens</span>
                  </div>
                  <button
                    onClick={() => setLocationVerification(!locationVerification)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      locationVerification ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                        locationVerification ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                      }`}
                    />
                  </button>
                </div>

                {/* Switch 4 */}
                <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.01] p-3">
                  <div className="flex flex-col pr-4">
                    <span className="text-xs font-semibold text-white/80">Administrator Override</span>
                    <span className="text-[10px] text-white/35 mt-0.5 leading-snug">Allow school staff to manually verify attendance for isolated cases</span>
                  </div>
                  <button
                    onClick={() => setCoordinatorOverride(!coordinatorOverride)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      coordinatorOverride ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                        coordinatorOverride ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0 bg-white/50"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

