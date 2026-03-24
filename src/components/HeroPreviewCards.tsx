"use client";

interface HeroPreviewCardsProps {
  scrollY: number;
  viewW: number;
  viewH: number;
}

const CARD_COUNT = 6;

export function HeroPreviewCards({ scrollY, viewW, viewH }: HeroPreviewCardsProps) {
  const fadeOpacity = Math.max(0, 1 - scrollY / (viewH * 0.5));
  if (fadeOpacity < 0.01) return null;

  // Right half, bottom half (X+, Y+) — "books on a shelf" angled for 3D
  const shelfX = viewW * 0.68;
  const shelfY = viewH * 0.62;

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-[2]"
      style={{ opacity: fadeOpacity, perspective: 1200, perspectiveOrigin: "70% 60%" }}
    >
      {Array.from({ length: CARD_COUNT }).map((_, i) => {
        const offset = (i - CARD_COUNT / 2) * 35;
        const parallax = scrollY * (0.04 + i * 0.015);

        // Each card rotated on Y axis like books leaning on each other
        const rotateY = -40 + i * 5;
        const rotateZ = -1 + i * 0.5;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: shelfX + offset,
              top: shelfY - parallax,
              width: 260,
              height: 170,
              transformStyle: "preserve-3d",
              transform: `rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
              filter: "grayscale(1)",
              opacity: 0.25 + (CARD_COUNT - 1 - i) * 0.08,
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "2px 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            {/* Browser chrome */}
            <div
              style={{
                height: 20,
                background: "#eee",
                display: "flex",
                alignItems: "center",
                paddingLeft: 8,
                gap: 4,
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ccc" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ccc" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ccc" }} />
            </div>
            <img
              src="/check-site.png"
              alt=""
              style={{
                width: "100%",
                height: 150,
                objectFit: "cover",
                objectPosition: `${i * 18}% ${i * 12}%`,
                display: "block",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
