import { ingredientKeys, ingredientLabels } from "../data/cards";
import { totalIngredients } from "../utils/gameLogic";
import type { GameState } from "../types/game";

interface PlayerPanelProps {
  state: GameState;
}

const playerTokens = [
  "bg-lime-300 text-grave ring-2 ring-lime-100",
  "bg-cyan-300 text-grave ring-2 ring-cyan-100",
  "bg-white text-grave ring-2 ring-emerald-200",
  "bg-emerald-400 text-grave ring-2 ring-emerald-100"
];

export default function PlayerPanel({ state }: PlayerPanelProps) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {state.players.map((player, index) => (
        <section
          key={player.id}
          className={`rounded-lg border p-3 text-white shadow-soft ${
            index === state.currentPlayerIndex ? "border-ember bg-[#173856]" : "border-white/10 bg-[#14253a]"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="flex items-center gap-2 font-black">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${playerTokens[(player.id - 1) % playerTokens.length]}`}>
                  {player.id}
                </span>
                {player.name}
              </h3>
              <p className="text-sm text-white/70">위치 {player.position} · 점수 {player.score}</p>
            </div>
            <span className="rounded bg-broth px-2 py-1 text-xs font-bold text-grave">
              {totalIngredients(player.ingredients)}/{player.maxCarryCapacity}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-1 text-center text-xs">
            {ingredientKeys.map((key) => (
              <div key={key} className="rounded bg-grave/5 px-1 py-2">
                <div>{ingredientLabels[key].emoji}</div>
                <div className="font-bold">{player.ingredients[key]}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm">
            <div className="font-bold">팔</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {player.arms.length ? (
                player.arms.map((arm) => (
                  <span key={arm.id} className="rounded bg-moss px-2 py-1 text-xs font-bold text-white">
                    {arm.emoji} {arm.name}
                  </span>
                ))
              ) : (
                <span className="text-white/50">장착 없음</span>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs text-white/70">요리 {player.completedDishes.length}개</div>
        </section>
      ))}
    </section>
  );
}
