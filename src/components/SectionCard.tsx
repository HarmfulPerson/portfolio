import { theme } from "@/lib/theme";

interface PathData {
  d: string;
  svgLeft: number;
  svgW: number;
  cardX: number;
}

interface SectionCardProps {
  index: number;
  title: string;
  text: string;
  isLeft: boolean;
  pathData: PathData;
  threadProgress: number;
  borderProgress: number;
  textOpacity: number;
  cardScreenY: number;
  dotScreenY: number;
  centerX: number;
  viewW: number;
  viewH: number;
  titleSuffix?: React.ReactNode;
  contactLinks?: { label: string; href: string }[];
  glowColor?: string | null;
  cardW?: number;
  cardH?: number;
}

export function SectionCard({
  index,
  title,
  text,
  isLeft,
  pathData,
  threadProgress,
  borderProgress,
  textOpacity,
  cardScreenY,
  dotScreenY,
  centerX,
  viewW,
  viewH,
  titleSuffix,
  contactLinks,
  glowColor,
  cardW: cardWProp,
  cardH: cardHProp,
}: SectionCardProps) {
  const CARD_W = cardWProp || theme.card.width;
  const CARD_H = cardHProp || theme.card.height;

  const snappedCardY = Math.round(cardScreenY / 10) * 10;
  const snappedDotY = Math.round(dotScreenY / 10) * 10;
  const activeColor = glowColor || theme.accent;

  let borderSvg: React.ReactNode = null;
  if (borderProgress > 0.01) {
    const rx = pathData.cardX;
    const ry = snappedCardY;
    const rw = CARD_W;
    const rh = CARD_H;
    const ax = isLeft ? rx + rw : rx;
    const ay = ry + rh / 2;

    const lax = ax - rx;
    const lay = ay - ry;
    const rectD = isLeft
      ? `M ${lax} ${lay} L ${lax} ${rh} L 0 ${rh} L 0 0 L ${lax} 0 L ${lax} ${lay}`
      : `M ${lax} ${lay} L ${lax} ${rh} L ${rw} ${rh} L ${rw} 0 L ${lax} 0 L ${lax} ${lay}`;

    borderSvg = (
      <svg
        className="fixed pointer-events-none"
        style={{ left: rx, top: ry, width: rw + 2, height: rh + 2, zIndex: 10, overflow: "visible", transition: "top 0.15s linear" }}
      >
        <path
          d={rectD}
          fill="none"
          stroke={activeColor}
          strokeWidth={1}
          strokeLinejoin="miter"
          style={{ transition: "stroke 0.4s ease" }}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - borderProgress}
          opacity={0.7}
        />
      </svg>
    );
  }

  return (
    <>
      {threadProgress > 0.01 && (
        <div
          className="fixed pointer-events-none"
          style={{
            left: centerX - 4,
            top: snappedDotY - 4,
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: activeColor,
            opacity: Math.min(0.7, threadProgress),
            transition: "background 0.4s ease, top 0.15s linear",
            willChange: "top",
            zIndex: 9,
          }}
        />
      )}

      {threadProgress > 0.01 && (
        <svg
          className="fixed pointer-events-none"
          style={{
            left: pathData.svgLeft,
            top: snappedCardY + CARD_H / 2 - 50,
            width: pathData.svgW,
            height: 100,
            zIndex: 9,
            overflow: "visible",
            transition: "top 0.15s linear",
          }}
        >
          <path
            d={pathData.d}
            fill="none"
            stroke={activeColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.6}
            style={{ transition: "stroke 0.4s ease" }}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - threadProgress}
          />
        </svg>
      )}

      {borderSvg}

      {textOpacity > 0 && (
        <div
          className="fixed pointer-events-none font-mono"
          style={{
            left: pathData.cardX,
            top: snappedCardY,
            width: CARD_W,
            height: CARD_H,
            transition: "top 0.15s linear",
            zIndex: 11,
            opacity: textOpacity,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "10px 20px",
            background: glowColor ? `${glowColor}08` : theme.accentGlow,
            transition: "background 0.4s ease",
          }}
        >
          <div className="flex flex-col gap-2">
            <span
              className="text-[10px] tracking-[0.25em] uppercase font-semibold"
              style={{ color: theme.accent }}
            >
              0{index + 1}
            </span>
            <div className="flex items-baseline gap-3">
              <h2
                className="text-sm tracking-[0.15em] uppercase font-semibold"
                style={{ color: theme.text.primary }}
              >
                {title}
              </h2>
              {titleSuffix}
            </div>
            <p
              className="text-xs leading-relaxed max-w-xs tracking-wide"
              style={{ color: theme.text.secondary }}
            >
              {text}
            </p>
            {contactLinks && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 pointer-events-auto">
                {contactLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] tracking-[0.15em] uppercase cursor-pointer transition-colors"
                    style={{ color: theme.text.secondary }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = theme.accent)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = theme.text.secondary)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
