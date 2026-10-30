import type { ReactNode } from "react";

interface MoreProps {
  children: ReactNode;
  label?: string;
}

export function More({ children, label = "詳細を見る" }: MoreProps) {
  return (
    <details className="more">
      <summary>{label}</summary>
      <div className="more-body">{children}</div>
    </details>
  );
}
