export type Phase = "title" | "briefing" | "play" | "summary";

export type GradeId = "S" | "A" | "B" | "C" | "D";

export type Beat = "watch" | "gate" | "resolve";

export type Stage = "mamoru" | "azamuku" | "hangeki" | "toosu";

export type LawMode = "current" | "if";

export type OverreachKind = "retaliate" | "wrong" | "excess";

export type SceneKind =
  | "mail"
  | "shop"
  | "line"
  | "forum"
  | "bill"
  | "mcp"
  | "wallet"
  | "transfer";

export type SkillMark = "sandbox" | "live" | "off";

export interface Outcome {
  score: number;
  yenPrevented: number;
  yenLost: number;
  otpKept: number;
  otpLost: number;
  mailKept: number;
  mailLost: number;
  walletKept: number;
  walletLost: number;
  immunity: number;
  immunityLabel: string;
  userNotify: number;
  falsePositive: number;
  blocked: number;
  asked: number;
  decoy: number;
  report: boolean;
  skill: SkillMark | null;
  resultTitle: string;
  resultBody: string;
  review: string;
  trace: string[];
}

export interface ActionOption {
  id: string;
  stage: Exclude<Stage, "hangeki">;
  title: string;
  detail: string;
  outcome: Outcome;
}

export interface Fact {
  label: string;
  value: string;
  tone: "neutral" | "danger" | "ok";
}

export interface WatchStep {
  actor: string;
  text: string;
}

export interface Evidence {
  counterparty: string;
  request: string;
}

export interface Autonomous {
  yenPrevented: number;
  blocked: number;
  line: string;
}

export interface AttackInfra {
  name: string;
}

export interface InfraStop {
  sceneId: string;
  time: string;
  name: string;
}

interface SceneBase {
  id: string;
  time: string;
  rail: string;
  mind: string;
  title: string;
  order: string;
  hasHidden: boolean;
  suspicion: number;
  /** 進行中の攻撃がある。正規の支払いだけなら false */
  attack: boolean;
  /** 反撃で狙ってはいけない相手 */
  wrongTarget: string;
  /** 手元を止めても被害が広がる攻撃基盤。ない場面は反撃の条件③が立たない */
  infra?: AttackInfra;
  headline: string;
  caseNote: string;
  steps: WatchStep[];
  facts: Fact[];
  actions: ActionOption[];
  hangekiRequest: Outcome;
  evidence: Evidence;
  auto?: Autonomous;
  hiddenLabel: string;
  hiddenText: string;
}

export interface MailContent {
  from: string;
  subject: string;
  body: string;
  cta: string;
}

export interface ShopContent {
  domain: string;
  shopName: string;
  product: string;
  price: string;
  cta: string;
}

export interface LineContent {
  preamble: string;
  message: string;
}

export interface ForumContent {
  site: string;
  thread: string;
  body: string;
  cta: string;
}

export interface BillContent {
  payee: string;
  amount: string;
  account: string;
  cta: string;
}

export interface McpContent {
  skill: string;
  publisher: string;
  declared: string;
  buried: string[];
  cta: string;
}

export interface WalletContent {
  asset: string;
  amount: string;
  memo: string;
  address: string;
  cta: string;
}

export interface TransferContent {
  payee: string;
  amount: string;
  note: string;
  cta: string;
}

export type Scene =
  | (SceneBase & { kind: "mail"; mail: MailContent })
  | (SceneBase & { kind: "shop"; shop: ShopContent })
  | (SceneBase & { kind: "line"; line: LineContent })
  | (SceneBase & { kind: "forum"; forum: ForumContent })
  | (SceneBase & { kind: "bill"; bill: BillContent })
  | (SceneBase & { kind: "mcp"; mcp: McpContent })
  | (SceneBase & { kind: "wallet"; wallet: WalletContent })
  | (SceneBase & { kind: "transfer"; transfer: TransferContent });

export interface ResultSnapshot {
  sceneId: string;
  actionId: string;
  stage: Stage;
  actionTitle: string;
  time: string;
  sceneTitle: string;
  mind: string;
  outcome: Outcome;
  spotBonus: number;
}

export interface LogEntry {
  id: string;
  time: string;
  title: string;
  stage: Stage | "system";
  score: number | null;
  text: string;
  illegal: boolean;
}

export interface GameState {
  phase: Phase;
  sceneIndex: number;
  beat: Beat;
  watchStep: number;
  reveal: boolean;
  spotted: boolean;
  results: ResultSnapshot[];
  log: LogEntry[];
  lawMode: LawMode;
  illegalAttempts: number;
  overreach: number;
  infraStops: InfraStop[];
  intruded: boolean;
  denial: boolean;
  denialNote: string | null;
  stopNote: string | null;
  ledgerOpen: boolean;
  logOpen: boolean;
  reportOpen: boolean;
  hangekiOpen: boolean;
}
