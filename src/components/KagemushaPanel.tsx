import type { Beat, LawMode, ResultSnapshot, Scene } from "../game/types";
import { formatYen, stageLabel } from "../game/scoring";
import { More } from "./More";
import { StageMark } from "./StageMark";

interface KagemushaPanelProps {
  scene: Scene;
  lawMode: LawMode;
  beat: Beat;
  reveal: boolean;
  spotted: boolean;
  denialNote: string | null;
  stopNote: string | null;
  result: ResultSnapshot | null;
  isLast: boolean;
  onReveal: () => void;
  onChoose: (actionId: string) => void;
  onHangeki: () => void;
  onNext: () => void;
}

export function KagemushaPanel({
  scene,
  lawMode,
  beat,
  reveal,
  spotted,
  denialNote,
  stopNote,
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
            <p>{scene.mind}が進めています。</p>
            {scene.hasHidden ? (
              <button type="button" className="reveal" data-testid="reveal" onClick={onReveal}>
                {reveal ? "影は見えている" : "影で読む"}
              </button>
            ) : null}
            {spotted ? <p className="spot">+8</p> : null}
          </div>
        ) : (
          <>
            <p className="headline">{scene.headline}</p>
            <div className="meter" aria-label={`怪しさ ${scene.suspicion}`}>
              <span style={{ width: `${scene.suspicion}%` }} />
            </div>
            <p className="meter-label">怪しさ {scene.suspicion}</p>
            <More label="判断の根拠">
              <ul className="facts">
                {scene.facts.map((fact) => (
                  <li key={fact.label} className={`tone-${fact.tone}`}>
                    <span>{fact.label}</span>
                    <b>{fact.value}</b>
                  </li>
                ))}
              </ul>
              <p>{scene.caseNote}</p>
            </More>
          </>
        )}
          {denialNote && beat === "gate" ? (
          <p className="denial" role="alert">
            {denialNote}
          </p>
        ) : null}
        {stopNote ? (
          <p className="stop-note" data-testid="infra-stopped">
            基盤を止めた記録を残しました。
            <More>{stopNote}</More>
          </p>
        ) : null}
        {beat === "resolve" && result ? (
          <div className="result" data-testid="result">
            <p className="choice-kicker">
              {stageLabel(result.stage)} · {result.outcome.score + result.spotBonus}点
              {result.spotBonus > 0 ? "（影で読む +8）" : ""}
            </p>
            <h3>{result.outcome.resultTitle}</h3>
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
            <More>
              <p>{result.outcome.resultBody}</p>
              {result.outcome.trace.length > 0 ? (
                <ul className="trace">
                  {result.outcome.trace.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
              <p>{result.outcome.review}</p>
            </More>
            <button type="button" className="ghost" data-testid="open-hangeki" onClick={onHangeki}>
              反撃の条件を見る
            </button>
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
              <StageMark stage={item.stage} />
              <span className="choice-kicker">
                {index + 1} · {stageLabel(item.stage)}
              </span>
              <strong>{item.title}</strong>
            </button>
          ))}
          <button
            type="button"
            className={`choice stage-hangeki${lawMode === "current" ? " is-locked" : ""}`}
            data-testid="open-hangeki"
            onClick={onHangeki}
          >
            <StageMark stage="hangeki" locked={lawMode === "current"} />
            <span className="choice-kicker">{scene.actions.length + 1} · 反撃</span>
            <strong>{lawMode === "current" ? "現行法では不可" : "条件を見る"}</strong>
          </button>
          <More label="選択の説明">
            <ul className="choice-notes">
              {scene.actions.map((item) => (
                <li key={item.id}>
                  <b>{item.title}</b>
                  {item.detail}
                </li>
              ))}
            </ul>
          </More>
        </div>
      ) : null}
    </aside>
  );
}
