import type { Stage } from "../game/types";

interface StageMarkProps {
  stage: Stage;
  locked?: boolean;
}

export function StageMark({ stage, locked = false }: StageMarkProps) {
  return (
    <svg className={`stage-mark mark-${stage}`} viewBox="0 0 32 32" aria-hidden="true">
      {stage === "mamoru" ? <path d="M16 3 6 8v8c0 7 4.4 11.2 10 13 5.6-1.8 10-6 10-13V8L16 3Z" /> : null}
      {stage === "azamuku" ? (
        <>
          <circle cx="12" cy="16" r="7" />
          <circle cx="20" cy="16" r="7" />
        </>
      ) : null}
      {stage === "toosu" ? <path d="M6 16h16M16 8l8 8-8 8" /> : null}
      {stage === "hangeki" ? <path d="M17 3 8 18h7l-1 11 10-16h-7l1-10Z" /> : null}
      {locked ? <path className="lock" d="M12 15h8v7h-8v-7Zm1.2-2.2a2.8 2.8 0 0 1 5.6 0V15h-1.4v-2.2a1.4 1.4 0 0 0-2.8 0V15h-1.4v-2.2Z" /> : null}
    </svg>
  );
}
