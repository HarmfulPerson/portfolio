"use client";

import { useState, useEffect } from "react";
import { PROJECTS } from "@/lib/sections";
import { theme } from "@/lib/theme";

interface ProjectOverlayProps {
  projectIndex: number | null;
  onClose: () => void;
  viewW: number;
  viewH: number;
  centerX: number;
}

const PROJECT_URL = "https://luznycontent-staging-landing.vercel.app/";

export function ProjectOverlay({ projectIndex, onClose, viewW, viewH, centerX }: ProjectOverlayProps) {
  const [phase, setPhase] = useState<"idle" | "opening" | "open" | "closing">("idle");
  const [progress, setProgress] = useState(0);
  const [lastIndex, setLastIndex] = useState(0);

  useEffect(() => {
    if (projectIndex !== null && phase === "idle") {
      setLastIndex(projectIndex);
      setPhase("opening");
      setProgress(0);
    }
    if (projectIndex === null && phase === "open") {
      setPhase("closing");
    }
  }, [projectIndex, phase]);

  useEffect(() => {
    if (phase !== "open") return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 30) {
        onClose();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [phase, onClose]);

  useEffect(() => {
    if (phase === "idle") return;

    let raf: number;
    let start: number | null = null;
    const duration = phase === "opening" ? 600 : 500;

    const animate = (time: number) => {
      if (!start) start = time;
      const t = Math.min(1, (time - start) / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      if (phase === "opening") {
        setProgress(eased);
        if (t >= 1) { setPhase("open"); return; }
      } else if (phase === "closing") {
        setProgress(1 - eased);
        if (t >= 1) { setPhase("idle"); setProgress(0); return; }
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  if (phase === "idle" && progress === 0) return null;

  const project = PROJECTS[projectIndex ?? lastIndex];
  const color = project.color;

  const tearGap = progress * viewH * 0.6;
  const topLineEnd = viewH / 2 - tearGap / 2;
  const bottomLineStart = viewH / 2 + tearGap / 2;

  const contentOpacity = Math.max(0, (progress - 0.4) / 0.6);

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-auto cursor-auto"
      style={{ opacity: progress > 0.01 ? 1 : 0 }}
    >
      <div
        className="absolute inset-0"
        style={{ background: theme.bg, opacity: progress * 0.97 }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            `linear-gradient(to right, ${theme.grid} 1px, transparent 1px), linear-gradient(to bottom, ${theme.grid} 1px, transparent 1px)`,
          backgroundSize: "10px 10px",
          opacity: progress * 0.5,
        }}
      />

      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ width: 1, top: 0, height: Math.max(0, topLineEnd), background: color, opacity: 0.6 }}
      />

      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ width: 1, top: bottomLineStart, bottom: 0, background: color, opacity: 0.6 }}
      />

      {progress > 0.1 && (
        <svg
          className="absolute"
          style={{ left: 0, top: 0, width: viewW, height: viewH, pointerEvents: "none" }}
        >
          <line x1={centerX - 20 * progress} y1={topLineEnd} x2={centerX + 20 * progress} y2={topLineEnd}
            stroke={color} strokeWidth={1} opacity={0.4} strokeLinecap="round" />
          <line x1={centerX - 20 * progress} y1={bottomLineStart} x2={centerX + 20 * progress} y2={bottomLineStart}
            stroke={color} strokeWidth={1} opacity={0.4} strokeLinecap="round" />
        </svg>
      )}

      <div
        className="absolute inset-0 flex flex-col items-center justify-center font-mono"
        style={{ opacity: contentOpacity }}
      >
        <div style={{ width: 10, height: 10, background: color, marginBottom: 20 }} />

        <span className="text-[10px] tracking-[0.25em] uppercase font-semibold mb-2" style={{ color }}>
          Project
        </span>

        <h1 className="text-3xl font-semibold tracking-tight mb-4" style={{ color: theme.text.primary }}>
          {project.name}
        </h1>

        <p className="text-xs tracking-wide max-w-sm text-center leading-relaxed mb-8" style={{ color: theme.text.secondary }}>
          A showcase of precision engineering and creative problem-solving.
          Built with modern tools and an obsession for detail.
        </p>

        <a
          href={PROJECT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block cursor-pointer group relative"
          style={{
            width: 320,
            height: 200,
            border: `1px solid ${color}30`,
            overflow: "hidden",
          }}
        >
          <iframe
            src={PROJECT_URL}
            className="w-full h-full border-none pointer-events-none"
            style={{
              transform: "scale(0.4)",
              transformOrigin: "top left",
              width: 800,
              height: 500,
            }}
            title={project.name}
            tabIndex={-1}
          />
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: `${color}15`, backdropFilter: "blur(1px)" }}
          >
            <span className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color }}>
              Visit site →
            </span>
          </div>
        </a>
      </div>

      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 font-mono"
        style={{ opacity: contentOpacity * 0.6, zIndex: 101 }}
      >
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ animation: "bounce 2s ease-in-out infinite", transform: "rotate(180deg)" }}
        >
          <path d="M3 5l4 4 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[8px] tracking-[0.2em] uppercase" style={{ color: theme.text.secondary }}>
          scroll to close
        </span>
      </div>

      <button
        className="fixed top-6 left-6 z-[101] font-mono cursor-pointer flex items-center gap-2"
        style={{
          opacity: contentOpacity,
          background: "rgba(255,255,255,0.7)",
          padding: "8px 16px",
          borderRadius: "6px",
          border: `1px solid ${color}40`,
          backdropFilter: "blur(8px)",
          color: theme.text.secondary,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = color)}
        onMouseLeave={(e) => (e.currentTarget.style.color = theme.text.secondary)}
        onClick={onClose}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M7 2L3 6L7 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[11px] tracking-[0.15em] uppercase">Back</span>
      </button>
    </div>
  );
}
