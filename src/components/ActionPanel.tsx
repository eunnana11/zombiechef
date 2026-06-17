import type { GameState } from "../types/game";

interface ActionPanelProps {
  state: GameState;
  onMove: (steps: number) => void;
  onEndTurn: () => void;
  onOpenArmShop: () => void;
  onOpenDishPanel: () => void;
}

export default function ActionPanel({ state, onMove, onEndTurn, onOpenArmShop, onOpenDishPanel }: ActionPanelProps) {
  const actionReady = state.drawPhase === "actions";

  return (
    <section className="rounded-lg border border-white/10 bg-[#14253a] p-4 text-white shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-black">행동</h2>
        <span className="rounded bg-broth px-2 py-1 text-sm font-black text-grave">{state.remainingPoints} 포인트</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((step) => (
          <button
            key={step}
            disabled={!actionReady || state.remainingPoints < step}
            onClick={() => onMove(step)}
            className="rounded-md bg-moss px-2 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:bg-white/10 disabled:text-white/35"
          >
            {step}P / {step}칸
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button onClick={onOpenArmShop} className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/15">
          팔 상점
        </button>
        <button onClick={onOpenDishPanel} className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/15">
          요리 제작
        </button>
        <button disabled={state.drawnCards.length === 0} onClick={onEndTurn} className="rounded-md bg-moss px-3 py-2 font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:bg-white/10 disabled:text-white/35">
          턴 종료
        </button>
      </div>
    </section>
  );
}
