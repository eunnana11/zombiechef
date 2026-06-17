import { dishes, ingredientKeys, ingredientLabels } from "../data/cards";
import { board } from "../data/board";
import { canCookDish, getDishCost } from "../utils/gameLogic";
import type { GameState } from "../types/game";

interface DishPanelProps {
  state: GameState;
  onCook: (dishId: string) => void;
}

export default function DishPanel({ state, onCook }: DishPanelProps) {
  const player = state.players[state.currentPlayerIndex];
  const cell = board[player.position];
  const inKitchen = cell.type === "kitchen" || cell.type === "finalKitchen";

  return (
    <section className="rounded-lg border border-white/10 bg-[#14253a] p-4 text-white shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-black">요리 제작</h2>
        <span className="text-sm font-bold text-white/60">{inKitchen ? "주방 이용 가능" : "주방 칸 필요"}</span>
      </div>
      <div className="grid gap-2 lg:grid-cols-2">
        {dishes.map((dish) => {
          const cost = getDishCost(player, dish);
          const ready = state.drawPhase === "actions" && inKitchen && canCookDish(player, dish, state.remainingPoints);
          return (
            <button
              key={dish.id}
              disabled={!ready}
              onClick={() => onCook(dish.id)}
              className="rounded-md border border-white/10 bg-white/5 p-3 text-left disabled:opacity-45"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-black">{dish.emoji} {dish.name}</div>
                <div className="whitespace-nowrap rounded bg-broth px-2 py-1 text-xs font-bold text-grave">{cost}P · {dish.score}점</div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1 text-xs">
                {ingredientKeys.filter((key) => dish.ingredients[key] > 0).map((key) => (
                  <span key={key} className="rounded bg-grave/5 px-2 py-1">
                    {ingredientLabels[key].emoji}{dish.ingredients[key]}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-white/60">{dish.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
