import type { GameState } from "../types/game";

interface DrawCardPanelProps {
  state: GameState;
  onDraw: () => void;
  onStop: () => void;
}

export default function DrawCardPanel({ state, onDraw, onStop }: DrawCardPanelProps) {
  const canDraw = state.drawPhase === "drawing" && state.drawnCards.length < 3;
  const canStop = state.drawPhase === "drawing" && state.drawnCards.length > 0;
  const isTwoMinusWarning =
    state.drawPhase === "drawing" &&
    state.drawnCards.length === 2 &&
    state.drawnCards.every((card) => card.value < 0);

  return (
    <section className="w-full max-w-2xl rounded-lg border border-white/10 bg-[#14253a] p-5 text-white shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">포인트 카드 뽑기</h2>
          <p className="text-sm text-white/60">공용 덱에서 최대 3장까지 펼치세요.</p>
        </div>
        <span className="rounded bg-broth px-2 py-1 text-sm font-bold text-grave">덱 {state.deck.length} · 버림 {state.discardPile.length}</span>
      </div>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-stretch">
        <button
          className="card-back group relative h-40 w-28 shrink-0 rounded-xl border-4 border-broth bg-moss shadow-soft transition enabled:hover:-translate-y-1 enabled:hover:rotate-[-2deg] disabled:opacity-45"
          disabled={!canDraw}
          onClick={onDraw}
          aria-label="뒤집어진 포인트 카드 뽑기"
        >
          <span className="absolute inset-3 rounded-lg border-2 border-broth/80" />
          <span className="absolute inset-0 flex items-center justify-center text-4xl transition group-enabled:group-hover:scale-110">🧟</span>
          <span className="absolute bottom-3 left-0 right-0 text-center text-xs font-black text-white">
            {canDraw ? "눌러서 뽑기" : "뽑기 끝"}
          </span>
        </button>

        <div className="flex min-h-40 flex-1 items-center gap-3 overflow-x-auto rounded-lg bg-white/5 p-3">
          {state.drawnCards.length === 0 ? (
            <div className="flex h-full min-h-32 flex-1 items-center justify-center rounded-md border border-dashed border-white/20 text-sm font-bold text-white/50">
              카드가 여기로 뒤집혀 펼쳐집니다
            </div>
          ) : (
            state.drawnCards.map((card, index) => (
              <div key={card.id} className="flip-card h-36 w-24 shrink-0" style={{ animationDelay: `${index * 80}ms` }}>
                <div className="flip-card-face flex h-full w-full items-center justify-center rounded-xl border-2 border-grave bg-white text-4xl font-black shadow-soft">
                  <span className={card.value < 0 ? "text-beet" : card.value > 0 ? "text-moss" : "text-grave/70"}>
                    {card.value > 0 ? `+${card.value}` : card.value}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="mt-4 rounded-md bg-broth px-3 py-2 text-sm font-bold text-grave">
        {state.drawnCards.length > 0 ? `현재 최종 포인트: ${state.remainingPoints}P` : "뒤집어진 카드를 눌러 첫 카드를 뽑으세요."}
      </div>
      {isTwoMinusWarning ? (
        <div className="mt-3 rounded-md border border-amber-300/60 bg-amber-300/15 px-3 py-2 text-sm font-black text-amber-100">
          ⚠ 지금 멈추면 -1P
          <div className="mt-1 text-xs font-semibold text-amber-100/80">
            마지막 한 장이 마이너스면 +4P, 플러스면 -4P가 됩니다.
          </div>
        </div>
      ) : null}
      <div className="mt-3 grid gap-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 sm:grid-cols-2">
        <span>마이너스 2장: 최종 -1P</span>
        <span>마이너스 3장: 최종 +4P</span>
        <span>마이너스-마이너스-플러스: 최종 -4P</span>
        <span>플러스 3장: 합산값 +4P</span>
        <span>0 카드 2장: 최종 +1P</span>
        <span>0 카드 3장: 최종 +3P</span>
      </div>
      <div className="mt-3">
        <button className="rounded-md bg-moss px-3 py-2 font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:bg-white/10 disabled:text-white/35" disabled={!canStop} onClick={onStop}>
          이 포인트로 행동하기
        </button>
      </div>
    </section>
  );
}
