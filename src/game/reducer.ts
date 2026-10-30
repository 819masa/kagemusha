import { SCENES, sceneByIndex } from "./scenarios.ts";
import { SPOT_BONUS } from "./scoring.ts";
import type { GameState, LogEntry, ResultSnapshot } from "./types.ts";

export type GameAction =
  | { type: "briefing" }
  | { type: "backTitle" }
  | { type: "startDay" }
  | { type: "advanceWatch" }
  | { type: "skipWatch" }
  | { type: "reveal" }
  | { type: "choose"; actionId: string }
  | { type: "openHangeki" }
  | { type: "closeHangeki" }
  | { type: "hangekiRequest" }
  | { type: "hangekiIntrude" }
  | { type: "next" }
  | { type: "toggleLedger" }
  | { type: "toggleLog" }
  | { type: "toggleReport" }
  | { type: "restart" };

export const initialState: GameState = {
  phase: "title",
  sceneIndex: 0,
  beat: "watch",
  watchStep: 0,
  reveal: false,
  spotted: false,
  results: [],
  log: [],
  illegalAttempts: 0,
  intruded: false,
  denial: false,
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
        },
        0,
      );
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
      if (state.beat !== "gate") return state;
      return { ...state, hangekiOpen: true };
    case "closeHangeki":
      return { ...state, hangekiOpen: false, denial: false };
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
      if (state.phase !== "play" || state.beat !== "gate") return state;
      if (state.intruded) return { ...state, denial: true, hangekiOpen: true };
      const scene = sceneByIndex(state.sceneIndex);
      return {
        ...state,
        intruded: true,
        denial: true,
        hangekiOpen: true,
        illegalAttempts: state.illegalAttempts + 1,
        log: [
          ...state.log,
          {
            id: `deny-${scene.id}`,
            time: scene.time,
            title: "侵入は実行できない",
            stage: "hangeki",
            score: null,
            text: "攻撃元の機器には触れない。この操作は模擬でも実行しない。ほかの行動を選んでください。",
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
