"use client";

import { PROJECTS } from "@/lib/sections";
import { theme } from "@/lib/theme";
import { seededRandom } from "@/lib/math";

interface ProjectGridProps {
  opacity: number;
  cardX: number;
  cardScreenY: number;
  onProjectClick?: (index: number) => void;
}

function getProjectPositions(cardW: number, cardH: number) {
  const rand = seededRandom(42);
  const cellSize = 10;
  const cols = Math.floor(cardW / cellSize);
  const rows = Math.floor(cardH / cellSize);
  const totalCells = cols * rows;

  const used = new Set<number>();
  return PROJECTS.map(() => {
    let idx: number;
    do {
      idx = Math.floor(rand() * totalCells);
    } while (used.has(idx));
    used.add(idx);

    const col = idx % cols;
    const row = Math.floor(idx / cols);
    return { x: col * cellSize, y: row * cellSize };
  });
}

const positions = getProjectPositions(theme.card.width, theme.card.height);

export function ProjectGrid({ opacity, cardX, cardScreenY, onProjectClick }: ProjectGridProps) {
  if (opacity < 0.01) return null;

  return (
    <div
      className="fixed pointer-events-auto"
      style={{
        left: cardX,
        top: Math.round(cardScreenY / 10) * 10,
        width: theme.card.width,
        height: theme.card.height,
        zIndex: 12,
        opacity,
      }}
    >
      {PROJECTS.map((project, i) => {
        const pos = positions[i];
        return (
          <button
            key={project.name}
            className="absolute cursor-pointer transition-transform duration-200"
            title={project.name}
            style={{
              left: pos.x + 1,
              top: pos.y + 1,
              width: 9,
              height: 9,
              background: project.color,
              border: "none",
              padding: 0,
              opacity: 0.7,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(2.5)";
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.zIndex = "20";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.opacity = "0.7";
              e.currentTarget.style.zIndex = "";
            }}
            onClick={() => onProjectClick?.(i)}
          />
        );
      })}
    </div>
  );
}
