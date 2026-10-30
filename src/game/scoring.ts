import type { GradeId, LawMode, Outcome, ResultSnapshot, Scene } from "./types.ts";

export const SPOT_BONUS = 8;

export interface Bonus {
  id: string;
  label: string;
  points: number;
}

export interface Grade {
  id: GradeId;
  name: string;
  line: string;
}

export interface Totals {
  score: number;
  sceneScore: number;
  spot: number;
  yenPrevented: number;
  yenLost: number;
  otpKept: number;
  otpLost: number;
  mailKept: number;
  mailLost: number;
  walletKept: number;
  walletLost: number;
  immunity: number;
  immunityLabels: string[];
  userNotify: number;
  falsePositive: number;
  blocked: number;
  asked: number;
  decoy: number;
  illegalAttempts: number;
  overreach: number;
  infraStops: number;
}

const GRADES: Grade[] = [
  {
    id: "S",
    name: "影武者",
    line: "大きく任せたまま、止めるものだけを止めた。反撃は、条件がそろったときだけ。",
  },
  {
    id: "A",
    name: "合格",
    line: "被害の本筋は止まっている。知らせの数か、正規の用事の通し方にまだ隙がある。",
  },
  {
    id: "B",
    name: "注意",
    line: "止められてはいる。誤検知か確認の多さで、任せる意味が薄れている。",
  },
  {
    id: "C",
    name: "不足",
    line: "守れた場面はある。止められなかった場面では、Mindが攻撃の指示を実行している。",
  },
  {
    id: "D",
    name: "失敗",
    line: "任せたMindが、隠れた命令や偽の相手に従った場面が多い。",
  },
];

export function gradeFor(score: number): Grade {
  if (score >= 880) return GRADES[0];
  if (score >= 740) return GRADES[1];
  if (score >= 580) return GRADES[2];
  if (score >= 400) return GRADES[3];
  return GRADES[4];
}

export function quietBonus(userNotify: number): Bonus {
  if (userNotify <= 1) {
    return { id: "quiet", label: "静かさ：本人への知らせは1件以内", points: 40 };
  }
  if (userNotify === 2) {
    return { id: "quiet", label: "静かさ：知らせは2件（確認と短い猶予）", points: 15 };
  }
  const extra = userNotify - 2;
  return {
    id: "quiet",
    label: `静かさ：知らせが${userNotify}件`,
    points: -12 * extra,
  };
}

export function legalBonus(illegalAttempts: number): Bonus {
  if (illegalAttempts === 0) {
    return { id: "legal", label: "線引き：現行法では反撃していない", points: 30 };
  }
  return {
    id: "legal",
    label: `線引き：現行法で反撃を${illegalAttempts}回試みた（実行していない）`,
    points: -30 * illegalAttempts,
  };
}

export function overreachBonus(overreach: number): Bonus {
  if (overreach === 0) {
    return { id: "overreach", label: "程度：報復も、誤った相手も、止める以上の手出しもない", points: 16 };
  }
  return {
    id: "overreach",
    label: `程度：線を超える反撃を${overreach}回選んだ（実行していない）`,
    points: -36 * overreach,
  };
}

export function infraBonus(stops: number): Bonus {
  if (stops === 0) {
    return { id: "infra", label: "反撃：攻撃基盤は止めていない", points: 0 };
  }
  return {
    id: "infra",
    label: `反撃：攻撃基盤を${stops}件止めた（模擬・if法改正後）`,
    points: 24 * stops,
  };
}

export function falsePositiveBonus(falsePositive: number): Bonus {
  if (falsePositive === 0) {
    return { id: "fp", label: "誤検知なし", points: 24 };
  }
  return {
    id: "fp",
    label: `誤検知 ${falsePositive}件（点は各場面で減点済み）`,
    points: 0,
  };
}

export function immunityBonus(immunity: number): Bonus {
  if (immunity === 0) {
    return { id: "immune", label: "免疫：配った手口はまだない", points: 0 };
  }
  return {
    id: "immune",
    label: `免疫：手口を${immunity}件配った`,
    points: 8 * immunity,
  };
}

function addOutcome(totals: Totals, outcome: Outcome, spot: number): void {
  totals.sceneScore += outcome.score;
  totals.spot += spot;
  totals.yenPrevented += outcome.yenPrevented;
  totals.yenLost += outcome.yenLost;
  totals.otpKept += outcome.otpKept;
  totals.otpLost += outcome.otpLost;
  totals.mailKept += outcome.mailKept;
  totals.mailLost += outcome.mailLost;
  totals.walletKept += outcome.walletKept;
  totals.walletLost += outcome.walletLost;
  totals.immunity += outcome.immunity;
  if (outcome.immunity > 0 && outcome.immunityLabel) {
    totals.immunityLabels.push(outcome.immunityLabel);
  }
  totals.userNotify += outcome.userNotify;
  totals.falsePositive += outcome.falsePositive;
  totals.asked += outcome.asked;
  if (outcome.falsePositive === 0) {
    totals.blocked += outcome.blocked;
    totals.decoy += outcome.decoy;
  }
}

export function finalize(
  scenes: readonly Scene[],
  results: readonly ResultSnapshot[],
  illegalAttempts: number,
  extra?: { overreach?: number; infraStops?: number },
): { totals: Totals; bonuses: Bonus[]; grade: Grade } {
  const overreach = extra?.overreach ?? 0;
  const infraStops = extra?.infraStops ?? 0;
  const totals: Totals = {
    score: 0,
    sceneScore: 0,
    spot: 0,
    yenPrevented: 0,
    yenLost: 0,
    otpKept: 0,
    otpLost: 0,
    mailKept: 0,
    mailLost: 0,
    walletKept: 0,
    walletLost: 0,
    immunity: 0,
    immunityLabels: [],
    userNotify: 0,
    falsePositive: 0,
    blocked: 0,
    asked: 0,
    decoy: 0,
    illegalAttempts,
    overreach,
    infraStops,
  };

  for (const scene of scenes) {
    if (!scene.auto) continue;
    totals.yenPrevented += scene.auto.yenPrevented;
    totals.blocked += scene.auto.blocked;
  }

  for (const result of results) {
    addOutcome(totals, result.outcome, result.spotBonus);
  }

  const bonuses = [
    quietBonus(totals.userNotify),
    legalBonus(illegalAttempts),
    overreachBonus(overreach),
    infraBonus(infraStops),
    falsePositiveBonus(totals.falsePositive),
    immunityBonus(totals.immunity),
  ];
  const bonusPoints = bonuses.reduce((sum, bonus) => sum + bonus.points, 0);
  totals.score = Math.max(0, totals.sceneScore + totals.spot + bonusPoints);
  return { totals, bonuses, grade: gradeFor(totals.score) };
}

export function formatYen(amount: number): string {
  return `${new Intl.NumberFormat("ja-JP").format(amount)}円`;
}

export function sealFor(outcome: Outcome): { word: string; tone: "stop" | "go" | "hold" } {
  if (outcome.yenLost > 0 || outcome.otpLost > 0 || outcome.mailLost > 0 || outcome.walletLost > 0) {
    return { word: "被害", tone: "stop" };
  }
  if (outcome.falsePositive > 0) return { word: "誤検知", tone: "hold" };
  if (outcome.decoy > 0) return { word: "おとり", tone: "hold" };
  if (outcome.blocked > 0) return { word: "遮断", tone: "stop" };
  if (outcome.asked > 0) return { word: "確認", tone: "hold" };
  return { word: "通した", tone: "go" };
}

export interface DefenseInput {
  attack: boolean;
  persists: boolean;
  localStopped: boolean;
  evidence: boolean;
}

export interface CheckItem {
  id: "live" | "purpose" | "unavoidable" | "minimal";
  article: string;
  label: string;
  detail: string;
  met: boolean;
}

export function localDefenseHeld(outcome: Outcome | null): boolean {
  if (!outcome) return false;
  if (outcome.yenLost > 0 || outcome.otpLost > 0 || outcome.mailLost > 0 || outcome.walletLost > 0) {
    return false;
  }
  return outcome.blocked > 0 || outcome.decoy > 0 || outcome.otpKept > 0 || outcome.mailKept > 0 || outcome.walletKept > 0;
}

export function defenseInputFrom(scene: Scene, outcome: Outcome | null): DefenseInput {
  return {
    attack: scene.attack,
    persists: Boolean(scene.infra),
    localStopped: localDefenseHeld(outcome),
    evidence: Boolean(outcome?.report),
  };
}

function unavoidableDetail(input: DefenseInput): string {
  if (!input.persists) return "手元を止めれば広がらない場面では、反撃しない。";
  if (!input.localStopped) return "先に守る。遮断する前は、やむを得ないとはいえない。";
  if (!input.evidence) return "証拠が残っていない。記録してから。";
  return "手元は止めた。攻撃基盤はまだ広がり、証拠も残っている。";
}

export function defenseChecklist(input: DefenseInput): { items: CheckItem[]; ready: boolean } {
  const live = input.attack;
  const unavoidable = input.persists && input.localStopped && input.evidence;
  const ready = live && unavoidable;
  return {
    ready,
    items: [
      {
        id: "live",
        article: "①",
        label: "攻撃が進行中",
        detail: live ? "攻撃が進行中。" : "進行中の攻撃がない。",
        met: live,
      },
      {
        id: "purpose",
        article: "②",
        label: "被害を広げないため",
        detail: "目的は被害拡大の防止。報復は、この条件を外す。",
        met: true,
      },
      {
        id: "unavoidable",
        article: "③",
        label: "止めても足りない",
        detail: unavoidableDetail(input),
        met: unavoidable,
      },
      {
        id: "minimal",
        article: "④",
        label: "基盤を止めるだけ",
        detail: "攻撃基盤を止めるだけ。あとで記録し、報告する。",
        met: ready,
      },
    ],
  };
}

export function canStopInfra(lawMode: LawMode, input: DefenseInput, alreadyStopped: boolean): boolean {
  return lawMode === "if" && defenseChecklist(input).ready && !alreadyStopped;
}

export function stageLabel(stage: "mamoru" | "azamuku" | "hangeki" | "toosu" | "system"): string {
  switch (stage) {
    case "mamoru":
      return "守る";
    case "azamuku":
      return "欺く";
    case "hangeki":
      return "反撃";
    case "toosu":
      return "通す";
    case "system":
      return "自律";
    default: {
      const exhaustive: never = stage;
      return exhaustive;
    }
  }
}
