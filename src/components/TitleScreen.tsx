interface TitleScreenProps {
  onStart: () => void;
}

const STAGES = [
  { name: "守る", text: "遮断・記録・通報。目印つきのおとりは、会話せずに流出元を見つける。" },
  { name: "欺く", text: "隔離した偽物だけで相手とやり取りし、手口を引き出して免疫に配る。" },
  { name: "反撃", text: "将来（if）。証拠を公的機関へ。攻撃元への侵入は、どの段階でもしない。" },
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
        任せたMindの前に立ち、隠し命令と偽の窓口を止める。あなたが選ぶのは、守る・欺く・反撃。反撃で機器へ侵入することはできない。
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
