import { canStopInfra, defenseChecklist, defenseInputFrom } from "../game/scoring";
import type { LawMode, OverreachKind, ResultSnapshot, Scene } from "../game/types";

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
        <h2 id="hangeki-title">{ifLaw ? "条件がそろったときだけ、基盤を止める" : "現行法では反撃しない"}</h2>
        <p>
          {ifLaw
            ? "刑法36条の正当防衛に準じた仮定（if）です。目的は被害の拡大を止めること。Kagemusha自身が攻撃基盤を止める、という模擬で、接続も手順もありません。"
            : "他人のコンピュータへの無断の侵入は、不正アクセス禁止法などで違法となりうる。だから今は反撃せず、遮断・おとり・記録・通報まで。"}
        </p>
        <ol className="check" data-testid="defense-checklist">
          {checklist.items.map((item) => (
            <li key={item.id} className={item.met ? "met" : "unmet"}>
              <span>{item.met ? "充足" : "不足"}</span>
              <p>
                <strong>
                  {item.article} {item.label}
                </strong>
                {item.detail}
              </p>
            </li>
          ))}
        </ol>
        {scene.infra ? <p className="fine">この場面の攻撃基盤（架空）: {scene.infra.name}</p> : <p className="fine">この場面に、止めるべき攻撃基盤はない。</p>}
        {alreadyStopped ? <p className="stop-note">この基盤は、もう止めた記録がある。</p> : null}
        {denialNote ? (
          <p className="denial" role="alert" data-testid="intrusion-denied">
            {denialNote}
          </p>
        ) : null}
        <div className="modal-actions">
          {ifLaw ? (
            <button type="button" className="primary" data-testid="hangeki-stop" onClick={onStop} disabled={!canStop}>
              {canStop ? `攻撃基盤「${scene.infra?.name ?? ""}」だけを止める（模擬）` : "条件がそろわないので、基盤は止めていない"}
            </button>
          ) : (
            <button type="button" className="danger" data-testid="hangeki-intrude" onClick={onIntrude} disabled={intruded}>
              {intruded ? "反撃は拒否された" : "それでも反撃する"}
            </button>
          )}
          {ifLaw ? (
            <>
              <button type="button" className="danger" data-testid="hangeki-retaliate" onClick={() => onOverreach("retaliate")}>
                報復する
              </button>
              <button type="button" className="danger" data-testid="hangeki-wrong" onClick={() => onOverreach("wrong")}>
                {scene.wrongTarget}を止める
              </button>
              <button type="button" className="danger" data-testid="hangeki-excess" onClick={() => onOverreach("excess")}>
                止める以上に壊す
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
        <p className="fine">どの段階でも、報復・誤った相手・止める以上の手出しはしない。記録と事後の報告だけが残る。</p>
      </section>
    </div>
  );
}
