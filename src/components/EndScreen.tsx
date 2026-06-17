import { ingredientKeys } from "../data/cards";
import { rankPlayers, totalIngredients } from "../utils/gameLogic";
import type { GameState } from "../types/game";

interface EndScreenProps {
  state: GameState;
  onRestart: (players: number) => void;
}

export default function EndScreen({ state, onRestart }: EndScreenProps) {
  const ranked = rankPlayers(state.players);
  const winners = ranked.filter((player) => state.winnerIds.includes(player.id));

  return (
    <main className="min-h-screen bg-grave px-4 py-8">
      <section className="mx-auto max-w-4xl rounded-lg border border-grave/10 bg-white p-6 text-grave shadow-soft">
        <p className="text-sm font-bold text-ember">게임 종료</p>
        <h1 className="mt-2 text-3xl font-black">🏆 {winners.map((winner) => winner.name).join(", ")} 승리!</h1>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-grave/10 text-sm text-grave/70">
                <th className="py-2">순위</th>
                <th>플레이어</th>
                <th>점수</th>
                <th>요리</th>
                <th>남은 재료</th>
                <th>팔</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((player, index) => (
                <tr key={player.id} className="border-b border-grave/10">
                  <td className="py-3 font-black">{index + 1}</td>
                  <td>🧟 {player.name}</td>
                  <td className="font-black">{player.score}</td>
                  <td>{player.completedDishes.length}</td>
                  <td>{totalIngredients(player.ingredients)} ({ingredientKeys.map((key) => player.ingredients[key]).join("/")})</td>
                  <td>{player.arms.map((arm) => arm.name).join(", ") || "없음"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {[2, 3, 4].map((count) => (
            <button key={count} onClick={() => onRestart(count)} className="rounded-md bg-moss px-4 py-2 font-bold text-white">
              {count}명으로 다시 시작
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
