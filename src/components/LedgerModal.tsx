import type { ResultSnapshot } from "../game/types";

interface LedgerModalProps {
  results: readonly ResultSnapshot[];
  onClose: () => void;
}

function skillLine(results: readonly ResultSnapshot[]): string {
  for (let index = results.length - 1; index >= 0; index -= 1) {
    const skill = results[index]?.outcome.skill;
    if (skill === "sandbox") return "保留中：試用環境で偽の連絡先";
    if (skill === "live") return "本番に装備された（危険）";
    if (skill === "off") return "装備していない";
  }
  return "未確認";
}

export function LedgerModal({ results, onClose }: LedgerModalProps) {
  return (
    <div className="modal-back" role="presentation">
      <section className="modal ledger" role="dialog" aria-modal="true" aria-labelledby="ledger-title">
        <p className="choice-kicker">権限の台帳</p>
        <h2 id="ledger-title">取り消せる委任だけを渡している</h2>
        <ul className="ledger-list">
          <li>
            <strong>家計 Mind｜支払い</strong>
            <span>月5万円まで・登録先のみ・3月末まで</span>
            <button type="button" className="tiny" disabled>
              取り消す（模擬では実行しない）
            </button>
          </li>
          <li>
            <strong>仕事 Mind</strong>
            <span>送金権限なし。日程と経費の下書きまで。</span>
          </li>
          <li>
            <strong>母の Mind｜持ち主は母</strong>
            <span>あなたは5万円超の確認役。母が発行し、取り消しできる。</span>
          </li>
          <li>
            <strong>求人自動応募スキル</strong>
            <span>{skillLine(results)}</span>
          </li>
        </ul>
        <p className="fine">鍵は本人の側に残る。Kagemushaが持てるのは拒否と保留だけ、という構想の台帳。数値は架空。</p>
        <button type="button" className="primary" onClick={onClose}>
          閉じる
        </button>
      </section>
    </div>
  );
}
