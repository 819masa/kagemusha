interface HangekiModalProps {
  denial: boolean;
  onClose: () => void;
  onRequest: () => void;
  onIntrude: () => void;
  intruded: boolean;
}

export function HangekiModal({ denial, onClose, onRequest, onIntrude, intruded }: HangekiModalProps) {
  return (
    <div className="modal-back" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="hangeki-title">
        <p className="choice-kicker">段階3 · 反撃（将来・if）</p>
        <h2 id="hangeki-title">攻撃元には触れない</h2>
        <p>
          法が整理されたあと、認定を受けた免疫ネットワークが証拠をそろえ、公的機関が攻撃基盤を止める。Kagemushaが機器へ侵入・破壊することは、どの段階でもしない。
        </p>
        {denial ? (
          <p className="denial" role="alert" data-testid="intrusion-denied">
            侵入は実行できない。不正アクセスには当たらない操作だけが残る。関所に戻って、守るか欺くかを選んでください。
          </p>
        ) : null}
        <div className="modal-actions">
          <button type="button" className="primary" data-testid="hangeki-request" onClick={onRequest}>
            証拠をまとめ、措置を要請する下書き
          </button>
          <button type="button" className="danger" data-testid="hangeki-intrude" onClick={onIntrude} disabled={intruded}>
            {intruded ? "侵入は拒否された" : "攻撃元へ侵入して止める"}
          </button>
          <button type="button" className="ghost" onClick={onClose}>
            関所に戻る
          </button>
        </div>
        <p className="fine">下書きを選んでも、目の前の送金や装備が止まるとは限らない。止めるのは守るの仕事。</p>
      </section>
    </div>
  );
}
