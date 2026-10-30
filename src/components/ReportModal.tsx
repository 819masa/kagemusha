import type { ResultSnapshot } from "../game/types";
import { SCENES } from "../game/scenarios";

interface ReportModalProps {
  results: readonly ResultSnapshot[];
  onClose: () => void;
}

export function ReportModal({ results, onClose }: ReportModalProps) {
  const items = results.filter((result) => result.outcome.report);
  return (
    <div className="modal-back" role="presentation">
      <section className="modal report" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <p className="choice-kicker">通報の下書き · 未送信</p>
        <h2 id="report-title">提出は、本人が決める</h2>
        <p>載せるのは時刻、相手のID、求められた内容だけ。メール本文、資産の中身、連絡先は入れない。</p>
        {items.length === 0 ? <p>今日、残した下書きはない。</p> : null}
        <ul className="report-list">
          {items.map((result) => {
            const scene = SCENES.find((item) => item.id === result.sceneId);
            return (
              <li key={result.sceneId + result.actionId}>
                <span>{result.time}</span>
                <strong>{scene?.evidence.counterparty}</strong>
                <p>{scene?.evidence.request}</p>
              </li>
            );
          })}
        </ul>
        <button type="button" className="danger" disabled>
          提出する（模擬では送れない）
        </button>
        <button type="button" className="primary" onClick={onClose}>
          閉じる
        </button>
      </section>
    </div>
  );
}
