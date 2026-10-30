interface SealProps {
  word: string;
  tone: "stop" | "go" | "hold" | "deny";
}

export function Seal({ word, tone }: SealProps) {
  return (
    <div className={`seal seal-${tone}`} aria-hidden="true">
      <span>{word}</span>
    </div>
  );
}
