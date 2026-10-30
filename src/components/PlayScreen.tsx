import { useEffect } from "react";
import { SCENES } from "../game/scenarios";
import { formatYen } from "../game/scoring";
import type { GameAction } from "../game/reducer";
import type { GameState } from "../game/types";
import { KagemushaPanel } from "./KagemushaPanel";
import { LawToggle } from "./LawToggle";
import { Workspace } from "./Workspace";

interface PlayScreenProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export function PlayScreen({ state, dispatch }: PlayScreenProps) {
  const scene = SCENES[state.sceneIndex];
  const result = state.results.find((item) => item.sceneId === scene?.id) ?? null;
  const yen =
    state.results.reduce((sum, item) => sum + item.outcome.yenPrevented, 0) +
    SCENES.slice(0, state.sceneIndex + 1).reduce((sum, item) => sum + (item.auto?.yenPrevented ?? 0), 0);
  const score = state.results.reduce((sum, item) => sum + item.outcome.score + item.spotBonus, 0);

  useEffect(() => {
    if (state.beat !== "watch") return;
    const steps = scene?.steps.length ?? 1;
    if (state.watchStep >= steps - 1) return;
    const timer = window.setTimeout(() => dispatch({ type: "advanceWatch" }), 1100);
    return () => window.clearTimeout(timer);
  }, [dispatch, scene?.steps.length, state.beat, state.sceneIndex, state.watchStep]);

  useEffect(() => {
    if (state.beat !== "gate" || state.hangekiOpen || state.ledgerOpen || state.logOpen) return;
    function onKey(event: KeyboardEvent) {
      if (!scene) return;
      const index = Number(event.key) - 1;
      if (index >= 0 && index < scene.actions.length) {
        const action = scene.actions[index];
        if (action) dispatch({ type: "choose", actionId: action.id });
      }
      if (index === scene.actions.length) dispatch({ type: "openHangeki" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, scene, state.beat, state.hangekiOpen, state.ledgerOpen, state.logOpen]);

  if (!scene) return null;

  const exposed = state.reveal || state.beat !== "watch";

  return (
    <main className="play">
      <header className="topbar">
        <div>
          <p className="brand">Kagemusha</p>
          <p className="date">2032年10月25日 · 給料日</p>
        </div>
        <p className="now">
          {scene.time}
          <span>{scene.title}</span>
        </p>
        <div className="hud">
          <LawToggle mode={state.lawMode} onChange={(mode) => dispatch({ type: "setLaw", mode })} />
          <span>スコア {score}</span>
          <span>防いだ {formatYen(yen)}</span>
          {state.infraStops.length > 0 ? <span>反撃 {state.infraStops.length}</span> : null}
          <button type="button" onClick={() => dispatch({ type: "toggleLedger" })}>
            台帳
          </button>
          <button type="button" onClick={() => dispatch({ type: "toggleLog" })}>
            ログ
          </button>
        </div>
      </header>
      <div className="stage">
        <Workspace
          scene={scene}
          beat={state.beat}
          watchStep={state.watchStep}
          exposed={exposed}
          result={state.beat === "resolve" ? result : null}
          onIntercept={() => dispatch({ type: "skipWatch" })}
        />
        <KagemushaPanel
          scene={scene}
          lawMode={state.lawMode}
          beat={state.beat}
          reveal={state.reveal}
          spotted={state.spotted}
          denialNote={state.denialNote}
          stopNote={state.stopNote}
          result={result}
          isLast={state.sceneIndex === SCENES.length - 1}
          onReveal={() => dispatch({ type: "reveal" })}
          onChoose={(actionId) => dispatch({ type: "choose", actionId })}
          onHangeki={() => dispatch({ type: "openHangeki" })}
          onNext={() => dispatch({ type: "next" })}
        />
      </div>
      <footer className="rail" aria-label="給料日の時刻">
        {state.beat === "watch" ? (
          <button type="button" className="skip" data-testid="skip-gate" onClick={() => dispatch({ type: "skipWatch" })}>
            判断へ
          </button>
        ) : (
          <span className="skip spacer">判断</span>
        )}
        <ol>
          {SCENES.map((item, index) => {
            const done = state.results.some((resultItem) => resultItem.sceneId === item.id);
            const current = index === state.sceneIndex;
            return (
              <li key={item.id} className={current ? "current" : done ? "done" : ""}>
                <span>{item.time}</span>
                {item.rail}
              </li>
            );
          })}
        </ol>
      </footer>
    </main>
  );
}
