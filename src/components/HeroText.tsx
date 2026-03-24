"use client";

import { useMemo, useState, useEffect, useRef, memo } from "react";
import { theme } from "@/lib/theme";
import { seededRandom, easeInOutCubic } from "@/lib/math";

interface HeroTextProps {
  fillProgress: number;
  footerProgress: number;
  scrollY: number;
  viewW: number;
  viewH: number;
  mounted: boolean;
  designGlowColor?: string | null;
  nameGlowColor?: string | null;
}

function generateFillOrder(cols: number, rows: number, seed: number): number[] {
  const total = cols * rows;
  const indices = Array.from({ length: total }, (_, i) => i);
  const rand = seededRandom(seed);

  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices;
}

const MemoClipPath = memo(function MemoClipPath({ id, fillOrder, count, cols, cellSize }: {
  id: string; fillOrder: number[]; count: number; cols: number; cellSize: number;
}) {
  if (count <= 0) return null;
  return (
    <svg style={{ position: "absolute", width: 0, height: 0 }}>
      <defs>
        <clipPath id={id}>
          {fillOrder.slice(0, count).map((idx) => (
            <rect
              key={idx}
              x={(idx % cols) * cellSize}
              y={Math.floor(idx / cols) * cellSize}
              width={cellSize}
              height={cellSize}
            />
          ))}
        </clipPath>
      </defs>
    </svg>
  );
});

export function HeroText({ fillProgress, footerProgress, scrollY, viewW, viewH, mounted, designGlowColor, nameGlowColor }: HeroTextProps) {
  const cellSize = isMobile ? 20 : 10;
  const textW = isMobile ? 350 : 700;
  const textH = isMobile ? 100 : 200;
  const cols = Math.ceil(textW / cellSize);
  const rows = Math.ceil(textH / cellSize);
  const total = cols * rows;

  const fillOrder = useMemo(() => generateFillOrder(cols, rows, 777), [cols, rows]);
  const quantize = isMobile ? 10 : 20;
  const filledCount = Math.min(total, Math.floor(fillProgress * total / quantize) * quantize);

  const fp = easeInOutCubic(Math.max(0, Math.min(1, footerProgress)));

  const startFontSize = Math.min(200, viewW * 0.12);
  const endFontSize = 14;
  const currentFontSize = startFontSize + (endFontSize - startFontSize) * fp;

  const startX = viewW / 2;
  const startY = viewH / 2;
  const isMobile = viewW < 640;
  const endX = isMobile ? 20 : 40;
  const endY = Math.round((viewH - (isMobile ? 30 : 18)) / 10) * 10;

  const currentX = startX + (endX - startX) * fp;
  const currentY = startY + (endY - startY) * fp;

  const translateX = -50 * (1 - fp);
  const translateY = -50 * (1 - fp);

  const startOpacity = 0.12;
  const endOpacity = 1;
  const currentOpacity = startOpacity + (endOpacity - startOpacity) * fp;

  const showClip = fp < 0.95 && filledCount < total;

  const showSuffix = fp > 0.94;

  const designEndWidth = endFontSize * 0.6 * 6 * (1 - 0.04);
  const suffixFinalLeft = endX + designEndWidth + 8;

  const nameW = Math.round(Math.min(500, viewW * 0.6) / 10) * 10;
  const nameH = isMobile ? 60 : 80;
  const nameCellSize = isMobile ? 20 : 10;
  const nameCols = Math.ceil(nameW / nameCellSize);
  const nameRows = Math.ceil(nameH / nameCellSize);
  const nameTotal = nameCols * nameRows;
  const nameFillOrder = useMemo(() => generateFillOrder(nameCols, nameRows, 1337), [nameCols, nameRows]);

  const [nameFill, setNameFill] = useState(0);
  const nameStarted = useRef(false);
  useEffect(() => {
    if (nameStarted.current) return;
    nameStarted.current = true;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setNameFill(t);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  const nameFilledCount = Math.floor(easeInOutCubic(nameFill) * nameTotal);
  const nameX = Math.round(viewW / 2 / 10) * 10;
  const nameY = Math.round(viewH * 0.38 / 10) * 10;
  const heroFadeOpacity = Math.max(0, 1 - scrollY / (viewH * 0.4));
  const heroParallax = scrollY * 0.3;

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-[3]">
      {nameFilledCount < nameTotal && (
        <MemoClipPath id="heroNameClip" fillOrder={nameFillOrder} count={nameFilledCount} cols={nameCols} cellSize={nameCellSize} />
      )}

      {heroFadeOpacity > 0.01 && mounted && nameFilledCount > 0 && (
        <div
          style={{
            position: "absolute",
            left: nameX,
            top: nameY - heroParallax,
            transform: "translateX(-50%)",
            opacity: heroFadeOpacity,
            width: nameW,
            height: nameH,
            padding: "10px 0",
            ...(nameFilledCount < nameTotal ? {
              clipPath: "url(#heroNameClip)",
            } : {}),
          }}
        >
          <div
            className="font-mono uppercase leading-none text-center"
            style={{
              fontSize: Math.min(36, viewW * 0.038),
              letterSpacing: "0.15em",
              fontWeight: 500,
              transition: "color 0.4s ease",
            }}
          >
            <span style={{ color: theme.text.primary }}>MARCIN</span>
            {" "}
            <span style={{ color: nameGlowColor || theme.accent, transition: "color 0.4s ease" }}>WIECZOREK</span>
          </div>
          <div
            className="font-mono uppercase leading-none text-center"
            style={{
              fontSize: Math.min(16, viewW * 0.018),
              letterSpacing: "0.2em",
              color: theme.text.secondary,
              marginTop: 14,
            }}
          >
            FULLSTACK DEVELOPER
          </div>
        </div>
      )}

      {filledCount > 0 && showClip && (
        <MemoClipPath id="heroFillClip" fillOrder={fillOrder} count={filledCount} cols={cols} cellSize={cellSize} />
      )}
      {filledCount > 0 && <div
        className="font-mono font-black uppercase leading-none"
        style={{
          position: "absolute",
          left: currentX,
          top: currentY,
          transform: `translate(${translateX}%, ${translateY}%)`,
          fontSize: currentFontSize,
          letterSpacing: "-0.04em",
          color: designGlowColor || theme.accent,
          opacity: currentOpacity,
          whiteSpace: "nowrap",
          transition: "color 0.4s ease",
          ...(showClip ? {
            clipPath: "url(#heroFillClip)",
            width: textW,
            height: textH,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          } : {}),
        }}
      >
        DESIGN
      </div>}

      {showSuffix && (
        <div
          key="suffix"
          className="font-mono leading-none"
          style={{
            position: "fixed",
            left: suffixFinalLeft,
            top: endY,
            fontSize: endFontSize,
            color: theme.text.secondary,
            whiteSpace: "nowrap",
            zIndex: 13,
            animation: "suffixSlideIn 0.4s ease-out forwards",
          }}
        >
          by HarmfulPerson
        </div>
      )}
    </div>
  );
}
