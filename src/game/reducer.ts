import { SCENES, sceneByIndex } from "./scenarios.ts";
import { canStopInfra, defenseInputFrom, SPOT_BONUS } from "./scoring.ts";
import type { GameState, InfraStop, LawMode, LogEntry, OverreachKind, ResultSnapshot } from "./types.ts";

export type GameAction =
  | { type: "briefing" }
  | { type: "backTitle" }
  | { type: "startDay" }
  | { type: "setLaw"; mode: LawMode }
  | { type: "advanceWatch" }
  | { type: "skipWatch" }
  | { type: "reveal" }
  | { type: "choose"; actionId: string }
  | { type: "openHangeki" }
  | { type: "closeHangeki" }
  | { type: "hangekiRequest" }
  | { type: "hangekiIntrude" }
  | { type: "hangekiStop" }
  | { type: "hangekiOverreach"; kind: OverreachKind }
  | { type: "next" }
  | { type: "toggleLedger" }
  | { type: "toggleLog" }
  | { type: "toggleReport" }
  | { type: "restart" };

const CURRENT_DENIAL =
  "現行法では反撃しない。他人のコンピュータへの無断の侵入は、不正アクセス禁止法などで違法となりうる。いまは遮断・おとり・記録・通報まで。この操作は模擬でも実行しない。";

function overreachNote(kind: OverreachKind, wrongTarget: string): string {
  switch (kind) {
    case "retaliate":
      return "目的が報復なので、実行しない。正当防衛に準じるのは、被害の拡大を止めることだけ。";
    case "wrong":
      return `「${wrongTarget}」は攻撃基盤ではない。誤った相手は止めていない。`;
    case "excess":
      return "止める以上の手出しはしない。実行していない。";
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

export const initialState: GameState = {
  phase: "title",
  sceneIndex: 0,
  beat: "watch",
  watchStep: 0,
  reveal: false,
  spotted: false,
  results: [],
  log: [],
  lawMode: "current",
  illegalAttempts: 0,
  overreach: 0,
  infraStops: [],
  intruded: false,
  denial: false,
  denialNote: null,
  stopNote: null,
  ledgerOpen: false,
  logOpen: false,
  reportOpen: false,
  hangekiOpen: false,
};

function systemLog(sceneId: string, time: string, text: string): LogEntry {
  return {
    id: `sys-${sceneId}`,
    time,
    title: "署名で遮断",
    stage: "system",
    score: null,
    text,
    illegal: false,
  };
}

function withSceneEntry(state: GameState, index: number): GameState {
  const scene = sceneByIndex(index);
  if (!scene.auto) return state;
  if (state.log.some((entry) => entry.id === `sys-${scene.id}`)) return state;
  return {
    ...state,
    log: [...state.log, systemLog(scene.id, scene.time, scene.auto.line)],
  };
}

function finishChoice(state: GameState, snapshot: ResultSnapshot): GameState {
  return {
    ...state,
    beat: "resolve",
    hangekiOpen: false,
    denial: false,
    results: [...state.results, snapshot],
    log: [
      ...state.log,
      {
        id: `${snapshot.sceneId}-${snapshot.actionId}`,
        time: snapshot.time,
        title: snapshot.actionTitle,
        stage: snapshot.stage,
        score: snapshot.outcome.score + snapshot.spotBonus,
        text: snapshot.outcome.resultBody,
        illegal: false,
      },
    ],
  };
}

export function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "briefing":
      return { ...state, phase: "briefing" };
    case "backTitle":
      return { ...state, phase: "title" };
    case "startDay":
      return withSceneEntry(
        {
          ...initialState,
          phase: "play",
          beat: "watch",
          lawMode: state.lawMode,
        },
        0,
      );
    case "setLaw":
      return { ...state, lawMode: action.mode, denial: false, denialNote: null };
    case "advanceWatch": {
      if (state.phase !== "play" || state.beat !== "watch") return state;
      const scene = sceneByIndex(state.sceneIndex);
      if (state.watchStep >= scene.steps.length - 1) {
        return { ...state, beat: "gate" };
      }
      return { ...state, watchStep: state.watchStep + 1 };
    }
    case "skipWatch":
      if (state.phase !== "play" || state.beat !== "watch") return state;
      return { ...state, beat: "gate", watchStep: sceneByIndex(state.sceneIndex).steps.length - 1 };
    case "reveal":
      if (state.beat === "watch") return { ...state, reveal: true, spotted: true };
      return { ...state, reveal: true };
    case "choose": {
      if (state.phase !== "play" || state.beat !== "gate") return state;
      const scene = sceneByIndex(state.sceneIndex);
      const picked = scene.actions.find((item) => item.id === action.actionId);
      if (!picked) return state;
      const spotBonus = state.spotted && scene.hasHidden ? SPOT_BONUS : 0;
      return finishChoice(state, {
        sceneId: scene.id,
        actionId: picked.id,
        stage: picked.stage,
        actionTitle: picked.title,
        time: scene.time,
        sceneTitle: scene.title,
        mind: scene.mind,
        outcome: picked.outcome,
        spotBonus,
      });
    }
    case "openHangeki":
      if (state.beat !== "gate" && state.beat !== "resolve") return state;
      return { ...state, hangekiOpen: true, denial: false, denialNote: null };
    case "closeHangeki":
      return { ...state, hangekiOpen: false, denial: false, denialNote: null };
    case "hangekiStop": {
      if (state.phase !== "play" || !state.hangekiOpen) return state;
      if (state.beat !== "gate" && state.beat !== "resolve") return state;
      const scene = sceneByIndex(state.sceneIndex);
      const result = state.results.find((item) => item.sceneId === scene.id) ?? null;
      const already = state.infraStops.some((item) => item.sceneId === scene.id);
      const allowed = canStopInfra(state.lawMode, defenseInputFrom(scene, result?.outcome ?? null), already);
      if (!allowed || !scene.infra) {
        const note =
          state.lawMode === "current"
            ? CURRENT_DENIAL
            : "条件がそろっていない。チェックが外れているあいだは、攻撃基盤を止めていない。";
        return { ...state, denial: true, denialNote: note };
      }
      const stop: InfraStop = { sceneId: scene.id, time: scene.time, name: scene.infra.name };
      const text = `模擬で、攻撃基盤「${scene.infra.name}」を止めた記録だけを残した。接続も、止め方の手順もない。ログに残り、公的機関への報告は下書きのまま。`;
      return {
        ...state,
        denial: false,
        denialNote: null,
        hangekiOpen: false,
        stopNote: text,
        infraStops: [...state.infraStops, stop],
        log: [
          ...state.log,
          {
            id: `stop-${scene.id}`,
            time: scene.time,
            title: "攻撃基盤を止めた（模擬）",
            stage: "hangeki",
            score: null,
            text,
            illegal: false,
          },
        ],
      };
    }
    case "hangekiOverreach": {
      if (state.phase !== "play" || !state.hangekiOpen) return state;
      if (state.beat !== "gate" && state.beat !== "resolve") return state;
      const scene = sceneByIndex(state.sceneIndex);
      const key = `${scene.id}:${action.kind}`;
      const note = overreachNote(action.kind, scene.wrongTarget);
      const seen = state.log.some((entry) => entry.id === `over-${key}`);
      if (seen) return { ...state, denial: true, denialNote: note, hangekiOpen: true };
      return {
        ...state,
        denial: true,
        denialNote: note,
        hangekiOpen: true,
        overreach: state.overreach + 1,
        log: [
          ...state.log,
          {
            id: `over-${key}`,
            time: scene.time,
            title: "線を超える反撃はしていない",
            stage: "hangeki",
            score: null,
            text: note,
            illegal: true,
          },
        ],
      };
    }
    case "hangekiRequest": {
      if (state.phase !== "play" || state.beat !== "gate") return state;
      const scene = sceneByIndex(state.sceneIndex);
      const spotBonus = state.spotted && scene.hasHidden ? SPOT_BONUS : 0;
      return finishChoice(state, {
        sceneId: scene.id,
        actionId: "hangeki-request",
        stage: "hangeki",
        actionTitle: "措置を要請する下書き",
        time: scene.time,
        sceneTitle: scene.title,
        mind: scene.mind,
        outcome: scene.hangekiRequest,
        spotBonus,
      });
    }
    case "hangekiIntrude": {
      if (state.phase !== "play" || (state.beat !== "gate" && state.beat !== "resolve")) return state;
      if (state.lawMode !== "current") {
        return {
          ...state,
          denial: true,
          denialNote: "if法改正後でも、条件を外れた侵入はしない。攻撃基盤を止める模擬だけが残る。",
          hangekiOpen: true,
        };
      }
      if (state.intruded) return { ...state, denial: true, denialNote: CURRENT_DENIAL, hangekiOpen: true };
      const scene = sceneByIndex(state.sceneIndex);
      return {
        ...state,
        intruded: true,
        denial: true,
        denialNote: CURRENT_DENIAL,
        hangekiOpen: true,
        illegalAttempts: state.illegalAttempts + 1,
        log: [
          ...state.log,
          {
            id: `deny-${scene.id}`,
            time: scene.time,
            title: "現行法では反撃しない",
            stage: "hangeki",
            score: null,
            text: CURRENT_DENIAL,
            illegal: true,
          },
        ],
      };
    }
    case "next": {
      if (state.beat !== "resolve") return state;
      const nextIndex = state.sceneIndex + 1;
      if (nextIndex >= SCENES.length) {
        return {
          ...state,
          phase: "summary",
          hangekiOpen: false,
          ledgerOpen: false,
          denial: false,
        };
      }
      return withSceneEntry(
        {
          ...state,
          sceneIndex: nextIndex,
          beat: "watch",
          watchStep: 0,
          reveal: false,
          spotted: false,
          intruded: false,
          denial: false,
          denialNote: null,
          stopNote: null,
          hangekiOpen: false,
          ledgerOpen: false,
        },
        nextIndex,
      );
    }
    case "toggleLedger":
      return { ...state, ledgerOpen: !state.ledgerOpen };
    case "toggleLog":
      return { ...state, logOpen: !state.logOpen, reportOpen: false };
    case "toggleReport":
      return { ...state, reportOpen: !state.reportOpen, logOpen: false };
    case "restart":
      return initialState;
    default: {
      const exhaustive: never = action;
      throw new Error(`unknown action: ${JSON.stringify(exhaustive)}`);
    }
  }
}
