"use client";

import { useEffect, useState, useRef } from "react";
import { theme } from "@/lib/theme";

export interface TechTagHit {
  triggerGlow: (tagIndex: number, color: string) => void;
  getTagRects: () => { x: number; y: number; w: number; h: number }[];
}

interface TechTagsProps {
  scrollY: number;
  viewW: number;
  viewH: number;
  centerX: number;
  onCursorColor?: (color: string | null) => void;
  hitRef?: React.MutableRefObject<TechTagHit | null>;
}

const GLOW_COLORS = ["#e85d04", "#d00000", "#ffba08", "#3a86ff", "#8338ec", "#ff006e"];

const TAGS = [
  { label: "NEXT.JS", offsetX: -0.32, offsetY: 0.22 },
  { label: "REACT", offsetX: -0.18, offsetY: 0.28 },
  { label: "TYPESCRIPT", offsetX: -0.08, offsetY: 0.58 },
  { label: "NESTJS", offsetX: 0.22, offsetY: 0.24 },
  { label: "GRAPHQL", offsetX: 0.12, offsetY: 0.55 },
  { label: "POSTGRESQL", offsetX: 0.30, offsetY: 0.62 },
  { label: "REDIS", offsetX: -0.28, offsetY: 0.64 },
  { label: "DOCKER", offsetX: 0.26, offsetY: 0.42 },
  { label: "STRIPE", offsetX: -0.35, offsetY: 0.48 },
];

interface GlowState { color: string; time: number; left: boolean }

export function TechTags({ scrollY, viewW, viewH, centerX, onCursorColor, hitRef }: TechTagsProps) {
  const [mounted, setMounted] = useState(false);
  const tagElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const glowsRef = useRef<{ [key: number]: GlowState }>({});
  const cursorColorRef = useRef<string | null>(null);
  const onCursorColorRef = useRef(onCursorColor);
  onCursorColorRef.current = onCursorColor;

  useEffect(() => {
    if (!hitRef) return;
    hitRef.current = {
      triggerGlow: (tagIndex: number, color: string) => {
        const now = Date.now();
        const existing = glowsRef.current[tagIndex];
        if (existing && now - existing.time < 1500) return;
        glowsRef.current[tagIndex] = { color, time: now, left: true };
        setTick((n) => n + 1);
      },
      getTagRects: () => {
        return tagElsRef.current.map((el) => {
          if (!el) return { x: 0, y: 0, w: 0, h: 0 };
          const rect = el.getBoundingClientRect();
          return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
        });
      },
    };
  });
  const [tick, setTick] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      let hitColor: string | null = null;

      for (let i = 0; i < tagElsRef.current.length; i++) {
        const el = tagElsRef.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();

        const inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        const existing = glowsRef.current[i];

        if (inside) {
          if (existing && now - existing.time < 1500) {
            hitColor = existing.color;
          } else if (!existing || existing.left || now - existing.time >= 1500) {
            const color = GLOW_COLORS[Math.floor(Math.random() * GLOW_COLORS.length)];
            glowsRef.current[i] = { color, time: now, left: false };
            hitColor = color;
            setTick((n) => n + 1);
          }
        } else {
          if (existing && !existing.left) {
            existing.left = true;
          }
        }
      }

      if (cursorColorRef.current !== hitColor) {
        cursorColorRef.current = hitColor;
        onCursorColorRef.current?.(hitColor);
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    let raf: number;
    let lastTick = 0;
    const loop = (now: number) => {
      if (now - lastTick > 100) {
        lastTick = now;
        let anyActive = false;
        for (const key in glowsRef.current) {
          if (now - glowsRef.current[key].time < 1500) { anyActive = true; break; }
        }
        if (anyActive) {
          setTick((n) => n + 1);
        } else if (cursorColorRef.current) {
          cursorColorRef.current = null;
          onCursorColorRef.current?.(null);
          setTick((n) => n + 1);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const now = Date.now();

  if (viewW < 640) return null;

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-[3]">
      {TAGS.map((tag, i) => {
        const x = Math.round((centerX + viewW * tag.offsetX) / 10) * 10;
        const y = Math.round((viewH * tag.offsetY) / 10) * 10;
        const delay = 0.6 + i * 0.15;

        const glow = glowsRef.current[i];
        const glowAge = glow ? (now - glow.time) / 1000 : 999;
        const glowAlpha = glowAge < 1.5 ? Math.max(0, 1 - glowAge / 1.5) : 0;
        const glowColor = glow?.color || GLOW_COLORS[0];

        return (
          <div
            key={tag.label}
            ref={(el) => { tagElsRef.current[i] = el; }}
            className="font-mono uppercase"
            style={{
              position: "absolute",
              left: x,
              top: y - scrollY * 0.2,
              fontSize: 10,
              letterSpacing: "0.15em",
              color: glowAlpha > 0.1 ? glowColor : theme.text.muted,
              border: `1px solid ${glowAlpha > 0.1 ? glowColor : theme.accentLight}`,
              padding: "4px 9px",
              lineHeight: "10px",
              opacity: mounted ? 1 : 0,
              transition: `opacity 0.6s ease ${delay}s, color 0.3s ease, border-color 0.3s ease`,
              boxShadow: glowAlpha > 0.01
                ? `0 0 ${12 + glowAlpha * 20}px ${glowColor}${Math.round(glowAlpha * 80).toString(16).padStart(2, "0")}, 0 0 ${4 + glowAlpha * 8}px ${glowColor}${Math.round(glowAlpha * 50).toString(16).padStart(2, "0")}`
                : "none",
            }}
          >
            {tag.label}
          </div>
        );
      })}
    </div>
  );
}
