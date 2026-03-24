import { theme } from "@/lib/theme";

export function GridBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{
        backgroundImage:
          `linear-gradient(to right, ${theme.grid} 1px, transparent 1px), linear-gradient(to bottom, ${theme.grid} 1px, transparent 1px)`,
        backgroundSize: `${theme.grid10}px ${theme.grid10}px`,
      }}
    />
  );
}
