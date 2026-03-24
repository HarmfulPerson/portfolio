import { theme } from "@/lib/theme";

interface ScrollIndicatorProps {
  visible: boolean;
}

export function ScrollIndicator({ visible }: ScrollIndicatorProps) {
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-500 z-50"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <span
        className="text-xs tracking-[0.2em] uppercase font-mono"
        style={{
          color: theme.text.secondary,
          background: "rgba(255,255,255,0.7)",
          padding: "4px 12px",
          borderRadius: "4px",
          border: `1px solid ${theme.accentLight}`,
        }}
      >
        Scroll to explore
      </span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        style={{ color: theme.accent, animation: "bounce 1.5s ease-in-out infinite" }}
      >
        <path
          d="M3 6l5 5 5-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
