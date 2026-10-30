interface TitleScreenProps {
  onStart: () => void;
}

const STAGES = [
  { name: "守る", text: "遮断・記録・通報。目印つきのおとりは、会話せずに流出元を見つける。" },
  { name: "欺く", text: "隔離した偽物だけで相手とやり取りし、手口を引き出して免疫に配る。" },
  { name: "反撃", text: "現行法ではしない。if法改正後は、正当防衛に準じた条件で、Kagemushaが攻撃基盤を止める。" },
];

export function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <main className="title-screen">
      <p className="eyebrow">2032 / 給料日の模擬</p>
      <h1>
        <span className="en">Kagemusha</span>
        <span className="ja">影武者</span>
      </h1>
      <p className="lede">
        AIエージェントに攻撃される世界。
        <br />
        だから、攻めて守る。
      </p>
      <p className="sub">
        任せたMindの前に立ち、隠し命令と偽の窓口を止める。選ぶのは、守る・欺く・反撃。現行法の反撃は拒否される。if法改正後は、条件がそろったときだけ基盤を止める模擬になる。
      </p>
      <button type="button" className="primary" data-testid="title-start" onClick={onStart}>
        給料日を始める
      </button>
      <ol className="stage-row">
        {STAGES.map((stage) => (
          <li key={stage.name}>
            <strong>{stage.name}</strong>
            <span>{stage.text}</span>
          </li>
        ))}
      </ol>
      <p className="fine">実在のシステムには接続しない。攻撃も防御も、この画面の中だけ。</p>
    </main>
  );
}
