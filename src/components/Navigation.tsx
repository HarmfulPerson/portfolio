import { theme } from "@/lib/theme";
import { SECTIONS } from "@/lib/sections";

interface NavigationProps {
  visible: boolean;
  onNavigate: (index: number) => void;
}

export function Navigation({ visible, onNavigate }: NavigationProps) {
  return (
    <nav
      className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-6 pointer-events-auto z-50 font-mono max-w-[calc(100vw-32px)]"
      style={{
        background: "rgba(255,255,255,0.92)",
        padding: "8px 16px",
        borderRadius: "6px",
        border: `1px solid ${theme.accentLight}`,
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : -20}px)`,
        transition: "opacity 0.4s ease, transform 0.4s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <span
        className="text-xs font-semibold tracking-[0.15em] uppercase"
        style={{ color: theme.accent }}
      >
        MN
      </span>
      <div className="w-px h-3" style={{ background: theme.text.muted }} />
      {SECTIONS.map((section, idx) => (
        <a
          key={section.title}
          className="text-[11px] tracking-[0.15em] uppercase transition-colors cursor-pointer"
          style={{ color: theme.text.secondary }}
          onMouseEnter={(e) => (e.currentTarget.style.color = theme.accent)}
          onMouseLeave={(e) => (e.currentTarget.style.color = theme.text.secondary)}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(idx);
          }}
        >
          {section.title}
        </a>
      ))}
    </nav>
  );
}
