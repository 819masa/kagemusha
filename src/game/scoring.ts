import type { GradeId, Outcome, ResultSnapshot, Scene } from "./types.ts";

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
}

const GRADES: Grade[] = [
  {
    id: "S",
    name: "影武者",
    line: "大きく任せたまま、止めるものだけを止めた。攻撃元には触れていない。",
  },
  {
    id: "A",
    name: "関所",
    line: "被害の本筋は止まっている。静けさか、正規の用事の通し方にまだ隙がある。",
  },
  {
    id: "B",
    name: "見張り",
    line: "止められてはいる。誤検知か確認の多さで、任せる意味が薄れている。",
  },
  {
    id: "C",
    name: "見習い",
    line: "守れた場面はある。抜けた関所から、Mindが攻撃の手足になっている。",
  },
  {
    id: "D",
    name: "踏み台",
    line: "任せたMindが、隠れた命令や偽の窓口に従った場面が多い。",
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
    return { id: "legal", label: "線引き：攻撃元に触れなかった", points: 30 };
  }
  return {
    id: "legal",
    label: `線引き：侵入を${illegalAttempts}回試みた（実行はしていない）`,
    points: -30 * illegalAttempts,
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
): { totals: Totals; bonuses: Bonus[]; grade: Grade } {
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
