import { theme } from "@/lib/theme";

interface FooterProps {
  scrollY: number;
  footerStart: number;
  viewH: number;
  viewW: number;
  centerX: number;
}

export function Footer({ scrollY, footerStart, viewH, viewW, centerX }: FooterProps) {
  const footerSpan = viewH * 0.8;
  const footerElapsed = scrollY - footerStart;

  if (footerElapsed < -viewH) return null;

  const splitProgress = Math.max(0, Math.min(1, footerElapsed / (footerSpan * 0.3)));
  const footerOpacity = splitProgress;
  const splitY = viewH - 60;
  const lineLeft = centerX - centerX * splitProgress;
  const lineRight = centerX + (viewW - centerX) * splitProgress;

  return (
    <>
      {splitProgress > 0.01 && (
        <svg
          className="fixed pointer-events-none z-[2]"
          style={{ left: 0, top: 0, width: viewW, height: viewH, overflow: "visible" }}
        >
          <line x1={centerX} y1={splitY} x2={lineLeft} y2={splitY}
            stroke={theme.accent} strokeWidth={1} opacity={0.6 * splitProgress} strokeLinecap="round" />
          <line x1={centerX} y1={splitY} x2={lineRight} y2={splitY}
            stroke={theme.accent} strokeWidth={1} opacity={0.6 * splitProgress} strokeLinecap="round" />
          <circle cx={centerX} cy={splitY} r={4}
            fill={theme.accent} opacity={0.6 * splitProgress} />
        </svg>
      )}

      {footerOpacity > 0.01 && (
        <>
          <div
            className="fixed left-0 right-0 pointer-events-none z-[12] font-mono flex items-center justify-between px-4 sm:px-10"
            style={{ top: splitY + 10, opacity: footerOpacity }}
          >
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: theme.text.secondary }}>
              © 2026
            </span>
            <span className="hidden sm:block text-xs tracking-[0.15em] uppercase font-semibold" style={{ color: theme.accent }}>
              hello@marcin.dev
            </span>
            <div className="flex gap-4">
              {["GitHub", "LinkedIn", "Twitter"].map((link) => (
                <span key={link} className="text-[10px] tracking-[0.15em] uppercase" style={{ color: theme.text.secondary }}>
                  {link}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
