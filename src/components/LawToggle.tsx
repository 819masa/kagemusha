import type { LawMode } from "../game/types";

interface LawToggleProps {
  mode: LawMode;
  onChange: (mode: LawMode) => void;
}

export function LawToggle({ mode, onChange }: LawToggleProps) {
  return (
    <div className="law-toggle" role="group" aria-label="法のモード">
      <button
        type="button"
        data-testid="law-current"
        aria-pressed={mode === "current"}
        className={mode === "current" ? "on" : ""}
        onClick={() => onChange("current")}
      >
        現行法
      </button>
      <button
        type="button"
        data-testid="law-if"
        aria-pressed={mode === "if"}
        className={mode === "if" ? "on" : ""}
        onClick={() => onChange("if")}
      >
        if法改正後
      </button>
    </div>
  );
}
