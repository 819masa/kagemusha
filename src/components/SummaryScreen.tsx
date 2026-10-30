import { SCENES } from "../game/scenarios";
import { finalize, formatYen, stageLabel } from "../game/scoring";
import type { GameAction } from "../game/reducer";
import type { GameState } from "../game/types";

interface SummaryScreenProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export function SummaryScreen({ state, dispatch }: SummaryScreenProps) {
  const { totals, bonuses, grade } = finalize(SCENES, state.results, state.illegalAttempts, {
    overreach: state.overreach,
    infraStops: state.infraStops.length,
  });
  return (
    <main className="summary">
      <article className="paper" data-testid="summary">
        <header>
          <p className="eyebrow">22:00 · 今日の Kagemusha</p>
          <h1>
            <span>{grade.id}</span>
            {grade.name}
          </h1>
          <p className="scoreline">{totals.score}点</p>
          <p>{grade.line}</p>
        </header>
        <dl className="night">
          <div>
            <dt>守った</dt>
            <dd>遮断 {totals.blocked}件</dd>
          </div>
          <div>
            <dt>聞いた</dt>
            <dd>確認 {totals.asked}件</dd>
          </div>
          <div>
            <dt>攻めた</dt>
            <dd>おとり {totals.decoy}件</dd>
          </div>
          <div>
            <dt>配った</dt>
            <dd>手口 {totals.immunity}件</dd>
          </div>
        </dl>
        <ul className="metrics">
          <li>防いだ額 {formatYen(totals.yenPrevented)}</li>
          <li>被害額 {formatYen(totals.yenLost)}</li>
          <li>認証コード {totals.otpLost > 0 ? "流出" : totals.otpKept > 0 ? "守った" : "場面なし"}</li>
          <li>メール箱 {totals.mailLost > 0 ? "複製された" : totals.mailKept > 0 ? "守った" : "場面なし"}</li>
          <li>ウォレット {totals.walletLost > 0 ? "送金された" : totals.walletKept > 0 ? "守った" : "場面なし"}</li>
          <li>本人への知らせ {totals.userNotify}件</li>
          <li>誤検知 {totals.falsePositive}件</li>
          <li>現行法での反撃の試み {totals.illegalAttempts}回</li>
          <li>線を超える反撃 {totals.overreach}回</li>
          <li>攻撃基盤を止めた（模擬） {totals.infraStops}件</li>
        </ul>
        <section>
          <h2>加点</h2>
          <ul className="bonuses">
            {bonuses.map((bonus) => (
              <li key={bonus.id}>
                <span>{bonus.label}</span>
                <strong>{bonus.points > 0 ? `+${bonus.points}` : bonus.points}</strong>
              </li>
            ))}
          </ul>
        </section>
        {totals.immunityLabels.length > 0 ? (
          <section>
            <h2>免疫に残した特徴</h2>
            <ul>
              {totals.immunityLabels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
            <p className="fine">名前、金額、本文、連絡先は配っていない。</p>
          </section>
        ) : null}
        <section>
          <h2>場面</h2>
          <ol className="recap">
            {state.results.map((result) => (
              <li key={result.sceneId}>
                <span>
                  {result.time} · {stageLabel(result.stage)} · {result.outcome.score + result.spotBonus}点
                </span>
                <strong>
                  {result.sceneTitle} / {result.actionTitle}
                </strong>
                <p>{result.outcome.review}</p>
              </li>
            ))}
          </ol>
        </section>
        <p className="fine">
          ウォレットの「約18万ドル」は公開事例の規模を示すための架空の残高で、円の被害額には混ぜていない。人物と金額は架空。
        </p>
        <div className="summary-actions">
          <button type="button" className="primary" onClick={() => dispatch({ type: "toggleReport" })}>
            下書きを見て通報する
          </button>
          <button type="button" className="ghost" onClick={() => dispatch({ type: "toggleLog" })}>
            判断ログ
          </button>
          <button type="button" className="ghost" onClick={() => dispatch({ type: "toggleLedger" })}>
            権限の台帳
          </button>
          <button type="button" data-testid="restart" onClick={() => dispatch({ type: "restart" })}>
            もう一度
          </button>
        </div>
      </article>
    </main>
  );
}
