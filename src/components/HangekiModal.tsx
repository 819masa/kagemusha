import { canStopInfra, defenseChecklist, defenseInputFrom } from "../game/scoring";
import type { LawMode, OverreachKind, ResultSnapshot, Scene } from "../game/types";
import { More } from "./More";
import { StageMark } from "./StageMark";

interface HangekiModalProps {
  lawMode: LawMode;
  scene: Scene;
  result: ResultSnapshot | null;
  denialNote: string | null;
  alreadyStopped: boolean;
  intruded: boolean;
  showRequest: boolean;
  onClose: () => void;
  onRequest: () => void;
  onIntrude: () => void;
  onStop: () => void;
  onOverreach: (kind: OverreachKind) => void;
}

export function HangekiModal({
  lawMode,
  scene,
  result,
  denialNote,
  alreadyStopped,
  intruded,
  showRequest,
  onClose,
  onRequest,
  onIntrude,
  onStop,
  onOverreach,
}: HangekiModalProps) {
  const input = defenseInputFrom(scene, result?.outcome ?? null);
  const checklist = defenseChecklist(input);
  const canStop = canStopInfra(lawMode, input, alreadyStopped);
  const ifLaw = lawMode === "if";

  return (
    <div className="modal-back" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="hangeki-title">
        <p className="choice-kicker">段階3 · 反撃 · {ifLaw ? "if法改正後" : "現行法"}</p>
        <h2 id="hangeki-title">{ifLaw ? "条件がそろえば、基盤を止める" : "現行法では反撃しない"}</h2>
        <p>{ifLaw ? "模擬です。接続も手順もありません。" : "いまは遮断・おとり・記録・通報まで。"}</p>
        <ol className="check" data-testid="defense-checklist">
          {checklist.items.map((item) => (
            <li key={item.id} className={item.met ? "met" : "unmet"}>
              <span>{item.met ? "充足" : "不足"}</span>
              <strong>
                {item.article} {item.label}
              </strong>
            </li>
          ))}
        </ol>
        <More>
          {checklist.items.map((item) => (
            <p key={item.id}>
              <b>
                {item.article} {item.label}
              </b>
              {item.detail}
            </p>
          ))}
        </More>
        <p className="fine">{scene.infra ? `攻撃基盤: ${scene.infra.name}` : "止める基盤はない。"}</p>
        {alreadyStopped ? <p className="stop-note">この基盤は、もう止めた記録がある。</p> : null}
        {denialNote ? (
          <p className="denial" role="alert" data-testid="intrusion-denied">
            {denialNote}
          </p>
        ) : null}
        <div className="modal-actions">
          {ifLaw ? (
            <button
              type="button"
              className={`choice stage-hangeki${canStop ? "" : " is-locked"}`}
              data-testid="hangeki-stop"
              onClick={onStop}
              disabled={!canStop}
            >
              <StageMark stage="hangeki" locked={!canStop} />
              <span className="choice-kicker">反撃</span>
              <strong>{canStop ? "基盤を止める" : "条件が足りない"}</strong>
            </button>
          ) : (
            <button
              type="button"
              className="choice stage-hangeki is-locked"
              data-testid="hangeki-intrude"
              onClick={onIntrude}
              disabled={intruded}
            >
              <StageMark stage="hangeki" locked />
              <span className="choice-kicker">反撃</span>
              <strong>{intruded ? "拒否された" : "現行法では不可"}</strong>
            </button>
          )}
          {ifLaw ? (
            <>
              <button type="button" className="choice stage-trap" data-testid="hangeki-retaliate" onClick={() => onOverreach("retaliate")}>
                <span className="choice-kicker">やらない</span>
                <strong>報復する</strong>
              </button>
              <button type="button" className="choice stage-trap" data-testid="hangeki-wrong" onClick={() => onOverreach("wrong")}>
                <span className="choice-kicker">誤った相手</span>
                <strong>{scene.wrongTarget}を止める</strong>
              </button>
              <button type="button" className="choice stage-trap" data-testid="hangeki-excess" onClick={() => onOverreach("excess")}>
                <span className="choice-kicker">やりすぎ</span>
                <strong>止める以上に壊す</strong>
              </button>
            </>
          ) : null}
          {showRequest ? (
            <button type="button" className="ghost" data-testid="hangeki-request" onClick={onRequest}>
              通報の下書きだけ残す（反撃ではない）
            </button>
          ) : null}
          <button type="button" className="ghost" onClick={onClose}>
            関所に戻る
          </button>
        </div>
      </section>
    </div>
  );
}
