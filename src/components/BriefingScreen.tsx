import type { LawMode } from "../game/types";
import { LawToggle } from "./LawToggle";

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
        <p>
          24歳、社会人2年目。仕事と家計とキャリアをMindに任せ、回線にはKagemushaだけをつないでいる。母のMindでは、5万円を超える送金の確認役。
        </p>
      </header>
      <section className="mind-grid" aria-label="今日動くMind">
        <article>
          <h2>家計 Mind</h2>
          <p>給料の振り分け、支払い、ウォレットの残高。</p>
        </article>
        <article>
          <h2>仕事 Mind</h2>
          <p>メールと予定。送金の権限はない。</p>
        </article>
        <article>
          <h2>キャリア Mind</h2>
          <p>応募と契約。スキルを装備する前に関所がある。</p>
        </article>
        <article className="mind-kage">
          <h2>Kagemusha</h2>
          <p>実行の直前に割り込む。出せるのは拒否と保留だけ。承認も、鍵も持たない。</p>
        </article>
      </section>
      <section className="how">
        <h2>遊び方</h2>
        <ol>
          <li>Mindが買い物、メール、ウォレットを進めるのを見る。危ないボタンを押しても、関所で止まる。</li>
          <li>隠し文字がある場面は「影で読む」。関所の前に読むと、点が増える。</li>
          <li>守る、欺く、通す、から選ぶ。反撃は条件の一覧で、現行法なら拒否、if法改正後なら基盤を止める模擬だけが残る。</li>
          <li>夜のまとめで、防いだもの、誤検知、静かさ、免疫を見る。</li>
        </ol>
      </section>
      <aside className="rule">
        <h2>反撃のモード</h2>
        <LawToggle mode={lawMode} onChange={onLaw} />
        <p>
          現行法では反撃しない。if法改正後は、攻撃が進行中で、目的が被害拡大の防止であり、遮断では止まらず証拠があり、攻撃基盤を止めるだけのとき、模擬で止めた記録が残る。報復、誤った相手、止める以上の手出しは点を減らす。
        </p>
      </aside>
      <div className="briefing-actions">
        <button type="button" className="ghost" onClick={onBack}>
          戻る
        </button>
        <button type="button" className="primary" data-testid="briefing-start" onClick={onStart}>
          07:20 から見守る
        </button>
      </div>
    </main>
  );
}
