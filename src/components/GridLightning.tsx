"use client";

import { useEffect, useRef } from "react";

import type { TechTagHit } from "./TechTags";

interface CardRect { x: number; y: number; w: number; h: number; index: number }

interface GridLightningProps {
  viewW: number;
  viewH: number;
  techTagHitRef?: React.MutableRefObject<TechTagHit | null>;
  cardRectsRef?: React.MutableRefObject<CardRect[]>;
  onCardHit?: (cardIndex: number, color: string) => void;
}

const RAINBOW = ["#e85d04", "#d00000", "#ffba08", "#3a86ff", "#8338ec", "#ff006e", "#06d6a0"];

interface Bolt {
  headY: number;
  speed: number;
  color: string;
  segments: { x: number; y: number }[];
  maxLen: number;
}

export function GridLightning({ viewW, viewH, techTagHitRef, cardRectsRef, onCardHit }: GridLightningProps) {
  const onCardHitRef = useRef(onCardHit);
  onCardHitRef.current = onCardHit;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = viewW;
    canvas.height = viewH;

    const isMobile = viewW < 768;
    const maxBolts = isMobile ? 8 : 30;
    const spawnInterval = isMobile ? 400 : 200;
    const spawnExtra = isMobile ? 0.2 : 0.5;

    const bolts: Bolt[] = [];
    let lastSpawn = 0;
    let raf: number;
    let tagRectsCache: { x: number; y: number; w: number; h: number }[] | null = null;
    let tagRectsCacheTime = 0;

    const spawnBolt = () => {
      if (bolts.length >= maxBolts) return;
      const cols = Math.floor(viewW / 10);
      const gridX = Math.floor(Math.random() * cols) * 10;
      bolts.push({
        headY: 0,
        speed: isMobile ? 6 + Math.random() * 4 : 8 + Math.random() * 6,
        color: RAINBOW[Math.floor(Math.random() * RAINBOW.length)],
        segments: [{ x: gridX, y: 0 }],
        maxLen: isMobile ? 10 + Math.floor(Math.random() * 10) : 15 + Math.floor(Math.random() * 20),
      });
    };

    const animate = (now: number) => {
      ctx.clearRect(0, 0, viewW, viewH);

      if (now - lastSpawn > spawnInterval + Math.random() * spawnInterval) {
        lastSpawn = now;
        spawnBolt();
        if (Math.random() < spawnExtra) spawnBolt();
        if (!isMobile && Math.random() < 0.2) spawnBolt();
      }

      if (now - tagRectsCacheTime > 200) {
        tagRectsCacheTime = now;
        tagRectsCache = techTagHitRef?.current?.getTagRects() || null;
      }

      for (let b = bolts.length - 1; b >= 0; b--) {
        const bolt = bolts[b];
        bolt.headY += bolt.speed;

        const lastSeg = bolt.segments[bolt.segments.length - 1];
        const jag = Math.random() < 0.4 ? (Math.random() < 0.5 ? -10 : 10) : 0;
        const newX = Math.max(0, Math.min(viewW - 10, lastSeg.x + jag));

        bolt.segments.push({ x: newX, y: bolt.headY });

        if (tagRectsCache) {
          for (let t = 0; t < tagRectsCache.length; t++) {
            const r = tagRectsCache[t];
            if (r.w === 0) continue;
            if (newX >= r.x - 5 && newX <= r.x + r.w + 5 && bolt.headY >= r.y && bolt.headY <= r.y + r.h) {
              techTagHitRef?.current?.triggerGlow(t, bolt.color);
            }
          }
        }

        if (cardRectsRef?.current && onCardHitRef.current) {
          for (let c = 0; c < cardRectsRef.current.length; c++) {
            const r = cardRectsRef.current[c];
            if (!r) continue;
            if (newX >= r.x - 5 && newX <= r.x + r.w + 5 && bolt.headY >= r.y && bolt.headY <= r.y + r.h) {
              onCardHitRef.current(r.index, bolt.color);
            }
          }
        }

        if (bolt.segments.length > bolt.maxLen) {
          bolt.segments.shift();
        }

        if (bolt.segments[0].y > viewH) {
          bolts.splice(b, 1);
          continue;
        }

        const segCount = bolt.segments.length;
        ctx.strokeStyle = bolt.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let s = 1; s < segCount; s++) {
          const prev = bolt.segments[s - 1];
          const curr = bolt.segments[s];
          ctx.moveTo(prev.x + 0.5, prev.y);
          ctx.lineTo(curr.x + 0.5, curr.y);
        }
        ctx.globalAlpha = 0.4;
        ctx.stroke();

        if (!isMobile) {
          ctx.lineWidth = 5;
          ctx.globalAlpha = 0.1;
          ctx.stroke();
        }

        if (segCount > 1) {
          const head = bolt.segments[segCount - 1];
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = bolt.color;
          ctx.fillRect(head.x - 1, head.y - 2, 3, 4);
        }
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [viewW, viewH]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1, width: viewW, height: viewH }}
    />
  );
}
