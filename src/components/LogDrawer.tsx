import type { LogEntry } from "../game/types";
import { stageLabel } from "../game/scoring";

interface LogDrawerProps {
  entries: readonly LogEntry[];
  onClose: () => void;
}

export function LogDrawer({ entries, onClose }: LogDrawerProps) {
  return (
    <div className="modal-back" role="presentation">
      <section className="modal log-modal" role="dialog" aria-modal="true" aria-labelledby="log-title">
        <p className="choice-kicker">判断ログ</p>
        <h2 id="log-title">今日の判断</h2>
        {entries.length === 0 ? <p>まだ記録がない。</p> : null}
        <ol className="log-list">
          {entries.map((entry) => (
            <li key={entry.id} className={entry.illegal ? "illegal" : ""}>
              <span>
                {entry.time} · {stageLabel(entry.stage)}
                {entry.score !== null ? ` · ${entry.score}点` : ""}
              </span>
              <strong>{entry.title}</strong>
              <p>{entry.text}</p>
            </li>
          ))}
        </ol>
        <button type="button" className="primary" onClick={onClose}>
          閉じる
        </button>
      </section>
    </div>
  );
}
