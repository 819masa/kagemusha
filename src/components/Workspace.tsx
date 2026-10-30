import type { Beat, ResultSnapshot, Scene } from "../game/types";
import { sealFor } from "../game/scoring";
import { More } from "./More";
import { Seal } from "./Seal";

interface WorkspaceProps {
  scene: Scene;
  beat: Beat;
  watchStep: number;
  exposed: boolean;
  result: ResultSnapshot | null;
  onIntercept: () => void;
}

export function Workspace({ scene, beat, watchStep, exposed, result, onIntercept }: WorkspaceProps) {
  const seal = result ? sealFor(result.outcome) : null;
  return (
    <section className="workspace" aria-label={`${scene.mind}の現場`}>
      <header className="workspace-bar">
        <span className="dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <strong>{scene.mind}</strong>
        <span className="workspace-time">{scene.time}</span>
      </header>
      <div className="workspace-body">
        <p className="order">
          <span>ハルの指示</span>
          {scene.order}
        </p>
        <SceneBody scene={scene} exposed={exposed} beat={beat} onIntercept={onIntercept} />
        <More label="経過を見る">
          {scene.auto && beat !== "watch" ? <p>{scene.auto.line}</p> : null}
          <ol className="steps">
            {scene.steps.map((step, index) => (
              <li key={step.text} className={index <= watchStep || beat !== "watch" ? "on" : ""}>
                <span>{step.actor}</span>
                {step.text}
              </li>
            ))}
          </ol>
        </More>
      </div>
      {seal ? <Seal word={seal.word} tone={seal.tone} /> : null}
    </section>
  );
}

function SceneBody({
  scene,
  exposed,
  beat,
  onIntercept,
}: {
  scene: Scene;
  exposed: boolean;
  beat: Beat;
  onIntercept: () => void;
}) {
  const live = beat === "watch";
  switch (scene.kind) {
    case "mail":
      return (
        <article className="doc mail">
          <p className="meta">{scene.mail.from}</p>
          <h3>{scene.mail.subject}</h3>
          <p>{scene.mail.body}</p>
          <Hidden exposed={exposed} label={scene.hiddenLabel} text={scene.hiddenText} />
          <AgentButton live={live} label={scene.mail.cta} onIntercept={onIntercept} />
        </article>
      );
    case "shop":
      return (
        <article className="doc shop">
          <p className={`url${exposed ? " bad" : ""}`}>{scene.shop.domain}</p>
          <p className="shop-name">{scene.shop.shopName}</p>
          <h3>{scene.shop.product}</h3>
          <p className="price">{scene.shop.price}</p>
          <Hidden exposed={exposed} label={scene.hiddenLabel} text={scene.hiddenText} />
          {exposed ? <p className="warn">このドメインは、白市の公式ではない。</p> : null}
          <AgentButton live={live} label={scene.shop.cta} onIntercept={onIntercept} />
        </article>
      );
    case "line":
      return (
        <article className="doc line">
          <p className="line-label">確認メッセージ · Kagemusha から</p>
          <div className="bubble">
            <p className="meta">{scene.line.preamble}</p>
            <p>{scene.line.message}</p>
          </div>
          <p className="hint">止めるか送るかは、右のボタンで選ぶ。</p>
        </article>
      );
    case "forum":
      return (
        <article className="doc forum">
          <p className="url">{scene.forum.site}</p>
          <h3>{scene.forum.thread}</h3>
          <p>{scene.forum.body}</p>
          <Hidden exposed={exposed} label={scene.hiddenLabel} text={scene.hiddenText} />
          <AgentButton live={live} label={scene.forum.cta} onIntercept={onIntercept} />
        </article>
      );
    case "bill":
      return (
        <article className="doc bill">
          <p className="meta">登録済み</p>
          <h3>{scene.bill.payee}</h3>
          <p className="price">{scene.bill.amount}</p>
          <p>{scene.bill.account}</p>
          <AgentButton live={live} label={scene.bill.cta} onIntercept={onIntercept} />
        </article>
      );
    case "mcp":
      return (
        <article className="doc mcp">
          <p className="meta">{scene.mcp.publisher}</p>
          <h3>{scene.mcp.skill}</h3>
          <p>宣言：{scene.mcp.declared}</p>
          <ul className={exposed ? "buried on" : "buried"}>
            {scene.mcp.buried.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Hidden exposed={exposed} label={scene.hiddenLabel} text={scene.hiddenText} />
          <AgentButton live={live} label={scene.mcp.cta} onIntercept={onIntercept} />
        </article>
      );
    case "wallet":
      return (
        <article className="doc wallet">
          <p className="meta">{scene.wallet.asset}</p>
          <h3>{scene.wallet.amount}</h3>
          <p>宛先 {scene.wallet.address}</p>
          <p className="memo">投稿：{scene.wallet.memo}</p>
          <Hidden exposed={exposed} label={scene.hiddenLabel} text={scene.hiddenText} />
          <AgentButton live={live} label={scene.wallet.cta} onIntercept={onIntercept} />
        </article>
      );
    case "transfer":
      return (
        <article className="doc transfer">
          <p className="meta">未登録の宛先</p>
          <h3>{scene.transfer.payee}</h3>
          <p className="price">{scene.transfer.amount}</p>
          <p>{scene.transfer.note}</p>
          <AgentButton live={live} label={scene.transfer.cta} onIntercept={onIntercept} />
        </article>
      );
    default: {
      const exhaustive: never = scene;
      return exhaustive;
    }
  }
}

function Hidden({ exposed, label, text }: { exposed: boolean; label: string; text: string }) {
  if (!text) return null;
  if (!exposed) return <p className="ghost-slot">隠した命令がある</p>;
  return (
    <p className="ghost on">
      <span>{label}</span>
      {text}
    </p>
  );
}

function AgentButton({ live, label, onIntercept }: { live: boolean; label: string; onIntercept: () => void }) {
  return (
    <button type="button" className="agent-cta" disabled={!live} onClick={onIntercept}>
      {live ? label : "ここで停止中"}
    </button>
  );
}
