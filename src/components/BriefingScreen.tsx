import type { LawMode } from "../game/types";
import { LawToggle } from "./LawToggle";
import { More } from "./More";

interface BriefingScreenProps {
  lawMode: LawMode;
  onLaw: (mode: LawMode) => void;
  onBack: () => void;
  onStart: () => void;
}

export function BriefingScreen({ lawMode, onLaw, onBack, onStart }: BriefingScreenProps) {
  return (
    <main className="briefing">
      <header className="briefing-head">
        <p className="eyebrow">2032年10月25日</p>
        <h1>佐藤ハルの給料日</h1>
        <p>家計・仕事・キャリアを任せ、Kagemushaが見張る。</p>
      </header>
      <aside className="rule">
        <h2>反撃</h2>
        <LawToggle mode={lawMode} onChange={onLaw} />
        <p>{lawMode === "current" ? "現行法では反撃できません。" : "条件がそろったときだけ、基盤を止めます。"}</p>
      </aside>
      <More>
        <p>ボタンを押すと、実行の前に止まります。隠した文字を見ると点が少し増えます。最後に結果を見ます。</p>
        <p>if法改正後の反撃は、攻撃の最中で、被害を広げないため、遮断では止まらず、証拠があるときだけです。</p>
      </More>
      <div className="briefing-actions">
        <button type="button" className="ghost" onClick={onBack}>
          戻る
        </button>
        <button type="button" className="primary cta" data-testid="briefing-start" onClick={onStart}>
          07:20 から見守る
        </button>
      </div>
    </main>
  );
}
