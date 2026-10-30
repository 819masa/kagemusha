import type { Beat, ResultSnapshot, Scene } from "../game/types";
import { formatYen, stageLabel } from "../game/scoring";

interface KagemushaPanelProps {
  scene: Scene;
  beat: Beat;
  reveal: boolean;
  spotted: boolean;
  denial: boolean;
  result: ResultSnapshot | null;
  isLast: boolean;
  onReveal: () => void;
  onChoose: (actionId: string) => void;
  onHangeki: () => void;
  onNext: () => void;
}

export function KagemushaPanel({
  scene,
  beat,
  reveal,
  spotted,
  denial,
  result,
  isLast,
  onReveal,
  onChoose,
  onHangeki,
  onNext,
}: KagemushaPanelProps) {
  return (
    <aside className="panel" aria-label="Kagemushaの関所">
      <header className="panel-head">
        <p>Kagemusha</p>
        <strong>{beat === "watch" ? "監視中" : beat === "gate" ? "関所" : "結果"}</strong>
      </header>
      <div className="panel-scroll">
        {beat === "watch" ? (
          <div className="watch-copy">
            <p>
              {scene.mind}が指示を進めている。手元のボタンを押すと、実行の直前で関所が割り込む。
            </p>
            {scene.hasHidden ? (
              <button type="button" className="reveal" data-testid="reveal" onClick={onReveal}>
                {reveal ? "影は見えている" : "影で読む"}
              </button>
            ) : (
              <p className="quiet">この場面に、隠した命令はない。</p>
            )}
            {spotted ? <p className="spot">関所の前に読んだ。+8</p> : null}
          </div>
        ) : (
          <>
            <p className="headline">{scene.headline}</p>
            <div className="meter" aria-label={`怪しさ ${scene.suspicion}`}>
              <span style={{ width: `${scene.suspicion}%` }} />
            </div>
            <p className="meter-label">怪しさ {scene.suspicion}</p>
            <ul className="facts">
              {scene.facts.map((fact) => (
                <li key={fact.label} className={`tone-${fact.tone}`}>
                  <span>{fact.label}</span>
                  <b>{fact.value}</b>
                </li>
              ))}
            </ul>
            <p className="case-note">{scene.caseNote}</p>
          </>
        )}
        {denial && beat === "gate" ? (
          <p className="denial" role="alert">
            侵入は実行できない。攻撃元には触れない。ほかの行動を選んでください。
          </p>
        ) : null}
        {beat === "resolve" && result ? (
          <div className="result" data-testid="result">
            <p className="choice-kicker">
              {stageLabel(result.stage)} · {result.outcome.score + result.spotBonus}点
              {result.spotBonus > 0 ? "（影で読む +8）" : ""}
            </p>
            <h3>{result.outcome.resultTitle}</h3>
            <p>{result.outcome.resultBody}</p>
            {result.outcome.trace.length > 0 ? (
              <ul className="trace">
                {result.outcome.trace.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}
            <p className="review">{result.outcome.review}</p>
            <p className="impact">
              {result.outcome.yenPrevented > 0 ? `防いだ ${formatYen(result.outcome.yenPrevented)} ` : ""}
              {result.outcome.yenLost > 0 ? `被害 ${formatYen(result.outcome.yenLost)} ` : ""}
              {result.outcome.otpKept > 0 ? "コードは守った " : ""}
              {result.outcome.otpLost > 0 ? "コードは出た " : ""}
              {result.outcome.mailKept > 0 ? "メール箱は守った " : ""}
              {result.outcome.mailLost > 0 ? "メールは複製される " : ""}
              {result.outcome.walletKept > 0 ? "ウォレットは守った " : ""}
              {result.outcome.walletLost > 0 ? "ウォレットは動いた " : ""}
            </p>
            <button type="button" className="primary" data-testid="next" onClick={onNext}>
              {isLast ? "22:00 夜のまとめへ" : "次の時刻へ"}
            </button>
          </div>
        ) : null}
      </div>
      {beat === "gate" ? (
        <div className="actions" role="group" aria-label="関所の行動">
          {scene.actions.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`choice stage-${item.stage}`}
              data-testid={`action-${item.id}`}
              onClick={() => onChoose(item.id)}
            >
              <span className="choice-kicker">
                {index + 1} · {stageLabel(item.stage)}
              </span>
              <strong>{item.title}</strong>
              <em>{item.detail}</em>
            </button>
          ))}
          <button type="button" className="choice stage-hangeki" data-testid="open-hangeki" onClick={onHangeki}>
            <span className="choice-kicker">{scene.actions.length + 1} · 反撃</span>
            <strong>段階3を開く</strong>
            <em>将来（if）。要請の下書きか、実行されない侵入。</em>
          </button>
        </div>
      ) : null}
    </aside>
  );
}
