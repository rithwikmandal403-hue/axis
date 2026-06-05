/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ProfileData = {
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  image: string | null;
};

type ProfileManagerProps = {
  profileData: ProfileData;
  phoneVisibility: string;
  onPhoneVisibilityChange: (val: string) => void;
  onUpdate: (updatedData: Partial<ProfileData>) => void;
  styling: {
    bg: string;
    panelBg: string;
    itemBg: string;
    itemHoverBg: string;
    border: string;
    textMuted: string;
    textPrimary: string;
    inputBg: string;
    btnActive: string;
    indicator: string;
  };
};

export function ProfileManager({
  profileData,
  phoneVisibility,
  onPhoneVisibilityChange,
  onUpdate,
  styling,
}: ProfileManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const badgeConfig = { label: "Teacher Account", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" };

  const validateAndProcessFile = (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Please upload a PNG, JPG, or WEBP image.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Photo size must be under 5MB.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPendingImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleSavePending = () => {
    if (pendingImage) {
      onUpdate({ image: pendingImage });
      setPendingImage(null);
    }
  };

  const handleCancelPending = () => {
    setPendingImage(null);
  };

  const handleRemoveImage = () => {
    onUpdate({ image: null });
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-safe-lg">
      <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-safe-lg items-start">
        {/* AVATAR INTERACTIVE REGION */}
        <div className="flex flex-col items-center gap-safe-sm">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={pendingImage ? undefined : (profileData.image ? () => setIsPreviewModalOpen(true) : triggerFilePicker)}
            className={`relative size-32 rounded-full border-2 cursor-pointer overflow-hidden flex items-center justify-center transition-all duration-300 select-none ${
              isDragging
                ? "border-cyan-400 bg-cyan-950/20 scale-105 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                : "border-white/[0.08] hover:border-white/20 bg-white/[0.01]"
            }`}
            title={profileData.image ? "Click to view full photo" : "Click or drag/drop to upload photo"}
          >
            {/* Visual indicator for dragging */}
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-cyan-950/50 backdrop-blur-sm flex flex-col items-center justify-center gap-1 z-10"
                >
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest animate-pulse">Drop Photo</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Display States */}
            {pendingImage ? (
              <img
                src={pendingImage}
                alt="Pending Profile Avatar"
                className="size-full object-cover filter brightness-75 transition-all duration-300"
              />
            ) : profileData.image ? (
              <img
                src={profileData.image}
                alt="Profile Avatar"
                className="size-full object-cover transition-all duration-300 hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold tracking-tight text-white/90">
                  {getInitials(profileData.name)}
                </span>
                <span className="text-[8px] text-white/35 mt-1 block uppercase tracking-wider">Upload</span>
              </div>
            )}

            {/* Subtle Overlay to clarify hover actions when image is present */}
            {profileData.image && !pendingImage && (
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[9px] font-bold text-white uppercase tracking-wider">View Full</span>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
          />

          {/* Error Message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[9px] font-semibold text-rose-400 text-center max-w-[150px] leading-tight"
              >
                {errorMessage}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* DETAILS AND ACTIONS PANEL */}
        <div className="space-y-safe-md">
          {/* Identity Header */}
          <div className="flex flex-wrap items-center gap-3 justify-between md:justify-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{profileData.name}</h4>
                <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeConfig.color}`}>
                  {badgeConfig.label}
                </span>
              </div>
              <span className="text-xs text-white/45 block">{profileData.role} · {profileData.department}</span>
            </div>

            {/* Actions list */}
            <div className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                {pendingImage ? (
                  <motion.div
                    key="pending-actions"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 4 }}
                    className="flex items-center gap-2"
                  >
                    <button
                      onClick={handleSavePending}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-bold transition-all"
                    >
                      Save Photo
                    </button>
                    <button
                      onClick={handleCancelPending}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-semibold transition-all"
                    >
                      Cancel
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="standard-actions"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 4 }}
                    className="flex items-center gap-2"
                  >
                    {profileData.image ? (
                      <>
                        <button
                          onClick={triggerFilePicker}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold border border-white/[0.06] transition-all"
                        >
                          Replace Photo
                        </button>
                        <button
                          onClick={handleRemoveImage}
                          className="px-3 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-950/40 text-red-400 text-[10px] font-semibold border border-red-500/10 transition-all"
                        >
                          Remove Photo
                        </button>
                        <button
                          onClick={() => setIsPreviewModalOpen(true)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-semibold transition-all"
                        >
                          Preview
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={triggerFilePicker}
                        className={`px-3 py-1.5 rounded-lg text-[10px] transition-all ${styling.btnActive}`}
                      >
                        Upload Photo
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Form Fields Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.04]">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider block">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className={`w-full rounded-xl border ${styling.inputBg} px-3.5 py-2 text-xs text-white focus:outline-none`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider block">Role</label>
              <input
                type="text"
                value={profileData.role}
                onChange={(e) => onUpdate({ role: e.target.value })}
                className={`w-full rounded-xl border ${styling.inputBg} px-3.5 py-2 text-xs text-white focus:outline-none`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider block">Department</label>
              <input
                type="text"
                value={profileData.department}
                onChange={(e) => onUpdate({ department: e.target.value })}
                className={`w-full rounded-xl border ${styling.inputBg} px-3.5 py-2 text-xs text-white focus:outline-none`}
              />
            </div>
            
            {/* Phone Number Grid cell with integrated visibility */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider block">Phone Number</label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => onUpdate({ phone: e.target.value })}
                  className={`w-full rounded-xl border ${styling.inputBg} px-3.5 py-2 text-xs text-white focus:outline-none`}
                />
                <select
                  value={phoneVisibility}
                  onChange={(e) => onPhoneVisibilityChange(e.target.value)}
                  className={`rounded-xl border ${styling.inputBg} bg-[#0A0A0B]/85 px-3 py-2 text-xs text-white focus:outline-none cursor-pointer hover:bg-white/[0.02] transition-colors`}
                  title="Who can see your phone number"
                >
                  <option value="Only Me">Only Me</option>
                  <option value="Staff Members">Staff Members</option>
                  <option value="Department Members">Department Members</option>
                  <option value="Everyone">Everyone</option>
                </select>
              </div>
              <span className="text-[8px] text-white/30 block">
                Visibility: <span className="text-cyan-400 font-semibold">{phoneVisibility}</span>
              </span>
            </div>

            {/* Read-Only Institutional Email */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider block">Institution Email</label>
              <div className={`w-full max-w-md rounded-xl border ${styling.inputBg} px-3.5 py-2 text-xs text-white/60 bg-white/[0.02] flex items-center justify-between`}>
                <span>{profileData.email}</span>
                <span className="text-[8.5px] text-white/35 font-medium tracking-wide">Managed by your organization.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL RESOLUTION LIGHTBOX MODAL */}
      <AnimatePresence>
        {isPreviewModalOpen && profileData.image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setIsPreviewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-lg w-full bg-[#0C0C0E] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-safe-lg py-safe-md border-b border-white/[0.06]">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Full Photo Preview</h4>
                  <p className="text-[10px] text-white/40">{profileData.name} · {badgeConfig.label}</p>
                </div>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="text-white/40 hover:text-white text-xs font-semibold px-2 py-1 rounded hover:bg-white/5 transition-all"
                >
                  Close
                </button>
              </div>

              {/* Photo Area */}
              <div className="p-safe-lg flex items-center justify-center bg-black/20 max-h-[400px] overflow-hidden">
                <img
                  src={profileData.image}
                  alt="Full resolution profile photo"
                  className="max-h-[340px] w-auto max-w-full rounded-lg object-contain shadow-inner"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 px-safe-lg py-safe-md bg-[#0A0A0B]/60 border-t border-white/[0.06]">
                <button
                  onClick={() => {
                    setIsPreviewModalOpen(false);
                    triggerFilePicker();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold border border-white/[0.06] transition-all"
                >
                  Replace Photo
                </button>
                <button
                  onClick={() => {
                    setIsPreviewModalOpen(false);
                    handleRemoveImage();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-950/40 text-red-400 text-[10px] font-semibold border border-red-500/10 transition-all"
                >
                  Remove Photo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
