import { useState } from "react";
import type { InfraStop, ResultSnapshot } from "../game/types";
import { SCENES } from "../game/scenarios";

interface ReportModalProps {
  results: readonly ResultSnapshot[];
  infraStops: readonly InfraStop[];
  onClose: () => void;
}

export function ReportModal({ results, infraStops, onClose }: ReportModalProps) {
  const [accepted, setAccepted] = useState(false);
  const items = results.filter((result) => result.outcome.report);
  return (
    <div className="modal-back" role="presentation">
      <section className="modal report" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <p className="choice-kicker">通報の下書き · 未送信</p>
        <h2 id="report-title">提出は、本人が決める</h2>
        <p>載せるのは時刻、相手のID、求められた内容だけ。メール本文、資産の中身、連絡先は入れない。</p>
        {items.length === 0 && infraStops.length === 0 ? <p>今日、残した下書きはない。</p> : null}
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
        {infraStops.length > 0 ? (
          <ul className="report-list">
            {infraStops.map((stop) => (
              <li key={stop.sceneId}>
                <span>{stop.time} · 反撃の事後報告</span>
                <strong>{stop.name}（架空の攻撃基盤）</strong>
                <p>被害の拡大を止めるため、基盤を止めた、という模擬の記録。止め方の手順は含まない。</p>
              </li>
            ))}
          </ul>
        ) : null}
        <button
          type="button"
          className={accepted ? "submit-main is-sent" : "submit-main"}
          onClick={() => setAccepted(true)}
        >
          {accepted ? "受け付けました（模擬）" : "提出する"}
        </button>
        {accepted ? <p className="fine">送信はしていません。架空の操作です。</p> : null}
        <button type="button" className="primary" onClick={onClose}>
          閉じる
        </button>
      </section>
    </div>
  );
}
