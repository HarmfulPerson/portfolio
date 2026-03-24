import { theme } from "@/lib/theme";

interface CenterLineProps {
  accentHeight: number;
  viewH: number;
  centerX: number;
}

export function CenterLine({ accentHeight, viewH, centerX }: CenterLineProps) {
  return (
    <>
      <div
        className="fixed top-0 bottom-0 pointer-events-none z-[2]"
        style={{ left: centerX, width: 1, background: theme.line.base, opacity: theme.line.baseOpacity }}
      />
      {accentHeight > 0 && (
        <div
          className="fixed top-0 pointer-events-none z-[2]"
          style={{
            left: centerX,
            width: 1,
            height: Math.min(viewH, Math.max(0, accentHeight)),
            background: theme.accent,
            opacity: theme.line.accentOpacity,
          }}
        />
      )}
    </>
  );
}
