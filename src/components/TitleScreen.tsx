interface TitleScreenProps {
  onStart: () => void;
}

const STAGES = [
  { name: "守る", stage: "mamoru" },
  { name: "欺く", stage: "azamuku" },
  { name: "反撃", stage: "hangeki" },
] as const;

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
      <button type="button" className="primary cta" data-testid="title-start" onClick={onStart}>
        給料日を始める
      </button>
      <ol className="stage-row">
        {STAGES.map((stage) => (
          <li key={stage.name} className={`stage-chip stage-${stage.stage}`}>
            <strong>{stage.name}</strong>
          </li>
        ))}
      </ol>
      <details className="more">
        <summary>詳細を見る</summary>
        <p>任せたMindの前に立ち、守る・欺く・反撃を選ぶ模擬です。実在のシステムには接続しません。</p>
      </details>
    </main>
  );
}
