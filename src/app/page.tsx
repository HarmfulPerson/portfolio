"use client";

import { useCallback, useRef, useState, useEffect, useMemo, memo } from "react";
import { theme } from "@/lib/theme";
import { SECTIONS } from "@/lib/sections";
import { easeInOutCubic, buildThreadPath } from "@/lib/math";
import { PROJECTS } from "@/lib/sections";
import { GridBackground } from "@/components/GridBackground";
import { HeroText } from "@/components/HeroText";
import { Navigation } from "@/components/Navigation";
import { ScrollIndicator } from "@/components/ScrollIndicator";
import { CenterLine } from "@/components/CenterLine";
import { SectionCard } from "@/components/SectionCard";
import { Footer } from "@/components/Footer";
import { ProjectGrid } from "@/components/ProjectGrid";
import { ProjectOverlay } from "@/components/ProjectOverlay";
import { TechTags } from "@/components/TechTags";
import { GridLightning } from "@/components/GridLightning";
import type { TechTagHit } from "@/components/TechTags";

const DESKTOP_CARD_W = theme.card.width;
const DESKTOP_CARD_H = theme.card.height;
const DESKTOP_GAP = theme.card.gap;

const CONTACT_LINKS = [
  { label: "GitHub", href: "https://github.com/marcinwieczorek" },
  { label: "LinkedIn", href: "https://linkedin.com/in/marcinwieczorek" },
  { label: "Twitter", href: "https://twitter.com/marcinwieczorek" },
  { label: "hello@marcin.dev", href: "mailto:hello@marcin.dev" },
];

const ProjectTitleSuffix = memo(function ProjectTitleSuffix() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {PROJECTS.slice(0, 4).map((p) => (
          <div
            key={p.name}
            style={{ width: 4, height: 4, background: p.color, opacity: 0.7 }}
          />
        ))}
      </div>
      <span
        className="text-[8px] tracking-[0.15em] uppercase"
        style={{ color: theme.text.secondary }}
      >
        click to explore
      </span>
    </div>
  );
});

const MemoSectionCard = memo(SectionCard);
const MemoProjectGrid = memo(ProjectGrid);
const MemoCenterLine = memo(CenterLine);
const MemoFooter = memo(Footer);
const MemoNavigation = memo(Navigation);
const MemoScrollIndicator = memo(ScrollIndicator);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [showIndicator, setShowIndicator] = useState(true);
  const [viewH, setViewH] = useState(800);
  const [viewW, setViewW] = useState(1200);
  const [mounted, setMounted] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const cursorColorRef = useRef<string | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const techTagHitRef = useRef<TechTagHit | null>(null);
  const cardRectsRef = useRef<{ x: number; y: number; w: number; h: number; index: number }[]>([]);
  const cardGlowsRef = useRef<{ [key: number]: { color: string; time: number } }>({});
  const [cardGlowTick, setCardGlowTick] = useState(0);

  const handleCardHit = useCallback((cardIndex: number, color: string) => {
    const now = Date.now();
    const existing = cardGlowsRef.current[cardIndex];
    if (existing && now - existing.time < 2000) return;
    cardGlowsRef.current[cardIndex] = { color, time: now };
    setCardGlowTick((n) => n + 1);
    setTimeout(() => {
      if (cardGlowsRef.current[cardIndex]?.time === now) {
        delete cardGlowsRef.current[cardIndex];
        setCardGlowTick((n) => n + 1);
      }
    }, 2000);
  }, []);

  useEffect(() => {
    setViewH(window.innerHeight);
    setViewW(window.innerWidth);
    setMounted(true);

    const onResize = () => {
      setViewH(window.innerHeight);
      setViewW(window.innerWidth);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number;
    let running = true;
    let lastSet = 0;

    const isMobile = window.innerWidth < 768;
    const threshold = isMobile ? 10 : 3;

    const tick = () => {
      if (!running) return;
      const val = Math.round(container.scrollTop);
      if (Math.abs(val - lastSet) >= threshold) {
        lastSet = val;
        setScrollY(val);
        setShowIndicator(val < 20);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleCursorColor = useCallback((color: string | null) => {
    cursorColorRef.current = color;
    const el = cursorRef.current;
    if (!el) return;
    if (color) {
      el.style.width = "12px";
      el.style.height = "12px";
      el.style.background = color;
      el.style.boxShadow = `0 0 12px ${color}, 0 0 4px ${color}`;
    } else {
      el.style.width = "8px";
      el.style.height = "8px";
      el.style.background = theme.accent;
      el.style.boxShadow = "none";
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const cursor = cursorRef.current;
    if (cursor) {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    }

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left + container.scrollLeft) / 10);
    const y = Math.floor((e.clientY - rect.top + container.scrollTop) / 10);

    const cell = document.createElement("div");
    cell.style.cssText = `
      position:absolute;
      left:${x * 10 + 1}px;
      top:${y * 10 + 1}px;
      width:9px;
      height:9px;
      background:${cursorColorRef.current ? cursorColorRef.current + "40" : theme.accentLight};
      pointer-events:none;
      border-radius:2px;
      animation:fade 0.6s ease-out forwards;
      will-change:opacity,transform;
    `;
    container.appendChild(cell);
    cell.addEventListener("animationend", () => cell.remove());
  }, []);

  const isMobile = viewW < 640;
  const CARD_W = isMobile ? Math.round((viewW - 40) / 10) * 10 : DESKTOP_CARD_W;
  const CARD_H = isMobile ? 180 : DESKTOP_CARD_H;
  const gap = isMobile ? 20 : DESKTOP_GAP;

  const sectionSpan = viewH * 0.9;
  const totalHeight = viewH * 1.6 + SECTIONS.length * sectionSpan + viewH * 1.2;
  const centerX = Math.round(viewW / 2 / 10) * 10;
  const firstSectionStart = viewH * 1.2;
  const footerStart = firstSectionStart + SECTIONS.length * sectionSpan;

  const fillProgress = Math.max(0, Math.min(1, scrollY / footerStart));
  const footerProgress = Math.max(0, Math.min(1, (scrollY - footerStart) / (viewH * 0.6)));

  const fpEased = easeInOutCubic(Math.max(0, Math.min(1, footerProgress)));
  const designFontSize = Math.min(200, viewW * 0.12) + (14 - Math.min(200, viewW * 0.12)) * fpEased;
  const designVisualW = designFontSize * 0.6 * 6;
  const designVisualH = designFontSize;
  const isMobileDesign = viewW < 640;
  const designEndX = isMobileDesign ? 20 : 40;
  const designEndY = Math.round((viewH - (isMobileDesign ? 30 : 18)) / 10) * 10;
  const designCX = viewW / 2 + (designEndX - viewW / 2) * fpEased;
  const designCY = viewH / 2 + (designEndY - viewH / 2) * fpEased;
  const designTransX = -50 * (1 - fpEased);
  const designLeft = designCX + (designTransX / 100) * designVisualW;
  const designTransY = -50 * (1 - fpEased);
  const designTop = designCY + (designTransY / 100) * designVisualH;

  if (fillProgress > 0) {
    cardRectsRef.current[99] = { x: designLeft, y: designTop, w: designVisualW, h: designVisualH, index: 99 };
  }

  const nameW = Math.round(Math.min(500, viewW * 0.6) / 10) * 10;
  const nameVisualX = Math.round(viewW / 2 / 10) * 10 - nameW / 2;
  const nameVisualY = Math.round(viewH * 0.38 / 10) * 10 - scrollY * 0.3;
  if (nameVisualY > -80 && nameVisualY < viewH) {
    cardRectsRef.current[98] = { x: nameVisualX, y: nameVisualY, w: nameW, h: 80, index: 98 };
  }

  const paths = useMemo(() => {
    return SECTIONS.map((_, i) => {
      const isLeft = isMobile ? false : i % 2 === 0;
      const rawCardX = isMobile
        ? Math.round((viewW - CARD_W) / 2 / 10) * 10
        : isLeft
          ? Math.max(20, centerX - CARD_W - gap)
          : Math.min(viewW - CARD_W - 20, centerX + gap);
      const cardX = Math.round(rawCardX / 10) * 10;
      const nearEdgeX = isLeft ? cardX + CARD_W : cardX;

      const svgPad = 50;
      const minX = Math.min(centerX, nearEdgeX) - svgPad;
      const maxX = Math.max(centerX, nearEdgeX) + svgPad;

      const sx = centerX - minX;
      const ex = nearEdgeX - minX;

      const { d } = buildThreadPath(sx, svgPad, ex, svgPad, (i + 1) * 7919);

      return { d, svgLeft: minX, svgW: maxX - minX, cardX };
    });
  }, [centerX, viewW]);

  const accentHeight = useMemo(() => {
    const dotScreenFixed = viewH * 0.5;

    if (scrollY < firstSectionStart) {
      const travel = Math.max(0, scrollY / firstSectionStart);
      return dotScreenFixed * easeInOutCubic(travel);
    }

    let targetY = dotScreenFixed;

    for (let i = 0; i < SECTIONS.length; i++) {
      const sectionStart = firstSectionStart + i * sectionSpan;
      const elapsed = scrollY - sectionStart;

      if (elapsed < 0) {
        const prevEnd = firstSectionStart + (i - 1) * sectionSpan + sectionSpan * 0.55;
        const travel = Math.max(0, Math.min(1, (scrollY - prevEnd) / (sectionStart - prevEnd)));
        targetY = dotScreenFixed + (viewH * 0.8 - dotScreenFixed) * Math.sin(travel * Math.PI);
        targetY = Math.max(dotScreenFixed, targetY);
        break;
      } else {
        targetY = dotScreenFixed;
      }
    }

    const lastElapsed = scrollY - (firstSectionStart + (SECTIONS.length - 1) * sectionSpan);
    if (lastElapsed >= sectionSpan * 0.55) {
      const toFooter = Math.max(0, Math.min(1, (scrollY - (footerStart - viewH * 0.5)) / (viewH * 0.5)));
      targetY = dotScreenFixed + (viewH - 60 - dotScreenFixed) * toFooter;
    }

    return targetY;
  }, [scrollY, viewH, sectionSpan, firstSectionStart, footerStart]);

  const scrollAnimRef = useRef(0);
  const handleNavigate = useCallback((idx: number) => {
    const container = containerRef.current;
    if (!container) return;
    cancelAnimationFrame(scrollAnimRef.current);

    const from = container.scrollTop;
    const to = firstSectionStart + idx * sectionSpan + sectionSpan * 0.55;
    const distance = to - from;
    const duration = Math.min(1200, Math.max(400, Math.abs(distance) * 0.3));
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      container.scrollTop = from + distance * ease;
      if (t < 1) scrollAnimRef.current = requestAnimationFrame(step);
    };
    scrollAnimRef.current = requestAnimationFrame(step);
  }, [firstSectionStart, sectionSpan]);

  const handleCloseProject = useCallback(() => {
    setSelectedProject(null);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fade {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.5); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @keyframes suffixSlideIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        ref={containerRef}
        className="relative w-full h-screen bg-white cursor-none overflow-auto"
        onMouseMove={handleMouseMove}
      >
        <MemoNavigation visible={scrollY > 50} onNavigate={handleNavigate} />
        <HeroText
          fillProgress={fillProgress}
          footerProgress={footerProgress}
          scrollY={scrollY}
          viewW={viewW}
          viewH={viewH}
          mounted={mounted}
          designGlowColor={cardGlowsRef.current[99]?.color || null}
          nameGlowColor={cardGlowsRef.current[98]?.color || null}
        />
        <TechTags scrollY={scrollY} viewW={viewW} viewH={viewH} centerX={centerX} onCursorColor={handleCursorColor} hitRef={techTagHitRef} />
        <GridBackground />
        <GridLightning viewW={viewW} viewH={viewH} techTagHitRef={techTagHitRef} cardRectsRef={cardRectsRef} onCardHit={handleCardHit} />
        <MemoCenterLine accentHeight={accentHeight} viewH={viewH} centerX={centerX} />

        <div className="pointer-events-none relative z-[4]" style={{ height: totalHeight }} />

        {mounted &&
          SECTIONS.map((section, i) => {
            const sectionStart = firstSectionStart + i * sectionSpan;
            const elapsed = scrollY - sectionStart;

            const p1 = sectionSpan * 0.25;
            const p2 = sectionSpan * 0.45;
            const p3 = sectionSpan * 0.55;

            if (elapsed < -10) return null;

            let threadProgress = 0;
            if (elapsed >= 0 && elapsed < p1) threadProgress = easeInOutCubic(elapsed / p1);
            else if (elapsed >= p1) threadProgress = 1;

            let borderProgress = 0;
            if (elapsed >= p1 && elapsed < p2) borderProgress = easeInOutCubic((elapsed - p1) / (p2 - p1));
            else if (elapsed >= p2) borderProgress = 1;

            const textOpacity = elapsed >= p2 && elapsed < p3
              ? easeInOutCubic((elapsed - p2) / (p3 - p2))
              : elapsed >= p3 ? 1 : 0;

            if (threadProgress < 0.005) return null;

            const pathData = paths[i];
            if (!pathData) return null;

            const stickyY = Math.round((viewH * 0.5 - CARD_H / 2) / 10) * 10;
            const releasePoint = sectionStart + p3;
            const scrollPastRelease = scrollY - releasePoint;
            const cardScreenY = elapsed < p3 ? stickyY : stickyY - scrollPastRelease;
            const dotScreenY = cardScreenY + CARD_H / 2;

            const hasProjects = "hasProjects" in section && section.hasProjects;

            const snappedY = Math.round(cardScreenY / 10) * 10;
            cardRectsRef.current[i] = { x: pathData.cardX, y: snappedY, w: CARD_W, h: CARD_H, index: i };

            const cardGlow = cardGlowsRef.current[i];
            const cardGlowColor = cardGlow ? cardGlow.color : null;

            return (
              <div key={i}>
                <MemoSectionCard
                  index={i}
                  title={section.title}
                  text={section.text}
                  isLeft={isMobile ? false : i % 2 === 0}
                  cardW={CARD_W}
                  cardH={CARD_H}
                  pathData={pathData}
                  threadProgress={threadProgress}
                  borderProgress={borderProgress}
                  textOpacity={textOpacity}
                  cardScreenY={cardScreenY}
                  dotScreenY={dotScreenY}
                  centerX={centerX}
                  viewW={viewW}
                  viewH={viewH}
                  titleSuffix={hasProjects ? <ProjectTitleSuffix /> : undefined}
                  contactLinks={section.title === "Contact" ? CONTACT_LINKS : undefined}
                  glowColor={cardGlowColor}
                />
                {hasProjects && (
                  <MemoProjectGrid
                    opacity={textOpacity}
                    cardX={pathData.cardX}
                    cardScreenY={cardScreenY}
                    onProjectClick={setSelectedProject}
                    cardW={CARD_W}
                    cardH={CARD_H}
                  />
                )}
              </div>
            );
          })}

        <MemoFooter
          scrollY={scrollY}
          footerStart={footerStart}
          viewH={viewH}
          viewW={viewW}
          centerX={centerX}
        />

        <MemoScrollIndicator visible={showIndicator} />

        <ProjectOverlay
          projectIndex={selectedProject}
          onClose={handleCloseProject}
          viewW={viewW}
          viewH={viewH}
          centerX={centerX}
        />
      </div>

      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[200]"
        style={{
          left: 0,
          top: 0,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: theme.accent,
          transform: "translate(-50%, -50%)",
          transition: "width 0.2s, height 0.2s, background 0.2s, box-shadow 0.2s",
          willChange: "left, top",
        }}
      />
    </>
  );
}
