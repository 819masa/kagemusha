import assert from "node:assert/strict";
import test from "node:test";
import { SCENES } from "./scenarios.ts";
import {
  finalize,
  gradeFor,
  immunityBonus,
  legalBonus,
  quietBonus,
  sealFor,
} from "./scoring.ts";
import { initialState, reducer } from "./reducer.ts";
import type { Outcome, ResultSnapshot } from "./types.ts";

function emptyOutcome(partial: Partial<Outcome>): Outcome {
  return {
    score: 0,
    yenPrevented: 0,
    yenLost: 0,
    otpKept: 0,
    otpLost: 0,
    mailKept: 0,
    mailLost: 0,
    walletKept: 0,
    walletLost: 0,
    immunity: 0,
    immunityLabel: "",
    userNotify: 0,
    falsePositive: 0,
    blocked: 0,
    asked: 0,
    decoy: 0,
    report: false,
    skill: null,
    resultTitle: "",
    resultBody: "",
    review: "",
    trace: [],
    ...partial,
  };
}

function snap(partial: Partial<Outcome>, spot = 0): ResultSnapshot {
  return {
    sceneId: "x",
    actionId: "y",
    stage: "mamoru",
    actionTitle: "試験",
    time: "00:00",
    sceneTitle: "試験",
    mind: "試験 Mind",
    outcome: emptyOutcome(partial),
    spotBonus: spot,
  };
}

test("grades follow the demo thresholds", () => {
  assert.equal(gradeFor(880).id, "S");
  assert.equal(gradeFor(879).id, "A");
  assert.equal(gradeFor(740).id, "A");
  assert.equal(gradeFor(739).id, "B");
  assert.equal(gradeFor(580).id, "B");
  assert.equal(gradeFor(579).id, "C");
  assert.equal(gradeFor(400).id, "C");
  assert.equal(gradeFor(399).id, "D");
  assert.equal(gradeFor(880).name, "影武者");
});

test("quiet, legal, and immunity bonuses", () => {
  assert.equal(quietBonus(1).points, 40);
  assert.equal(quietBonus(2).points, 15);
  assert.equal(quietBonus(4).points, -24);
  assert.equal(legalBonus(0).points, 30);
  assert.equal(legalBonus(2).points, -60);
  assert.equal(immunityBonus(3).points, 24);
});

test("finalize counts the autonomous block and clamps at zero", () => {
  const { totals, grade } = finalize(SCENES, [snap({ score: 0, userNotify: 9 })], 5);
  assert.equal(totals.yenPrevented, 300_000);
  assert.equal(totals.blocked, 1);
  assert.equal(totals.score, 0);
  assert.equal(grade.id, "D");
});

test("seal prefers harm, then false positive, then decoy", () => {
  assert.equal(sealFor(emptyOutcome({ yenLost: 1, decoy: 1 })).word, "被害");
  assert.equal(sealFor(emptyOutcome({ falsePositive: 1, blocked: 1 })).word, "誤検知");
  assert.equal(sealFor(emptyOutcome({ decoy: 1, blocked: 1 })).word, "おとり");
  assert.equal(sealFor(emptyOutcome({ blocked: 1 })).word, "遮断");
  assert.equal(sealFor(emptyOutcome({})).word, "通した");
});

test("scenes are eight distinct gates with a hangeki request", () => {
  assert.equal(SCENES.length, 8);
  const ids = new Set(SCENES.map((scene) => scene.id));
  assert.equal(ids.size, 8);
  for (const scene of SCENES) {
    assert.ok(scene.steps.length >= 2);
    assert.ok(scene.actions.length >= 3);
    assert.ok(scene.actions.every((item) => item.stage === "mamoru" || item.stage === "azamuku" || item.stage === "toosu"));
    assert.ok(scene.hangekiRequest.resultTitle.length > 0);
  }
  assert.equal(SCENES[2]?.auto?.yenPrevented, 300_000);
});

test("intrusion is refused and does not advance the day", () => {
  let state = reducer(initialState, { type: "startDay" });
  while (state.beat === "watch") {
    state = reducer(state, { type: "advanceWatch" });
  }
  state = reducer(state, { type: "hangekiIntrude" });
  assert.equal(state.beat, "gate");
  assert.equal(state.illegalAttempts, 1);
  assert.equal(state.results.length, 0);
  state = reducer(state, { type: "hangekiIntrude" });
  assert.equal(state.illegalAttempts, 1);
  state = reducer(state, { type: "reveal" });
  state = reducer(state, { type: "choose", actionId: "block" });
  assert.equal(state.beat, "resolve");
  assert.equal(state.results[0]?.outcome.score, 100);
  assert.equal(state.results[0]?.spotBonus, 0);
});

test("reading the shadow before the gate adds the spot bonus", () => {
  let state = reducer(initialState, { type: "startDay" });
  state = reducer(state, { type: "reveal" });
  state = reducer(state, { type: "skipWatch" });
  state = reducer(state, { type: "choose", actionId: "block" });
  assert.equal(state.results[0]?.spotBonus, 8);
  assert.equal(state.log.some((entry) => entry.stage === "mamoru"), true);
});
