import { board } from "../data/board";
import type { ReactNode } from "react";
import type { GameState } from "../types/game";

const cellLabel: Record<(typeof board)[number]["type"], string> = {
  start: "시작",
  empty: "빈칸",
  ingredient: "식재료",
  search: "탐색",
  kitchen: "주방",
  finalKitchen: "최종 주방"
};

const cellTone: Record<(typeof board)[number]["type"], string> = {
  start: "bg-moss text-white",
  empty: "bg-white/95",
  ingredient: "bg-emerald-100",
  search: "bg-sky-100",
  kitchen: "bg-lime-100",
  finalKitchen: "bg-teal-100"
};

const playerTokens = [
  "bg-lime-300 text-grave ring-2 ring-lime-100",
  "bg-cyan-300 text-grave ring-2 ring-cyan-100",
  "bg-white text-grave ring-2 ring-emerald-200",
  "bg-emerald-400 text-grave ring-2 ring-emerald-100"
];

interface BoardProps {
  state: GameState;
  children?: ReactNode;
}

const getCellPosition = (index: number): { gridColumn: number; gridRow: number } => {
  if (index <= 8) return { gridColumn: index + 1, gridRow: 1 };
  if (index <= 15) return { gridColumn: 9, gridRow: index - 7 };
  if (index <= 23) return { gridColumn: 24 - index, gridRow: 8 };
  return { gridColumn: 1, gridRow: 31 - index };
};

export default function Board({ state, children }: BoardProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#102236] p-4 text-white shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black">한 바퀴 카드판</h2>
        <span className="text-sm text-white/70">30칸 사각 트랙</span>
      </div>
      <div className="board-scroll overflow-x-auto pb-2">
        <div className="grid min-w-[1240px] grid-cols-9 grid-rows-[repeat(8,minmax(0,1fr))] gap-2">
          <div
            className="flex min-h-[540px] items-center justify-center rounded-lg border border-dashed border-white/15 bg-[#0b1424]/85 p-4"
            style={{ gridColumn: "2 / 9", gridRow: "2 / 8" }}
          >
            {children}
          </div>
          {board.map((cell) => {
            const playersHere = state.players.filter((player) => player.position === cell.index);
            const position = getCellPosition(cell.index);
            return (
              <div
                key={cell.index}
                style={position}
                className={`min-h-28 rounded-md border border-grave/10 p-2 text-grave ${cellTone[cell.type]} ${
                  state.currentPlayerIndex >= 0 && playersHere.some((player) => player.id === state.players[state.currentPlayerIndex].id)
                    ? "ring-2 ring-ember"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between text-sm font-black">
                  <span>{cell.index}</span>
                  <span className="text-xl">{cell.type === "ingredient" ? "🍖" : cell.type === "search" ? "🦴" : cell.type === "kitchen" || cell.type === "finalKitchen" ? "🍳" : ""}</span>
                </div>
                {cell.type !== "empty" ? (
                  <div className="mt-1 text-base font-black leading-tight text-grave">{cellLabel[cell.type]}</div>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {playersHere.map((player) => (
                    <span
                      key={player.id}
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-black shadow-sm ${
                        playerTokens[(player.id - 1) % playerTokens.length]
                      }`}
                      title={player.name}
                    >
                      {player.id}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
