"use client";

import { useEffect, useState, useRef } from "react";
import { playNotificationSound } from "./audio-system";

type DeviceOption = {
  deviceId: string;
  label: string;
};

interface HTMLVideoElementWithSink extends HTMLVideoElement {
  setSinkId(sinkId: string): Promise<void>;
}

type DeviceCalibrationProps = {
  onConfirm?: () => void;
  confirmLabel?: string;
  theme?: string;
};

export function DeviceCalibration({ onConfirm, confirmLabel = "Join Meeting", theme = "dark" }: DeviceCalibrationProps) {
  const [cameras, setCameras] = useState<DeviceOption[]>([
    { deviceId: "default", label: "Integrated Webcam (1080p)" }
  ]);
  const [microphones, setMicrophones] = useState<DeviceOption[]>([
    { deviceId: "default", label: "Default Input Source" },
    { deviceId: "quadcast", label: "HyperX QuadCast S" }
  ]);
  const [speakers, setSpeakers] = useState<DeviceOption[]>([
    { deviceId: "default", label: "Default Speakers Output" },
    { deviceId: "arctis", label: "SteelSeries Arctis Pro" }
  ]);

  const [selectedCamera, setSelectedCamera] = useState("default");
  const [selectedMicrophone, setSelectedMicrophone] = useState("default");
  const [selectedSpeaker, setSelectedSpeaker] = useState("default");

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const [cameraActive, setCameraActive] = useState(true);
  const [micMuted, setMicMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Keep track of the latest mute/active states using stable refs to avoid recreating the stream on state changes.
  const micMutedRef = useRef(micMuted);
  micMutedRef.current = micMuted;
  const cameraActiveRef = useRef(cameraActive);
  cameraActiveRef.current = cameraActive;

  // Initialize browser device access
  useEffect(() => {
    let isCurrent = true;
    let activeStream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let animationFrameId: number | null = null;

    async function setupDevices() {
      try {
        const streamConstraints = {
          video: selectedCamera === "default" ? true : { deviceId: { exact: selectedCamera } },
          audio: selectedMicrophone === "default" ? true : { deviceId: { exact: selectedMicrophone } }
        };

        const localStream = await navigator.mediaDevices.getUserMedia(streamConstraints);

        if (!isCurrent) {
          localStream.getTracks().forEach(track => track.stop());
          return;
        }

        activeStream = localStream;

        // Apply current mute states to new stream tracks using the stable refs
        const audioTrack = activeStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !micMutedRef.current;
        }
        const videoTrack = activeStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = cameraActiveRef.current;
        }

        setStream(activeStream);
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }

        // Web Audio API analyzer setup for live microphone feedback
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AudioContextClass();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const source = audioCtx.createMediaStreamSource(activeStream);
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        microphoneRef.current = source;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          if (!isCurrent || !analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          setMicLevel(Math.min(100, Math.round(average * 1.5)));
          animationFrameId = requestAnimationFrame(updateVolume);
          animationFrameRef.current = animationFrameId;
        };
        updateVolume();

        // Enumerate actual browser media devices once permission is granted
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevs = devices.filter(d => d.kind === "videoinput").map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.substring(0, 4)}` }));
          const audioDevs = devices.filter(d => d.kind === "audioinput").map(d => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.substring(0, 4)}` }));
          const outputDevs = devices.filter(d => d.kind === "audiooutput").map(d => ({ deviceId: d.deviceId, label: d.label || `Speaker ${d.deviceId.substring(0, 4)}` }));

          if (videoDevs.length > 0) setCameras(videoDevs);
          if (audioDevs.length > 0) setMicrophones(audioDevs);
          if (outputDevs.length > 0) setSpeakers(outputDevs);
        }

      } catch (err) {
        console.warn("Media devices permission denied or unsupported:", err);
        if (!isCurrent) return;
        // If browser permission denied, fall back to mock animated mic level
        const interval = setInterval(() => {
          if (isCurrent) {
            if (!micMutedRef.current) {
              setMicLevel(Math.floor(Math.random() * 40) + 5);
            } else {
              setMicLevel(0);
            }
          }
        }, 150);
        return () => clearInterval(interval);
      }
    }

    setupDevices();

    return () => {
      isCurrent = false;
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (audioCtx) {
        audioCtx.close();
      }
    };
  }, [selectedCamera, selectedMicrophone]);

  // Synchronize micMuted state with track status
  useEffect(() => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micMuted;
      }
    }
  }, [micMuted, stream]);

  // Synchronize cameraActive state with track status
  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = cameraActive;
      }
    }
  }, [cameraActive, stream]);

  // Set speaker output sink ID when selectedSpeaker changes
  useEffect(() => {
    const videoEl = videoRef.current as HTMLVideoElementWithSink | null;
    if (videoEl && typeof videoEl.setSinkId === "function") {
      videoEl.setSinkId(selectedSpeaker)
        .catch((err: unknown) => console.warn("Failed to set audio output sink ID:", err));
    }
  }, [selectedSpeaker, stream]);

  const testSpeakers = () => {
    // Play slightly richer tone (meeting tone chime) to verify speaker output
    playNotificationSound("meeting");
  };

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
  };

  const toggleMic = () => {
    setMicMuted(!micMuted);
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-6 bg-[#0E0E10]/40 border border-white/[0.06] rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      {/* LEFT: Live Video Frame */}
      <div className="flex flex-col gap-3">
        <div className="aspect-video w-full rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center overflow-hidden relative shadow-inner">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="flex flex-col items-center gap-2.5">
              <div className="size-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg font-semibold text-white/40">
                AC
              </div>
              <span className="text-xs text-white/30 font-medium">Camera Feed Suspended</span>
            </div>
          )}

          {/* Quick feed control overrides overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={toggleCamera}
                className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105 ${
                  cameraActive 
                    ? "bg-[#0E0E10]/80 border-white/10 text-white/80 hover:text-white hover:border-white/20" 
                    : "bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30"
                }`}
                title="Toggle Camera"
              >
                {cameraActive ? (
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                ) : (
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                )}
              </button>

              <button
                onClick={toggleMic}
                className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105 ${
                  !micMuted 
                    ? "bg-[#0E0E10]/80 border-white/10 text-white/80 hover:text-white hover:border-white/20" 
                    : "bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30"
                }`}
                title="Toggle Microphone"
              >
                {!micMuted ? (
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                ) : (
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                )}
              </button>
            </div>
            <div className="px-2 py-1 bg-black/60 rounded text-[9px] uppercase tracking-wider font-semibold border border-white/5">
              Secure Stream
            </div>
          </div>
        </div>

        {/* Live Audio activity level meter */}
        <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/35 uppercase tracking-wider">Microphone Input Level</span>
            <span className="text-[9px] text-white/20 mt-0.5">Speak to test audio sensitivity indicators</span>
          </div>
          <div className="flex-1 max-w-[200px] h-3 bg-black/50 border border-white/[0.06] rounded overflow-hidden p-0.5 flex gap-0.5 items-center">
            {Array.from({ length: 20 }).map((_, idx) => {
              const active = micLevel > (idx * 5);
              return (
                <span
                  key={idx}
                  className={`h-full flex-1 rounded-sm transition-all duration-75 ${
                    active 
                      ? idx < 14 ? "bg-cyan-500" : idx < 18 ? "bg-amber-400" : "bg-rose-500"
                      : "bg-white/5"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: Calibration Selectors */}
      <div className="flex flex-col justify-between gap-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-1 border-b border-white/[0.06] pb-3">
            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest leading-none">Pre-flight check</span>
            <h3 className="text-sm font-semibold tracking-tight text-white/95 mt-1">Calibrate Core Hardware</h3>
          </div>

          <div className="space-y-3.5">
            {/* Camera Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Video Input (Webcam)</label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-xs focus:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200 ${theme === "light" ? "bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300" : "bg-zinc-900 text-white border-white/10 hover:border-white/20"}`}
              >
                {cameras.map(c => (
                  <option key={c.deviceId} value={c.deviceId}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Microphone Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Audio Input (Mic)</label>
              <select
                value={selectedMicrophone}
                onChange={(e) => setSelectedMicrophone(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-xs focus:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200 ${theme === "light" ? "bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300" : "bg-zinc-900 text-white border-white/10 hover:border-white/20"}`}
              >
                {microphones.map(m => (
                  <option key={m.deviceId} value={m.deviceId}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Speaker Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Audio Output (Speakers)</label>
              <div className="flex gap-2">
                <select
                  value={selectedSpeaker}
                  onChange={(e) => setSelectedSpeaker(e.target.value)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-xs focus:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200 ${theme === "light" ? "bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300" : "bg-zinc-900 text-white border-white/10 hover:border-white/20"}`}
                >
                  {speakers.map(s => (
                    <option key={s.deviceId} value={s.deviceId}>{s.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={testSpeakers}
                  className="px-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs font-semibold rounded-xl text-white transition-all duration-200 whitespace-nowrap hover:scale-102 outline-none"
                >
                  Test Audio
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic confirmation button (Only for Pre-join screen flow) */}
        {onConfirm && (
          <button
            onClick={onConfirm}
            className="w-full py-3 bg-white hover:bg-white/95 text-zinc-950 font-bold rounded-xl text-xs tracking-tight shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] outline-none"
          >
            {confirmLabel}
          </button>
        )}
      </div>
    </div>
  );
}
